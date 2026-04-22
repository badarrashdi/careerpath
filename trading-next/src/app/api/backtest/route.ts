import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    engine: "walk-forward placeholder",
    windows: {
      intraday: { trainMonths: 9, testMonths: 3, rebalance: "monthly" },
      swing: { trainMonths: 36, testMonths: 6, rebalance: "quarterly" },
    },
    metrics: ["cagr", "sharpe", "max_drawdown", "win_rate", "expectancy", "profit_factor"],
  });
}
