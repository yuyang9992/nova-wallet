import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { AppKitButton } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter, queryClient } from "./walletConfig";

const API = "https://api.binance.com/api/v3";

const COINS = [
{ symbol: "BTCUSDT", name: "Bitcoin", short: "BTC", icon: "₿" },
{ symbol: "ETHUSDT", name: "Ethereum", short: "ETH", icon: "Ξ" },
{ symbol: "SOLUSDT", name: "Solana", short: "SOL", icon: "S" },
{ symbol: "BNBUSDT", name: "BNB", short: "BNB", icon: "◆" },
{ symbol: "XRPUSDT", name: "XRP", short: "XRP", icon: "X" },
{ symbol: "ADAUSDT", name: "Cardano", short: "ADA", icon: "A" },
{ symbol: "DOGEUSDT", name: "Dogecoin", short: "DOGE", icon: "Ð" },
{ symbol: "AVAXUSDT", name: "Avalanche", short: "AVAX", icon: "A" },
{ symbol: "LINKUSDT", name: "Chainlink", short: "LINK", icon: "L" },
{ symbol: "DOTUSDT", name: "Polkadot", short: "DOT", icon: "●" },
{ symbol: "TRXUSDT", name: "TRON", short: "TRX", icon: "T" },
{ symbol: "LTCUSDT", name: "Litecoin", short: "LTC", icon: "Ł" },
];

const TIMEFRAMES = [
{ label: "1m", value: "1m" },
{ label: "5m", value: "5m" },
{ label: "15m", value: "15m" },
{ label: "1h", value: "1h" },
{ label: "4h", value: "4h" },
{ label: "1D", value: "1d" },
];

function formatPrice(value) {
if (value === null || value === undefined || Number.isNaN(Number(value))) {
return "—";
}

const number = Number(value);

if (number >= 1000) {
return number.toLocaleString("en-US", {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
});
}

if (number >= 1) {
return number.toLocaleString("en-US", {
minimumFractionDigits: 2,
maximumFractionDigits: 4,
});
}

return number.toLocaleString("en-US", {
minimumFractionDigits: 4,
maximumFractionDigits: 8,
});
}

function formatCompact(value) {
const number = Number(value || 0);

if (number >= 1000000000) {
return `$${(number / 1000000000).toFixed(2)}B`;
}

if (number >= 1000000) {
return `$${(number / 1000000).toFixed(2)}M`;
}

if (number >= 1000) {
return `$${(number / 1000).toFixed(2)}K`;
}

return `$${number.toFixed(2)}`;
}

function AppStyles() {
return ( <style>{`
:root {
color-scheme: dark;
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
BlinkMacSystemFont, "Segoe UI", sans-serif;
background: #080b12;
color: #f4f7fb;
}



  body {
    margin: 0;
    background: #080b12;
    color: #f4f7fb;
  }

  button,
  input,
  select {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  .app-shell {
    min-height: 100vh;
    display: flex;
    background:
      radial-gradient(circle at 80% -10%, rgba(45, 80, 160, 0.12), transparent 30%),
      #080b12;
  }

  .sidebar {
    width: 190px;
    min-height: 100vh;
    padding: 22px 14px;
    border-right: 1px solid #202838;
    background: #0a0e16;
    flex-shrink: 0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 36px;
  }

  .brand-mark {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: linear-gradient(135deg, #7765ff, #4f46d9);
    color: white;
    font-weight: 800;
    font-size: 19px;
  }

  .brand-name {
    font-size: 16px;
    line-height: 1.05;
    font-weight: 800;
  }

  .sidebar-label {
    color: #65738d;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.4px;
    padding: 0 10px 12px;
  }

  .nav-list {
    display: grid;
    gap: 6px;
  }

  .nav-item {
    border: 1px solid transparent;
    background: transparent;
    color: #8190a9;
    text-align: left;
    border-radius: 9px;
    padding: 13px 12px;
    display: flex;
    align-items: center;
    gap: 11px;
    font-size: 13px;
  }

  .nav-item:hover,
  .nav-item.active {
    color: #a99fff;
    background: #171832;
    border-color: #3d3a83;
  }

  .main-area {
    flex: 1;
    min-width: 0;
    padding: 22px 24px 40px;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #202838;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .eyebrow {
    color: #6f82a4;
    font-size: 10px;
    letter-spacing: 1.8px;
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 7px;
  }

  .page-title {
    margin: 0;
    font-size: 25px;
    letter-spacing: -0.8px;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-button,
  .network-button {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 1px solid #273246;
    border-radius: 10px;
    color: #b9c5d9;
    background: #101621;
  }

  .connect-button {
    border: 0;
    border-radius: 9px;
    background: #1688e8;
    color: white;
    padding: 11px 17px;
    font-size: 12px;
    font-weight: 700;
  }

  .market-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .market-card {
    min-width: 0;
    border: 1px solid #222d3d;
    border-radius: 12px;
    background: #101620;
    padding: 14px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .market-card:hover,
  .market-card.selected {
    border-color: #6559e9;
    background: #14172c;
  }

  .market-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #8fa0bd;
    font-size: 11px;
  }

  .coin-icon {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #202b3d;
    color: #d8e1f0;
    font-weight: 800;
  }

  .market-symbol {
    font-weight: 700;
  }

  .market-price {
    margin-top: 16px;
    font-size: 17px;
    font-weight: 750;
  }

  .market-change {
    margin-top: 5px;
    font-size: 11px;
  }

  .positive {
    color: #27c991;
  }

  .negative {
    color: #f26d83;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 315px;
    gap: 14px;
    align-items: stretch;
  }

  .panel {
    border: 1px solid #222d3d;
    border-radius: 13px;
    background: #101620;
    overflow: hidden;
  }

  .chart-panel {
    min-height: 585px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid #222b39;
  }

  .pair-heading {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pair-heading .coin-icon {
    width: 36px;
    height: 36px;
    font-size: 17px;
  }

  .pair-name {
    font-size: 16px;
    font-weight: 800;
  }

  .pair-subtitle {
    margin-top: 4px;
    color: #71829f;
    font-size: 11px;
  }

  .chart-price {
    text-align: right;
  }

  .chart-price-value {
    font-size: 17px;
    font-weight: 800;
  }

  .chart-price-change {
    font-size: 11px;
    margin-top: 5px;
  }

  .chart-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    border-bottom: 1px solid #222b39;
  }

  .timeframes {
    display: flex;
    gap: 4px;
  }

  .timeframe {
    border: 0;
    color: #7185a7;
    background: transparent;
    border-radius: 6px;
    padding: 7px 9px;
    font-size: 11px;
  }

  .timeframe:hover,
  .timeframe.active {
    color: white;
    background: #27334a;
  }

  .chart-tools {
    display: flex;
    gap: 12px;
    color: #7185a7;
    font-size: 13px;
  }

  .chart-wrap {
    position: relative;
    height: 405px;
    padding: 10px 14px 8px;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .chart-empty {
    height: 100%;
    display: grid;
    place-items: center;
    color: #647694;
    font-size: 12px;
  }

  .chart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 18px;
    color: #647694;
    font-size: 10px;
    border-top: 1px solid #222b39;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 16px 18px;
    border-top: 1px solid #222b39;
  }

  .stat-label {
    color: #6f82a4;
    font-size: 10px;
    margin-bottom: 7px;
  }

  .stat-value {
    font-size: 12px;
    font-weight: 700;
  }

  .swap-panel {
    min-height: 585px;
  }

  .swap-title {
    font-size: 15px;
    font-weight: 800;
  }

  .swap-subtitle {
    color: #71829f;
    font-size: 10px;
    margin-top: 5px;
  }

  .swap-body {
    padding: 18px;
  }

  .side-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid #293548;
    border-radius: 8px;
    padding: 3px;
    margin-bottom: 18px;
  }

  .side-tab {
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #8292ad;
    padding: 9px;
    font-size: 12px;
    font-weight: 700;
  }

  .side-tab.active {
    color: white;
    background: #29234f;
  }

  .field-box {
    border: 1px solid #2a364a;
    border-radius: 11px;
    padding: 13px;
    margin-bottom: 10px;
    background: #0d131d;
  }

  .field-label-row {
    display: flex;
    justify-content: space-between;
    color: #8191ac;
    font-size: 10px;
    margin-bottom: 13px;
  }

  .field-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .amount-input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    color: white;
    background: transparent;
    font-size: 23px;
    font-weight: 800;
  }

  .amount-input::placeholder {
    color: #34445d;
  }

  .token-select {
    border: 1px solid #2b3850;
    border-radius: 8px;
    background: #1a2434;
    color: white;
    padding: 9px 10px;
    font-size: 11px;
    font-weight: 700;
  }

  .swap-arrow {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    margin: -1px auto 8px;
    border: 1px solid #2b3850;
    border-radius: 50%;
    background: #202b3e;
    color: #b8c7df;
  }

  .quote-list {
    border-top: 1px solid #222d3d;
    margin-top: 20px;
    padding-top: 13px;
  }

  .quote-row {
    display: flex;
    justify-content: space-between;
    color: #71829f;
    font-size: 10px;
    padding: 7px 0;
  }

  .quote-row strong {
    color: #bdc9dc;
    font-weight: 600;
    text-align: right;
  }

  .primary-action {
    width: 100%;
    border: 0;
    border-radius: 9px;
    background: linear-gradient(90deg, #695bf1, #5544d8);
    color: white;
    padding: 13px;
    margin-top: 20px;
    font-size: 12px;
    font-weight: 800;
  }

  .primary-action:hover {
    filter: brightness(1.1);
  }

  .secondary-action {
    width: 100%;
    border: 1px solid #33415a;
    border-radius: 9px;
    background: #151e2c;
    color: #c8d3e5;
    padding: 12px;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 700;
  }

  .notice {
    color: #6d809f;
    font-size: 10px;
    line-height: 1.6;
    text-align: center;
    margin-top: 14px;
  }

  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 14px;
  }

  .bottom-panel {
    min-height: 230px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th,
  .table td {
    text-align: left;
    padding: 13px 18px;
    border-bottom: 1px solid #1d2735;
    font-size: 11px;
  }

  .table th {
    color: #647694;
    font-size: 10px;
    font-weight: 600;
  }

  .table td {
    color: #b6c4d9;
  }

  .empty-state {
    min-height: 150px;
    display: grid;
    place-items: center;
    color: #61728f;
    font-size: 12px;
    padding: 20px;
    text-align: center;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: grid;
    place-items: center;
    padding: 20px;
    z-index: 50;
  }

  .modal {
    width: min(420px, 100%);
    border: 1px solid #303d53;
    border-radius: 15px;
    background: #111925;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45);
    padding: 24px;
  }

  .modal-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
  }

  .modal-subtitle {
    color: #7b8da9;
    font-size: 12px;
    margin-top: 7px;
  }

  .close-button {
    border: 0;
    background: transparent;
    color: #8798b4;
    font-size: 20px;
  }

  .form-label {
    display: block;
    color: #9aabc4;
    font-size: 11px;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    border: 1px solid #2d3b50;
    border-radius: 8px;
    outline: none;
    background: #0b111a;
    color: white;
    padding: 12px;
    margin-bottom: 15px;
  }

  .form-input:focus {
    border-color: #6559e9;
  }

  .modal-footer {
    color: #71829f;
    font-size: 10px;
    line-height: 1.6;
    margin-top: 16px;
  }

  @media (max-width: 1100px) {
    .market-strip {
      grid-template-columns: repeat(2, 1fr);
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .swap-panel {
      min-height: auto;
    }
  }

  @media (max-width: 760px) {
    .sidebar {
      width: 72px;
      padding: 18px 8px;
    }

    .brand {
      justify-content: center;
      padding: 0 0 28px;
    }

    .brand-name,
    .sidebar-label,
    .nav-item span {
      display: none;
    }

    .nav-item {
      justify-content: center;
    }

    .main-area {
      padding: 15px;
    }

    .topbar {
      align-items: flex-start;
      gap: 12px;
    }

    .top-actions {
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .bottom-grid,
    .stats-row {
      grid-template-columns: 1fr 1fr;
    }
  }
`}</style>
```

);
}

function SignInModal({ onClose }) {
const [mode, setMode] = useState("signin");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");

function submit(event) {
event.preventDefault();

```
if (!email || !password) {
  setMessage("Please enter your email and password.");
  return;
}

setMessage(
  "Account interface is ready. Secure authentication requires a backend service."
);
```

}

return ( <div className="modal-backdrop" onClick={onClose}>
<div className="modal" onClick={(event) => event.stopPropagation()}> <div className="modal-top"> <div> <h2 className="modal-title">
{mode === "signin" ? "Welcome back" : "Create your account"} </h2> <div className="modal-subtitle">
{mode === "signin"
? "Sign in to access your portfolio and trading account."
: "Create an account to manage your trading profile."} </div> </div>

```
      <button className="close-button" onClick={onClose}>
        ×
      </button>
    </div>

    <form onSubmit={submit}>
      <label className="form-label">Email address</label>
      <input
        className="form-input"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label className="form-label">Password</label>
      <input
        className="form-input"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button className="primary-action" type="submit">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </button>
    </form>

    <button
      className="secondary-action"
      onClick={() => {
        setMode(mode === "signin" ? "signup" : "signin");
        setMessage("");
      }}
    >
      {mode === "signin"
        ? "Create a new account"
        : "Already have an account? Sign In"}
    </button>

    {message && <div className="modal-footer">{message}</div>}

    <div className="modal-footer">
      Never enter your wallet recovery phrase or private key here.
      Wallet transactions must be approved directly in your wallet.
    </div>
  </div>
</div>
```

);
}

function MarketChart({ candles, loading }) {
const width = 900;
const height = 390;
const padding = { top: 22, right: 55, bottom: 30, left: 10 };

const points = useMemo(() => {
if (!candles.length) return [];

```
const closes = candles.map((item) => Number(item[4]));
const min = Math.min(...closes);
const max = Math.max(...closes);
const range = max - min || 1;

return closes.map((close, index) => {
  const x =
    padding.left +
    (index / Math.max(closes.length - 1, 1)) *
      (width - padding.left - padding.right);

  const y =
    padding.top +
    (1 - (close - min) / range) *
      (height - padding.top - padding.bottom);

  return { x, y, close };
});
```

}, [candles]);

if (loading || !candles.length) {
return <div className="chart-empty">Loading live market chart...</div>;
}

const line = points.map((point) => `${point.x},${point.y}`).join(" ");
const area = `${padding.left},${height - padding.bottom} ${line} ${
    width - padding.right
  },${height - padding.bottom}`;

const last = points[points.length - 1];
const first = points[0];
const rising = last.close >= first.close;

return (
<svg
className="chart-svg"
viewBox={`0 0 ${width} ${height}`}
preserveAspectRatio="none"
> <defs> <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
<stop
offset="0%"
stopColor={rising ? "#36d5a0" : "#f26d83"}
stopOpacity="0.22"
/>
<stop
offset="100%"
stopColor={rising ? "#36d5a0" : "#f26d83"}
stopOpacity="0"
/> </linearGradient> </defs>

```
  {[0, 1, 2, 3, 4].map((row) => {
    const y = padding.top + (row / 4) * (height - padding.top - padding.bottom);

    return (
      <line
        key={row}
        x1={padding.left}
        x2={width - padding.right}
        y1={y}
        y2={y}
        stroke="#202c3d"
        strokeDasharray="4 6"
      />
    );
  })}

  <polygon points={area} fill="url(#chartFill)" />

  <polyline
    points={line}
    fill="none"
    stroke={rising ? "#36d5a0" : "#f26d83"}
    strokeWidth="2.5"
    strokeLinejoin="round"
    strokeLinecap="round"
  />

  <circle
    cx={last.x}
    cy={last.y}
    r="4"
    fill={rising ? "#36d5a0" : "#f26d83"}
  />

  <text
    x={width - padding.right + 8}
    y={last.y + 4}
    fill={rising ? "#36d5a0" : "#f26d83"}
    fontSize="11"
  >
    {formatPrice(last.close)}
  </text>
</svg>
```

);
}

function App() {
const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
const [timeframe, setTimeframe] = useState("1h");
const [markets, setMarkets] = useState({});
const [candles, setCandles] = useState([]);
const [loadingChart, setLoadingChart] = useState(true);
const [tradeSide, setTradeSide] = useState("buy");
const [amount, setAmount] = useState("");
const [fromToken, setFromToken] = useState("BTC");
const [toToken, setToToken] = useState("USDT");
const [showSignIn, setShowSignIn] = useState(false);
const [notice, setNotice] = useState("");

const selectedCoin =
COINS.find((coin) => coin.symbol === selectedSymbol) || COINS[0];

const selectedMarket = markets[selectedSymbol];

async function loadMarkets() {
try {
const response = await fetch(`${API}/ticker/24hr`);
const data = await response.json();

```
  const allowed = new Set(COINS.map((coin) => coin.symbol));
  const result = {};

  data
    .filter((item) => allowed.has(item.symbol))
    .forEach((item) => {
      result[item.symbol] = {
        price: Number(item.lastPrice),
        change: Number(item.priceChangePercent),
        high: Number(item.highPrice),
        low: Number(item.lowPrice),
        volume: Number(item.quoteVolume),
      };
    });

  setMarkets(result);
} catch (error) {
  console.error("Market loading error:", error);
}
```

}

async function loadChart() {
setLoadingChart(true);

```
try {
  const response = await fetch(
    `${API}/klines?symbol=${selectedSymbol}&interval=${timeframe}&limit=90`
  );

  const data = await response.json();
  setCandles(Array.isArray(data) ? data : []);
} catch (error) {
  console.error("Chart loading error:", error);
  setCandles([]);
} finally {
  setLoadingChart(false);
}
```

}

useEffect(() => {
loadMarkets();

```
const interval = setInterval(loadMarkets, 15000);

return () => clearInterval(interval);
```

}, []);

useEffect(() => {
loadChart();

```
const interval = setInterval(loadChart, 30000);

return () => clearInterval(interval);
```

}, [selectedSymbol, timeframe]);

function handleTrade() {
setNotice(
"Connect your wallet first. The final transaction will be reviewed and approved in your wallet."
);
}

const estimatedReceive = useMemo(() => {
const value = Number(amount || 0);
const price = selectedMarket?.price || 0;

```
if (!value || !price) return "0.00";

if (fromToken === "BTC" || fromToken === "ETH" || fromToken === "SOL") {
  return (value * price).toFixed(2);
}

return (value / price).toFixed(6);
```

}, [amount, fromToken, selectedMarket]);

return (
<> <AppStyles />

```
  <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">N</div>
        <div className="brand-name">
          Nova
          <br />
          Wallet
        </div>
      </div>

      <div className="sidebar-label">WORKSPACE</div>

      <div className="nav-list">
        <button className="nav-item active">
          <span>▦</span>
          <span>Trade</span>
        </button>

        <button className="nav-item">
          <span>⌁</span>
          <span>Markets</span>
        </button>

        <button className="nav-item">
          <span>▣</span>
          <span>Portfolio</span>
        </button>

        <button className="nav-item">
          <span>↔</span>
          <span>Activity</span>
        </button>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div>
          <div className="eyebrow">Decentralized trading</div>
          <h1 className="page-title">Trade</h1>
        </div>

        <div className="top-actions">
          <button className="icon-button" title="Search">
            ⌕
          </button>

          <button className="network-button" title="Network">
            ◇
          </button>

          <button
            className="connect-button"
            onClick={() => setShowSignIn(true)}
          >
            Sign In
          </button>

          <AppKitButton />
        </div>
      </header>

      <section className="market-strip">
        {COINS.slice(0, 8).map((coin) => {
          const market = markets[coin.symbol];
          const isSelected = coin.symbol === selectedSymbol;

          return (
            <div
              key={coin.symbol}
              className={`market-card ${isSelected ? "selected" : ""}`}
              onClick={() => {
                setSelectedSymbol(coin.symbol);
                setFromToken(coin.short);
              }}
            >
              <div className="market-card-top">
                <div className="coin-icon">{coin.icon}</div>
                <div className="market-symbol">
                  {coin.short} / USDT
                </div>
              </div>

              <div className="market-price">
                {market ? `$${formatPrice(market.price)}` : "Loading..."}
              </div>

              <div
                className={`market-change ${
                  market?.change >= 0 ? "positive" : "negative"
                }`}
              >
                {market
                  ? `${market.change >= 0 ? "+" : ""}${market.change.toFixed(
                      2
                    )}%`
                  : "—"}
              </div>
            </div>
          );
        })}
      </section>

      <div className="content-grid">
        <section className="panel chart-panel">
          <div className="panel-header">
            <div className="pair-heading">
              <div className="coin-icon">{selectedCoin.icon}</div>
              <div>
                <div className="pair-name">
                  {selectedCoin.short} / USDT
                </div>
                <div className="pair-subtitle">
                  {selectedCoin.name}
                </div>
              </div>
            </div>

            <div className="chart-price">
              <div className="chart-price-value">
                {selectedMarket
                  ? `$${formatPrice(selectedMarket.price)}`
                  : "—"}
              </div>
              <div
                className={`chart-price-change ${
                  selectedMarket?.change >= 0 ? "positive" : "negative"
                }`}
              >
                {selectedMarket
                  ? `${selectedMarket.change >= 0 ? "+" : ""}${selectedMarket.change.toFixed(
                      2
                    )}%`
                  : "—"}
              </div>
            </div>
          </div>

          <div className="chart-toolbar">
            <div className="timeframes">
              {TIMEFRAMES.map((item) => (
                <button
                  key={item.value}
                  className={`timeframe ${
                    timeframe === item.value ? "active" : ""
                  }`}
                  onClick={() => setTimeframe(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="chart-tools">
              <span>▥</span>
              <span>⚙</span>
            </div>
          </div>

          <div className="chart-wrap">
            <MarketChart
              candles={candles}
              loading={loadingChart}
            />
          </div>

          <div className="stats-row">
            <div>
              <div className="stat-label">24h High</div>
              <div className="stat-value">
                {selectedMarket
                  ? `$${formatPrice(selectedMarket.high)}`
                  : "—"}
              </div>
            </div>

            <div>
              <div className="stat-label">24h Low</div>
              <div className="stat-value">
                {selectedMarket
                  ? `$${formatPrice(selectedMarket.low)}`
                  : "—"}
              </div>
            </div>

            <div>
              <div className="stat-label">24h Volume</div>
              <div className="stat-value">
                {selectedMarket
                  ? formatCompact(selectedMarket.volume)
                  : "—"}
              </div>
            </div>

            <div>
              <div className="stat-label">Market</div>
              <div className="stat-value">Spot</div>
            </div>
          </div>

          <div className="chart-footer">
            <span>Live market data from Binance public API</span>
            <span>Updates every 15 seconds</span>
          </div>
        </section>

        <section className="panel swap-panel">
          <div className="panel-header">
            <div>
              <div className="swap-title">Trade</div>
              <div className="swap-subtitle">
                Exchange assets from your connected wallet
              </div>
            </div>

            <span style={{ color: "#8092ae", fontSize: "13px" }}>
              ⚙
            </span>
          </div>

          <div className="swap-body">
            <div className="side-tabs">
              <button
                className={`side-tab ${
                  tradeSide === "buy" ? "active" : ""
                }`}
                onClick={() => setTradeSide("buy")}
              >
                Buy
              </button>

              <button
                className={`side-tab ${
                  tradeSide === "sell" ? "active" : ""
                }`}
                onClick={() => setTradeSide("sell")}
              >
                Sell
              </button>
            </div>

            <div className="field-box">
              <div className="field-label-row">
                <span>Pay</span>
                <span>Balance —</span>
              </div>

              <div className="field-main">
                <input
                  className="amount-input"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />

                <select
                  className="token-select"
                  value={fromToken}
                  onChange={(event) =>
                    setFromToken(event.target.value)
                  }
                >
                  {COINS.slice(0, 8).map((coin) => (
                    <option key={coin.short} value={coin.short}>
                      {coin.short}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="swap-arrow">⇅</div>

            <div className="field-box">
              <div className="field-label-row">
                <span>Receive</span>
                <span>Balance —</span>
              </div>

              <div className="field-main">
                <div
                  style={{
                    color: "#d8e1f0",
                    fontSize: "23px",
                    fontWeight: 800,
                    minWidth: 0,
                  }}
                >
                  {estimatedReceive}
                </div>

                <select
                  className="token-select"
                  value={toToken}
                  onChange={(event) =>
                    setToToken(event.target.value)
                  }
                >
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
            </div>

            <div className="quote-list">
              <div className="quote-row">
                <span>Exchange rate</span>
                <strong>
                  {selectedMarket
                    ? `1 ${selectedCoin.short} ≈ $${formatPrice(
                        selectedMarket.price
                      )}`
                    : "—"}
                </strong>
              </div>

              <div className="quote-row">
                <span>Price impact</span>
                <strong>Calculated before confirmation</strong>
              </div>

              <div className="quote-row">
                <span>Minimum received</span>
                <strong>Calculated before confirmation</strong>
              </div>

              <div className="quote-row">
                <span>Network fee</span>
                <strong>Calculated before confirmation</strong>
              </div>
            </div>

            <button className="primary-action" onClick={handleTrade}>
              Connect Wallet to Trade
            </button>

            {notice && <div className="notice">{notice}</div>}

            <div className="notice">
              You control the transaction. Nova Wallet never asks for
              your private key or recovery phrase.
            </div>
          </div>
        </section>
      </div>

      <div className="bottom-grid">
        <section className="panel bottom-panel">
          <div className="panel-header">
            <div>
              <div className="swap-title">Market Overview</div>
              <div className="swap-subtitle">
                Available trading markets
              </div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>24h Change</th>
              </tr>
            </thead>

            <tbody>
              {COINS.slice(0, 5).map((coin) => {
                const market = markets[coin.symbol];

                return (
                  <tr key={coin.symbol}>
                    <td>
                      {coin.icon} {coin.short}
                    </td>
                    <td>
                      {market ? `$${formatPrice(market.price)}` : "—"}
                    </td>
                    <td
                      className={
                        market?.change >= 0 ? "positive" : "negative"
                      }
                    >
                      {market
                        ? `${market.change >= 0 ? "+" : ""}${market.change.toFixed(
                            2
                          )}%`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="panel bottom-panel">
          <div className="panel-header">
            <div>
              <div className="swap-title">Recent Activity</div>
              <div className="swap-subtitle">
                Your wallet transactions
              </div>
            </div>
          </div>

          <div className="empty-state">
            Connect your wallet to view your transaction history.
          </div>
        </section>
      </div>
    </main>
  </div>

  {showSignIn && (
    <SignInModal onClose={() => setShowSignIn(false)} />
  )}
</>
```

);
}

ReactDOM.createRoot(document.getElementById("root")).render( <WagmiProvider config={wagmiAdapter.wagmiConfig}> <QueryClientProvider client={queryClient}> <App /> </QueryClientProvider> </WagmiProvider>
);
