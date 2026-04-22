import type { MarketSnapshot, Signal } from "@/lib/trading/types";

function makeSignal(base: Omit<Signal, "signalId" | "generatedAt">): Signal {
  return {
    ...base,
    signalId: `${base.strategyId}_${base.symbol}_${Date.now()}`,
    generatedAt: new Date().toISOString(),
  };
}

export function evaluateSwingStrategies(snapshot: MarketSnapshot): Signal[] {
  const signals: Signal[] = [];
  const price = snapshot.close;

  if (price > snapshot.high20d && snapshot.volume > snapshot.avgVolume20 * 1.5) {
    const stopLoss = price - snapshot.atr14 * 2;
    signals.push(
      makeSignal({
        style: "swing",
        strategyId: "breakout_20d",
        symbol: snapshot.symbol,
        sector: snapshot.sector,
        side: "BUY",
        confidence: 0.72,
        entry: price,
        stopLoss,
        target: price + (price - stopLoss) * 3,
        notes: "20-day breakout with volume expansion.",
      }),
    );
  }

  if (
    price > snapshot.ema200 &&
    snapshot.ema20 > snapshot.ema50 &&
    price <= snapshot.ema20 * 1.015 &&
    snapshot.rsi14 > 52
  ) {
    const stopLoss = Math.min(snapshot.low, price - snapshot.atr14);
    signals.push(
      makeSignal({
        style: "swing",
        strategyId: "pullback_trend",
        symbol: snapshot.symbol,
        sector: snapshot.sector,
        side: "BUY",
        confidence: 0.66,
        entry: price,
        stopLoss,
        target: price + (price - stopLoss) * 2.5,
        notes: "Uptrend pullback near EMA20 with momentum recovery.",
      }),
    );
  }

  if (snapshot.isNr7 && price > snapshot.closePrev && snapshot.volume > snapshot.avgVolume20 * 1.2) {
    const stopLoss = snapshot.low20d;

    if (stopLoss > 0 && stopLoss < price) {
      signals.push(
        makeSignal({
          style: "swing",
          strategyId: "contraction_breakout",
          symbol: snapshot.symbol,
          sector: snapshot.sector,
          side: "BUY",
          confidence: 0.64,
          entry: price,
          stopLoss,
          target: price + (price - stopLoss) * 2,
          notes: "NR7 volatility contraction breakout setup.",
        }),
      );
    }
  }

  return signals;
}
