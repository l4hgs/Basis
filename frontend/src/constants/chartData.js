/**
 * Offline fallback price data for the DCA chart.
 *
 * Used by DcaChart.jsx when the Blockchain.info API is unavailable.
 * Points marked `isDca: true` are DCA execution markers; those with
 * `purchaseId` map to the corresponding purchase in INITIAL_PURCHASES.
 *
 * Keep this file in sync with backend seed data if you change the
 * initial purchases.
 */

export const TIMEFRAME_DATA = {
  '1W': [
    { date: 'Oct 25, 2023', price: 34100 },
    { date: 'Oct 26, 2023', price: 34500 },
    { date: 'Oct 27, 2023', price: 33900 },
    { date: 'Oct 28, 2023', price: 34120 },
    { date: 'Oct 29, 2023', price: 34300 },
    { date: 'Oct 30, 2023', price: 34450 },
    { date: 'Oct 31, 2023', price: 34600 },
  ],
  '1M': [
    { date: 'Oct 1, 2023',  price: 27100 },
    { date: 'Oct 3, 2023',  price: 27500 },
    { date: 'Oct 5, 2023',  price: 27300 },
    { date: 'Oct 7, 2023',  price: 27950 },
    { date: 'Oct 10, 2023', price: 27400, isDca: true, purchaseId: 3 },
    { date: 'Oct 12, 2023', price: 26800 },
    { date: 'Oct 14, 2023', price: 26900 },
    { date: 'Oct 17, 2023', price: 28200, isDca: true, purchaseId: 2 },
    { date: 'Oct 19, 2023', price: 28700 },
    { date: 'Oct 21, 2023', price: 29900 },
    { date: 'Oct 24, 2023', price: 33900, isDca: true, purchaseId: 1 },
    { date: 'Oct 26, 2023', price: 34100 },
    { date: 'Oct 28, 2023', price: 34050 },
    { date: 'Oct 30, 2023', price: 34300 },
    { date: 'Oct 31, 2023', price: 34600 },
  ],
  'YTD': [
    { date: 'Jan 2023', price: 16500 },
    { date: 'Feb 2023', price: 21800 },
    { date: 'Mar 2023', price: 24400 },
    { date: 'Apr 2023', price: 28500 },
    { date: 'May 2023', price: 27200, isDca: true, isHistoricalDca: true, amountUsd: 500, receivedBtc: 0.01838 },
    { date: 'Jun 2023', price: 26300 },
    { date: 'Jul 2023', price: 30400, isDca: true, isHistoricalDca: true, amountUsd: 500, receivedBtc: 0.01645 },
    { date: 'Aug 2023', price: 29200 },
    { date: 'Sep 2023', price: 25800, isDca: true, isHistoricalDca: true, amountUsd: 500, receivedBtc: 0.01938 },
    { date: 'Oct 10, 2023', price: 27400, isDca: true, purchaseId: 3 },
    { date: 'Oct 17, 2023', price: 28200, isDca: true, purchaseId: 2 },
    { date: 'Oct 24, 2023', price: 33900, isDca: true, purchaseId: 1 },
    { date: 'Oct 31, 2023', price: 34600 },
  ],
  'ALL': [
    { date: 'Jan 2021', price: 29000 },
    { date: 'Apr 2021', price: 64000, isDca: true, isHistoricalDca: true, amountUsd: 1000, receivedBtc: 0.01562 },
    { date: 'Jul 2021', price: 31000 },
    { date: 'Nov 2021', price: 67500, isDca: true, isHistoricalDca: true, amountUsd: 1000, receivedBtc: 0.01481 },
    { date: 'Jan 2022', price: 43000 },
    { date: 'Jun 2022', price: 20000, isDca: true, isHistoricalDca: true, amountUsd: 1000, receivedBtc: 0.05000 },
    { date: 'Dec 2022', price: 16500 },
    { date: 'Apr 2023', price: 28500 },
    { date: 'Jul 2023', price: 30400 },
    { date: 'Oct 10, 2023', price: 27400, isDca: true, purchaseId: 3 },
    { date: 'Oct 17, 2023', price: 28200, isDca: true, purchaseId: 2 },
    { date: 'Oct 24, 2023', price: 33900, isDca: true, purchaseId: 1 },
    { date: 'Oct 31, 2023', price: 34600 },
  ],
};
