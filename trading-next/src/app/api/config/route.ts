import { NextResponse } from "next/server";
import { DEFAULT_CAPITAL, RISK_LIMITS, getTradeMode } from "@/lib/trading/config";

export async function GET() {
  return NextResponse.json({
    capital: DEFAULT_CAPITAL,
    tradeMode: getTradeMode(),
    riskLimits: RISK_LIMITS,
  });
}
