import type { MarketSnapshot, Signal } from "@/lib/trading/types";

const IST_OPEN_MINUTE = 9 * 60 + 20;
const IST_LAST_ENTRY_MINUTE = 15 * 60 + 10;

function toIstMinute(timestamp: string): number {
  const date = new Date(timestamp);
  return date.getUTCHours() * 60 + date.getUTCMinutes() + 330;
}

function makeSignal(base: Omit<Signal, "signalId" | "generatedAt">): Signal {
  return {
    ...base,
    signalId: `${base.strategyId}_${base.symbol}_${Date.now()}`,
    generatedAt: new Date().toISOString(),
  };
}

export function evaluateIntradayStrategies(snapshot: MarketSnapshot): Signal[] {
  const minute = toIstMinute(snapshot.timestamp);
  if (minute < IST_OPEN_MINUTE || minute > IST_LAST_ENTRY_MINUTE) {
    return [];
  }

  const signals: Signal[] = [];
  const price = snapshot.ltp;

  if (
    price > snapshot.dayHigh * 0.999 &&
    snapshot.volume > snapshot.avgVolume20 * 1.8 &&
    snapshot.adx14 > 18
  ) {
    const stopDistance = Math.max(snapshot.atr14 * 0.6, price * 0.008);
    const stopLoss = price - stopDistance;

    if (stopLoss > 0 && stopLoss < price) {
      signals.push(
        makeSignal({
          style: "intraday",
          strategyId: "orb_rvol",
          symbol: snapshot.symbol,
          sector: snapshot.sector,
          side: "BUY",
          confidence: 0.74,
          entry: price,
          stopLoss,
          target: price + (price - stopLoss) * 1.5,
          notes: "ORB breakout with RVOL and ADX confirmation.",
        }),
      );
    }
  }

  if (
    snapshot.ema20 > snapshot.ema50 &&
    Math.abs(price - snapshot.vwap) <= snapshot.atr14 * 0.15 &&
    snapshot.rsi14 > 52
  ) {
    const stopLoss = Math.min(snapshot.low, price - snapshot.atr14 * 0.5);

    if (stopLoss > 0 && stopLoss < price) {
      signals.push(
        makeSignal({
          style: "intraday",
          strategyId: "vwap_pullback",
          symbol: snapshot.symbol,
          sector: snapshot.sector,
          side: "BUY",
          confidence: 0.68,
          entry: price,
          stopLoss,
          target: price + (price - stopLoss) * 2,
          notes: "Trend pullback to VWAP with momentum recovery.",
        }),
      );
    }
  }

  if (snapshot.zscoreVwap < -2.2 && snapshot.adx14 < 20 && price > snapshot.dayLow * 1.001) {
    const stopLoss = snapshot.dayLow * 0.999;

    if (stopLoss > 0 && stopLoss < price) {
      signals.push(
        makeSignal({
          style: "intraday",
          strategyId: "mr_vwap",
          symbol: snapshot.symbol,
          sector: snapshot.sector,
          side: "BUY",
          confidence: 0.61,
          entry: price,
          stopLoss,
          target: snapshot.vwap,
          notes: "Mean reversion from VWAP negative z-score stretch.",
        }),
      );
    }
  }

  return signals;
}
