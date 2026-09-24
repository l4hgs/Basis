/**
 * Baseline tests for DCA stat calculations, purchase validation logic,
 * and localStorage round-trips.
 *
 * Run with:  cd frontend && npx vitest run
 */

import { describe, it, expect } from 'vitest';
import { computeDcaStats } from '../utils/dcaStats.js';
import { INITIAL_PURCHASES, HISTORICAL_BTC, HISTORICAL_SPENT } from '../constants/purchases.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Isolated baseline — no dependency on the real global constants
const HIST = { btc: 0.5, spent: 20000 };

const THREE_PURCHASES = [
  { id: 1, amountUsd: 500, receivedBtc: 0.01 },
  { id: 2, amountUsd: 500, receivedBtc: 0.02 },
  { id: 3, amountUsd: 500, receivedBtc: 0.015 },
];

// ─── computeDcaStats ─────────────────────────────────────────────────────────

describe('computeDcaStats', () => {
  it('returns zero-like values for an empty purchases array', () => {
    const result = computeDcaStats([], 50000, HIST);
    expect(result.totalStack).toBeCloseTo(HIST.btc);
    expect(result.totalSpent).toBeCloseTo(HIST.spent);
    expect(result.averageCost).toBeCloseTo(HIST.spent / HIST.btc);
  });

  it('adds user purchases on top of historical baseline', () => {
    const result = computeDcaStats(THREE_PURCHASES, 30000, HIST);
    const expectedBtc   = 0.01 + 0.02 + 0.015 + HIST.btc;   // 0.545
    const expectedSpent = 500  + 500  + 500   + HIST.spent;  // 21500
    expect(result.totalStack).toBeCloseTo(expectedBtc, 8);
    expect(result.totalSpent).toBeCloseTo(expectedSpent, 2);
  });

  it('computes averageCost = totalSpent / totalStack', () => {
    const result = computeDcaStats(THREE_PURCHASES, 30000, HIST);
    const expectedBtc   = 0.01 + 0.02 + 0.015 + HIST.btc;
    const expectedSpent = 1500 + HIST.spent;
    expect(result.averageCost).toBeCloseTo(expectedSpent / expectedBtc, 2);
  });

  it('computes portfolioValue = totalStack * liveBtcPrice', () => {
    const price  = 40000;
    const result = computeDcaStats(THREE_PURCHASES, price, HIST);
    expect(result.portfolioValue).toBeCloseTo(result.totalStack * price, 2);
  });

  it('portfolioGainPercent is positive when price > averageCost', () => {
    // HIST gives averageCost = 20000 / 0.5 = 40000; use price 60000
    const result = computeDcaStats([], 60000, HIST);
    expect(result.portfolioGainPercent).toBeGreaterThan(0);
  });

  it('portfolioGainPercent is negative when price < averageCost', () => {
    const result = computeDcaStats([], 10000, HIST);
    expect(result.portfolioGainPercent).toBeLessThan(0);
  });

  it('defaults to the real HISTORICAL_* constants when no override is passed', () => {
    const result = computeDcaStats([], 50000);
    // totalStack should include HISTORICAL_BTC
    expect(result.totalStack).toBeCloseTo(HISTORICAL_BTC, 5);
    expect(result.totalSpent).toBeCloseTo(HISTORICAL_SPENT, 2);
  });

  it('averageCost is 0 when no BTC has been accumulated', () => {
    const result = computeDcaStats([], 50000, { btc: 0, spent: 0 });
    expect(result.averageCost).toBe(0);
    expect(result.portfolioGainPercent).toBe(0);
  });
});

// ─── Purchase validation rules ───────────────────────────────────────────────
// The validation in handleLogPurchase is tested as pure rules — no React needed.

describe('purchase validation rules', () => {
  function validate({ buyDate, usdAmount, btcReceived, fetchedMarketPrice, isOverride, isFetchingPrice }) {
    if (!buyDate)                              return 'Please select a buy date.';
    const parsedUsd = parseFloat(usdAmount);
    if (isNaN(parsedUsd) || parsedUsd <= 0)   return 'Please enter a valid USD amount.';
    if (isFetchingPrice)                       return 'Please wait — fetching historical price...';
    if (!fetchedMarketPrice && !isOverride)    return 'Could not fetch historical price. Enable Override to enter BTC manually.';
    const parsedBtc = parseFloat(btcReceived);
    if (isNaN(parsedBtc) || parsedBtc <= 0)   return 'Please enter a valid BTC amount.';
    return null; // valid
  }

  const baseValid = {
    buyDate: '2023-10-24',
    usdAmount: '500',
    btcReceived: '0.0074',
    fetchedMarketPrice: 33900,
    isOverride: false,
    isFetchingPrice: false,
  };

  it('returns null for a fully valid entry', () => {
    expect(validate(baseValid)).toBeNull();
  });

  it('rejects missing date', () => {
    expect(validate({ ...baseValid, buyDate: '' })).toMatch(/date/i);
  });

  it('rejects zero USD amount', () => {
    expect(validate({ ...baseValid, usdAmount: '0' })).toMatch(/USD/i);
  });

  it('rejects negative USD amount', () => {
    expect(validate({ ...baseValid, usdAmount: '-1' })).toMatch(/USD/i);
  });

  it('rejects while price is still being fetched', () => {
    expect(validate({ ...baseValid, isFetchingPrice: true })).toMatch(/wait/i);
  });

  it('rejects when no market price and override is off', () => {
    expect(validate({ ...baseValid, fetchedMarketPrice: null, isOverride: false })).toMatch(/override/i);
  });

  it('accepts when no market price but override is on', () => {
    expect(validate({ ...baseValid, fetchedMarketPrice: null, isOverride: true })).toBeNull();
  });

  it('rejects zero BTC amount', () => {
    expect(validate({ ...baseValid, btcReceived: '0' })).toMatch(/BTC/i);
  });
});

// ─── localStorage round-trip ──────────────────────────────────────────────────

describe('localStorage round-trip', () => {
  it('INITIAL_PURCHASES survive JSON stringify → parse intact', () => {
    const serialised   = JSON.stringify(INITIAL_PURCHASES);
    const deserialised = JSON.parse(serialised);
    expect(deserialised).toHaveLength(INITIAL_PURCHASES.length);
    deserialised.forEach((item, i) => {
      expect(item.id).toBe(INITIAL_PURCHASES[i].id);
      expect(item.amountUsd).toBeCloseTo(INITIAL_PURCHASES[i].amountUsd, 2);
      expect(item.receivedBtc).toBeCloseTo(INITIAL_PURCHASES[i].receivedBtc, 8);
      expect(item.date).toBe(INITIAL_PURCHASES[i].date);
    });
  });

  it('a purchase with extra fields round-trips cleanly', () => {
    const purchase = { id: 999, asset: 'BTC', date: 'Oct 31, 2023', amountUsd: 250, receivedBtc: 0.0037, marketPrice: 67567.57, isCustomRate: false };
    const result   = JSON.parse(JSON.stringify(purchase));
    expect(result).toEqual(purchase);
  });
});
