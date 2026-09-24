import express from 'express';
import cors from 'cors';
import {
  getAllPurchases,
  getPurchaseById,
  insertPurchase,
  updatePurchase,
  deletePurchase,
  getAllSettings,
  setSetting,
} from './db.js';

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── GET /api/buys ─────────────────────────────────────────────────────────────
app.get('/api/buys', (req, res) => {
  res.json(getAllPurchases());
});

// ── POST /api/buys ────────────────────────────────────────────────────────────
app.post('/api/buys', (req, res) => {
  const { date, amountUsd, receivedBtc, marketPrice, isCustomRate } = req.body;

  if (!date || amountUsd == null || receivedBtc == null) {
    return res.status(400).json({ error: 'date, amountUsd and receivedBtc are required' });
  }

  const created = insertPurchase({
    id:           Date.now(),
    asset:        'BTC',
    date,
    amountUsd:    parseFloat(amountUsd),
    receivedBtc:  parseFloat(receivedBtc),
    marketPrice:  marketPrice  != null ? parseFloat(marketPrice)  : undefined,
    isCustomRate: Boolean(isCustomRate),
  });

  res.status(201).json(created);
});

// ── PUT /api/buys/:id ─────────────────────────────────────────────────────────
app.put('/api/buys/:id', (req, res) => {
  const id      = parseInt(req.params.id, 10);
  const { date, amountUsd, receivedBtc, marketPrice, isCustomRate } = req.body;

  const updated = updatePurchase(id, {
    ...(date         != null && { date }),
    ...(amountUsd    != null && { amountUsd:   parseFloat(amountUsd) }),
    ...(receivedBtc  != null && { receivedBtc: parseFloat(receivedBtc) }),
    ...(marketPrice  != null && { marketPrice: parseFloat(marketPrice) }),
    ...(isCustomRate != null && { isCustomRate: Boolean(isCustomRate) }),
  });

  if (!updated) return res.status(404).json({ error: 'Purchase not found' });
  res.json(updated);
});

// ── DELETE /api/buys/:id ──────────────────────────────────────────────────────
app.delete('/api/buys/:id', (req, res) => {
  const id      = parseInt(req.params.id, 10);
  const deleted = deletePurchase(id);
  if (!deleted) return res.status(404).json({ error: 'Purchase not found' });
  res.status(204).send();
});

// ── GET /api/settings ─────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  res.json(getAllSettings());
});

// ── PUT /api/settings ─────────────────────────────────────────────────────────
app.put('/api/settings', (req, res) => {
  const allowed = ['frequency', 'amount', 'asset', 'autoSync', 'emailReports', 'walletKey'];
  const updates = req.body;

  for (const key of allowed) {
    if (key in updates) setSetting(key, updates[key]);
  }

  res.json(getAllSettings());
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Basis API running on http://localhost:${PORT}`);
});
