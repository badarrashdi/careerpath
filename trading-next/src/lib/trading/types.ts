export type TradingStyle = "intraday" | "swing";
export type TradeSide = "BUY" | "SELL";

export type IntradayStrategyId = "orb_rvol" | "vwap_pullback" | "mr_vwap";
export type SwingStrategyId = "breakout_20d" | "pullback_trend" | "contraction_breakout";
export type StrategyId = IntradayStrategyId | SwingStrategyId;

export interface MarketSnapshot {
  symbol: string;
  sector: string;
  timestamp: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume20: number;
  vwap: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  adx14: number;
  atr14: number;
  zscoreVwap: number;
  high20d: number;
  low20d: number;
  closePrev: number;
  isNr7: boolean;
}

export interface Signal {
  signalId: string;
  style: TradingStyle;
  strategyId: StrategyId;
  symbol: string;
  sector: string;
  side: TradeSide;
  confidence: number;
  entry: number;
  stopLoss: number;
  target: number;
  generatedAt: string;
  notes: string;
}

export interface RiskLimits {
  intradayRiskPerTradePct: number;
  swingRiskPerTradePct: number;
  maxOpenRiskPct: number;
  maxDailyLossPct: number;
  maxGlobalLossPct: number;
  maxIntradayNotionalPct: number;
  maxSwingNotionalPct: number;
  maxSectorExposurePct: number;
  maxIntradayPositions: number;
  maxSwingPositions: number;
  maxConsecutiveLosses: number;
}

export interface PortfolioState {
  capital: number;
  availableCash: number;
  dailyPnl: number;
  globalPnl: number;
  openRisk: number;
  intradayPositions: number;
  swingPositions: number;
  sectorExposure: Record<string, number>;
  consecutiveLossesIntraday: number;
}

export interface OrderIntent {
  style: TradingStyle;
  strategyId: StrategyId;
  symbol: string;
  sector: string;
  side: TradeSide;
  entry: number;
  stopLoss: number;
  target: number;
  quantity: number;
  notional: number;
  riskAmount: number;
  tag: string;
}

export interface RiskCheckResult {
  accepted: boolean;
  reasons: string[];
}

export interface OrderResult {
  orderId: string;
  status: "ACCEPTED" | "REJECTED";
  brokerOrderId?: string;
  reason?: string;
  placedAt: string;
}

export interface StrategyCatalogItem {
  id: StrategyId;
  style: TradingStyle;
  name: string;
  timeframe: string;
  setup: string;
  entryRule: string;
  exitRule: string;
  riskRule: string;
}

export interface DashboardState {
  startedAt: string;
  mode: "paper" | "live";
  recentSignals: Signal[];
  recentOrders: OrderResult[];
  counters: {
    signalsGenerated: number;
    ordersAccepted: number;
    ordersRejected: number;
  };
}
