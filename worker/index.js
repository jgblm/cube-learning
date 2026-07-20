/**
 * Cloudflare Worker: API for the categorized Rubik's-cube formula library,
 * backed by D1 (SQLite). The schema is created lazily and the database is
 * seeded from the built-in algorithm data on first use, so the app works
 * out-of-the-box in both local dev and production.
 *
 * The Worker also serves the static SPA (via the ASSETS binding) for every
 * non-API request, preserving client-side routing.
 *
 * Endpoints:
 *   GET    /api/formulas[?category=]   list formulas (optionally by category)
 *   GET    /api/formulas/:id           single formula
 *   GET    /api/categories             distinct categories
 *   POST   /api/formulas               create a formula
 *   PUT    /api/formulas/:id           update a formula
 *   DELETE /api/formulas/:id           delete a formula
 *   POST   /api/seed                   seed built-in data if the table is empty
 */

import { OLL_2LOOK, PLL_COMMON } from '../src/cube/algorithms.js';
import { ALL_LESSONS } from '../src/content/lessons.js';
import { invertSequence, toSequence } from '../src/cube/moves.js';

/* ------------------------------------------------------------------ schema */

const SCHEMA =
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
  'updated_at INTEGER NOT NULL)';

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

  for (const e of OLL_2LOOK) {
    const tags = ['OLL', e.pattern ? 'cross' : 'corners'];
    rows.push(
      inputToRow(
        {
          id: e.id,
          name: e.name,
          category: 'OLL',
          initial_state: e.setup ?? '',
          state_features: e.hint ?? { zh: '', en: '' },
          algorithm: e.algorithm ?? '',
          tags,
          creator: 'system',
          description: e.hint ?? { zh: '', en: '' },
        },
        now,
      ),
    );
  }

  for (const e of PLL_COMMON) {
    rows.push(
      inputToRow(
        {
          id: e.id,
          name: e.name,
          category: 'PLL',
          initial_state: e.setup ?? '',
          algorithm: e.algorithm ?? '',
          tags: ['PLL'],
          creator: 'system',
        },
        now,
      ),
    );
  }

  for (const lesson of ALL_LESSONS) {
    (lesson.steps ?? []).forEach((step, i) => {
      if (!step || !step.algorithm) return;
      const setup = invertSequence(toSequence(step.algorithm)).join(' ');
      rows.push(
        inputToRow(
          {
            id: `lesson-${lesson.id}-${i}`,
            name: {
              zh: `${lesson.title?.zh ?? lesson.id} · 步骤${i + 1}`,
              en: `${lesson.title?.en ?? lesson.id} · Step ${i + 1}`,
            },
            category: 'Lesson',
            initial_state: setup,
            state_features: { zh: step.zh ?? '', en: step.en ?? '' },
            algorithm: step.algorithm,
            tags: [lesson.levelId, lesson.id],
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
  await db.prepare(SCHEMA).run();
}

async function seed(db) {
  const rows = buildSeed();
  const stmt = db.prepare(INSERT_SQL);
  await db.batch(rows.map((r) => stmt.bind(...values(r))));
}

/* ------------------------------------------------------------------- routes */

async function handleApi(request, url, db) {
  const method = request.method;
  const { pathname } = url;

  if (pathname === '/api/categories' && method === 'GET') {
    const { results } = await db
      .prepare("SELECT DISTINCT category FROM formulas WHERE category <> '' ORDER BY category")
      .all();
    return Response.json({ categories: results.map((r) => r.category) });
  }

  if (pathname === '/api/seed' && method === 'POST') {
    const { results } = await db.prepare('SELECT COUNT(*) AS c FROM formulas').all();
    if ((results[0]?.c ?? 0) > 0) {
      return Response.json({ seeded: false, message: 'already populated' });
    }
    await seed(db);
    return Response.json({ seeded: true });
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
      const row = inputToRow({ ...body, id }, Date.now());
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
