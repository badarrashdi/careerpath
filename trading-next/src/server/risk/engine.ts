import { RISK_LIMITS } from "@/lib/trading/config";
import type { OrderIntent, PortfolioState, RiskCheckResult, RiskLimits, Signal } from "@/lib/trading/types";

const SLIPPAGE_BUFFER_BPS = 8;

function basisPoints(value: number, bps: number): number {
  return value * (bps / 10_000);
}

export function buildOrderIntent(signal: Signal, portfolio: PortfolioState, limits: RiskLimits = RISK_LIMITS): OrderIntent {
  const riskPct = signal.style === "intraday" ? limits.intradayRiskPerTradePct : limits.swingRiskPerTradePct;
  const riskAmount = portfolio.capital * (riskPct / 100);

  const rawPerShareRisk = Math.abs(signal.entry - signal.stopLoss);
  const perShareRisk = rawPerShareRisk + basisPoints(signal.entry, SLIPPAGE_BUFFER_BPS);
  const quantity = Math.max(1, Math.floor(riskAmount / perShareRisk));

  return {
    style: signal.style,
    strategyId: signal.strategyId,
    symbol: signal.symbol,
    sector: signal.sector,
    side: signal.side,
    entry: signal.entry,
    stopLoss: signal.stopLoss,
    target: signal.target,
    quantity,
    notional: quantity * signal.entry,
    riskAmount,
    tag: `${signal.style}_${signal.strategyId}`,
  };
}

export function runRiskChecks(intent: OrderIntent, portfolio: PortfolioState, limits: RiskLimits = RISK_LIMITS): RiskCheckResult {
  const reasons: string[] = [];

  if (portfolio.dailyPnl <= -portfolio.capital * (limits.maxDailyLossPct / 100)) {
    reasons.push("daily_loss_cap_breached");
  }

  if (portfolio.globalPnl <= -portfolio.capital * (limits.maxGlobalLossPct / 100)) {
    reasons.push("global_loss_cap_breached");
  }

  if (portfolio.openRisk + intent.riskAmount > portfolio.capital * (limits.maxOpenRiskPct / 100)) {
    reasons.push("max_open_risk_exceeded");
  }

  if (intent.notional > portfolio.capital * ((intent.style === "intraday" ? limits.maxIntradayNotionalPct : limits.maxSwingNotionalPct) / 100)) {
    reasons.push("position_notional_limit_exceeded");
  }

  const currentSector = portfolio.sectorExposure[intent.sector] ?? 0;
  if (currentSector + intent.notional > portfolio.capital * (limits.maxSectorExposurePct / 100)) {
    reasons.push("sector_exposure_limit_exceeded");
  }

  if (intent.notional > portfolio.availableCash) {
    reasons.push("insufficient_available_cash");
  }

  if (intent.style === "intraday") {
    if (portfolio.intradayPositions >= limits.maxIntradayPositions) {
      reasons.push("max_intraday_positions_reached");
    }
    if (portfolio.consecutiveLossesIntraday >= limits.maxConsecutiveLosses) {
      reasons.push("intraday_killswitch_consecutive_losses");
    }
  } else if (portfolio.swingPositions >= limits.maxSwingPositions) {
    reasons.push("max_swing_positions_reached");
  }

  return {
    accepted: reasons.length === 0,
    reasons,
  };
}
