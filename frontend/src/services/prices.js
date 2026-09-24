/**
 * services/prices.js — unified price-data layer for the Basis frontend.
 *
 * Consolidates the three external price APIs into one module with
 * consistent error handling, logging, and offline fallbacks.
 *
 * Consumers:
 *   App.jsx       → fetchSpotPrice(), fetchHistoricalPrice()
 *   DcaChart.jsx  → fetchPriceSeries()
 */

import { TIMEFRAME_DATA } from '../constants/chartData.js';

const LOG = '[prices]';

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a human-readable or ISO date string to YYYY-MM-DD.
 * Handles: 'Oct 24, 2023', '2023-10-24', 'Jan 2023' (first of month).
 */
export function parseDateToYmd(dateStr) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const dateObj = new Date(dateStr);
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Month-Year only: 'Jan 2023' → '2023-01-01'
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const idx    = months.indexOf(parts[0]);
    if (idx !== -1) {
      const year  = parts[1].padStart(4, '0');
      const month = String(idx + 1).padStart(2, '0');
      return `${year}-${month}-01`;
    }
  }

  return dateStr;
}

/**
 * Find the closest price point in chartPrices for a given date string.
 */
export function findClosestChartPoint(dateStr, chartPrices) {
  if (!chartPrices || chartPrices.length === 0) return null;
  const targetYmd = parseDateToYmd(dateStr);
  if (!targetYmd) return null;

  const targetTime = new Date(targetYmd).getTime();
  if (isNaN(targetTime)) return null;

  let closest = chartPrices[0];
  let minDiff = Math.abs(new Date(chartPrices[0].time).getTime() - targetTime);

  for (let i = 1; i < chartPrices.length; i++) {
    const item = chartPrices[i];
    const itemTime = new Date(item.time).getTime();
    const diff = Math.abs(itemTime - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }

  return closest;
}

export function formatCoinGeckoDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

// ─── 1. Live spot price — Coinbase ───────────────────────────────────────────

/**
 * Fetch the current BTC/USD spot price from Coinbase.
 * @returns {Promise<number|null>}  Price in USD, or null on failure.
 */
export async function fetchSpotPrice() {
  try {
    const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const price = parseFloat(data?.data?.amount);
    if (isNaN(price)) throw new Error('Unexpected response shape');
    return price;
  } catch (err) {
    console.warn(`${LOG} fetchSpotPrice failed:`, err.message);
    return null;
  }
}

// ─── 2. Historical price for a date — CoinGecko ──────────────────────────────

/**
 * Fetch the BTC/USD price on a specific historical date from CoinGecko.
 * @param {string} dateStr  ISO date string: 'YYYY-MM-DD'
 * @param {AbortSignal} [signal]  Optional abort signal for cancellation.
 * @returns {Promise<number|null>}  Price in USD, or null on failure / no data.
 */
export async function fetchHistoricalPrice(dateStr, signal) {
  try {
    const geckoDate = formatCoinGeckoDate(dateStr);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${geckoDate}&localization=false`,
      { ...(signal && { signal }) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data  = await res.json();
    const usdPrice = data?.market_data?.current_price?.usd;
    const phpPrice = data?.market_data?.current_price?.php ?? (usdPrice ? usdPrice * 58.5 : null);
    if (!usdPrice) return null;
    return { usd: usdPrice, php: phpPrice };
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.warn(`${LOG} fetchHistoricalPrice(${dateStr}) failed:`, err.message);
    return null;
  }
}

// ─── 3. Price series for chart — Blockchain.info ─────────────────────────────

/**
 * Fetch a BTC/USD OHLCV series for a given timeframe from Blockchain.info.
 * Falls back to the local TIMEFRAME_DATA constants on API failure.
 *
 * @param {'1W'|'1M'|'YTD'|'ALL'} timeframe
 * @returns {Promise<Array<{time: string, value: number}>>}
 */
export async function fetchPriceSeries(timeframe) {
  const timespanMap = { '1W': '30days', '1M': '30days', 'YTD': '1year', 'ALL': 'all' };
  const timespan    = timespanMap[timeframe] ?? '30days';

  try {
    const res = await fetch(
      `https://api.blockchain.info/charts/market-price?timespan=${timespan}&format=json&cors=true`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.values?.length) throw new Error('Empty response');

    let mapped = data.values.map(item => ({
      time:  new Date(item.x * 1000).toISOString().split('T')[0],
      value: item.y,
    }));

    // Apply timeframe-specific filters
    if (timeframe === '1W') {
      mapped = mapped.slice(-7);
    } else if (timeframe === 'YTD') {
      const startOfYear = `${new Date().getFullYear()}-01-01`;
      mapped = mapped.filter(p => p.time >= startOfYear);
    }

    return mapped;
  } catch (err) {
    console.warn(`${LOG} fetchPriceSeries(${timeframe}) failed — using fallback:`, err.message);
    return _buildFallback(timeframe);
  }
}

/**
 * Build a chart-ready array from the local TIMEFRAME_DATA fallback.
 * @param {string} timeframe
 * @returns {Array<{time: string, value: number}>}
 */
function _buildFallback(timeframe) {
  const rawPoints = TIMEFRAME_DATA[timeframe] ?? [];
  return rawPoints
    .map(p => ({ time: parseDateToYmd(p.date), value: p.price }))
    .sort((a, b) => a.time.localeCompare(b.time));
}
