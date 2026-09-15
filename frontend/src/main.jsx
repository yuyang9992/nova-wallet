import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import {
  WagmiProvider,
  useAccount,
  useBalance,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";

import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { wagmiAdapter, queryClient } from "./walletConfig";

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    data: walletBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address: address,
  });

  const {
    data: transactionHash,
    isPending: isTransactionPending,
    sendTransaction,
    error: transactionError,
  } = useSendTransaction();

  const {
    isLoading: isTransactionConfirming,
    isSuccess: isTransactionConfirmed,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const [activeModal, setActiveModal] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  const [transactions, setTransactions] = useState([
    {
      name: "Received Bitcoin",
      type: "Income",
      amount: "+$1,250.00",
      date: "Today, 10:24 AM",
      icon: "₿",
    },
    {
      name: "USDT Deposit",
      type: "Income",
      amount: "+$850.00",
      date: "Yesterday, 4:15 PM",
      icon: "₮",
    },
    {
      name: "Ethereum Transfer",
      type: "Expense",
      amount: "-$420.50",
      date: "Sep 08, 2026",
      icon: "Ξ",
    },
    {
      name: "Bitcoin Purchase",
      type: "Expense",
      amount: "-$1,200.00",
      date: "Sep 06, 2026",
      icon: "₿",
    },
  ]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  const formattedBalance = walletBalance
    ? Number(walletBalance.formatted).toFixed(5)
    : "0.00000";

  const openModal = (modalName) => {
    setFormError("");
    setAmount("");
    setRecipient("");
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormError("");
    setAmount("");
    setRecipient("");
  };

  const copyAddress = async () => {
    if (!address) return;

    await navigator.clipboard.writeText(address);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSendTransaction = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!isConnected || !address) {
      setFormError("Please connect your wallet first.");
      return;
    }

    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setFormError("Please enter a valid wallet address.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    try {
      sendTransaction({
        to: recipient,
        value: BigInt(Math.floor(Number(amount) * 1e18)),
      });
    } catch (error) {
      setFormError(error?.message || "Transaction failed.");
    }
  };

  const addLocalTransaction = (type, transactionAmount) => {
    const newTransaction = {
      name: type === "Income" ? "Wallet Deposit" : "Wallet Transfer",
      type,
      amount:
        type === "Income"
          ? `+$${transactionAmount}`
          : `-$${transactionAmount}`,
      date: "Just now",
      icon: type === "Income" ? "↓" : "↑",
    };

    setTransactions((previousTransactions) => [
      newTransaction,
      ...previousTransactions,
    ]);
  };

  const closeAfterSuccess = () => {
    if (isTransactionConfirmed) {
      addLocalTransaction("Expense", amount);
      refetchBalance();
      closeModal();
    }
  };

  React.useEffect(() => {
    closeAfterSuccess();
  }, [isTransactionConfirmed]);

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
              <strong>{shortAddress}</strong>
              <small>Connected Wallet</small>
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

            <AppKitButton />
          </div>
        </header>

        <section className="balance-grid" id="dashboard">
          <div className="balance-card">
            <div className="card-header">
              <span>Total Wallet Balance</span>
              <button className="more-button">•••</button>
            </div>

            <div className="balance-amount">
              {isBalanceLoading ? "Loading..." : formattedBalance}
              <small
                style={{
                  fontSize: "18px",
                  marginLeft: "10px",
                  opacity: 0.7,
                }}
              >
                {walletBalance?.symbol || "ETH"}
              </small>
            </div>

            <div className="balance-change">
              <span>
                {isConnected ? "● Connected" : "○ Not connected"}
              </span>

              <small>
                Network ID: {isConnected ? chainId : "—"}
              </small>
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
            <div className="stat-title">Wallet Address</div>

            <div
              className="stat-value"
              style={{ fontSize: "18px", wordBreak: "break-all" }}
            >
              {shortAddress}
            </div>

            <button
              className="add-button"
              style={{ marginTop: "15px" }}
              onClick={copyAddress}
              disabled={!address}
            >
              {copied ? "Copied!" : "Copy Address"}
            </button>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◎</div>
            <div className="stat-title">Current Network</div>

            <div className="stat-value">
              {isConnected ? `Chain ID ${chainId}` : "Not connected"}
            </div>

            <div className="stat-positive">
              {isConnected ? "Wallet is ready" : "Connect wallet to start"}
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel wallet-panel" id="wallets">
            <div className="panel-heading">
              <div>
                <h2>My Wallet</h2>
                <p>Manage your connected crypto wallet</p>
              </div>

              <AppKitButton />
            </div>

            <div className="wallet-list">
              <div className="wallet-item">
                <div className="coin-icon ethereum">Ξ</div>

                <div className="wallet-info">
                  <strong>{walletBalance?.symbol || "Ethereum"}</strong>
                  <span>Native Token</span>
                </div>

                <div className="wallet-price">
                  <strong>
                    {isBalanceLoading ? "Loading..." : formattedBalance}
                  </strong>

                  <span>{walletBalance?.symbol || "ETH"}</span>
                </div>

                <div className="wallet-percent positive">
                  {isConnected ? "Connected" : "Disconnected"}
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
              <button
                className="quick-action"
                onClick={() => openModal("deposit")}
              >
                <span className="quick-icon deposit">↓</span>
                <span>Deposit</span>
              </button>

              <button
                className="quick-action"
                onClick={() => openModal("withdraw")}
              >
                <span className="quick-icon withdraw">↑</span>
                <span>Withdraw</span>
              </button>

              <button
                className="quick-action"
                onClick={() => openModal("send")}
              >
                <span className="quick-icon send">↗</span>
                <span>Send</span>
              </button>

              <button
                className="quick-action"
                onClick={() => openModal("receive")}
              >
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

            <button className="view-all">View all →</button>
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

      {activeModal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              color: "#1f2937",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {activeModal === "deposit" && "Deposit"}
                {activeModal === "receive" && "Receive Crypto"}
                {activeModal === "send" && "Send Crypto"}
                {activeModal === "withdraw" && "Withdraw Crypto"}
              </h2>

              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {!isConnected &&
              activeModal !== "deposit" &&
              activeModal !== "receive" && (
                <div
                  style={{
                    background: "#fff3cd",
                    padding: "14px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    color: "#856404",
                  }}
                >
                  Please connect your wallet before sending crypto.
                </div>
              )}

            {(activeModal === "deposit" ||
              activeModal === "receive") && (
              <div>
                <p>
                  Send crypto to the following wallet address:
                </p>

                <div
                  style={{
                    background: "#f3f4f6",
                    padding: "15px",
                    borderRadius: "10px",
                    wordBreak: "break-all",
                    fontSize: "14px",
                    marginBottom: "15px",
                  }}
                >
                  {address || "Connect your wallet to see your address"}
                </div>

                <button
                  className="add-button"
                  onClick={copyAddress}
                  disabled={!address}
                  style={{ width: "100%" }}
                >
                  {copied ? "Address Copied!" : "Copy Wallet Address"}
                </button>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginTop: "15px",
                  }}
                >
                  Only send assets that belong to the selected network.
                  Sending to the wrong network may permanently lose funds.
                </p>
              </div>
            )}

            {(activeModal === "send" ||
              activeModal === "withdraw") && (
              <form onSubmit={handleSendTransaction}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Recipient Wallet Address
                </label>

                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(event) =>
                    setRecipient(event.target.value)
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}
                />

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Amount ({walletBalance?.symbol || "ETH"})
                </label>

                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}
                />

                {formError && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "12px",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      fontSize: "14px",
                    }}
                  >
                    {formError}
                  </div>
                )}

                {transactionError && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "12px",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      fontSize: "14px",
                    }}
                  >
                    {transactionError.message}
                  </div>
                )}

                {transactionHash && (
                  <div
                    style={{
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      padding: "12px",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      wordBreak: "break-all",
                    }}
                  >
                    Transaction Hash:
                    <br />
                    {transactionHash}
                  </div>
                )}

                <button
                  type="submit"
                  className="add-button"
                  disabled={
                    !isConnected ||
                    isTransactionPending ||
                    isTransactionConfirming
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    cursor:
                      !isConnected ||
                      isTransactionPending ||
                      isTransactionConfirming
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isTransactionPending
                    ? "Confirm in Wallet..."
                    : isTransactionConfirming
                    ? "Confirming Transaction..."
                    : "Send Transaction"}
                </button>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "14px",
                  }}
                >
                  Network fees are required. Always verify the
                  recipient address before confirming.
                </p>
              </form>
            )}
          </div>
        </div>
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
