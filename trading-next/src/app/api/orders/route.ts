import { NextResponse } from "next/server";
import type { PortfolioState, Signal } from "@/lib/trading/types";
import { DEFAULT_CAPITAL } from "@/lib/trading/config";
import { submitOrder } from "@/server/execution/order-router";
import { buildOrderIntent, runRiskChecks } from "@/server/risk/engine";
import { recordOrder } from "@/server/state/store";

interface OrderRequest {
  signal: Signal;
  portfolio?: PortfolioState;
}

const defaultPortfolio: PortfolioState = {
  capital: DEFAULT_CAPITAL,
  availableCash: DEFAULT_CAPITAL,
  dailyPnl: 0,
  globalPnl: 0,
  openRisk: 0,
  intradayPositions: 0,
  swingPositions: 0,
  sectorExposure: {},
  consecutiveLossesIntraday: 0,
};

function isSignal(signal: Partial<Signal>): signal is Signal {
  const required: (keyof Signal)[] = [
    "signalId",
    "style",
    "strategyId",
    "symbol",
    "sector",
    "side",
    "confidence",
    "entry",
    "stopLoss",
    "target",
    "generatedAt",
    "notes",
  ];

  return required.every((field) => field in signal);
}

export async function POST(request: Request) {
  let body: OrderRequest;

  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json_payload" }, { status: 400 });
  }

  if (!body || !isSignal((body as Partial<OrderRequest>).signal ?? {})) {
    return NextResponse.json({ error: "invalid_signal" }, { status: 400 });
  }

  const portfolio = body.portfolio ?? defaultPortfolio;
  const intent = buildOrderIntent(body.signal, portfolio);
  const risk = runRiskChecks(intent, portfolio);

  if (!risk.accepted) {
    const rejection = {
      orderId: `rejected_${Date.now()}`,
      status: "REJECTED" as const,
      reason: risk.reasons.join(","),
      placedAt: new Date().toISOString(),
    };

    recordOrder(rejection);

    return NextResponse.json(
      {
        accepted: false,
        risk,
        intent,
        order: rejection,
      },
      { status: 422 },
    );
  }

  const order = await submitOrder(intent);
  recordOrder(order);

  return NextResponse.json({
    accepted: order.status === "ACCEPTED",
    risk,
    intent,
    order,
  });
}
