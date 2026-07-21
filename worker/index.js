/**
 * Cloudflare Worker: API for the F2L formula library,
 * backed by D1 (SQLite). The schema is created lazily and the database is
 * seeded from the built-in F2L data on first use.
 *
 * The Worker also serves the static SPA (via the ASSETS binding) for every
 * non-API request, preserving client-side routing.
 *
 * Endpoints:
 *   POST   /api/auth/login             login (sets session cookie)
 *   POST   /api/auth/logout            logout (clears session cookie)
 *   GET    /api/auth/me                current user, or 401 if not logged in
 *   GET    /api/formulas[?category=]   list formulas (requires login)
 *   GET    /api/formulas/:id           single formula (requires login)
 *   GET    /api/categories             distinct categories (requires login)
 *   POST   /api/formulas               create a formula (requires login)
 *   PUT    /api/formulas/:id           update a formula (requires login)
 *   DELETE /api/formulas/:id           delete a formula (requires login)
 *   POST   /api/reseed                 clear DB and re-import all formulas from file (requires login)
 */

import F2L_DATA from '../src/content/f2l_data.json' with { type: 'json' };

/* ------------------------------------------------------------------ schema */

const SCHEMA_STATEMENTS = [
  'CREATE TABLE IF NOT EXISTS formulas (' +
    'id TEXT PRIMARY KEY, ' +
    'name_zh TEXT NOT NULL DEFAULT \'\', ' +
    'name_en TEXT NOT NULL DEFAULT \'\', ' +
    'category TEXT NOT NULL DEFAULT \'\', ' +
    'initial_state TEXT NOT NULL DEFAULT \'\', ' +
    'state_features_zh TEXT NOT NULL DEFAULT \'\', ' +
    'state_features_en TEXT NOT NULL DEFAULT \'\', ' +
    'algorithm TEXT NOT NULL DEFAULT \'\', ' +
    'tags TEXT NOT NULL DEFAULT \'[]\', ' +
    'creator TEXT NOT NULL DEFAULT \'system\', ' +
    'description_zh TEXT NOT NULL DEFAULT \'\', ' +
    'description_en TEXT NOT NULL DEFAULT \'\', ' +
    'created_at INTEGER NOT NULL, ' +
    'updated_at INTEGER NOT NULL)',

  'CREATE TABLE IF NOT EXISTS users (' +
    'id TEXT PRIMARY KEY, ' +
    'username TEXT NOT NULL UNIQUE, ' +
    'password_hash TEXT NOT NULL, ' +
    'created_at INTEGER NOT NULL, ' +
    'updated_at INTEGER NOT NULL)',

  'CREATE TABLE IF NOT EXISTS sessions (' +
    'token_hash TEXT PRIMARY KEY, ' +
    'user_id TEXT NOT NULL, ' +
    'expires_at INTEGER NOT NULL)',
];

const COLS = [
  'id', 'name_zh', 'name_en', 'category', 'initial_state',
  'state_features_zh', 'state_features_en', 'algorithm', 'tags',
  'creator', 'description_zh', 'description_en', 'created_at', 'updated_at',
];

const INSERT_SQL =
  `INSERT OR IGNORE INTO formulas (${COLS.join(',')}) VALUES (${COLS.map(() => '?').join(',')})`;

/* ------------------------------------------------------------------ mapping */

function parseTags(s) {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function rowToFormula(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: { zh: row.name_zh, en: row.name_en },
    category: row.category,
    initial_state: row.initial_state,
    state_features: { zh: row.state_features_zh, en: row.state_features_en },
    algorithm: row.algorithm,
    tags: parseTags(row.tags),
    creator: row.creator,
    description: { zh: row.description_zh, en: row.description_en },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function inputToRow(input, now) {
  const tags = Array.isArray(input.tags) ? input.tags.map(String) : [];
  return {
    id: input.id,
    name_zh: input.name?.zh ?? '',
    name_en: input.name?.en ?? '',
    category: input.category ?? '',
    initial_state: input.initial_state ?? '',
    state_features_zh: input.state_features?.zh ?? '',
    state_features_en: input.state_features?.en ?? '',
    algorithm: input.algorithm ?? '',
    tags: JSON.stringify(tags),
    creator: input.creator ?? 'system',
    description_zh: input.description?.zh ?? '',
    description_en: input.description?.en ?? '',
    created_at: now,
    updated_at: now,
  };
}

/** Merge an existing DB row with a partial update payload (both as column maps). */
function mergeRow(existing, body) {
  const tags =
    body.tags !== undefined
      ? JSON.stringify(Array.isArray(body.tags) ? body.tags.map(String) : [])
      : existing.tags;
  return {
    id: existing.id,
    name_zh: body.name?.zh ?? existing.name_zh,
    name_en: body.name?.en ?? existing.name_en,
    category: body.category ?? existing.category,
    initial_state: body.initial_state ?? existing.initial_state,
    state_features_zh: body.state_features?.zh ?? existing.state_features_zh,
    state_features_en: body.state_features?.en ?? existing.state_features_en,
    algorithm: body.algorithm ?? existing.algorithm,
    tags,
    creator: body.creator ?? existing.creator,
    description_zh: body.description?.zh ?? existing.description_zh,
    description_en: body.description?.en ?? existing.description_en,
    created_at: existing.created_at,
    updated_at: Date.now(),
  };
}

const values = (row) => COLS.map((c) => row[c]);

/* -------------------------------------------------------------------- seed */

function buildSeed() {
  const now = Date.now();
  const rows = [];

  for (const entry of F2L_DATA) {
    const caseStr = String(entry.case).padStart(2, '0');
    entry.algorithms.forEach((alg, i) => {
      rows.push(
        inputToRow(
          {
            id: `f2l-${caseStr}-${i}`,
            name: {
              zh: `F2L ${entry.case} · 公式${i + 1}`,
              en: `F2L ${entry.case} · Alg ${i + 1}`,
            },
            category: 'F2L',
            initial_state: entry.setup,
            algorithm: alg,
            tags: ['F2L', `case_${entry.case}`, entry.subgroup, entry.dataFl],
            creator: 'system',
          },
          now,
        ),
      );
    });
  }

  return rows;
}

async function ensureSchema(db) {
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.prepare(stmt).run();
  }
}

async function seed(db) {
  const rows = buildSeed();
  const stmt = db.prepare(INSERT_SQL);
  await db.batch(rows.map((r) => stmt.bind(...values(r))));
}

/* ------------------------------------------------------------- auth / users */

const SESSION_TTL = 7 * 24 * 60 * 60; // seconds

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bufToHex(buf) {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

function randomHex(bytes) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return bufToHex(arr.buffer);
}

async function pbkdf2(password, saltBytes, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

async function verifyPassword(password, stored) {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = Number(parts[1]);
  const salt = b64ToBytes(parts[2]);
  const expected = b64ToBytes(parts[3]);
  const actual = await pbkdf2(password, salt, iterations);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

async function createSession(db, userId) {
  const token = randomHex(32);
  const tokenHash = bufToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
  const expiresAt = Date.now() + SESSION_TTL * 1000;
  await db
    .prepare('INSERT OR REPLACE INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, userId, expiresAt)
    .run();
  return { token, expiresAt };
}

async function getSessionUser(request, db) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const tokenHash = bufToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
  const row = await db
    .prepare(
      'SELECT s.expires_at, u.id, u.username FROM sessions s ' +
        'JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?',
    )
    .bind(tokenHash)
    .first();
  if (!row) return null;
  if (row.expires_at < Date.now()) return null;
  return { id: row.id, username: row.username };
}

async function destroySession(db, request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (!match) return;
  const token = decodeURIComponent(match[1]);
  const tokenHash = bufToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
}

function sessionCookie(token, expiresAt, secure) {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  let c = `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
  if (secure) c += '; Secure';
  return c;
}

function withSession(response, token, expiresAt, secure) {
  response.headers.append('Set-Cookie', sessionCookie(token, expiresAt, secure));
  return response;
}

/* ------------------------------------------------------------------- routes */

async function handleApi(request, url, db) {
  const method = request.method;
  const { pathname } = url;
  const secure = url.protocol === 'https:';

  /* ----- auth ----- */
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return Response.json({ error: '用户名或密码错误' }, { status: 401 });
    }
    const { token, expiresAt } = await createSession(db, user.id);
    const res = Response.json({ user: { id: user.id, username: user.username } });
    return withSession(res, token, expiresAt, secure);
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    await destroySession(db, request);
    const res = Response.json({ ok: true });
    res.headers.append('Set-Cookie', sessionCookie('', 0, secure));
    return res;
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const user = await getSessionUser(request, db);
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    return Response.json({ user });
  }

  /* ----- formula library (requires login) ----- */
  const currentUser = await getSessionUser(request, db);
  if (!currentUser) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (pathname === '/api/categories' && method === 'GET') {
    const { results } = await db
      .prepare("SELECT DISTINCT category FROM formulas WHERE category <> '' ORDER BY category")
      .all();
    return Response.json({ categories: results.map((r) => r.category) });
  }

  if (pathname === '/api/reseed' && method === 'POST') {
    await db.prepare('DELETE FROM formulas').run();
    await seed(db);
    return Response.json({ reseeded: true });
  }

  if (pathname === '/api/formulas') {
    if (method === 'GET') {
      const category = url.searchParams.get('category');
      let sql = 'SELECT * FROM formulas';
      if (category) sql += ' WHERE category = ?';
      sql += ' ORDER BY category, created_at';
      const stmt = category ? db.prepare(sql).bind(category) : db.prepare(sql);
      const { results } = await stmt.all();
      return Response.json({ formulas: results.map(rowToFormula) });
    }

    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!body.algorithm) {
        return Response.json({ error: 'algorithm is required' }, { status: 400 });
      }
      const id =
        body.id && String(body.id).trim()
          ? String(body.id).trim()
          : `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const exists = await db.prepare('SELECT id FROM formulas WHERE id = ?').bind(id).first();
      if (exists) {
        return Response.json({ error: 'id already exists' }, { status: 409 });
      }
      const row = inputToRow({ ...body, id, creator: currentUser.username }, Date.now());
      await db.prepare(INSERT_SQL).bind(...values(row)).run();
      const created = await db.prepare('SELECT * FROM formulas WHERE id = ?').bind(id).first();
      return Response.json({ formula: rowToFormula(created) }, { status: 201 });
    }
  }

  const m = pathname.match(/^\/api\/formulas\/([^/]+)$/);
  if (m) {
    const id = decodeURIComponent(m[1]);

    if (method === 'GET') {
      const row = await db.prepare('SELECT * FROM formulas WHERE id = ?').bind(id).first();
      if (!row) return Response.json({ error: 'not found' }, { status: 404 });
      return Response.json({ formula: rowToFormula(row) });
    }

    if (method === 'PUT') {
      const existingRow = await db.prepare('SELECT * FROM formulas WHERE id = ?').bind(id).first();
      if (!existingRow) return Response.json({ error: 'not found' }, { status: 404 });
      const body = await request.json().catch(() => ({}));
      const merged = mergeRow(existingRow, body);
      await db
        .prepare(
          `UPDATE formulas SET
             name_zh = ?, name_en = ?, category = ?, initial_state = ?,
             state_features_zh = ?, state_features_en = ?, algorithm = ?, tags = ?,
             creator = ?, description_zh = ?, description_en = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(
          merged.name_zh, merged.name_en, merged.category, merged.initial_state,
          merged.state_features_zh, merged.state_features_en, merged.algorithm, merged.tags,
          merged.creator, merged.description_zh, merged.description_en, merged.updated_at,
          id,
        )
        .run();
      const updated = await db.prepare('SELECT * FROM formulas WHERE id = ?').bind(id).first();
      return Response.json({ formula: rowToFormula(updated) });
    }

    if (method === 'DELETE') {
      await db.prepare('DELETE FROM formulas WHERE id = ?').bind(id).run();
      return Response.json({ ok: true });
    }
  }

  return Response.json({ error: 'not found' }, { status: 404 });
}

/* ------------------------------------------------------------------ handler */

export default {
  async fetch(request, env) {
    const db = env.DB;
    const url = new URL(request.url);

    await ensureSchema(db);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, url, db);
      } catch (err) {
        return Response.json({ error: err.message || 'internal error' }, { status: 500 });
      }
    }

    // Non-API requests fall through to the static SPA (SPA fallback handled by
    // the assets binding's not_found_handling). In the dev server the assets
    // binding may be absent for non-navigation requests, so guard it.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  },
};
