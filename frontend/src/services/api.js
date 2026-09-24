/**
 * services/api.js — thin wrapper around the Basis backend API.
 *
 * All functions return Promises.  On network failure they log a
 * warning and return null so the caller can fall back to localStorage.
 *
 * Base URL is intentionally relative ('/api/...') so Vite's dev-proxy
 * (pointing to localhost:5000) and production deployments both work
 * without environment-specific config.
 */

const BASE = '/api';

// ─── helpers ────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  // DELETE returns 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all purchases from the backend.
 * @returns {Promise<Array|null>}  Array of purchase objects, or null on failure.
 */
export async function fetchBuys() {
  try {
    return await request('/buys');
  } catch (err) {
    console.warn('[api] fetchBuys failed — falling back to localStorage:', err.message);
    return null;
  }
}

/**
 * Create a new purchase on the backend.
 * @param {{ date, amountUsd, receivedBtc, marketPrice?, isCustomRate? }} data
 * @returns {Promise<Object|null>}  Created purchase (with server-assigned id), or null on failure.
 */
export async function createBuy(data) {
  try {
    return await request('/buys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('[api] createBuy failed — purchase saved locally only:', err.message);
    return null;
  }
}

/**
 * Update an existing purchase on the backend.
 * @param {number|string} id
 * @param {{ date?, amountUsd?, receivedBtc?, marketPrice? }} data
 * @returns {Promise<Object|null>}  Updated purchase, or null on failure.
 */
export async function updateBuy(id, data) {
  try {
    return await request(`/buys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('[api] updateBuy failed — edit saved locally only:', err.message);
    return null;
  }
}

/**
 * Delete a purchase from the backend.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export async function deleteBuy(id) {
  try {
    return await request(`/buys/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[api] deleteBuy failed — deletion applied locally only:', err.message);
    return null;
  }
}

// ─── Settings ────────────────────────────────────────────────────────────────

/**
 * Fetch the persisted DCA plan and preferences.
 * @returns {Promise<Object|null>}
 */
export async function fetchSettings() {
  try {
    return await request('/settings');
  } catch (err) {
    console.warn('[api] fetchSettings failed — using local defaults:', err.message);
    return null;
  }
}

/**
 * Persist updated settings.
 * @param {Partial<{ frequency, amount, asset, autoSync, emailReports, walletKey }>} data
 * @returns {Promise<Object|null>}  Full updated settings object, or null on failure.
 */
export async function saveSettings(data) {
  try {
    return await request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('[api] saveSettings failed — changes saved locally only:', err.message);
    return null;
  }
}

