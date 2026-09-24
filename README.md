<div align="center">
  <img src="frontend/public/basis-logo.png" alt="Basis Logo" width="120" height="120">
  
  # Basis - Bitcoin DCA Tracker

  > *Disciplined Stacking. High-Fidelity Insights.*  
  > A high-performance, real-time Bitcoin Dollar-Cost Averaging (DCA) tracker and accumulation dashboard.
</div>

<div align="center">

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TradingView](https://img.shields.io/badge/TradingView-Lightweight_Charts_v5-2563EB.svg?style=for-the-badge&logo=tradingview&logoColor=white)](https://tradingview.github.io/lightweight-charts/)
[![License](https://img.shields.io/badge/License-MIT-F7931A.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🎥 Demo & Overview

Watch **Basis** in action: [**View Interactive Dashboard Demo**](#) *(Coming Soon)*

---

## About Basis & The Accumulation Challenge

Bitcoin is infamous for short-term price volatility. Trying to time the market leads to emotional stress and poor financial decisions. **Dollar-Cost Averaging (DCA)**—buying a fixed fiat amount at regular intervals regardless of price—is historically the most effective strategy for building long-term Bitcoin wealth.

**The Tracking & Multi-Currency Gap**  
Many DCA investors face a tracking nightmare:
- Manual spreadsheets are tedious, error-prone, and lack dynamic average cost curves.
- Standard portfolio trackers display prices in USD only, ignoring local currencies like Philippine Pesos (PHP) while needing real-time BTC/USD spot updates.
- Traditional charts fail to show exact buy execution points alongside historical cost basis step lines.

**The Solution**  
We built **Basis** to be a high-fidelity, responsive fintech dashboard for disciplined Bitcoin accumulators:
- **Dual Currency Engine**: Portfolio values, ledger spent, and total invested tracked in **PHP (₱)**, while Bitcoin market prices and execution price levels remain standardized in **USD ($)**.
- **Custom Canvas Charts**: Custom TradingView Lightweight Charts primitives draw canvas DCA markers sized proportionally relative to your largest buy.
- **Dynamic Average Cost Basis**: Real-time step-line tracking that adjusts automatically as you log, edit, or remove DCA entries.

---

## Core Features

### 📊 Interactive Accumulation Chart & Custom Markers
Built with TradingView Lightweight Charts v5 and custom Canvas primitives. Shows BTC USD market price area curves overlaid with a stepped charcoal line for dynamic Average Buy Price. DCA buys are plotted directly on the timeline with pulsing orange markers sized relative to your highest purchase amount.

### 🇵🇭 Dual Currency Engine (PHP & USD)
Track your local portfolio value and total PHP invested accurately while inspecting global Bitcoin market prices in USD. Includes real-time exchange rate synchronization via Coinbase API.

### ⚡ Live 10-Second Spot Price Sync & Flip Clock Animations
Features automatic 10-second spot price polling with Top-to-Bottom Flip Clock digit micro-animations for live ticker updates and metric counters.

### 📝 Full CRUD Purchase Ledger & Custom Rate Overrides
Complete transaction history tab featuring inline editing, delete confirmations, and auto-fetching of historical BTC prices via CoinGecko. Supports manual override toggles for custom OTC or peer-to-peer exchange rates.

### 📱 Responsive Fintech Aesthetic & Dark Mode
Designed with a sleek, modern dark palette (`#0f1115` canvas, glassmorphism cards, glowing green indicators, and Bitcoin orange accents). Fully optimized for desktop, tablet, and mobile browsers.

---

## Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Modern UI library with state management and custom hooks |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Lightning-fast development server and module bundler |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS engine with custom brand design system |
| **Charting Engine** | [Lightweight Charts v5](https://tradingview.github.io/lightweight-charts/) | High-performance HTML5 canvas financial chart library |
| **Backend API** | [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) | RESTful API server for transaction persistence |
| **Icons & Micro-UI** | [Lucide React](https://lucide.dev/) | Clean, modern vector icon set |
| **Testing** | [Vitest](https://vitest.dev/) | Unit testing runner for statistical algorithms & validation |

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Quick Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/basis.git
   cd Basis
   ```

2. **Install all workspace dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start Frontend & Backend concurrently:**
   ```bash
   npm run dev
   ```

   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000` (Vite automatically proxies `/api/*` requests)

---

## Directory Structure

```text
Basis/
├── package.json              # Root concurrent execution scripts (npm run dev)
├── frontend/                 # React + Vite + Tailwind CSS v4 workspace
│   ├── public/               # Logos, SVG icons, static assets
│   ├── src/
│   │   ├── App.jsx           # Root application state & API synchronization
│   │   ├── main.jsx          # React DOM entry point
│   │   ├── index.css         # Tailwind CSS directives & custom micro-animations
│   │   │
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AppHeader.jsx      # Header bar, sync status, mobile navigation
│   │   │   ├── Sidebar.jsx        # Responsive collapsible navigation
│   │   │   ├── DcaChart.jsx       # Lightweight Charts canvas integration
│   │   │   └── ConfirmDialog.jsx  # Accessible delete modal
│   │   │
│   │   ├── pages/            # Application views
│   │   │   ├── DashboardPage.jsx  # Metrics, chart, recent buys, manual logger
│   │   │   ├── MyBuysPage.jsx     # Full CRUD ledger table with inline editing
│   │   │   └── SettingsPage.jsx   # DCA plan configuration & preferences
│   │   │
│   │   ├── plugins/
│   │   │   └── DcaMarkersPlugin.js # Custom Canvas Primitive for DCA execution dots
│   │   │
│   │   ├── services/
│   │   │   ├── api.js        # REST API fetch client (GET/POST/PUT/DELETE)
│   │   │   └── prices.js     # Unified price service (Coinbase, CoinGecko, Blockchain.info)
│   │   │
│   │   ├── utils/
│   │   │   └── dcaStats.js   # Pure, unit-tested portfolio math engine
│   │   │
│   │   └── __tests__/        # Vitest test suite
│   │       ├── dcaStats.test.js # Portfolio stat calculation & validation tests
│   │       └── prices.test.js   # Date formatting & price fallback tests
│   │
│   ├── index.html            # HTML shell with meta tags & Google fonts
│   └── vite.config.js        # Vite config: React plugin, API proxy, Vitest setup
│
└── backend/                  # Node.js + Express REST API workspace
    ├── server.js             # REST API endpoints for purchase persistence
    └── package.json          # Backend dependencies (Express, CORS)
```

---

## External Price APIs & Resiliency

| Provider | Endpoint / Usage | Fallback Strategy |
|---|---|---|
| **Coinbase** | `GET /v2/prices/BTC-USD/spot` (Live BTC Price) | Local fallback with minor realistic price jitter |
| **Coinbase** | `GET /v2/exchange-rates?currency=USD` (USD/PHP Exchange Rate) | Default fallback rate (`58.5 PHP/USD`) |
| **CoinGecko** | `GET /coins/bitcoin/history?date=...` (Historical Price) | Manual **Override** mode for custom rate input |
| **Blockchain.info** | `GET /charts/market-price?timespan=...` (Price Chart) | Offline fallback dataset in `constants/chartData.js` |

---

## Running Tests

Run the full unit test suite via Vitest:

```bash
cd frontend

# Run all test files once
npm test

# Launch Vitest interactive UI
npm run test:ui
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
