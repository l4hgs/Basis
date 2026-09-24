/**
 * db.js — SQLite database layer for Basis backend.
 *
 * Opens (or creates) data/basis.db relative to this file.
 * Runs schema migrations on startup.
 * Exports typed query helpers used by server.js routes.
 */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ─── Open DB ─────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, 'data');
const DB_PATH   = join(DATA_DIR, 'basis.db');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS purchases (
    id            INTEGER PRIMARY KEY,
    asset         TEXT    NOT NULL DEFAULT 'BTC',
    date          TEXT    NOT NULL,
    amount_usd    REAL    NOT NULL,
    received_btc  REAL    NOT NULL,
    market_price  REAL,
    is_custom_rate INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// ─── Seed initial data ────────────────────────────────────────────────────────

const seedPurchases = db.prepare('SELECT COUNT(*) AS cnt FROM purchases').get();
if (seedPurchases.cnt === 0) {
  const insert = db.prepare(`
    INSERT INTO purchases (id, asset, date, amount_usd, received_btc, market_price)
    VALUES (@id, @asset, @date, @amount_usd, @received_btc, @market_price)
  `);
  db.transaction(() => {
    insert.run({ id: 1, asset: 'BTC', date: 'Oct 24, 2023', amount_usd: 500.00, received_btc: 0.00742, market_price: 67385.45 });
    insert.run({ id: 2, asset: 'BTC', date: 'Oct 17, 2023', amount_usd: 500.00, received_btc: 0.00789, market_price: 63371.35 });
    insert.run({ id: 3, asset: 'BTC', date: 'Oct 10, 2023', amount_usd: 500.00, received_btc: 0.00812, market_price: 61576.35 });
  })();
}

const DEFAULT_SETTINGS = {
  frequency:    'weekly',
  amount:       '500',
  asset:        'BTC',
  autoSync:     'true',
  emailReports: 'true',
  walletKey:    'bc1qxy2kg3340qxx3ur52hdva64223250u230uxy5z',
};

const settingCount = db.prepare('SELECT COUNT(*) AS cnt FROM settings').get();
if (settingCount.cnt === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value)');
  db.transaction(() => {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      insertSetting.run({ key, value });
    }
  })();
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

/**
 * Converts a DB row (snake_case) to the frontend-facing object (camelCase).
 */
function rowToObject(row) {
  return {
    id:           row.id,
    asset:        row.asset,
    date:         row.date,
    amountUsd:    row.amount_usd,
    receivedBtc:  row.received_btc,
    marketPrice:  row.market_price  ?? undefined,
    isCustomRate: row.is_custom_rate === 1,
  };
}

// ─── Purchase helpers ─────────────────────────────────────────────────────────

const stmts = {
  getAll:   db.prepare('SELECT * FROM purchases ORDER BY id DESC'),
  getById:  db.prepare('SELECT * FROM purchases WHERE id = ?'),
  insert:   db.prepare(`
    INSERT INTO purchases (id, asset, date, amount_usd, received_btc, market_price, is_custom_rate)
    VALUES (@id, @asset, @date, @amountUsd, @receivedBtc, @marketPrice, @isCustomRate)
  `),
  update:   db.prepare(`
    UPDATE purchases
    SET date = @date, amount_usd = @amountUsd, received_btc = @receivedBtc,
        market_price = @marketPrice, is_custom_rate = @isCustomRate
    WHERE id = @id
  `),
  delete:   db.prepare('DELETE FROM purchases WHERE id = ?'),

  getSetting:  db.prepare('SELECT value FROM settings WHERE key = ?'),
  getAllSettings: db.prepare('SELECT key, value FROM settings'),
  upsertSetting: db.prepare(`
    INSERT INTO settings (key, value) VALUES (@key, @value)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `),
};

export function getAllPurchases() {
  return stmts.getAll.all().map(rowToObject);
}

export function getPurchaseById(id) {
  const row = stmts.getById.get(id);
  return row ? rowToObject(row) : null;
}

export function insertPurchase(p) {
  stmts.insert.run({
    id:           p.id,
    asset:        p.asset ?? 'BTC',
    date:         p.date,
    amountUsd:    p.amountUsd,
    receivedBtc:  p.receivedBtc,
    marketPrice:  p.marketPrice  ?? null,
    isCustomRate: p.isCustomRate ? 1 : 0,
  });
  return getPurchaseById(p.id);
}

export function updatePurchase(id, fields) {
  const existing = getPurchaseById(id);
  if (!existing) return null;
  const merged = {
    id,
    date:         fields.date         ?? existing.date,
    amountUsd:    fields.amountUsd    ?? existing.amountUsd,
    receivedBtc:  fields.receivedBtc  ?? existing.receivedBtc,
    marketPrice:  fields.marketPrice  ?? existing.marketPrice  ?? null,
    isCustomRate: (fields.isCustomRate ?? existing.isCustomRate) ? 1 : 0,
  };
  stmts.update.run(merged);
  return getPurchaseById(id);
}

export function deletePurchase(id) {
  const info = stmts.delete.run(id);
  return info.changes > 0;
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

export function getAllSettings() {
  const rows = stmts.getAllSettings.all();
  const out  = {};
  for (const { key, value } of rows) {
    // Coerce booleans and numbers back from string storage
    if (value === 'true')  { out[key] = true;  continue; }
    if (value === 'false') { out[key] = false; continue; }
    const num = Number(value);
    out[key] = isNaN(num) || value.trim() === '' ? value : num;
  }
  return out;
}

export function setSetting(key, value) {
  stmts.upsertSetting.run({ key, value: String(value) });
}
