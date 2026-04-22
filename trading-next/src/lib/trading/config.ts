import type { RiskLimits, StrategyCatalogItem } from "@/lib/trading/types";

export const DEFAULT_CAPITAL = 5_000_000;

export const RISK_LIMITS: RiskLimits = {
  intradayRiskPerTradePct: 0.35,
  swingRiskPerTradePct: 0.75,
  maxOpenRiskPct: 2.5,
  maxDailyLossPct: 1.2,
  maxGlobalLossPct: 2,
  maxIntradayNotionalPct: 6,
  maxSwingNotionalPct: 12,
  maxSectorExposurePct: 25,
  maxIntradayPositions: 8,
  maxSwingPositions: 15,
  maxConsecutiveLosses: 5,
};

export const STRATEGY_CATALOG: StrategyCatalogItem[] = [
  {
    id: "orb_rvol",
    style: "intraday",
    name: "Opening Range Breakout + RVOL",
    timeframe: "5m",
    setup: "Breakout with trend strength and relative volume confirmation.",
    entryRule: "Buy above day high with RVOL > 1.8 and ADX > 18.",
    exitRule: "Partial at 1.5R, trailing by ATR, force square-off 15:20 IST.",
    riskRule: "Risk 0.35% of capital per trade.",
  },
  {
    id: "vwap_pullback",
    style: "intraday",
    name: "VWAP Pullback Trend",
    timeframe: "1m/5m",
    setup: "Trend continuation with pullback to VWAP.",
    entryRule: "EMA20 > EMA50 and price retests VWAP inside 0.15 ATR envelope.",
    exitRule: "Stop under pullback low and exit on VWAP failure.",
    riskRule: "Risk 0.35% of capital per trade.",
  },
  {
    id: "mr_vwap",
    style: "intraday",
    name: "VWAP Z-score Mean Reversion",
    timeframe: "1m",
    setup: "Countertrend snapback when stretched.",
    entryRule: "Long when z-score < -2.2 with controlled spread and weak trend.",
    exitRule: "Exit at VWAP or 1.2R.",
    riskRule: "Reduced confidence when ADX rises.",
  },
  {
    id: "breakout_20d",
    style: "swing",
    name: "20-Day Breakout Momentum",
    timeframe: "Daily",
    setup: "Trend breakout with volume expansion.",
    entryRule: "Close > 20D high and volume > 1.5x average.",
    exitRule: "Trail by 2 ATR and scale out at 2R/3R.",
    riskRule: "Risk 0.75% of capital per trade.",
  },
  {
    id: "pullback_trend",
    style: "swing",
    name: "Pullback in Structural Uptrend",
    timeframe: "Daily",
    setup: "Trend continuation after mean pullback.",
    entryRule: "Price > EMA200 with positive EMA slope and RSI rebound > 52.",
    exitRule: "Close below EMA20 for two sessions or 2.5R.",
    riskRule: "Gap buffer included in stop distance.",
  },
  {
    id: "contraction_breakout",
    style: "swing",
    name: "Volatility Contraction Breakout",
    timeframe: "Daily",
    setup: "NR7 contraction before expansion move.",
    entryRule: "NR7 + close above 20D range midpoint with volume pickup.",
    exitRule: "Time stop at day 10 if move is weak.",
    riskRule: "Limit to liquid NIFTY 200 names only.",
  },
];

export function getTradeMode(): "paper" | "live" {
  return process.env.TRADE_MODE === "live" ? "live" : "paper";
}

export function getUpstoxConfig() {
  return {
    apiKey: process.env.UPSTOX_API_KEY ?? "",
    apiSecret: process.env.UPSTOX_API_SECRET ?? "",
    redirectUri: process.env.UPSTOX_REDIRECT_URI ?? "",
    accessToken: process.env.UPSTOX_ACCESS_TOKEN ?? "",
    baseUrl: process.env.UPSTOX_BASE_URL ?? "https://api.upstox.com",
  };
}
