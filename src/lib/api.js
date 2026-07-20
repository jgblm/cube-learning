/**
 * Tiny fetch client for the formula-library API backed by Cloudflare D1.
 * All endpoints are same-origin (/api/...), so no extra config is needed.
 */

const BASE = '/api';

async function req(path, options) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const formulasApi = {
  /** List formulas, optionally filtered by category. */
  list: (category) =>
    req(category ? `/formulas?category=${encodeURIComponent(category)}` : '/formulas'),

  /** Fetch a single formula by id. */
  get: (id) => req(`/formulas/${encodeURIComponent(id)}`),

  /** Create a formula. */
  create: (payload) => req('/formulas', { method: 'POST', body: JSON.stringify(payload) }),

  /** Update a formula (partial payload). */
  update: (id, payload) =>
    req(`/formulas/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),

  /** Delete a formula by id. */
  remove: (id) => req(`/formulas/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  /** Distinct categories present in the database. */
  categories: () => req('/categories'),

  /** Seed built-in data if the table is empty. */
  seed: () => req('/seed', { method: 'POST' }),
};
