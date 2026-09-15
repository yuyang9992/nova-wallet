import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { WagmiProvider, useAccount, useBalance } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { wagmiAdapter, queryClient } from "./walletConfig";

const API_BASE = "https://api.binance.com/api/v3";

const markets = [
  {
    symbol: "BTCUSDT",
    pair: "BTC / USDT",
    name: "Bitcoin",
    short: "BTC",
    icon: "₿",
  },
  {
    symbol: "ETHUSDT",
    pair: "ETH / USDT",
    name: "Ethereum",
    short: "ETH",
    icon: "Ξ",
  },
  {
    symbol: "SOLUSDT",
    pair: "SOL / USDT",
    name: "Solana",
    short: "SOL",
    icon: "S",
  },
  {
    symbol: "BNBUSDT",
    pair: "BNB / USDT",
    name: "BNB",
    short: "BNB",
    icon: "◆",
  },
];

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [activePage, setActivePage] = useState("Trade");
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);
  const [prices, setPrices] = useState({});
  const [chartData, setChartData] = useState([]);
  const [chartInterval, setChartInterval] = useState("1h");
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [fromAmount, setFromAmount] = useState("");
  const [toToken, setToToken] = useState("USDC");
  const [swapMessage, setSwapMessage] = useState("");

  const { address, isConnected, chain } = useAccount();

  const { data: walletBalance } = useBalance({
    address,
  });

  useEffect(() => {
    let mounted = true;

    async function loadPrices() {
      try {
        const response = await fetch(
          `${API_BASE}/ticker/24hr?symbols=${encodeURIComponent(
            JSON.stringify(markets.map((item) => item.symbol))
          )}`
        );

        if (!response.ok) throw new Error("Unable to load market prices");

        const data = await response.json();

        if (!mounted) return;

        const nextPrices = {};

        data.forEach((item) => {
          nextPrices[item.symbol] = {
            price: Number(item.lastPrice),
            change: Number(item.priceChangePercent),
            volume: Number(item.quoteVolume),
          };
        });

        setPrices(nextPrices);
      } catch (error) {
        console.error("Market price error:", error);
      }
    }

    loadPrices();

    const timer = setInterval(loadPrices, 10000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadChart() {
      setIsLoadingChart(true);

      try {
        const response = await fetch(
          `${API_BASE}/klines?symbol=${selectedMarket.symbol}&interval=${chartInterval}&limit=80`
        );

        if (!response.ok) throw new Error("Unable to load chart");

        const data = await response.json();

        if (!mounted) return;

        const candles = data.map((item) => ({
          time: item[0],
          open: Number(item[1]),
          high: Number(item[2]),
          low: Number(item[3]),
          close: Number(item[4]),
          volume: Number(item[5]),
        }));

        setChartData(candles);
      } catch (error) {
        console.error("Chart error:", error);
        setChartData([]);
      } finally {
        if (mounted) setIsLoadingChart(false);
      }
    }

    loadChart();

    const timer = setInterval(loadChart, 30000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [selectedMarket, chartInterval]);

  const selectedPrice = prices[selectedMarket.symbol]?.price ?? null;
  const selectedChange = prices[selectedMarket.symbol]?.change ?? null;

  const estimatedOutput = useMemo(() => {
    if (!fromAmount || !selectedPrice) return null;

    const amount = Number(fromAmount);
    if (!Number.isFinite(amount) || amount <= 0) return null;

    return amount * selectedPrice;
  }, [fromAmount, selectedPrice]);

  function handleSwapReview() {
    setSwapMessage("");

    if (!isConnected) {
      setSwapMessage("Connect your wallet before reviewing a swap.");
      return;
    }

    if (!fromAmount || Number(fromAmount) <= 0) {
      setSwapMessage("Enter an amount to continue.");
      return;
    }

    setSwapMessage(
      "Swap review is ready. DEX router integration must be connected before a blockchain transaction can be submitted."
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">Nova</div>
            <div className="brand-name">Wallet</div>
          </div>
        </div>

        <div className="sidebar-section-title">Workspace</div>

        <button
          className={`side-link ${
            activePage === "Trade" ? "active" : ""
          }`}
          onClick={() => setActivePage("Trade")}
        >
          <span>▦</span>
          Trade
        </button>

        <button
          className={`side-link ${
            activePage === "Markets" ? "active" : ""
          }`}
          onClick={() => setActivePage("Markets")}
        >
          <span>⌁</span>
          Markets
        </button>

        <button
          className={`side-link ${
            activePage === "Portfolio" ? "active" : ""
          }`}
          onClick={() => setActivePage("Portfolio")}
        >
          <span>▣</span>
          Portfolio
        </button>

        <button
          className={`side-link ${
            activePage === "Activity" ? "active" : ""
          }`}
          onClick={() => setActivePage("Activity")}
        >
          <span>↔</span>
          Activity
        </button>

        <div className="sidebar-bottom">
          <div className="network-status">
            <span className="status-dot"></span>
            {chain?.name || "Wallet not connected"}
          </div>

          <div className="security-small">
            Non-custodial wallet
            <br />
            Your keys remain yours
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="page-heading">
            <div className="eyebrow">DECENTRALIZED TRADING</div>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" title="Search">
              ⌕
            </button>

            <button className="icon-button" title="Notifications">
              ♢
            </button>

            <AppKitButton />
          </div>
        </header>

        {activePage === "Trade" && (
          <>
            <section className="market-strip">
              {markets.map((market) => {
                const marketPrice = prices[market.symbol];
                const isSelected =
                  selectedMarket.symbol === market.symbol;

                return (
                  <button
                    key={market.symbol}
                    className={`market-mini ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedMarket(market)}
                  >
                    <div className="market-mini-top">
                      <span className="coin-icon">{market.icon}</span>
                      <span className="market-pair">
                        {market.pair}
                      </span>
                    </div>

                    <div className="market-mini-bottom">
                      <strong>
                        {formatNumber(marketPrice?.price, 2)}
                      </strong>

                      <span
                        className={
                          marketPrice?.change >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {marketPrice
                          ? `${marketPrice.change >= 0 ? "+" : ""}${formatNumber(
                              marketPrice.change,
                              2
                            )}%`
                          : "—"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="trading-layout">
              <div className="chart-panel panel">
                <div className="panel-header chart-header">
                  <div>
                    <div className="pair-title">
                      <span className="large-coin-icon">
                        {selectedMarket.icon}
                      </span>
                      <div>
                        <h2>{selectedMarket.pair}</h2>
                        <div className="pair-subtitle">
                          {selectedMarket.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="selected-price">
                    <strong>
                      {selectedPrice
                        ? `$${formatNumber(selectedPrice, 2)}`
                        : "—"}
                    </strong>

                    <span
                      className={
                        selectedChange >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {selectedChange !== null
                        ? `${selectedChange >= 0 ? "+" : ""}${formatNumber(
                            selectedChange,
                            2
                          )}%`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="chart-toolbar">
                  <div className="timeframes">
                    {["15m", "1h", "4h", "1d", "1w"].map(
                      (interval) => (
                        <button
                          key={interval}
                          className={
                            chartInterval === interval
                              ? "timeframe active"
                              : "timeframe"
                          }
                          onClick={() =>
                            setChartInterval(interval)
                          }
                        >
                          {interval}
                        </button>
                      )
                    )}
                  </div>

                  <div className="chart-tools">
                    <span>▥</span>
                    <span>⌁</span>
                    <span>⚙</span>
                  </div>
                </div>

                <PriceChart
                  data={chartData}
                  isLoading={isLoadingChart}
                />

                <div className="chart-footer">
                  <span>Market data provided by public market data API</span>
                  <span>Live updates</span>
                </div>
              </div>

              <SwapPanel
                selectedMarket={selectedMarket}
                selectedPrice={selectedPrice}
                selectedChange={selectedChange}
                fromAmount={fromAmount}
                setFromAmount={setFromAmount}
                toToken={toToken}
                setToToken={setToToken}
                estimatedOutput={estimatedOutput}
                isConnected={isConnected}
                walletBalance={walletBalance}
                onReview={handleSwapReview}
                swapMessage={swapMessage}
              />
            </section>

            <section className="bottom-grid">
              <div className="panel orderbook-panel">
                <div className="panel-header">
                  <div>
                    <h3>Order Book</h3>
                    <span className="panel-caption">
                      Market liquidity overview
                    </span>
                  </div>

                  <span className="book-tabs">Depth</span>
                </div>

                <div className="orderbook-columns">
                  <span>Price (USDT)</span>
                  <span>Amount</span>
                  <span>Total</span>
                </div>

                <div className="orderbook-rows">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div className="order-row sell-row" key={`s${row}`}>
                      <span>{formatNumber(selectedPrice ? selectedPrice + row * 2.5 : null, 2)}</span>
                      <span>{(0.012 * row).toFixed(4)}</span>
                      <span>{selectedPrice ? formatNumber(selectedPrice * 0.012 * row, 2) : "—"}</span>
                    </div>
                  ))}

                  <div className="spread-row">
                    <strong>
                      {selectedPrice
                        ? `$${formatNumber(selectedPrice, 2)}`
                        : "—"}
                    </strong>
                    <span>Spread</span>
                    <span>0.01%</span>
                  </div>

                  {[1, 2, 3, 4, 5].map((row) => (
                    <div className="order-row buy-row" key={`b${row}`}>
                      <span>{formatNumber(selectedPrice ? selectedPrice - row * 2.5 : null, 2)}</span>
                      <span>{(0.018 * row).toFixed(4)}</span>
                      <span>{selectedPrice ? formatNumber(selectedPrice * 0.018 * row, 2) : "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h3>Recent Activity</h3>
                    <span className="panel-caption">
                      Your wallet transactions
                    </span>
                  </div>
                </div>

                {!isConnected ? (
                  <div className="empty-state">
                    <div className="empty-icon">↔</div>
                    <h4>Connect your wallet</h4>
                    <p>
                      Your recent transactions will appear here after
                      connecting your wallet.
                    </p>
                    <AppKitButton />
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">✓</div>
                    <h4>No recent transactions</h4>
                    <p>
                      Confirmed wallet activity will appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activePage === "Markets" && (
          <section className="simple-page panel">
            <div className="panel-header">
              <div>
                <h2>Markets</h2>
                <span className="panel-caption">
                  Live market prices
                </span>
              </div>
            </div>

            <div className="markets-table">
              <div className="table-row table-head">
                <span>Asset</span>
                <span>Price</span>
                <span>24h Change</span>
                <span>24h Volume</span>
              </div>

              {markets.map((market) => {
                const data = prices[market.symbol];

                return (
                  <div className="table-row" key={market.symbol}>
                    <span className="asset-cell">
                      <span className="coin-icon">{market.icon}</span>
                      <strong>{market.pair}</strong>
                    </span>
                    <span>
                      {data ? `$${formatNumber(data.price, 2)}` : "—"}
                    </span>
                    <span className={data?.change >= 0 ? "positive" : "negative"}>
                      {data
                        ? `${data.change >= 0 ? "+" : ""}${formatNumber(data.change, 2)}%`
                        : "—"}
                    </span>
                    <span>
                      {data ? `$${formatNumber(data.volume, 0)}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activePage === "Portfolio" && (
          <section className="simple-page panel">
            <div className="panel-header">
              <div>
                <h2>Portfolio</h2>
                <span className="panel-caption">
                  Assets held by your connected wallet
                </span>
              </div>
            </div>

            {!isConnected ? (
              <div className="portfolio-empty">
                <h3>Connect your wallet to view your portfolio</h3>
                <p>
                  Nova Wallet does not hold your funds. Your assets remain
                  in your own wallet.
                </p>
                <AppKitButton />
              </div>
            ) : (
              <div className="wallet-summary">
                <div className="wallet-address">
                  {shortenAddress(address)}
                </div>
                <div className="wallet-balance">
                  {walletBalance
                    ? `${formatNumber(
                        Number(walletBalance.formatted),
                        5
                      )} ${walletBalance.symbol}`
                    : "Loading balance..."}
                </div>
              </div>
            )}
          </section>
        )}

        {activePage === "Activity" && (
          <section className="simple-page panel">
            <div className="panel-header">
              <div>
                <h2>Activity</h2>
                <span className="panel-caption">
                  Blockchain transaction history
                </span>
              </div>
            </div>

            <div className="portfolio-empty">
              <h3>No transaction activity yet</h3>
              <p>
                Transactions will appear after you connect a wallet and
                complete an on-chain action.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function SwapPanel({
  selectedMarket,
  selectedPrice,
  fromAmount,
  setFromAmount,
  toToken,
  setToToken,
  estimatedOutput,
  isConnected,
  walletBalance,
  onReview,
  swapMessage,
}) {
  return (
    <div className="swap-panel panel">
      <div className="panel-header">
        <div>
          <h2>Swap</h2>
          <span className="panel-caption">
            Exchange tokens from your wallet
          </span>
        </div>

        <button className="settings-button">⚙</button>
      </div>

      <div className="swap-box">
        <div className="swap-box-top">
          <span>From</span>
          <span className="balance-text">
            Balance:{" "}
            {walletBalance
              ? `${formatNumber(Number(walletBalance.formatted), 5)} ${
                  walletBalance.symbol
                }`
              : "—"}
          </span>
        </div>

        <div className="token-input-row">
          <input
            type="number"
            min="0"
            placeholder="0.00"
            value={fromAmount}
            onChange={(event) => setFromAmount(event.target.value)}
          />

          <button className="token-selector">
            <span className="coin-icon">{selectedMarket.icon}</span>
            {selectedMarket.short}
            <span>⌄</span>
          </button>
        </div>
      </div>

      <button className="swap-direction" title="Reverse tokens">
        ⇅
      </button>

      <div className="swap-box">
        <div className="swap-box-top">
          <span>To</span>
          <span className="balance-text">Balance: —</span>
        </div>

        <div className="token-input-row">
          <input
            type="text"
            placeholder="0.00"
            value={
              estimatedOutput
                ? formatNumber(estimatedOutput, 2)
                : ""
            }
            readOnly
          />

          <select
            className="token-selector select-token"
            value={toToken}
            onChange={(event) => setToToken(event.target.value)}
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="DAI">DAI</option>
          </select>
        </div>
      </div>

      <div className="swap-details">
        <div>
          <span>Exchange rate</span>
          <strong>
            {selectedPrice
              ? `1 ${selectedMarket.short} ≈ $${formatNumber(
                  selectedPrice,
                  2
                )}`
              : "—"}
          </strong>
        </div>

        <div>
          <span>Price impact</span>
          <strong>—</strong>
        </div>

        <div>
          <span>Minimum received</span>
          <strong>—</strong>
        </div>

        <div>
          <span>Network fee</span>
          <strong>Calculated before confirmation</strong>
        </div>
      </div>

      {swapMessage && (
        <div className="swap-message">{swapMessage}</div>
      )}

      <button className="primary-action" onClick={onReview}>
        {isConnected ? "Review Swap" : "Connect Wallet to Swap"}
      </button>

      <p className="swap-disclaimer">
        You control the transaction. Nova Wallet never asks for your
        private key or recovery phrase.
      </p>
    </div>
  );
}

function PriceChart({ data, isLoading }) {
  const width = 900;
  const height = 390;
  const padding = {
    top: 28,
    right: 70,
    bottom: 34,
    left: 18,
  };

  if (isLoading) {
    return (
      <div className="chart-loading">
        <div className="loading-spinner"></div>
        Loading market chart...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="chart-loading">
        Market chart is temporarily unavailable.
      </div>
    );
  }

  const values = data.map((item) => item.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x =
        padding.left +
        (index / (values.length - 1)) *
          (width - padding.left - padding.right);

      const y =
        padding.top +
        (1 - (value - min) / range) *
          (height - padding.top - padding.bottom);

      return `${x},${y}`;
    })
    .join(" ");

  const lastValue = values[values.length - 1];
  const lastX = width - padding.right;
  const lastY =
    padding.top +
    (1 - (lastValue - min) / range) *
      (height - padding.top - padding.bottom);

  return (
    <div className="chart-container">
      <svg
        className="price-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3, 4].map((line) => {
          const y =
            padding.top +
            (line / 4) * (height - padding.top - padding.bottom);

          return (
            <line
              key={line}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              className="chart-grid-line"
            />
          );
        })}

        {[0, 1, 2, 3, 4].map((line) => {
          const value = max - (line / 4) * range;

          const y =
            padding.top +
            (line / 4) * (height - padding.top - padding.bottom);

          return (
            <text
              key={`label-${line}`}
              x={width - padding.right + 12}
              y={y + 4}
              className="chart-price-label"
            >
              {formatNumber(value, 2)}
            </text>
          );
        })}

        <polyline
          points={points}
          className="chart-line"
          fill="none"
        />

        <line
          x1={lastX}
          x2={lastX}
          y1={lastY}
          y2={height - padding.bottom}
          className="chart-current-line"
        />

        <circle
          cx={lastX}
          cy={lastY}
          r="5"
          className="chart-current-dot"
        />

        <rect
          x={lastX - 62}
          y={lastY - 14}
          width="58"
          height="25"
          rx="4"
          className="chart-current-label"
        />

        <text
          x={lastX - 33}
          y={lastY + 3}
          textAnchor="middle"
          className="chart-current-text"
        >
          {formatNumber(lastValue, 2)}
        </text>
      </svg>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
