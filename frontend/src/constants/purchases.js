/**
 * Shared purchase constants used by App.jsx and any utility that
 * needs to combine user-logged buys with the pre-loaded "inception stack".
 *
 * HISTORICAL_* represent the cumulative DCA buys made before the tracked
 * window (before Oct 10 2023).  They are intentionally locked and cannot
 * be edited through the UI.
 */

export const HISTORICAL_SPENT = 0;   // No historical spend
export const HISTORICAL_BTC   = 0;    // No historical BTC

/** Seed data — start empty; users will add buys manually. */
export const INITIAL_PURCHASES = [];
