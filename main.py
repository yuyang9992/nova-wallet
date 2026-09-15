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
  usePublicClient,
  useSwitchChain,
} from "wagmi";

import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { isAddress, parseEther, formatEther } from "viem";
import { wagmiAdapter, queryClient } from "./walletConfig";

function WalletFunctions() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();

  const {
    data: balanceData,
    refetch: refetchBalance,
  } = useBalance({
    address,
    enabled: Boolean(address),
  });

  const {
    sendTransactionAsync,
    isPending: isSending,
  } = useSendTransaction();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [estimatedFee, setEstimatedFee] = useState(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [status, setStatus] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSend, setShowSend] = useState(false);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: transactionHash || undefined,
  });

  const networkNames = {
    1: "Ethereum Mainnet",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base",
    11155111: "Sepolia Testnet",
  };

  const networkName = networkNames[chainId] || `Chain ID: ${chainId}`;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  async function calculateNetworkFee() {
    try {
      if (!isConnected || !address) {
        setStatus("Please connect your wallet first.");
        return;
      }

      if (!publicClient) {
        setStatus("Blockchain connection is not ready.");
        return;
      }

      if (!isAddress(recipient)) {
        setStatus("Invalid recipient wallet address.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setStatus("Please enter a valid amount.");
        return;
      }

      const value = parseEther(amount);

      const gasLimit = await publicClient.estimateGas({
        account: address,
        to: recipient,
        value,
      });

      const gasPrice = await publicClient.getGasPrice();

      const feeInWei = gasLimit * gasPrice;
      const feeInNativeCoin = formatEther(feeInWei);

      setEstimatedFee(feeInNativeCoin);
      setStatus(
        `Estimated network fee: ${Number(feeInNativeCoin).toFixed(8)} native coin`
      );
    } catch (error) {
      console.error(error);
      setStatus("Unable to calculate network fee.");
    }
  }

  async function sendTransaction() {
    try {
      setStatus("");

      if (!isConnected || !address) {
        setStatus("Please connect your wallet first.");
        return;
      }

      if (!recipient || !isAddress(recipient)) {
        setStatus("Please enter a valid recipient address.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setStatus("Please enter an amount greater than zero.");
        return;
      }

      if (!balanceData) {
        setStatus("Unable to read wallet balance.");
        return;
      }

      const enteredAmount = Number(amount);
      const currentBalance = Number(balanceData.formatted);

      if (enteredAmount >= currentBalance) {
        setStatus(
          "Insufficient balance. You must keep some balance for network fees."
        );
        return;
      }

      const confirmedByUser = window.confirm(
        `Send ${amount} ${balanceData.symbol} to ${recipient}?\n\nNetwork: ${networkName}\n\nThis transaction cannot be reversed.`
      );

      if (!confirmedByUser) {
        setStatus("Transaction cancelled.");
        return;
      }

      setStatus("Please confirm the transaction in your wallet...");

      const hash = await sendTransactionAsync({
        to: recipient,
        value: parseEther(amount),
      });

      setTransactionHash(hash);
      setStatus(
        `Transaction submitted. Waiting for blockchain confirmation...\nHash: ${hash}`
      );
    } catch (error) {
      console.error(error);

      if (error?.name === "UserRejectedRequestError") {
        setStatus("You rejected the transaction in your wallet.");
      } else {
        setStatus(
          error?.shortMessage ||
            error?.message ||
            "Transaction failed. Please try again."
        );
      }
    }
  }

  function copyDepositAddress() {
    if (!address) {
      setStatus("Please connect your wallet first.");
      return;
    }

    navigator.clipboard.writeText(address);
    setStatus("Wallet address copied.");
  }

  function refreshWalletBalance() {
    refetchBalance();
    setStatus("Balance refreshed from blockchain.");
  }

  return (
    <div className="wallet-functions">
      <div className="wallet-control-header">
        <div>
          <h2>Blockchain Wallet</h2>
          <p>Real-time wallet connection and transaction controls</p>
        </div>

        <AppKitButton />
      </div>

      {!isConnected ? (
        <div className="wallet-not-connected">
          <h3>Wallet Not Connected</h3>
          <p>
            Connect MetaMask, Trust Wallet, Coinbase Wallet or another
            supported EVM wallet to continue.
          </p>
          <AppKitButton />
        </div>
      ) : (
        <>
          <div className="wallet-information">
            <div className="wallet-info-box">
              <span>Connected Address</span>
              <strong>{shortAddress}</strong>
              <small>{address}</small>
            </div>

            <div className="wallet-info-box">
              <span>Network</span>
              <strong>{networkName}</strong>
              <small>Chain ID: {chainId}</small>
            </div>

            <div className="wallet-info-box">
              <span>Blockchain Balance</span>
              <strong>
                {balanceData
                  ? `${Number(balanceData.formatted).toFixed(6)} ${
                      balanceData.symbol
                    }`
                  : "Loading..."}
              </strong>
              <small>Read directly from blockchain</small>
            </div>
          </div>

          <div className="wallet-action-buttons">
            <button
              className="wallet-action-button"
              onClick={() => setShowDeposit(!showDeposit)}
            >
              Deposit
            </button>

            <button
              className="wallet-action-button"
              onClick={() => setShowSend(!showSend)}
            >
              Send
            </button>

            <button
              className="wallet-action-button"
              onClick={refreshWalletBalance}
            >
              Refresh Balance
            </button>
          </div>

          {showDeposit && (
            <div className="wallet-modal-section">
              <h3>Deposit Address</h3>

              <p>
                Send only assets supported by this network to this address.
              </p>

              <div className="deposit-address">
                {address}
              </div>

              <button
                className="secondary-button"
                onClick={copyDepositAddress}
              >
                Copy Deposit Address
              </button>

              <p className="security-warning">
                Warning: Sending assets on the wrong network may permanently
                lose your funds.
              </p>
            </div>
          )}

          {showSend && (
            <div className="wallet-modal-section">
              <h3>Send Transaction</h3>

              <label>Recipient Wallet Address</label>

              <input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
              />

              <label>Amount</label>

              <input
                type="number"
                min="0"
                step="any"
                placeholder={`Amount in ${balanceData?.symbol || "native coin"}`}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />

              <div className="send-button-row">
                <button
                  className="secondary-button"
                  onClick={calculateNetworkFee}
                >
                  Check Network Fee
                </button>

                <button
                  className="primary-button"
                  onClick={sendTransaction}
                  disabled={isSending || isConfirming}
                >
                  {isSending
                    ? "Sending..."
                    : isConfirming
                    ? "Confirming..."
                    : "Send Transaction"}
                </button>
              </div>

              {estimatedFee && (
                <div className="fee-information">
                  Estimated Network Fee:{" "}
                  <strong>
                    {Number(estimatedFee).toFixed(8)}{" "}
                    {balanceData?.symbol || "native coin"}
                  </strong>
                </div>
              )}

              {transactionHash && (
                <div className="transaction-information">
                  <p>
                    Transaction Hash:
                  </p>

                  <a
                    href={`https://etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {transactionHash}
                  </a>
                </div>
              )}

              {isConfirmed && (
                <div className="success-message">
                  Transaction confirmed successfully on the blockchain.
                </div>
              )}
            </div>
          )}

          {status && (
            <div className="wallet-status">
              {status}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function App() {
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
            <AppKitButton />
          </div>
        </header>

        <WalletFunctions />

        <section className="panel">
          <h2>Security Information</h2>

          <ul>
            <li>Private keys are never requested or stored by this website.</li>
            <li>Every transaction must be approved inside your wallet.</li>
            <li>Recipient addresses are validated before sending.</li>
            <li>The app checks your balance before sending.</li>
            <li>You must keep extra balance for network fees.</li>
            <li>Transactions cannot be reversed after confirmation.</li>
          </ul>
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
