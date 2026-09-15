import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { wagmiAdapter, queryClient } from "./walletConfig";

const marketData = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: 64250.45,
    change: "+2.84%",
    icon: "₿",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: 3425.8,
    change: "+1.62%",
    icon: "Ξ",
  },
  {
    name: "Tether",
    symbol: "USDT",
    price: 1,
    change: "0.00%",
    icon: "₮",
  },
];

function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submitForm(event) {
    event.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    onLogin({
      email,
      name: email.split("@")[0],
    });
  }

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>

        <p>
          {mode === "login"
            ? "Sign in to view your portfolio and trading history."
            : "Create an account to manage your demo portfolio."}
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

          <button className="primary-button" type="submit">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login" ? "Create Account" : "Sign In"}
          </button>
        </div>

        <small className="demo-note">
          Demo account only. Do not enter real financial passwords.
        </small>
      </div>
    </div>
  );
}

function TradingPanel({ isLoggedIn, onOpenAuth, onTrade }) {
  const [selectedMarket, setSelectedMarket] = useState(marketData[0]);
  const [tradeType, setTradeType] = useState("buy");
  const [amount, setAmount] = useState("");

  function submitTrade(event) {
    event.preventDefault();

    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    onTrade({
      type: tradeType,
      symbol: selectedMarket.symbol,
      amount: Number(amount),
      price: selectedMarket.price,
    });

    setAmount("");
  }

  return (
    <div className="trading-layout">
      <div className="panel markets-panel">
        <div className="panel-heading">
          <div>
            <h2>Markets</h2>
            <p>Live-style demo market prices</p>
          </div>
        </div>

        <div className="market-list">
          {marketData.map((market) => (
            <button
              className={`market-item ${
                selectedMarket.symbol === market.symbol ? "selected" : ""
              }`}
              key={market.symbol}
              onClick={() => setSelectedMarket(market)}
            >
              <div className={`coin-icon ${market.symbol.toLowerCase()}`}>
                {market.icon}
              </div>

              <div className="market-info">
                <strong>{market.name}</strong>
                <span>{market.symbol}</span>
              </div>

              <div className="market-price">
                <strong>
                  ${market.price.toLocaleString("en-US")}
                </strong>
                <span className="positive">{market.change}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel trade-panel">
        <div className="panel-heading">
          <div>
            <h2>Trade {selectedMarket.symbol}</h2>
            <p>Demo trading mode</p>
          </div>

          <span className="demo-badge">DEMO</span>
        </div>

        {!isLoggedIn ? (
          <div className="login-required">
            <div className="lock-icon">🔒</div>

            <h3>Account required</h3>

            <p>
              Create an account or sign in to view your portfolio and start
              demo trading.
            </p>

            <button className="primary-button" onClick={onOpenAuth}>
              Create Account / Sign In
            </button>
          </div>
        ) : (
          <form className="trade-form" onSubmit={submitTrade}>
            <div className="trade-tabs">
              <button
                type="button"
                className={tradeType === "buy" ? "active buy-tab" : ""}
                onClick={() => setTradeType("buy")}
              >
                Buy
              </button>

              <button
                type="button"
                className={tradeType === "sell" ? "active sell-tab" : ""}
                onClick={() => setTradeType("sell")}
              >
                Sell
              </button>
            </div>

            <div className="selected-asset">
              <span>Asset</span>
              <strong>
                {selectedMarket.icon} {selectedMarket.name}
              </strong>
            </div>

            <label>Amount in USD</label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <div className="trade-summary">
              <div>
                <span>Market Price</span>
                <strong>
                  ${selectedMarket.price.toLocaleString("en-US")}
                </strong>
              </div>

              <div>
                <span>Estimated Fee</span>
                <strong>0.25%</strong>
              </div>
            </div>

            <button className="primary-button" type="submit">
              {tradeType === "buy" ? "Review Buy Order" : "Review Sell Order"}
            </button>

            <small className="demo-note">
              This is a simulated trade. No real funds are transferred.
            </small>
          </form>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const [demoBalance, setDemoBalance] = useState(24580.75);

  const [transactions, setTransactions] = useState([
    {
      name: "Demo Bitcoin Purchase",
      type: "Buy",
      amount: "$1,250.00",
      date: "Today, 10:24 AM",
    },
    {
      name: "Demo USDT Trade",
      type: "Buy",
      amount: "$850.00",
      date: "Yesterday, 4:15 PM",
    },
  ]);

  function handleLogin(user) {
    setIsLoggedIn(true);
    setShowAuth(false);
    alert(`Welcome, ${user.name}`);
  }

  function handleDemoTrade(trade) {
    const tradeValue = trade.amount;
    const fee = tradeValue * 0.0025;

    if (trade.type === "buy" && tradeValue + fee > demoBalance) {
      alert("Insufficient demo balance.");
      return;
    }

    if (trade.type === "buy") {
      setDemoBalance((current) => current - tradeValue - fee);
    } else {
      setDemoBalance((current) => current + tradeValue - fee);
    }

    setTransactions((current) => [
      {
        name: `Demo ${trade.type === "buy" ? "Purchase" : "Sale"} ${
          trade.symbol
        }`,
        type: trade.type === "buy" ? "Buy" : "Sell",
        amount: `$${tradeValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`,
        date: "Just now",
      },
      ...current,
    ]);

    alert(
      `Demo ${trade.type === "buy" ? "buy" : "sell"} order completed.\n\nNo real funds were transferred.`
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>Nova Wallet</span>
        </div>

        <nav>
          <button
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "trading" ? "active" : ""
            }`}
            onClick={() => setActivePage("trading")}
          >
            <span>↗</span>
            Trading
          </button>

          <button
            className={`nav-item ${
              activePage === "wallets" ? "active" : ""
            }`}
            onClick={() => setActivePage("wallets")}
          >
            <span>▣</span>
            My Wallets
          </button>

          <button
            className={`nav-item ${
              activePage === "transactions" ? "active" : ""
            }`}
            onClick={() => setActivePage("transactions")}
          >
            <span>↔</span>
            Transactions
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

          <button className="nav-item">
            <span>?</span>
            Help Center
          </button>

          <div className="profile">
            <div className="avatar">
              {isLoggedIn ? "YL" : "GU"}
            </div>

            <div>
              <strong>{isLoggedIn ? "Yuyang" : "Guest User"}</strong>
              <small>
                {isLoggedIn ? "Demo Account" : "Not signed in"}
              </small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>
              {isLoggedIn
                ? "Welcome back, Yuyang 👋"
                : "Welcome to Nova Wallet 👋"}
            </h1>

            <p>
              {isLoggedIn
                ? "Manage your demo portfolio and trading activity."
                : "Explore markets and create an account to continue."}
            </p>
          </div>

          <div className="top-actions">
            <button className="icon-button">⌕</button>
            <button className="icon-button">🔔</button>

            {isLoggedIn ? (
              <button
                className="user-button"
                onClick={() => setIsLoggedIn(false)}
              >
                <span className="avatar small">YL</span>
                Yuyang
              </button>
            ) : (
              <button
                className="primary-button small-button"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </button>
            )}

            <AppKitButton />
          </div>
        </header>

        {activePage === "trading" ? (
          <section>
            <div className="page-title">
              <h2>Trading</h2>
              <p>Buy and sell assets in demo mode.</p>
            </div>

            <TradingPanel
              isLoggedIn={isLoggedIn}
              onOpenAuth={() => setShowAuth(true)}
              onTrade={handleDemoTrade}
            />
          </section>
        ) : (
          <>
            <section className="balance-grid" id="dashboard">
              <div className="balance-card">
                <div className="card-header">
                  <span>
                    {isLoggedIn ? "Demo Portfolio Balance" : "Portfolio Balance"}
                  </span>
                  <span className="demo-badge">DEMO</span>
                </div>

                {isLoggedIn ? (
                  <>
                    <div className="balance-amount">
                      $
                      {demoBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </div>

                    <div className="balance-change">
                      <span>↗ 12.8%</span>
                      <small>Demo performance</small>
                    </div>
                  </>
                ) : (
                  <div className="hidden-balance">
                    <div className="blurred-balance">$00,000.00</div>

                    <p>
                      Create an account or sign in to view your balance.
                    </p>

                    <button
                      className="primary-button"
                      onClick={() => setShowAuth(true)}
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">↗</div>
                <div className="stat-title">Total Income</div>

                {isLoggedIn ? (
                  <div className="stat-value">$8,450.00</div>
                ) : (
                  <div className="private-value">••••••</div>
                )}

                <div className="stat-positive">
                  ↗ 8.4% <span>vs last month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">↙</div>
                <div className="stat-title">Total Expenses</div>

                {isLoggedIn ? (
                  <div className="stat-value">$3,250.50</div>
                ) : (
                  <div className="private-value">••••••</div>
                )}

                <div className="stat-negative">
                  ↘ 3.2% <span>vs last month</span>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Market Overview</h2>
                  <p>Explore available demo markets</p>
                </div>

                <button
                  className="add-button"
                  onClick={() => setActivePage("trading")}
                >
                  Start Trading →
                </button>
              </div>

              <div className="market-overview">
                {marketData.map((market) => (
                  <div className="overview-card" key={market.symbol}>
                    <div className="coin-icon">{market.icon}</div>
                    <strong>{market.name}</strong>
                    <span>{market.symbol}</span>
                    <h3>
                      ${market.price.toLocaleString("en-US")}
                    </h3>
                    <small className="positive">{market.change}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel transactions-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Your latest demo activity</p>
                </div>

                {!isLoggedIn && (
                  <button
                    className="view-all"
                    onClick={() => setShowAuth(true)}
                  >
                    Sign in to view all →
                  </button>
                )}
              </div>

              {isLoggedIn ? (
                <div className="transaction-table">
                  <div className="table-header">
                    <span>Transaction</span>
                    <span>Type</span>
                    <span>Date</span>
                    <span>Amount</span>
                  </div>

                  {transactions.map((transaction, index) => (
                    <div className="transaction-row" key={index}>
                      <strong>{transaction.name}</strong>
                      <span className="type income">
                        {transaction.type}
                      </span>
                      <span className="transaction-date">
                        {transaction.date}
                      </span>
                      <strong>{transaction.amount}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="private-section">
                  <div className="lock-icon">🔒</div>
                  <h3>Transactions are private</h3>
                  <p>
                    Create an account or sign in to view your transaction
                    history.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setShowAuth(true)}
                  >
                    Create Account / Sign In
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        <section className="panel security-panel">
          <h2>Security Notice</h2>
          <p>
            Nova Wallet never asks for your private key or Secret Recovery
            Phrase. This version uses demo trading only. No real funds are
            transferred.
          </p>
        </section>
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}
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
