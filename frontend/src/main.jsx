import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { wagmiAdapter, queryClient } from "./walletConfig";

const projectId = "YOUR_REOWN_PROJECT_ID";

const metadata = {
  name: "Nova Wallet",
  description: "Nova Wallet Crypto Dashboard",
  url: window.location.origin,
  icons: ["https://avatars.githubusercontent.com/u/179229932"]
};

const networks = [mainnet, polygon, arbitrum, optimism, base];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false
  }
});

const queryClient = new QueryClient();

function WalletConnection() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <button
        className="connect-wallet-button"
        onClick={() => window.open("https://reown.com/appkit", "_blank")}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="connected-wallet">
      <span className="wallet-network">
        {chain?.name || "Connected"}
      </span>

      <span className="wallet-address">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>

      <button
        className="disconnect-button"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}

function App() {
  const [balance, setBalance] = useState(24580.75);

  const transactions = [
    {
      name: "Received Bitcoin",
      type: "Income",
      amount: "+$1,250.00",
      date: "Today, 10:24 AM",
      icon: "₿"
    },
    {
      name: "USDT Deposit",
      type: "Income",
      amount: "+$850.00",
      date: "Yesterday, 4:15 PM",
      icon: "₮"
    },
    {
      name: "Ethereum Transfer",
      type: "Expense",
      amount: "-$420.50",
      date: "Sep 08, 2026",
      icon: "Ξ"
    },
    {
      name: "Bitcoin Purchase",
      type: "Expense",
      amount: "-$1,200.00",
      date: "Sep 06, 2026",
      icon: "₿"
    }
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>Nova Wallet</span>
        </div>

        <nav>
          <a className="nav-item active" href="#dashboard">
            <span>▦</span>
            Dashboard
          </a>

          <a className="nav-item" href="#wallets">
            <span>▣</span>
            My Wallets
          </a>

          <a className="nav-item" href="#transactions">
            <span>↔</span>
            Transactions
          </a>

          <a className="nav-item" href="#analytics">
            <span>◔</span>
            Analytics
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-item" href="#settings">
            <span>⚙</span>
            Settings
          </a>

          <a className="nav-item" href="#help">
            <span>?</span>
            Help Center
          </a>

          <div className="profile">
            <div className="avatar">YL</div>

            <div>
              <strong>Yuyang</strong>
              <small>Personal Account</small>
            </div>

            <span>⋮</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Good morning, Yuyang 👋</h1>
            <p>Here's what's happening with your wallet today.</p>
          </div>

          <div className="top-actions">
            <button className="icon-button">⌕</button>
            <button className="icon-button">🔔</button>

            <WalletConnection />
          </div>
        </header>

        <section className="balance-grid">
          <div className="balance-card">
            <div className="card-header">
              <span>Total Balance</span>
              <button className="more-button">•••</button>
            </div>

            <div className="balance-amount">
              $
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>

            <div className="balance-change">
              <span>↗ 12.8%</span>
              <small>Compared to last month</small>
            </div>

            <div className="balance-chart">
              <div className="chart-line"></div>

              <div className="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">↗</div>
            <div className="stat-title">Total Income</div>
            <div className="stat-value">$8,450.00</div>
            <div className="stat-positive">
              ↗ 8.4% <span>vs last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">↙</div>
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value">$3,250.50</div>
            <div className="stat-negative">
              ↘ 3.2% <span>vs last month</span>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel wallet-panel" id="wallets">
            <div className="panel-heading">
              <div>
                <h2>My Wallets</h2>
                <p>Manage your crypto assets</p>
              </div>

              <button className="add-button">
                + Add Wallet
              </button>
            </div>

            <div className="wallet-list">
              <div className="wallet-item">
                <div className="coin-icon bitcoin">₿</div>

                <div className="wallet-info">
                  <strong>Bitcoin</strong>
                  <span>BTC</span>
                </div>

                <div className="wallet-price">
                  <strong>0.1842 BTC</strong>
                  <span>$11,842.20</span>
                </div>

                <div className="wallet-percent positive">
                  +5.24%
                </div>
              </div>

              <div className="wallet-item">
                <div className="coin-icon ethereum">Ξ</div>

                <div className="wallet-info">
                  <strong>Ethereum</strong>
                  <span>ETH</span>
                </div>

                <div className="wallet-price">
                  <strong>2.450 ETH</strong>
                  <span>$6,720.80</span>
                </div>

                <div className="wallet-percent positive">
                  +3.18%
                </div>
              </div>

              <div className="wallet-item">
                <div className="coin-icon tether">₮</div>

                <div className="wallet-info">
                  <strong>Tether</strong>
                  <span>USDT</span>
                </div>

                <div className="wallet-price">
                  <strong>5,240.00 USDT</strong>
                  <span>$5,240.00</span>
                </div>

                <div className="wallet-percent neutral">
                  0.00%
                </div>
              </div>
            </div>
          </div>

          <div className="panel quick-panel">
            <div className="panel-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Manage your wallet</p>
              </div>
            </div>

            <div className="quick-actions">
              <button className="quick-action">
                <span className="quick-icon deposit">↓</span>
                <span>Deposit</span>
              </button>

              <button className="quick-action">
                <span className="quick-icon withdraw">↑</span>
                <span>Withdraw</span>
              </button>

              <button className="quick-action">
                <span className="quick-icon send">↗</span>
                <span>Send</span>
              </button>

              <button className="quick-action">
                <span className="quick-icon receive">↙</span>
                <span>Receive</span>
              </button>
            </div>
          </div>
        </section>

        <section className="panel transactions-panel" id="transactions">
          <div className="panel-heading">
            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest wallet activity</p>
            </div>

            <button className="view-all">
              View all →
            </button>
          </div>

          <div className="transaction-table">
            <div className="table-header">
              <span>Transaction</span>
              <span>Type</span>
              <span>Date</span>
              <span>Amount</span>
            </div>

            {transactions.map((transaction, index) => (
              <div className="transaction-row" key={index}>
                <div className="transaction-name">
                  <div className="transaction-icon">
                    {transaction.icon}
                  </div>

                  <strong>{transaction.name}</strong>
                </div>

                <span
                  className={
                    transaction.type === "Income"
                      ? "type income"
                      : "type expense"
                  }
                >
                  {transaction.type}
                </span>

                <span className="transaction-date">
                  {transaction.date}
                </span>

                <strong
                  className={
                    transaction.type === "Income"
                      ? "amount income"
                      : "amount expense"
                  }
                >
                  {transaction.amount}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </main>
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
const projectId = "a74f0ed553beed9257f071aecc9a2e08";
