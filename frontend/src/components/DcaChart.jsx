import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { createChart, LineStyle, LineType, ColorType, AreaSeries, LineSeries } from 'lightweight-charts';
import { DcaMarkersPrimitive } from '../plugins/DcaMarkersPlugin';
import { HISTORICAL_BTC, HISTORICAL_SPENT } from '../constants/purchases';
import { fetchPriceSeries, parseDateToYmd, findClosestChartPoint } from '../services/prices';

export default function DcaChart({ timeframe, purchases, setHoveredDcaPoint, phpRate = 58.5 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const priceSeriesRef = useRef(null);
  const avgCostSeriesRef = useRef(null);
  const primitiveRef = useRef(null);
  const purchasesRef = useRef(purchases);
  const chartPricesRef = useRef([]);

  const [chartPrices, setChartPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep chartPricesRef synced
  useEffect(() => {
    chartPricesRef.current = chartPrices;
  }, [chartPrices]);

  // 1. Fetch Prices on Timeframe Change
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchPriceSeries(timeframe)
      .then((prices) => {
        if (!active) return;
        setChartPrices(prices);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [timeframe]);

  // 2. Compute dynamic average cost basis
  const chronologicalPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [purchases]);

  const getCostBasisAtDate = useCallback((dateStr) => {
    const targetTime = new Date(dateStr).getTime();
    let userBtc = 0;
    let userSpent = 0;

    for (const p of chronologicalPurchases) {
      const pTime = new Date(p.date).getTime();
      if (pTime <= targetTime) {
        userBtc += p.receivedBtc;
        userSpent += p.amountUsd;
      } else {
        break;
      }
    }

    const finalBtc = userBtc + HISTORICAL_BTC;
    const finalSpent = userSpent + HISTORICAL_SPENT;

    const avgCostPhp = finalBtc > 0 ? finalSpent / finalBtc : 0;
    return avgCostPhp / (phpRate || 58.5);
  }, [chronologicalPurchases, phpRate]);

  const chartData = useMemo(() => {
    if (chartPrices.length === 0) return { priceData: [], avgCostData: [] };

    const priceData = chartPrices;
    const avgCostData = chartPrices.map(p => ({
      time: p.time,
      value: getCostBasisAtDate(p.time)
    }));

    return { priceData, avgCostData };
  }, [chartPrices, getCostBasisAtDate]);

  // 3. Initialize and Setup Chart — LIGHT THEME
  useEffect(() => {
    if (!containerRef.current) return;

    // Create TradingView Chart — light palette
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#F3F4F6', style: LineStyle.Solid },
        horzLines: { color: '#F3F4F6', style: LineStyle.Solid },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: '#9CA3AF',
      },
      timeScale: {
        borderVisible: false,
        textColor: '#9CA3AF',
        timeVisible: true,
      },
      crosshair: {
        vertLine: {
          color: '#D1D5DB',
          width: 1,
          style: LineStyle.Solid,
          labelVisible: true,
        },
        horzLine: {
          color: '#D1D5DB',
          width: 1,
          style: LineStyle.Solid,
          labelVisible: true,
        },
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      width: containerRef.current.clientWidth,
      height: 300,
    });

    // Sleek Area Series for BTC Price — soft gray fill
    const priceSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(209, 213, 219, 0.25)',
      bottomColor: 'rgba(209, 213, 219, 0.02)',
      lineColor: '#9CA3AF',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });

    // Charcoal stepped Line Series for Average Cost Basis
    const avgCostSeries = chart.addSeries(LineSeries, {
      color: '#111827',
      lineWidth: 2.5,
      lineType: LineType.WithSteps,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    chartRef.current = chart;
    priceSeriesRef.current = priceSeries;
    avgCostSeriesRef.current = avgCostSeries;

    // Attach custom primitive markers plugin
    const dcaMarkers = new DcaMarkersPrimitive(purchasesRef.current, chartPricesRef.current);
    priceSeries.attachPrimitive(dcaMarkers);
    primitiveRef.current = dcaMarkers;

    // Proximity subscription for Crosshair Move to show custom tooltips
    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time) {
        setHoveredDcaPoint(null);
        return;
      }

      const { x, y } = param.point;
      const timeScale = chart.timeScale();
      const currentPurchases = purchasesRef.current || [];
      const currentChartPrices = chartPricesRef.current || [];

      const maxBuyAmount = currentPurchases.reduce((max, p) => {
        const amt = Number(p.amountUsd) || Number(p.amountPhp) || 0;
        return amt > max ? amt : max;
      }, 0);

      const hovered = currentPurchases.find(p => {
        const dateStr = parseDateToYmd(p.date);
        const closest = findClosestChartPoint(dateStr, currentChartPrices);

        let px = null;
        let py = null;

        if (closest) {
          px = timeScale.timeToCoordinate(closest.time);
          py = priceSeries.priceToCoordinate(closest.value);
        } else {
          const targetYmd = parseDateToYmd(p.date);
          px = timeScale.timeToCoordinate(targetYmd);
          const price = p.amountUsd / p.receivedBtc;
          py = priceSeries.priceToCoordinate(price);
        }

        if (px === null || py === null) return false;

        const dx = px - x;
        const dy = py - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const amt = Number(p.amountUsd) || Number(p.amountPhp) || 0;
        let radius = 7;
        if (maxBuyAmount > 0) {
          const ratio = amt / maxBuyAmount;
          const minRadius = 5;
          const maxRadius = 16;
          radius = minRadius + Math.sqrt(ratio) * (maxRadius - minRadius);
        }

        return dist <= radius + 6; // 6px padding tolerance
      });

      if (hovered) {
        const dateStr = parseDateToYmd(hovered.date);
        const closest = findClosestChartPoint(dateStr, currentChartPrices);

        let px = null;
        let py = null;

        if (closest) {
          px = timeScale.timeToCoordinate(closest.time);
          py = priceSeries.priceToCoordinate(closest.value);
        }

        if (px !== null && py !== null) {
          setHoveredDcaPoint({
            ...hovered,
            x: px,
            y: py,
            price: hovered.marketPrice || ((hovered.amountUsd / hovered.receivedBtc) / (phpRate || 58.5))
          });
        }
      } else {
        setHoveredDcaPoint(null);
      }
    });

    // Resize Observer to handle responsive container sizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      avgCostSeriesRef.current = null;
      primitiveRef.current = null;
    };
  }, [setHoveredDcaPoint]);

  // 4. Update data on changes
  useEffect(() => {
    if (!chartRef.current || !priceSeriesRef.current || !avgCostSeriesRef.current) return;
    const { priceData, avgCostData } = chartData;

    priceSeriesRef.current.setData(priceData);
    avgCostSeriesRef.current.setData(avgCostData);

    if (priceData.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [chartData]);

  // 5. Sync purchases & chartPrices updates in primitive
  useEffect(() => {
    purchasesRef.current = purchases;
    chartPricesRef.current = chartPrices;
    if (primitiveRef.current) {
      primitiveRef.current.updatePurchases(purchases, chartPrices);
    }
  }, [purchases, chartPrices]);

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 animate-spin text-brand-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-brand-text-secondary font-semibold tracking-wider uppercase">Loading Market Data...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-[300px] overflow-hidden rounded-xl" />
    </div>
  );
}
