import { NextResponse } from "next/server";
import type { MarketSnapshot, TradingStyle } from "@/lib/trading/types";
import { evaluateIntradayStrategies } from "@/server/strategies/intraday";
import { evaluateSwingStrategies } from "@/server/strategies/swing";
import { recordSignals } from "@/server/state/store";

interface SignalRequest {
  style: TradingStyle;
  snapshot: MarketSnapshot;
}

function isValidSnapshot(snapshot: Partial<MarketSnapshot>): snapshot is MarketSnapshot {
  const required: (keyof MarketSnapshot)[] = [
    "symbol",
    "sector",
    "timestamp",
    "ltp",
    "open",
    "high",
    "low",
    "close",
    "dayHigh",
    "dayLow",
    "volume",
    "avgVolume20",
    "vwap",
    "ema20",
    "ema50",
    "ema200",
    "rsi14",
    "adx14",
    "atr14",
    "zscoreVwap",
    "high20d",
    "low20d",
    "closePrev",
    "isNr7",
  ];

  return required.every((field) => field in snapshot);
}

export async function POST(request: Request) {
  let body: SignalRequest;

  try {
    body = (await request.json()) as SignalRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json_payload" }, { status: 400 });
  }

  if (!body || (body.style !== "intraday" && body.style !== "swing")) {
    return NextResponse.json({ error: "invalid_style" }, { status: 400 });
  }

  if (!isValidSnapshot((body as Partial<SignalRequest>).snapshot ?? {})) {
    return NextResponse.json({ error: "invalid_snapshot" }, { status: 400 });
  }

  const signals = body.style === "intraday" ? evaluateIntradayStrategies(body.snapshot) : evaluateSwingStrategies(body.snapshot);

  recordSignals(signals);

  return NextResponse.json({
    generated: signals.length,
    signals,
  });
}
