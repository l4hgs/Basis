import { useState, useEffect } from 'react';
import { Calendar, Download, Info, MoreVertical, TrendingUp } from 'lucide-react';
import DcaChart from '../components/DcaChart';

const FlipText = ({ text }) => {
  return (
    <span className="inline-flex">
      {String(text).split('').map((char, index) => (
        <span key={`${index}-${char}`} className="inline-block animate-flip-down" style={{ minWidth: char === ' ' ? '0.25em' : 'auto' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default function DashboardPage({ portfolioGainPercent, portfolioValue, totalStack, averageCost, liveBtcPrice, timeframe, setTimeframe, purchases, setHoveredDcaPoint, hoveredDcaPoint, setActiveTab, formError, handleLogPurchase, buyDate, setBuyDate, isFetchingPrice, fetchedMarketPrice, usdAmount, setUsdAmount, btcReceived, setBtcReceived, isOverride, setIsOverride, phpRate = 58.5 }) {
  const portfolioValuePHP = portfolioValue * phpRate;
  return (

    <div className="space-y-6">

      {/* ================= METRIC ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Portfolio Value */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 relative overflow-hidden group select-none transition-all duration-300 hover:border-brand-text-tertiary card-shadow card-shadow-hover">
          {/* Background Watermark SVG */}
          <div className="absolute right-[-10px] bottom-[-20px] opacity-[0.04] group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-500 text-brand-text-tertiary">
            <svg className="w-36 h-36" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Portfolio Value</span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-brand-green-bg border border-brand-green-border text-brand-green">
              <TrendingUp className="w-3 h-3" />
              +{portfolioGainPercent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-bold text-brand-text-primary font-numeric">
              <FlipText text={portfolioValuePHP.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} />
            </span>
            <div className="text-xs text-brand-text-tertiary font-semibold mt-1">
              <span className="font-numeric text-sm whitespace-nowrap">{totalStack.toFixed(5)}</span> BTC
            </div>
          </div>
        </div>

        {/* Card 2: Total Stack */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 relative overflow-hidden group select-none transition-all duration-300 hover:border-brand-text-tertiary card-shadow card-shadow-hover">
          {/* Background Watermark SVG */}
          <div className="absolute right-[-10px] bottom-[-20px] opacity-[0.04] group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-500 text-brand-text-tertiary">
            <svg className="w-36 h-36" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L11 15v1c0 1.1.9 2 2 2v-1.07zM17.9 14c-.1.3-.2.6-.4.9l-4.5-4.5V8c0-1.1-.9-2-2-2H9.3c.4-.7.9-1.3 1.5-1.8L15.5 9c.9.9.9 2.4 0 3.3l-2.4 2.4c.9.5 1.9.8 2.8.3.9-.5 1.4-1.5 2-1z" />
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Total Stack</span>
            <div className="w-6 h-6 rounded-full bg-brand-bitcoin/10 flex items-center justify-center border border-brand-bitcoin/20">
              <span className="text-xs font-bold text-brand-bitcoin">₿</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-bold text-brand-text-primary flex items-baseline gap-1">
              <span className="text-sm font-bold text-brand-bitcoin self-center mr-0.5">₿</span>
              <span className="font-numeric">{totalStack.toFixed(4)}</span>
            </span>
            <div className="text-xs text-brand-text-tertiary font-semibold mt-1">
              Avg. Cost: <span className="font-numeric text-sm whitespace-nowrap">₱{averageCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Live BTC Price */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 relative overflow-hidden group select-none transition-all duration-300 hover:border-brand-text-tertiary card-shadow card-shadow-hover">
          {/* Background Watermark SVG */}
          <div className="absolute right-[-10px] bottom-[-20px] opacity-[0.04] group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-500 text-brand-text-tertiary">
            <svg className="w-36 h-36" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Live BTC Price</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green pulse-dot inline-block"></span>
            </div>
            <div className="w-6 h-6 rounded-full bg-brand-bg-canvas flex items-center justify-center border border-brand-border">
              <svg className="w-3 h-3 text-brand-text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17.07z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-bold text-brand-text-primary font-numeric">
              <FlipText text={`$${liveBtcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            </span>
            <div className="text-xs text-brand-text-tertiary font-semibold mt-1">
              Updated: Just now
            </div>
          </div>
        </div>

      </div>

      {/* ================= CHART SECTION ================= */}
      <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 select-none relative card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-brand-text-primary tracking-tight flex items-center gap-2">
            Accumulation Strategy
            <span className="group relative">
              <Info className="w-4 h-4 text-brand-text-tertiary hover:text-brand-text-secondary cursor-pointer" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-brand-bg-card border border-brand-border rounded-lg text-[10px] text-brand-text-secondary leading-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-20">
                Step-line (charcoal) displays dynamic Cost Basis. Smooth line (gray) shows Bitcoin market price. Orange dots denote automated buys.
              </span>
            </span>
          </h2>

          {/* Timeframe selector */}
          <div className="flex p-0.5 bg-brand-bg-canvas rounded-xl border border-brand-border">
            {['1W', '1M', 'YTD', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer ${timeframe === tf
                  ? 'bg-brand-bg-card text-brand-text-primary border border-brand-border shadow-sm'
                  : 'text-brand-text-tertiary hover:text-brand-text-primary'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="w-full relative min-h-[300px]">
          <DcaChart
            timeframe={timeframe}
            purchases={purchases}
            setHoveredDcaPoint={setHoveredDcaPoint}
            phpRate={phpRate}
          />

          {/* Tooltip Overlay */}
          {hoveredDcaPoint && (
            <div
              className="absolute z-50 bg-brand-bg-card border border-brand-border rounded-xl p-3 shadow-2xl text-[11px] leading-tight select-none pointer-events-none transition-all duration-75"
              style={{
                left: `${hoveredDcaPoint.x}px`,
                top: `${hoveredDcaPoint.y - 12}px`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="font-bold text-brand-bitcoin uppercase tracking-wider text-[9px] mb-1">DCA BUY EXECUTION</div>
              <div className="text-brand-text-primary font-bold mb-1">Amount: <span className="font-numeric text-sm whitespace-nowrap">₱{hoveredDcaPoint.amountUsd.toFixed(2)}</span></div>
              <div className="text-brand-text-secondary">Date: {hoveredDcaPoint.date}</div>
              <div className="text-brand-green mt-0.5">Received: <span className="font-numeric text-sm whitespace-nowrap">{hoveredDcaPoint.receivedBtc.toFixed(5)}</span> BTC</div>
              <div className="text-brand-text-tertiary mt-0.5">Price: <span className="font-numeric text-sm whitespace-nowrap">${Math.round(hoveredDcaPoint.marketPrice ?? (hoveredDcaPoint.price / phpRate)).toLocaleString()}</span> / BTC</div>
              <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-brand-bg-card border-r border-b border-brand-border rotate-45"></div>
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-brand-text-secondary font-semibold px-2">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-brand-text-tertiary rounded"></span>
            <span>BTC PRICE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-brand-accent rounded"></span>
            <span>AVG. BUY PRICE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-bitcoin"></span>
            <span>DCA EXECUTION</span>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM SECTION (SPLIT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Recent Buys Table */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 lg:col-span-8 flex flex-col min-w-0 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-brand-text-primary tracking-tight">Recent Buys</h2>
            <button
              onClick={() => setActiveTab('My Buys')}
              className="text-xs font-semibold text-brand-bitcoin hover:underline cursor-pointer flex items-center gap-1"
            >
              View Full History
              <span className="text-[10px]">↗</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-xs md:text-sm text-brand-text-tertiary font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-left whitespace-nowrap w-[18%]">Asset</th>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap w-[22%]">Date</th>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap w-[24%]">Amount (PHP)</th>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap w-[24%]">Received (BTC)</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap w-[12%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 text-xs md:text-sm font-semibold">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="group hover:bg-brand-bg-canvas/60 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-bitcoin/10 flex items-center justify-center border border-brand-bitcoin/20 shrink-0">
                          <span className="text-xs font-bold text-brand-bitcoin">₿</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-text-primary">{purchase.asset}</span>
                          {purchase.isCustomRate && (
                            <span className="text-[9px] font-bold text-brand-bitcoin/80 uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Custom Rate
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-brand-text-secondary whitespace-nowrap">{purchase.date}</td>
                    <td className="py-4 px-4 text-brand-text-secondary whitespace-nowrap"><span className="font-numeric text-sm whitespace-nowrap">₱{purchase.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
                    <td className="py-4 px-4 text-brand-green whitespace-nowrap"><span className="font-numeric text-sm whitespace-nowrap">{purchase.receivedBtc.toFixed(5)}</span></td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => alert(`Downloading transaction ${purchase.id} details...`)}
                          className="p-1.5 hover:bg-brand-bg-canvas border border-transparent hover:border-brand-border rounded-lg text-brand-text-tertiary hover:text-brand-text-primary cursor-pointer"
                          title="Download Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert('Options menu')}
                          className="p-1.5 hover:bg-brand-bg-canvas border border-transparent hover:border-brand-border rounded-lg text-brand-text-tertiary hover:text-brand-text-primary cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Manual Entry Form Box */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 lg:col-span-4 flex flex-col card-shadow">
          <h2 className="text-base font-bold text-brand-text-primary tracking-tight mb-1">Manual Entry</h2>
          <p className="text-[11px] text-brand-text-tertiary mb-4">BTC amount is auto-calculated from historical market price.</p>

          <form onSubmit={handleLogPurchase} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Date Input */}
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">Buy Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-text-tertiary" />
                <input
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-bg-input border border-brand-border rounded-xl text-sm font-semibold text-brand-text-primary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all select-none"
                />
              </div>
            </div>

            {/* Market Price Preview */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${isFetchingPrice
              ? 'border-brand-border bg-brand-bg-input'
              : fetchedMarketPrice
                ? 'border-brand-green-border bg-brand-green-bg'
                : 'border-brand-border bg-brand-bg-input'
              }`}>
              <span className="text-[10px] font-bold text-brand-text-tertiary uppercase tracking-wider">Market Price</span>
              {isFetchingPrice ? (
                <span className="flex items-center gap-1.5 text-[11px] text-brand-text-secondary">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching...
                </span>
              ) : fetchedMarketPrice ? (
                <span className="text-[11px] font-bold text-brand-green font-numeric">
                  ${fetchedMarketPrice.usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-[11px] text-brand-text-tertiary">—</span>
              )}
            </div>

            {/* PHP Amount Input */}
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">PHP Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-text-tertiary font-bold text-sm">₱</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-brand-bg-input border border-brand-border rounded-xl text-sm font-semibold text-brand-text-primary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all"
                />
              </div>
            </div>

            {/* BTC Received — read-only unless Override */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] md:text-xs font-bold text-brand-text-secondary uppercase tracking-wider">BTC Received</label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                  <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${isOverride ? 'bg-brand-bitcoin' : 'bg-brand-border'
                    }`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${isOverride ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isOverride}
                      onChange={(e) => {
                        setIsOverride(e.target.checked);
                        if (!e.target.checked && fetchedMarketPrice) {
                          const parsedUsd = parseFloat(usdAmount);
                          if (parsedUsd > 0) setBtcReceived((parsedUsd / fetchedMarketPrice).toFixed(8));
                          else setBtcReceived('');
                        }
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isOverride ? 'text-brand-bitcoin' : 'text-brand-text-tertiary'
                    }`}>Override</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-bitcoin font-bold text-sm">₿</span>
                <input
                  type="number"
                  step="0.00000001"
                  placeholder={isFetchingPrice ? 'Calculating...' : '0.00000000'}
                  value={btcReceived}
                  readOnly={!isOverride}
                  onChange={(e) => isOverride && setBtcReceived(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 border rounded-xl text-sm font-semibold transition-all ${isOverride
                    ? 'bg-brand-bg-input border-brand-bitcoin/40 text-brand-text-primary focus:outline-none focus:border-brand-bitcoin/70 focus:ring-1 focus:ring-brand-bitcoin/30 cursor-text'
                    : 'bg-brand-bg-canvas border-brand-border text-brand-text-tertiary cursor-not-allowed select-none'
                    }`}
                />
                {!isOverride && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isFetchingPrice ? (
                      <svg className="w-3.5 h-3.5 animate-spin text-brand-text-tertiary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : fetchedMarketPrice ? (
                      <svg className="w-3.5 h-3.5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-brand-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-6v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {isOverride && (
                <p className="mt-1.5 text-[10px] text-brand-bitcoin/70 font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Custom rate — this entry will be flagged in the ledger.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isFetchingPrice}
              className="w-full py-3.5 bg-brand-accent text-white hover:bg-brand-accent/90 active:scale-[0.98] rounded-xl text-xs md:text-sm font-extrabold uppercase tracking-wider cursor-pointer transition-all duration-150 glow-accent-btn disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isFetchingPrice ? 'Fetching Price...' : 'Log Purchase'}
            </button>
          </form>
        </div>

      </div>

    </div>

  );
}
