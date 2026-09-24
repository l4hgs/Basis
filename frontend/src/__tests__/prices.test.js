import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TIMEFRAME_DATA } from '../constants/chartData.js';
import { fetchHistoricalPrice, fetchPriceSeries, formatCoinGeckoDate, parseDateToYmd } from '../services/prices.js';

describe('price service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('formats CoinGecko historical dates as dd-mm-yyyy', () => {
    expect(formatCoinGeckoDate('2023-10-24')).toBe('24-10-2023');
  });

  it('requests CoinGecko with a formatted date', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ market_data: { current_price: { usd: 33900 } } }),
    });

    const price = await fetchHistoricalPrice('2023-10-24');

    expect(price).toEqual({ usd: 33900, php: 1983150 });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('date=24-10-2023'),
      {}
    );
  });

  it('falls back to local timeframe data when price series fetch fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));

    const series = await fetchPriceSeries('1W');
    const expected = TIMEFRAME_DATA['1W']
      .map(point => ({ time: parseDateToYmd(point.date), value: point.price }))
      .sort((a, b) => a.time.localeCompare(b.time));

    expect(series).toEqual(expected);
  });
});
