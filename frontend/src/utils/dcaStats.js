/**
 * computeDcaStats — pure function for DCA portfolio statistics.
 *
 * Extracted from App.jsx's useMemo so it can be unit-tested without
 * mocking React hooks.
 *
 * @param {Array}  purchases        - User-logged purchase objects
 * @param {number} liveBtcPrice     - Current BTC/USD price
 * @param {Object} [historical]     - Override historical baseline (for testing)
 * @param {number} [historical.btc]    - Historical BTC accumulated (default: HISTORICAL_BTC)
 * @param {number} [historical.spent]  - Historical USD spent      (default: HISTORICAL_SPENT)
 * @returns {{ totalStack, averageCost, totalSpent, portfolioValue, portfolioGainPercent }}
 */
import { HISTORICAL_BTC, HISTORICAL_SPENT } from '../constants/purchases.js';

export function computeDcaStats(purchases, liveBtcPrice, phpRate = 58.5, historical = {}) {
  let rate = phpRate;
  let hist = historical;
  if (typeof phpRate === 'object' && phpRate !== null) {
    hist = phpRate;
    rate = 1;
  }

  const histBtc   = hist.btc   ?? HISTORICAL_BTC;
  const histSpent = hist.spent ?? HISTORICAL_SPENT;

  const userBtc   = purchases.reduce((sum, p) => sum + p.receivedBtc, 0);
  const userSpent = purchases.reduce((sum, p) => sum + p.amountUsd,   0);

  const finalBtc   = userBtc   + histBtc;
  const finalSpent = userSpent + histSpent;

  const averageCost = finalBtc > 0 ? finalSpent / finalBtc : 0;
  const liveBtcPricePhp = liveBtcPrice * rate;
  const portfolioValue = finalBtc * liveBtcPrice;
  const portfolioGainPercent = averageCost > 0
    ? ((liveBtcPricePhp - averageCost) / averageCost) * 100
    : 0;

  return {
    totalStack:           finalBtc,
    averageCost,
    totalSpent:           finalSpent,
    portfolioValue,
    portfolioGainPercent,
  };
}
