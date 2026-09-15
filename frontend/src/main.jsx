import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { AppKitButton } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter } from "./walletConfig";

const queryClient = new QueryClient();

const COINS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    color: "#f7931a",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    icon: "◆",
    color: "#627eea",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    icon: "S",
    color: "#14f195",
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    icon: "◆",
    color: "#f3ba2f",
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    icon: "X",
    color: "#26a17b",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    icon: "A",
    color: "#0033ad",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    icon: "Ð",
    color: "#c2a633",
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    icon: "▲",
    color: "#e84142",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    icon: "⬡",
    color: "#375bd2",
  },
  {
    id: "matic-network",
    symbol: "POL",
    name: "Polygon",
    icon: "⬡",
    color: "#8247e5",
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    color: "#26a17b",
  },
];

function formatPrice(value) {
  if (value === undefined || value === null) return "—";

  if (value >= 1000) {
    return `$${value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;
  }

  if (value >= 1) {
    return `$${value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
    })}`;
  }

  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  })}`;
}

function formatPercent(value) {
  if (value === undefined || value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatLargeNumber(value) {
  if (!value) return "—";

  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  return `$${value.toLocaleString()}`;
}

function PriceChart({ data, positive }) {
  const width = 900;
  const height = 340;
  const padding = 18;

  if (!data || data.length < 2) {
    return (
      <div className="chart-loading">
        Loading market chart...
      </div>
    );
  }

  const values = data.map((item) => item[1]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x =
        padding +
        (index / (values.length - 1)) * (width - padding * 2);

      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${
    width - padding
  },${height - padding}`;

  return (
    <svg
      className="price-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={positive ? "#16c784" : "#ea3943"}
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            stopColor={positive ? "#16c784" : "#ea3943"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <line
        x1="0"
        y1="85"
        x2={width}
        y2="85"
        className="chart-grid"
      />
      <line
        x1="0"
        y1="170"
        x2={width}
        y2="170"
        className="chart-grid"
      />
      <line
        x1="0"
        y1="255"
        x2={width}
        y2="255"
        className="chart-grid"
      />

      <polygon
        points={areaPoints}
        fill="url(#chartGradient)"
      />

      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#16c784" : "#ea3943"}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const account = {
      name: name || email.split("@")[0],
      email,
    };

    localStorage.setItem("nova_account", JSON.stringify(account));
    onSuccess(account);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-brand">
          <div className="brand-mark">N</div>
          <span>Nova Wallet</span>
        </div>

        <h2>
          {mode === "signin"
            ? "Welcome back"
            : "Create your account"}
        </h2>

        <p className="modal-subtitle">
          {mode === "signin"
            ? "Sign in to access your portfolio and trading tools."
            : "Create an account to manage your wallet experience."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Full name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button full-width" type="submit">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "signin" ? (
            <>
              Don’t have an account?
              <button onClick={() => setMode("signup")}>
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button onClick={() => setMode("signin")}>
                Sign In
              </button>
            </>
          )}
        </div>

        <p className="auth-note">
          Your wallet private keys and recovery phrase are never requested.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [coins, setCoins] = useState({});
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState("24h");
  const [activePage, setActivePage] = useState("Trade");
  const [showAuth, setShowAuth] = useState(false);
  const [account, setAccount] = useState(null);
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  useEffect(() => {
    const savedAccount = localStorage.getItem("nova_account");

    if (savedAccount) {
      try {
        setAccount(JSON.parse(savedAccount));
      } catch {
        localStorage.removeItem("nova_account");
      }
    }
  }, []);

  useEffect(() => {
    async function loadMarketData() {
      try {
        const ids = COINS.map((coin) => coin.id).join(",");

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error("Market request failed");
        }

        const data = await response.json();

        const mapped = {};

        data.forEach((item) => {
          mapped[item.id] = item;
        });

        setCoins(mapped);

        if (mapped[selectedCoin.id]) {
          setSelectedCoin((current) => ({
            ...current,
            market: mapped[current.id],
          }));
        }
      } catch (error) {
        console.error("Market data error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMarketData();

    const interval = setInterval(loadMarketData, 60000);

    return () => clearInterval(interval);
  }, []);

  const selectedMarket = coins[selectedCoin.id];

  const chartData =
    selectedMarket?.sparkline_in_7d?.price || [];

  const selectedPrice = selectedMarket?.current_price || 0;
  const selectedChange =
    selectedMarket?.price_change_percentage_24h ?? 0;

  const displayChart =
    chartRange === "1h"
      ? chartData.slice(-12)
      : chartRange === "4h"
      ? chartData.slice(-48)
      : chartData;

  const tokenOptions = useMemo(
    () =>
      COINS.filter((coin) =>
        ["ETH", "USDT", "USDC", "BTC", "SOL", "BNB"].includes(
          coin.symbol
        )
      ),
    []
  );

  function selectCoin(coin) {
    setSelectedCoin(coin);
  }

  function handleFromAmount(value) {
    setFromAmount(value);

    const numericValue = Number(value);

    if (!numericValue || !selectedPrice) {
      setToAmount("");
      return;
    }

    setToAmount((numericValue * 0.997).toFixed(6));
  }

  function swapTokens() {
    const oldFrom = fromToken;
    setFromToken(toToken);
    setToToken(oldFrom);

    const oldAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(oldAmount);
  }

  function logout() {
    localStorage.removeItem("nova_account");
    setAccount(null);
  }

  return (
    <div className="app-shell">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #080b12;
          color: #f4f7fb;
        }

        button, input, select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app-shell {
          min-height: 100vh;
          display: flex;
          background: #080b12;
        }

        .sidebar {
          width: 220px;
          min-height: 100vh;
          padding: 26px 16px;
          background: #0b0f18;
          border-right: 1px solid #202938;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 19px;
          font-weight: 800;
          margin-bottom: 55px;
        }

        .brand-mark {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #6957ff, #8c6dff);
          color: white;
          font-weight: 900;
          font-size: 21px;
        }

        .nav-label {
          color: #697991;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 800;
          margin: 0 12px 12px;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          margin-bottom: 7px;
          border-radius: 10px;
          color: #8c9ab0;
          background: transparent;
          border: 1px solid transparent;
          text-align: left;
        }

        .nav-item:hover,
        .nav-item.active {
          color: #ffffff;
          background: #191735;
          border-color: #4036a2;
        }

        .main-content {
          margin-left: 220px;
          width: calc(100% - 220px);
          padding: 28px 30px 50px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #202938;
          padding-bottom: 20px;
          margin-bottom: 22px;
        }

        .eyebrow {
          color: #7689a7;
          font-size: 10px;
          letter-spacing: 1.7px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .page-title {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-button {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #293447;
          background: #101621;
          color: #b9c5d7;
        }

        .account-button {
          border: 1px solid #303d52;
          background: #111925;
          color: white;
          padding: 10px 15px;
          border-radius: 9px;
        }

        .connect-button {
          background: #1688e8;
          color: white;
          border: none;
          border-radius: 9px;
          padding: 12px 17px;
          font-weight: 700;
        }

        .market-ticker {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 14px;
        }

        .ticker-card {
          background: #101620;
          border: 1px solid #253043;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          min-width: 0;
        }

        .ticker-card.active {
          border-color: #6b5cff;
          background: #15152b;
        }

        .ticker-top {
          display: flex;
          justify-content: space-between;
          color: #91a1b9;
          font-size: 12px;
        }

        .ticker-price {
          margin-top: 16px;
          font-size: 18px;
          font-weight: 800;
        }

        .ticker-change {
          float: right;
          margin-top: -20px;
          font-size: 12px;
        }

        .positive {
          color: #16c784;
        }

        .negative {
          color: #ea3943;
        }

        .trading-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 14px;
        }

        .panel {
          background: #101620;
          border: 1px solid #253043;
          border-radius: 14px;
          overflow: hidden;
        }

        .chart-panel {
          min-height: 570px;
        }

        .panel-header {
          padding: 22px;
          border-bottom: 1px solid #253043;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .coin-heading {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .coin-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 900;
          color: white;
        }

        .coin-name {
          font-size: 18px;
          font-weight: 800;
        }

        .coin-subtitle {
          color: #71839e;
          font-size: 12px;
          margin-top: 5px;
        }

        .big-price {
          font-size: 21px;
          font-weight: 800;
          text-align: right;
        }

        .small-change {
          font-size: 12px;
          text-align: right;
          margin-top: 5px;
        }

        .chart-toolbar {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 22px;
          border-bottom: 1px solid #253043;
        }

        .range-button {
          border: none;
          background: transparent;
          color: #8192ad;
          padding: 8px 11px;
          border-radius: 7px;
          font-size: 12px;
        }

        .range-button.active {
          background: #28334a;
          color: white;
        }

        .chart-area {
          height: 350px;
          padding: 20px;
          position: relative;
        }

        .price-chart {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .chart-grid {
          stroke: #263143;
          stroke-width: 1;
          stroke-dasharray: 4 7;
        }

        .chart-loading {
          height: 100%;
          display: grid;
          place-items: center;
          color: #72839b;
        }

        .chart-footer {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          color: #6d809b;
          font-size: 11px;
          border-top: 1px solid #253043;
        }

        .swap-panel {
          min-height: 570px;
        }

        .swap-content {
          padding: 20px;
        }

        .swap-description {
          color: #7588a4;
          font-size: 12px;
          margin-top: 5px;
        }

        .token-box {
          background: #0c121c;
          border: 1px solid #2a374c;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .token-label {
          display: flex;
          justify-content: space-between;
          color: #8293ad;
          font-size: 11px;
          margin-bottom: 13px;
        }

        .token-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .token-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 25px;
          font-weight: 800;
        }

        .token-select {
          background: #202b3d;
          border: 1px solid #36445b;
          color: white;
          border-radius: 8px;
          padding: 10px;
          font-weight: 700;
        }

        .swap-arrow {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #202b3d;
          border: 1px solid #3a4860;
          color: #b9c7dc;
          margin: -2px auto 8px;
          position: relative;
          z-index: 2;
        }

        .swap-details {
          padding: 14px 0;
          border-top: 1px solid #253043;
          margin-top: 17px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          color: #8192aa;
          font-size: 12px;
          margin-bottom: 13px;
        }

        .detail-row strong {
          color: #dce5f2;
          font-weight: 500;
        }

        .primary-button {
          border: none;
          background: linear-gradient(90deg, #6957ff, #805cf5);
          color: white;
          border-radius: 9px;
          padding: 14px;
          font-weight: 800;
        }

        .primary-button:hover {
          filter: brightness(1.12);
        }

        .full-width {
          width: 100%;
        }

        .secondary-button {
          width: 100%;
          border: 1px solid #344258;
          background: #172131;
          color: white;
          border-radius: 9px;
          padding: 14px;
          font-weight: 700;
        }

        .wallet-note {
          color: #71839d;
          font-size: 11px;
          text-align: center;
          line-height: 1.6;
          margin-top: 14px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
        }

        .section-subtitle {
          color: #71839d;
          font-size: 12px;
          margin-top: 5px;
        }

        .coin-list {
          padding: 0 20px 10px;
        }

        .coin-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 12px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #202b3b;
          cursor: pointer;
        }

        .coin-row:last-child {
          border-bottom: none;
        }

        .coin-row:hover {
          background: #141d2b;
        }

        .coin-cell {
          color: #dbe4f1;
          font-size: 13px;
        }

        .coin-cell.muted {
          color: #8192aa;
        }

        .coin-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mini-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: white;
          font-weight: 800;
          font-size: 12px;
        }

        .coin-symbol {
          font-weight: 800;
        }

        .coin-full-name {
          color: #72839c;
          font-size: 11px;
          margin-top: 3px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          display: grid;
          place-items: center;
          z-index: 100;
          padding: 20px;
        }

        .auth-modal {
          width: 430px;
          max-width: 100%;
          background: #111925;
          border: 1px solid #344258;
          border-radius: 16px;
          padding: 30px;
          position: relative;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        }

        .modal-close {
          position: absolute;
          right: 18px;
          top: 15px;
          border: none;
          background: transparent;
          color: #91a1b8;
          font-size: 25px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          margin-bottom: 28px;
        }

        .auth-modal h2 {
          margin: 0;
          font-size: 25px;
        }

        .modal-subtitle {
          color: #8293ab;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .auth-modal label {
          display: block;
          color: #aab8cb;
          font-size: 12px;
          margin-bottom: 17px;
        }

        .auth-modal input {
          display: block;
          width: 100%;
          margin-top: 8px;
          padding: 13px;
          border-radius: 8px;
          border: 1px solid #344258;
          background: #0b111b;
          color: white;
          outline: none;
        }

        .auth-modal input:focus {
          border-color: #6957ff;
        }

        .form-error {
          color: #ff6d7a;
          font-size: 12px;
          margin-bottom: 15px;
        }

        .auth-switch {
          color: #8192aa;
          text-align: center;
          font-size: 12px;
          margin-top: 22px;
        }

        .auth-switch button {
          border: none;
          background: transparent;
          color: #8d7dff;
          margin-left: 5px;
          font-weight: 700;
        }

        .auth-note {
          color: #64758d;
          font-size: 10px;
          text-align: center;
          line-height: 1.5;
          margin-top: 22px;
        }

        @media (max-width: 1100px) {
          .trading-layout {
            grid-template-columns: 1fr;
          }

          .market-ticker {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .sidebar {
            width: 72px;
            padding: 20px 9px;
          }

          .brand span,
          .nav-label,
          .nav-item span {
            display: none;
          }

          .nav-item {
            justify-content: center;
            padding: 14px 5px;
          }

          .main-content {
            margin-left: 72px;
            width: calc(100% - 72px);
            padding: 18px 12px;
          }

          .topbar {
            align-items: flex-start;
            gap: 12px;
          }

          .top-actions {
            gap: 5px;
          }

          .connect-button {
            padding: 10px;
            font-size: 11px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .market-ticker {
            grid-template-columns: 1fr 1fr;
          }

          .coin-row {
            grid-template-columns: 1.5fr 1fr 1fr;
          }

          .coin-row > div:nth-child(3) {
            display: none;
          }
        }
      `}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <span>Nova Wallet</span>
        </div>

        <div className="nav-label">WORKSPACE</div>

        {["Trade", "Markets", "Portfolio", "Activity"].map(
          (item) => (
            <button
              key={item}
              className={`nav-item ${
                activePage === item ? "active" : ""
              }`}
              onClick={() => setActivePage(item)}
            >
              <span>
                {item === "Trade"
                  ? "▦"
                  : item === "Markets"
                  ? "⌁"
                  : item === "Portfolio"
                  ? "▣"
                  : "↔"}
              </span>
              <span>{item}</span>
            </button>
          )
        )}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              DECENTRALIZED TRADING
            </div>
            <h1 className="page-title">{activePage}</h1>
          </div>

          <div className="top-actions">
            <button className="icon-button">⌕</button>
            <button className="icon-button">◈</button>

            {account ? (
              <button className="account-button" onClick={logout}>
                {account.name}
              </button>
            ) : (
              <button
                className="account-button"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </button>
            )}

            <AppKitButton />
          </div>
        </header>

        <section className="market-ticker">
          {COINS.slice(0, 4).map((coin) => {
            const market = coins[coin.id];
            const change =
              market?.price_change_percentage_24h ?? 0;

            return (
              <div
                key={coin.id}
                className={`ticker-card ${
                  selectedCoin.id === coin.id ? "active" : ""
                }`}
                onClick={() => selectCoin(coin)}
              >
                <div className="ticker-top">
                  <span>
                    <span style={{ color: coin.color }}>
                      {coin.icon}
                    </span>{" "}
                    {coin.symbol}
                  </span>
                  <span>USD</span>
                </div>

                <div className="ticker-price">
                  {loading
                    ? "Loading..."
                    : formatPrice(market?.current_price)}
                </div>

                <div
                  className={`ticker-change ${
                    change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {formatPercent(change)}
                </div>
              </div>
            );
          })}
        </section>

        <div className="trading-layout">
          <section className="panel chart-panel">
            <div className="panel-header">
              <div className="coin-heading">
                <div
                  className="coin-icon"
                  style={{
                    background: selectedCoin.color,
                  }}
                >
                  {selectedCoin.icon}
                </div>

                <div>
                  <div className="coin-name">
                    {selectedCoin.symbol} / USDT
                  </div>
                  <div className="coin-subtitle">
                    {selectedCoin.name}
                  </div>
                </div>
              </div>

              <div>
                <div className="big-price">
                  {formatPrice(selectedPrice)}
                </div>
                <div
                  className={`small-change ${
                    selectedChange >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {formatPercent(selectedChange)}
                </div>
              </div>
            </div>

            <div className="chart-toolbar">
              {["1h", "4h", "24h"].map((range) => (
                <button
                  key={range}
                  className={`range-button ${
                    chartRange === range ? "active" : ""
                  }`}
                  onClick={() => setChartRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="chart-area">
              <PriceChart
                data={displayChart}
                positive={selectedChange >= 0}
              />
            </div>

            <div className="chart-footer">
              <span>Market data powered by public market data</span>
              <span>Live updates every 60 seconds</span>
            </div>
          </section>

          <section className="panel swap-panel">
            <div className="panel-header">
              <div>
                <div className="section-title">Swap</div>
                <div className="swap-description">
                  Exchange tokens from your wallet
                </div>
              </div>

              <span>⚙</span>
            </div>

            <div className="swap-content">
              <div className="token-box">
                <div className="token-label">
                  <span>From</span>
                  <span>Balance —</span>
                </div>

                <div className="token-row">
                  <input
                    className="token-input"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(event) =>
                      handleFromAmount(event.target.value)
                    }
                  />

                  <select
                    className="token-select"
                    value={fromToken}
                    onChange={(event) =>
                      setFromToken(event.target.value)
                    }
                  >
                    {tokenOptions.map((token) => (
                      <option
                        key={token.symbol}
                        value={token.symbol}
                      >
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="swap-arrow" onClick={swapTokens}>
                ⇅
              </button>

              <div className="token-box">
                <div className="token-label">
                  <span>To</span>
                  <span>Balance —</span>
                </div>

                <div className="token-row">
                  <input
                    className="token-input"
                    type="text"
                    placeholder="0.00"
                    value={toAmount}
                    readOnly
                  />

                  <select
                    className="token-select"
                    value={toToken}
                    onChange={(event) =>
                      setToToken(event.target.value)
                    }
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
              </div>

              <div className="swap-details">
                <div className="detail-row">
                  <span>Exchange rate</span>
                  <strong>—</strong>
                </div>

                <div className="detail-row">
                  <span>Price impact</span>
                  <strong>—</strong>
                </div>

                <div className="detail-row">
                  <span>Minimum received</span>
                  <strong>—</strong>
                </div>

                <div className="detail-row">
                  <span>Network fee</span>
                  <strong>Calculated before confirmation</strong>
                </div>
              </div>

              <AppKitButton />

              <p className="wallet-note">
                Connect your wallet to review balances, quote
                prices, and approve transactions. Nova Wallet
                never asks for your private key or recovery phrase.
              </p>
            </div>
          </section>
        </div>

        <div className="bottom-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="section-title">
                  Market Overview
                </div>
                <div className="section-subtitle">
                  Live cryptocurrency prices
                </div>
              </div>
            </div>

            <div className="coin-list">
              {COINS.slice(0, 6).map((coin) => {
                const market = coins[coin.id];
                const change =
                  market?.price_change_percentage_24h ?? 0;

                return (
                  <div
                    className="coin-row"
                    key={coin.id}
                    onClick={() => selectCoin(coin)}
                  >
                    <div className="coin-cell coin-title">
                      <div
                        className="mini-icon"
                        style={{
                          background: coin.color,
                        }}
                      >
                        {coin.icon}
                      </div>

                      <div>
                        <div className="coin-symbol">
                          {coin.symbol}
                        </div>
                        <div className="coin-full-name">
                          {coin.name}
                        </div>
                      </div>
                    </div>

                    <div className="coin-cell">
                      {formatPrice(market?.current_price)}
                    </div>

                    <div
                      className={`coin-cell ${
                        change >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {formatPercent(change)}
                    </div>

                    <div className="coin-cell muted">
                      {formatLargeNumber(
                        market?.market_cap
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="section-title">
                  Recent Activity
                </div>
                <div className="section-subtitle">
                  Your wallet transactions
                </div>
              </div>
            </div>

            <div
              style={{
                minHeight: 300,
                display: "grid",
                placeItems: "center",
                color: "#71839d",
                fontSize: 13,
                textAlign: "center",
                padding: 30,
              }}
            >
              Connect your wallet to view your transaction
              history.
            </div>
          </section>
        </div>
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(newAccount) => setAccount(newAccount)}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
