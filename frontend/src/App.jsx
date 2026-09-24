import { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import DashboardPage from './pages/DashboardPage';
import MyBuysPage from './pages/MyBuysPage';
import SettingsPage from './pages/SettingsPage';
import { INITIAL_PURCHASES } from './constants/purchases';
import { computeDcaStats } from './utils/dcaStats';
import { fetchBuys, createBuy, updateBuy, deleteBuy, fetchSettings, saveSettings } from './services/api';
import { fetchSpotPrice, fetchHistoricalPrice } from './services/prices';

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_PURCHASES_KEY = 'basis_purchases';
const LS_SETTINGS_KEY  = 'basis_settings';

const DEFAULT_SETTINGS = {
  frequency:    'weekly',
  amount:       500,
  asset:        'BTC',
  autoSync:     true,
  emailReports: true,
  walletKey:    'bc1qxy2kg3340qxx3ur52hdva64223250u230uxy5z',
};

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse localStorage[${key}]:`, e);
  }
  return fallback;
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function sanitizePurchases(rawPurchases, rate = 58.5) {
  if (!Array.isArray(rawPurchases)) return [];
  return rawPurchases.map(p => {
    const phpAmount = Number(p.amountUsd) || 0;
    const btcAmount = Number(p.receivedBtc) || 0;
    const effectiveUsdPrice = btcAmount > 0 ? (phpAmount / btcAmount) / rate : 0;

    if (phpAmount > 0 && effectiveUsdPrice < 10000) {
      let usdPrice = Number(p.marketPrice) || 67000;
      if (usdPrice > 500000) usdPrice = usdPrice / rate;
      if (usdPrice < 10000) usdPrice = 67000;

      const correctedBtc = (phpAmount / rate) / usdPrice;
      return {
        ...p,
        receivedBtc: Number(correctedBtc.toFixed(8)),
        marketPrice: Math.round(usdPrice),
      };
    }
    return p;
  });
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Last Sync: 2m ago');

  // ── Purchases ───────────────────────────────────────────────────────────────
  const [purchases, setPurchases] = useState(() => sanitizePurchases(loadLS(LS_PURCHASES_KEY, []), 58.5));

  // Write-through cache
  useEffect(() => { saveLS(LS_PURCHASES_KEY, purchases); }, [purchases]);

  // No automatic fetch – purchases are added manually only.


  // ── DCA Plan (Settings) ──────────────────────────────────────────────────────
  const [dcaPlan, setDcaPlan] = useState(
    () => loadLS(LS_SETTINGS_KEY, DEFAULT_SETTINGS)
  );

  // Write-through cache
  useEffect(() => { saveLS(LS_SETTINGS_KEY, dcaPlan); }, [dcaPlan]);

  // Load from API on mount
  useEffect(() => {
    fetchSettings().then(data => {
      if (data && typeof data === 'object') {
        setDcaPlan(prev => {
          const next = { ...prev, ...data };
          saveLS(LS_SETTINGS_KEY, next);
          return next;
        });
      }
    });
  }, []);

  const handleSaveDcaPlan = async (updatedPlan) => {
    setDcaPlan(updatedPlan);              // optimistic
    const confirmed = await saveSettings(updatedPlan);
    if (confirmed) setDcaPlan(confirmed); // reconcile with server response
  };

  // ── Live BTC Price ─────────────────────────────────────────────────────────
  const [liveBtcPrice, setLiveBtcPrice] = useState(96432.50);
  const [hoveredDcaPoint, setHoveredDcaPoint] = useState(null);

  const handleSyncPrice = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    fetchSpotPrice().then(price => {
      if (price !== null) {
        setLiveBtcPrice(price);
        setLastSyncText('Last Sync: Just now');
        setIsSyncing(false);
      } else {
        // Offline fallback — small random jitter
        const pctChange = (Math.random() - 0.5) * 0.01;
        setLiveBtcPrice(prev => Math.round(prev * (1 + pctChange) * 100) / 100);
        setLastSyncText('Last Sync: Just now');
        setIsSyncing(false);
      }
    });
  };

  useEffect(() => {
    let active = true;

    const sync = () => {
      setIsSyncing(true);
      fetchSpotPrice().then(price => {
        if (!active) return;
        if (price !== null) {
          setLiveBtcPrice(price);
        } else {
          const pctChange = (Math.random() - 0.5) * 0.01;
          setLiveBtcPrice(prev => Math.round(prev * (1 + pctChange) * 100) / 100);
        }
        setLastSyncText('Last Sync: Just now');
        setIsSyncing(false);
      });
    };

    sync();
    const interval = setInterval(sync, 10000);

    return () => { 
      active = false;
      clearInterval(interval);
    };
  }, []);

  // ── PHP Exchange Rate ──────────────────────────────────────────────────────
  const [phpRate, setPhpRate] = useState(58.5);

  useEffect(() => {
    let active = true;
    fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
      .then(res => res.json())
      .then(data => {
        if (active && data?.data?.rates?.PHP) {
          setPhpRate(parseFloat(data.data.rates.PHP));
        }
      })
      .catch(err => console.warn('Failed to fetch PHP rate', err));
    return () => { active = false; };
  }, []);

  // ── Historical price form state ────────────────────────────────────────────
  const [buyDate, setBuyDate] = useState('2023-10-31');
  const [usdAmount, setUsdAmount] = useState('');
  const [btcReceived, setBtcReceived] = useState('');
  const [formError, setFormError] = useState('');
  const [isOverride, setIsOverride] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [fetchedMarketPrice, setFetchedMarketPrice] = useState(null);
  const fetchAbortRef = useRef(null);
  const usdAmountRef = useRef(usdAmount);
  const isOverrideRef = useRef(isOverride);
  const phpRateRef = useRef(phpRate);

  useEffect(() => { usdAmountRef.current = usdAmount; }, [usdAmount]);
  useEffect(() => { isOverrideRef.current = isOverride; }, [isOverride]);
  useEffect(() => { phpRateRef.current = phpRate; }, [phpRate]);

  // Auto-fetch historical price when date changes
  useEffect(() => {
    if (!buyDate) return;

    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller       = new AbortController();
    fetchAbortRef.current  = controller;

    setIsFetchingPrice(true);
    setFetchedMarketPrice(null);
    if (!isOverrideRef.current) setBtcReceived('');

    fetchHistoricalPrice(buyDate, controller.signal).then(price => {
      if (controller.signal.aborted) return;
      setFetchedMarketPrice(price);
      if (price && !isOverrideRef.current) {
        const parsedPhp = parseFloat(usdAmountRef.current);
        if (parsedPhp > 0) {
          const btcPriceUsd = price.usd;
          const btcPricePhp = btcPriceUsd * phpRateRef.current;
          setBtcReceived((parsedPhp / btcPricePhp).toFixed(8));
        }
      }
      setIsFetchingPrice(false);
    });

    return () => controller.abort();
  }, [buyDate]);

  // Recalculate BTC when PHP amount changes
  useEffect(() => {
    if (isOverride) return;
    const parsedPhp = parseFloat(usdAmount);
    if (parsedPhp > 0) {
      const btcPriceUsd = fetchedMarketPrice?.usd || liveBtcPrice;
      const btcPricePhp = btcPriceUsd * phpRate;
      setBtcReceived((parsedPhp / btcPricePhp).toFixed(8));
    } else {
      setBtcReceived('');
    }
  }, [usdAmount, fetchedMarketPrice, liveBtcPrice, phpRate, isOverride]);

  // ── DCA Statistics ─────────────────────────────────────────────────────────
  const { totalStack, averageCost, totalSpent, portfolioValue, portfolioGainPercent } =
    useMemo(() => computeDcaStats(purchases, liveBtcPrice, phpRate), [purchases, liveBtcPrice, phpRate]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const handleLogPurchase = (e) => {
    e.preventDefault();
    setFormError('');

    const parsedPhp = parseFloat(usdAmount);
    const parsedBtc = parseFloat(btcReceived);

    if (!buyDate)                          { setFormError('Please select a buy date.'); return; }
    if (isNaN(parsedPhp) || parsedPhp <= 0) { setFormError('Please enter a valid PHP amount.'); return; }
    if (isFetchingPrice)                   { setFormError('Please wait — fetching historical price...'); return; }
    if (!fetchedMarketPrice && !isOverride) {
      setFormError('Could not fetch historical price. Enable Override to enter BTC manually.');
      return;
    }
    if (isNaN(parsedBtc) || parsedBtc <= 0) { setFormError('Please enter a valid BTC amount.'); return; }

    const formattedDate = new Date(buyDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const marketPriceUsd = isOverride
      ? (parsedPhp / parsedBtc) / phpRate
      : (fetchedMarketPrice?.usd || liveBtcPrice);

    const newPurchase = {
      id:          Date.now(),
      asset:       'BTC',
      date:        formattedDate,
      amountUsd:   parsedPhp,
      receivedBtc: parsedBtc,
      marketPrice: marketPriceUsd,
      isCustomRate: isOverride,
    };

    setPurchases(prev => [newPurchase, ...prev]);
    createBuy(newPurchase);

    setUsdAmount('');
    setBtcReceived('');
    setFetchedMarketPrice(null);
    setIsOverride(false);
  };

  const handleSavePurchaseEdit = (updatedPurchase) => {
    setPurchases(prev => prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
    updateBuy(updatedPurchase.id, updatedPurchase);
  };

  const handleDeletePurchase = (id) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    deleteBuy(id);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-brand-bg-canvas flex text-brand-text-primary overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="h-screen min-w-0 flex-1 bg-brand-bg-canvas flex flex-col p-4 md:p-8 overflow-y-auto overflow-x-hidden max-w-7xl mx-auto">
        <AppHeader
          activeTab={activeTab}
          setMobileMenuOpen={setMobileMenuOpen}
          handleSyncPrice={handleSyncPrice}
          isSyncing={isSyncing}
          lastSyncText={lastSyncText}
        />

        {activeTab === 'Dashboard' && (
          <DashboardPage
            portfolioGainPercent={portfolioGainPercent}
            portfolioValue={portfolioValue}
            totalStack={totalStack}
            averageCost={averageCost}
            liveBtcPrice={liveBtcPrice}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            purchases={purchases}
            setHoveredDcaPoint={setHoveredDcaPoint}
            hoveredDcaPoint={hoveredDcaPoint}
            setActiveTab={setActiveTab}
            formError={formError}
            handleLogPurchase={handleLogPurchase}
            buyDate={buyDate}
            setBuyDate={setBuyDate}
            isFetchingPrice={isFetchingPrice}
            fetchedMarketPrice={fetchedMarketPrice}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            btcReceived={btcReceived}
            setBtcReceived={setBtcReceived}
            isOverride={isOverride}
            setIsOverride={setIsOverride}
            dcaPlan={dcaPlan}
            phpRate={phpRate}
          />
        )}

        {activeTab === 'My Buys' && (
          <MyBuysPage
            purchases={purchases}
            onSaveEdit={handleSavePurchaseEdit}
            onDelete={handleDeletePurchase}
            totalSpent={totalSpent}
            phpRate={phpRate}
          />
        )}

        {activeTab === 'Settings' && (
          <SettingsPage
            dcaPlan={dcaPlan}
            onSave={handleSaveDcaPlan}
          />
        )}
      </main>
    </div>
  );
}
