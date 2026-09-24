import { Menu, RefreshCw } from 'lucide-react';

export default function AppHeader({ activeTab, setMobileMenuOpen, handleSyncPrice, isSyncing, lastSyncText }) {
  return (
        <header className="flex items-center justify-between mb-8 mt-2">
          {/* Logo & Toggle for Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-brand-bg-card border border-brand-border rounded-xl text-brand-text-tertiary hover:text-brand-text-primary mr-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/basis-logo.png"
                alt="Basis"
                className="h-12 w-32 object-contain object-left"
              />
            </div>
          </div>

          <div className="hidden md:block">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-text-primary leading-tight">
              {activeTab === 'Dashboard' && 'Portfolio Overview'}
              {activeTab === 'My Buys' && 'My DCA Purchases'}
              {activeTab === 'Settings' && 'Accumulation Settings'}
            </h1>
            <p className="text-sm text-brand-text-secondary mt-1">
              {activeTab === 'Dashboard' && 'Tracking your automated wealth accumulation.'}
              {activeTab === 'My Buys' && 'Comprehensive history of your Bitcoin acquisitions.'}
              {activeTab === 'Settings' && 'Fine-tune your automated Bitcoin accumulation strategy.'}
            </p>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncPrice}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-brand-bg-card hover:bg-brand-accent-soft active:scale-95 border border-brand-border rounded-xl text-xs md:text-sm font-semibold text-brand-text-secondary transition-all select-none disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-text-tertiary ${isSyncing ? 'animate-spin text-brand-bitcoin' : ''}`} />
            <span>{lastSyncText}</span>
          </button>
        </header>
  );
}
