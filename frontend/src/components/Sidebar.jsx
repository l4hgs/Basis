import { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Settings, HelpCircle, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 340;
const SIDEBAR_DEFAULT_WIDTH = 248;
const SIDEBAR_COLLAPSED_WIDTH = 84;

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);

  const startSidebarResize = (event) => {
    if (sidebarCollapsed) return;

    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handlePointerMove = (moveEvent) => {
      const nextWidth = startWidth + moveEvent.clientX - startX;
      setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, nextWidth)));
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  /* ── Active / inactive nav button styles ─────────────────────────────── */
  const navBtnBase = (isActive, collapsed) =>
    `flex items-center transition-all duration-200 cursor-pointer ${collapsed
      ? 'mx-auto h-12 w-12 justify-center rounded-xl'
      : 'w-full gap-3 rounded-2xl px-4 py-3 text-sm font-semibold'
    } ${isActive
      ? 'bg-brand-accent text-white font-bold shadow-sm'
      : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg-canvas'
    }`;

  return (
    <>
      {/* ================= SIDEBAR ================= */}
      {/* Desktop Sidebar */}
      <aside
        className={`relative hidden h-screen max-h-screen overflow-y-auto overflow-x-hidden md:flex flex-col bg-brand-bg-sidebar border-r border-brand-border select-none shrink-0 transition-[width,padding] duration-300 ${sidebarCollapsed ? 'px-3 py-5' : 'px-5 py-6'}`}
        style={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth }}
      >
        {/* Logo + Collapse/Expand */}
        <div className={`flex flex-col ${sidebarCollapsed ? 'items-center mb-6 gap-3' : 'mb-10 gap-0'}`}>
          {/* Logo row */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
            <img
              src={sidebarCollapsed ? '/basis-logo-b.png' : '/basis-logo.png'}
              alt="Basis"
              className={sidebarCollapsed ? 'h-10 w-10 object-contain' : 'h-16 w-40 object-contain object-left'}
            />
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-bg-canvas border border-brand-border text-brand-text-tertiary hover:text-brand-text-primary hover:bg-brand-accent-soft transition-all cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  Collapse
                </span>
              </button>
            )}
          </div>
          {/* Expand button — shown below logo when collapsed */}
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-brand-bg-canvas border border-brand-border text-brand-text-tertiary hover:text-brand-text-primary hover:bg-brand-accent-soft transition-all cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                Expand
              </span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'space-y-3' : 'space-y-2'}`}>
          <button
            onClick={() => setActiveTab('Dashboard')}
            title="Dashboard"
            className={navBtnBase(activeTab === 'Dashboard', sidebarCollapsed)}
          >
            <LayoutDashboard className={sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 shrink-0'} />
            <span className={sidebarCollapsed ? 'sr-only' : ''}>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('My Buys')}
            title="My Buys"
            className={navBtnBase(activeTab === 'My Buys', sidebarCollapsed)}
          >
            <ShoppingBag className={sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 shrink-0'} />
            <span className={sidebarCollapsed ? 'sr-only' : ''}>My Buys</span>
          </button>

          <button
            onClick={() => setActiveTab('Settings')}
            title="Settings"
            className={navBtnBase(activeTab === 'Settings', sidebarCollapsed)}
          >
            <Settings className={sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 shrink-0'} />
            <span className={sidebarCollapsed ? 'sr-only' : ''}>Settings</span>
          </button>
        </nav>

        {/* Sidebar Bottom */}
        <div className={`${sidebarCollapsed ? 'space-y-2 border-t-0 pt-3' : 'space-y-1 border-t border-brand-border pt-5'}`}>
          <button
            onClick={() => alert('Support module coming soon!')}
            title="Support"
            className={`flex items-center text-brand-text-tertiary hover:text-brand-text-primary transition-all duration-150 cursor-pointer ${sidebarCollapsed ? 'mx-auto h-10 w-10 justify-center rounded-xl' : 'w-full gap-3 rounded-xl px-4 py-3 text-sm font-medium'
              }`}
          >
            <HelpCircle className={sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 shrink-0'} />
            <span className={sidebarCollapsed ? 'sr-only' : ''}>Support</span>
          </button>
          <button
            onClick={() => alert('Signing out...')}
            title="Sign Out"
            className={`flex items-center text-brand-text-tertiary hover:text-red-500 transition-all duration-150 cursor-pointer ${sidebarCollapsed ? 'mx-auto h-10 w-10 justify-center rounded-xl' : 'w-full gap-3 rounded-xl px-4 py-3 text-sm font-medium'
              }`}
          >
            <LogOut className={sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 shrink-0'} />
            <span className={sidebarCollapsed ? 'sr-only' : ''}>Sign Out</span>
          </button>
        </div>
        {!sidebarCollapsed && (
          <div
            className="absolute right-0 top-0 h-full w-2 translate-x-1/2 cursor-col-resize"
            onPointerDown={startSidebarResize}
            aria-label="Resize sidebar"
            role="separator"
          >
            <div className="mx-auto h-full w-px bg-brand-border transition-colors hover:bg-brand-text-tertiary" />
          </div>
        )}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/30 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-64 bg-brand-bg-sidebar border-r border-brand-border p-6 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img
                    src="/basis-logo.png"
                    alt="Basis"
                    className="h-14 w-36 object-contain object-left"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-brand-bg-canvas border border-brand-border text-brand-text-tertiary hover:text-brand-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => { setActiveTab('Dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'Dashboard' ? 'bg-brand-accent text-white font-bold' : 'text-brand-text-secondary hover:bg-brand-bg-canvas'
                    }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('My Buys'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'My Buys' ? 'bg-brand-accent text-white font-bold' : 'text-brand-text-secondary hover:bg-brand-bg-canvas'
                    }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  My Buys
                </button>
                <button
                  onClick={() => { setActiveTab('Settings'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'Settings' ? 'bg-brand-accent text-white font-bold' : 'text-brand-text-secondary hover:bg-brand-bg-canvas'
                    }`}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-brand-border space-y-1">
              <button
                onClick={() => { alert('Support module coming soon!'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-text-tertiary hover:text-brand-text-primary rounded-xl"
              >
                <HelpCircle className="w-5 h-5" />
                Support
              </button>
              <button
                onClick={() => { alert('Signing out...'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-text-tertiary hover:text-red-500 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}



    </>
  );
}
