import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppKitButton } from "@reown/appkit/react";

import { wagmiAdapter, queryClient } from "./walletConfig";


// ဒီနေရာမှာ LiveMarketChart function ကို ထည့်ပါ
function LiveMarketChart({ symbol = "BTCUSDT" }) {
  const [prices, setPrices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const coinId =
    symbol === "BTCUSDT"
      ? "bitcoin"
      : symbol === "ETHUSDT"
      ? "ethereum"
      : symbol === "SOLUSDT"
      ? "solana"
      : symbol === "BNBUSDT"
      ? "binancecoin"
      : symbol === "XRPUSDT"
      ? "ripple"
      : symbol === "ADAUSDT"
      ? "cardano"
      : "bitcoin";

  async function loadChart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`
      );

      if (!response.ok) {
        throw new Error("Market data unavailable");
      }

      const data = await response.json();

      const formatted = (data.prices || []).map(([time, price]) => ({
        time,
        price,
      }));

      setPrices(formatted);
    } catch (err) {
      setError("Market data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadChart();

    const timer = setInterval(loadChart, 60000);

    return () => clearInterval(timer);
  }, [coinId]);

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
  const height = 360;
  const padding = 30;

  const values = prices.map((item) => item.price);
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const range = maxPrice - minPrice || 1;

  const points = prices
    .map((item, index) => {
      const x =
        padding +
        (index / (prices.length - 1)) *
          (width - padding * 2);

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

  const lineColor =
    changePercent >= 0 ? "#22c55e" : "#ef4444";

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
            id={`chartGradient-${symbol}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={lineColor}
              stopOpacity="0.25"
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
            (line / 4) *
              (height - padding * 2);

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
          fill={`url(#chartGradient-${symbol})`}
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
          Low: $
          {minPrice.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
        </span>

        <span>
          Live public market data · Updates every 60 seconds
        </span>

        <span>
          High: $
          {maxPrice.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
        </span>
      </div>
    </div>
  );
}


// ဒီအောက်မှာ မင်းရဲ့ App function ရှိရမယ်
function App() {
  // မင်းရဲ့ လက်ရှိ App code
}
