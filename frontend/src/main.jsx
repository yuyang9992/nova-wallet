import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { wagmiAdapter, queryClient } from "./walletConfig";

const COINS = [
  {
    symbol: "BTC",
    pair: "BTC / USDT",
    coinId: "bitcoin",
    name: "Bitcoin",
    fallbackPrice: 76404,
    color: "#f7931a",
  },
  {
    symbol: "ETH",
    pair: "ETH / USDT",
    coinId: "ethereum",
    name: "Ethereum",
    fallbackPrice: 2426.32,
    color: "#627eea",
  },
  {
    symbol: "SOL",
    pair: "SOL / USDT",
    coinId: "solana",
    name: "Solana",
    fallbackPrice: 99.41,
    color: "#14f195",
  },
  {
    symbol: "BNB",
    pair: "BNB / USDT",
    coinId: "binancecoin",
    name: "BNB",
    fallbackPrice: 718.29,
    color: "#f3ba2f",
  },
  {
    symbol: "XRP",
    pair: "XRP / USDT",
    coinId: "ripple",
    name: "XRP",
    fallbackPrice: 1.39,
    color: "#22a079",
  },
  {
    symbol: "ADA",
    pair: "ADA / USDT",
    coinId: "cardano",
    name: "Cardano",
    fallbackPrice: 0.202122,
    color: "#3157d5",
  },
];

function formatPrice(price) {
  if (price === undefined || price === null) return "—";

  if (price < 1) {
    return `$${price.toFixed(6)}`;
  }

  if (price < 100) {
    return `$${price.toFixed(2)}`;
  }

  return `$${price.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function formatLargeNumber(value) {
  if (!value) return "—";

  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }

  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }

  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }

  return `$${value.toLocaleString()}`;
}

function CoinIcon({ coin, small = false }) {
  return (
    <div
      style={{
        width: small ? 32 : 42,
        height: small ? 32 : 42,
        borderRadius: "50%",
        background: coin.color,
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: small ? 13 : 17,
        flexShrink: 0,
      }}
    >
      {coin.symbol === "BTC"
        ? "₿"
        : coin.symbol === "ETH"
        ? "◆"
        : coin.symbol === "SOL"
        ? "S"
        : coin.symbol === "BNB"
        ? "◆"
        : coin.symbol === "XRP"
        ? "X"
        : "A"}
    </div>
  );
}

/* --------------------------------------------------
   LIVE MARKET CHART
-------------------------------------------------- */

function LiveMarketChart({ coin }) {
  const [prices, setPrices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  async function loadChart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`
      );

      if (!response.ok) {
        throw new Error("Market data unavailable");
      }

      const data = await response.json();

      const formatted = (data.prices || []).map(([time, price]) => ({
        time,
        price,
      }));

      if (formatted.length < 2) {
        throw new Error("Not enough data");
      }

      setPrices(formatted);
    } catch (err) {
      setError("Live chart data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadChart();

    const timer = setInterval(loadChart, 60000);

    return () => clearInterval(timer);
  }, [coin.coinId]);

  if (loading) {
    return (
      <div className="chart-message">
        Loading live market data...
      </div>
    );
  }

  if (error || prices.length < 2) {
    return (
      <div className="chart-message">
        {error || "Not enough market data yet."}
      </div>
    );
  }

  const width = 1000;
  const height = 390;
  const padding = 35;

  const values = prices.map((item) => item.price);
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const range = maxPrice - minPrice || 1;

  const points = prices
    .map((item, index) => {
      const x =
        padding +
        (index / (prices.length - 1)) * (width - padding * 2);

      const y =
        height -
        padding -
        ((item.price - minPrice) / range) *
          (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  const firstPrice = values[0];
  const lastPrice = values[values.length - 1];

  const changePercent =
    ((lastPrice - firstPrice) / firstPrice) * 100;

  const lineColor = changePercent >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="live-chart-wrapper">
      <div className="chart-top-info">
        <span>24H Market Movement</span>

        <strong style={{ color: lineColor }}>
          {changePercent >= 0 ? "+" : ""}
          {changePercent.toFixed(2)}%
        </strong>
      </div>

      <svg
        className="live-market-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`chartGradient-${coin.symbol}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={lineColor}
              stopOpacity="0.30"
            />

            <stop
              offset="100%"
              stopColor={lineColor}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((line) => {
          const y =
            padding +
            (line / 4) * (height - padding * 2);

          return (
            <line
              key={line}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#263246"
              strokeDasharray="4 8"
              strokeWidth="1"
            />
          );
        })}

        <polyline
          points={`${padding},${height - padding} ${points} ${
            width - padding
          },${height - padding}`}
          fill={`url(#chartGradient-${coin.symbol})`}
          stroke="none"
        />

        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="chart-footer">
        <span>
          Low:{" "}
          {formatPrice(minPrice)}
        </span>

        <span>
          Live public market data · Updates every 60 seconds
        </span>

        <span>
          High:{" "}
          {formatPrice(maxPrice)}
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   MARKET DATA
-------------------------------------------------- */

function useMarketData() {
  const [marketData, setMarketData] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  async function loadMarkets() {
    try {
      const ids = COINS.map((coin) => coin.coinId).join(",");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error("Market request failed");
      }

      const data = await response.json();

      const mapped = {};

      data.forEach((item) => {
        mapped[item.id] = {
          price: item.current_price,
          change: item.price_change_percentage_24h,
          marketCap: item.market_cap,
          volume: item.total_volume,
        };
      });

      setMarketData(mapped);
    } catch (error) {
      const fallback = {};

      COINS.forEach((coin) => {
        fallback[coin.coinId] = {
          price: coin.fallbackPrice,
          change: -2.63,
          marketCap: 0,
          volume: 0,
        };
      });

      setMarketData(fallback);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadMarkets();

    const timer = setInterval(loadMarkets, 60000);

    return () => clearInterval(timer);
  }, []);

  return { marketData, loading };
}

/* --------------------------------------------------
   SIGN IN MODAL
-------------------------------------------------- */

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = React.useState("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");

  function submitForm(event) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    localStorage.setItem(
      "nova_demo_user",
      JSON.stringify({ email })
    );

    onSuccess({ email });
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-logo">N</div>

        <h2>
          {mode === "signin"
            ? "Welcome back"
            : "Create your account"}
        </h2>

        <p className="modal-subtitle">
          {mode === "signin"
            ? "Sign in to view your portfolio and start trading."
            : "Create a demo account to access your trading dashboard."}
        </p>

        <form onSubmit={submitForm}>
          <label>Email address</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {message && (
            <div className="form-message">{message}</div>
          )}

          <button className="primary-button" type="submit">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() => {
              setMode(
                mode === "signin" ? "signup" : "signin"
              );
              setMessage("");
            }}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>

        <div className="demo-note">
          Demo authentication only. Do not use real passwords.
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   TRADING PANEL
-------------------------------------------------- */

function TradingPanel({ coin, market, signedIn }) {
  const [side, setSide] = React.useState("buy");
  const [amount, setAmount] = React.useState("");
  const [message, setMessage] = React.useState("");

  const price = market?.price || coin.fallbackPrice;
  const numericAmount = Number(amount) || 0;
  const estimatedCoinAmount =
    price > 0 ? numericAmount / price : 0;

  function reviewOrder() {
    if (!signedIn) {
      setMessage("Please sign in before trading.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Enter an amount first.");
      return;
    }

    setMessage(
      `Demo ${side.toUpperCase()} order reviewed: $${numericAmount.toFixed(
        2
      )} ${coin.symbol}. No real funds will be used.`
    );
  }

  return (
    <section className="trade-panel">
      <div className="panel-heading">
        <div>
          <h3>Trade {coin.symbol}</h3>
          <p>Demo trading interface</p>
        </div>

        <span className="demo-badge">DEMO</span>
      </div>

      <div className="trade-tabs">
        <button
          className={side === "buy" ? "active-buy" : ""}
          onClick={() => setSide("buy")}
        >
          Buy
        </button>

        <button
          className={side === "sell" ? "active-sell" : ""}
          onClick={() => setSide("sell")}
        >
          Sell
        </button>
      </div>

      <div className="trade-field">
        <div className="field-label">
          <span>Pay with</span>
          <span>USDT</span>
        </div>

        <input
          type="number"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setMessage("");
          }}
        />

        <div className="field-help">
          Available balance: {signedIn ? "Demo 10,000 USDT" : "—"}
        </div>
      </div>

      <div className="trade-field">
        <div className="field-label">
          <span>Receive</span>
          <span>{coin.symbol}</span>
        </div>

        <div className="receive-value">
          {estimatedCoinAmount
            ? estimatedCoinAmount.toFixed(8)
            : "0.00000000"}
        </div>

        <div className="field-help">
          Estimated amount at current market price
        </div>
      </div>

      <div className="trade-summary">
        <div>
          <span>Market price</span>
          <strong>{formatPrice(price)}</strong>
        </div>

        <div>
          <span>Trading fee</span>
          <strong>0.25%</strong>
        </div>

        <div>
          <span>Network fee</span>
          <strong>Calculated before confirmation</strong>
        </div>
      </div>

      {message && (
        <div className="trade-message">{message}</div>
      )}

      <button
        className={
          side === "buy"
            ? "trade-submit buy-submit"
            : "trade-submit sell-submit"
        }
        onClick={reviewOrder}
      >
        {!signedIn
          ? "Sign In to Trade"
          : `Review ${side === "buy" ? "Buy" : "Sell"} Order`}
      </button>

      <p className="security-note">
        Nova Wallet never asks for your private key or recovery phrase.
        This is a demo trading interface and does not execute real orders.
      </p>
    </section>
  );
}

/* --------------------------------------------------
   MAIN APP
-------------------------------------------------- */

function App() {
  const { marketData, loading } = useMarketData();

  const [selectedCoin, setSelectedCoin] = React.useState(COINS[0]);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem("nova_demo_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("nova_demo_user");
      }
    }
  }, []);

  const selectedMarket = marketData[selectedCoin.coinId];

  function signOut() {
    localStorage.removeItem("nova_demo_user");
    setUser(null);
  }

  return (
    <div className="nova-app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <div>
            <strong>Nova</strong>
            <strong>Wallet</strong>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <button className="side-link active">
          ▦ <span>Trade</span>
        </button>

        <button className="side-link">
          ⌁ <span>Markets</span>
        </button>

        <button className="side-link">
          ▣ <span>Portfolio</span>
        </button>

        <button className="side-link">
          ↔ <span>Activity</span>
        </button>

        <div className="sidebar-bottom">
          <div className="security-small">
            <span>●</span>
            <div>
              <strong>Non-custodial</strong>
              <small>You control your wallet</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">DECENTRALIZED TRADING</div>
            <h1>Trade</h1>
          </div>

          <div className="top-actions">
            <button className="icon-button">⌕</button>
            <button className="icon-button">◇</button>

            {user ? (
              <button className="account-button" onClick={signOut}>
                {user.email}
                <span>Sign out</span>
              </button>
            ) : (
              <button
                className="signin-button"
                onClick={() => setAuthOpen(true)}
              >
                Sign In
              </button>
            )}

            <AppKitButton />
          </div>
        </header>

        <section className="market-cards">
          {COINS.map((coin) => {
            const market = marketData[coin.coinId];
            const price = market?.price || coin.fallbackPrice;
            const change = market?.change ?? -2.63;

            return (
              <button
                key={coin.symbol}
                className={`market-card ${
                  selectedCoin.symbol === coin.symbol
                    ? "selected"
                    : ""
                }`}
                onClick={() => setSelectedCoin(coin)}
              >
                <div className="market-card-top">
                  <div className="coin-title">
                    <CoinIcon coin={coin} small />
                    <span>{coin.symbol}</span>
                  </div>

                  <span>USD</span>
                </div>

                <div className="market-card-bottom">
                  <strong>{loading ? "—" : formatPrice(price)}</strong>

                  <span
                    className={
                      change >= 0 ? "positive" : "negative"
                    }
                  >
                    {change >= 0 ? "+" : ""}
                    {Number(change).toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        <section className="chart-section">
          <div className="chart-header">
            <div className="chart-title">
              <CoinIcon coin={selectedCoin} />

              <div>
                <h2>{selectedCoin.pair}</h2>
                <p>{selectedCoin.name}</p>
              </div>
            </div>

            <div className="chart-price">
              <strong>
                {formatPrice(
                  selectedMarket?.price ||
                    selectedCoin.fallbackPrice
                )}
              </strong>

              <span
                className={
                  (selectedMarket?.change ?? -2.63) >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {(selectedMarket?.change ?? -2.63) >= 0
                  ? "+"
                  : ""}
                {Number(
                  selectedMarket?.change ?? -2.63
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>

          <div className="chart-toolbar">
            <button>1h</button>
            <button>4h</button>
            <button className="active-time">24h</button>
            <button>7d</button>
            <button>30d</button>
          </div>

          <LiveMarketChart coin={selectedCoin} />
        </section>

        <div className="content-grid">
          <TradingPanel
            coin={selectedCoin}
            market={selectedMarket}
            signedIn={Boolean(user)}
          />

          <section className="market-overview">
            <div className="panel-heading">
              <div>
                <h3>Market Overview</h3>
                <p>Live cryptocurrency prices</p>
              </div>
            </div>

            <div className="overview-list">
              {COINS.map((coin) => {
                const market = marketData[coin.coinId];
                const price =
                  market?.price || coin.fallbackPrice;
                const change = market?.change ?? -2.63;

                return (
                  <button
                    className="overview-row"
                    key={coin.symbol}
                    onClick={() => setSelectedCoin(coin)}
                  >
                    <CoinIcon coin={coin} small />

                    <div className="overview-name">
                      <strong>{coin.symbol}</strong>
                      <small>{coin.name}</small>
                    </div>

                    <strong>{formatPrice(price)}</strong>

                    <span
                      className={
                        change >= 0 ? "positive" : "negative"
                      }
                    >
                      {change >= 0 ? "+" : ""}
                      {Number(change).toFixed(2)}%
                    </span>

                    <span className="market-cap">
                      {formatLargeNumber(market?.marketCap)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="bottom-panels">
          <div className="info-panel">
            <h3>Portfolio</h3>

            {user ? (
              <div className="portfolio-logged">
                <span>Your demo portfolio balance</span>
                <strong>$10,000.00</strong>
                <small>
                  Demo balance only. Connect a wallet to view
                  blockchain assets.
                </small>
              </div>
            ) : (
              <div className="portfolio-locked">
                <div className="lock-icon">🔒</div>
                <h4>Sign in to view your portfolio</h4>
                <p>
                  Create an account or sign in to view your
                  portfolio and start trading.
                </p>

                <button
                  className="secondary-button"
                  onClick={() => setAuthOpen(true)}
                >
                  Sign In / Create Account
                </button>
              </div>
            )}
          </div>

          <div className="info-panel">
            <h3>Recent Activity</h3>

            <div className="empty-activity">
              <div className="activity-icon">↔</div>
              <p>
                {user
                  ? "Your demo transactions will appear here."
                  : "Sign in to view your transaction history."}
              </p>
            </div>
          </div>
        </section>

        <footer className="page-footer">
          <span>
            Market data powered by public CoinGecko API
          </span>

          <span>
            Nova Wallet · Demo interface · Never share your
            recovery phrase
          </span>
        </footer>
      </main>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={(newUser) => setUser(newUser)}
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
