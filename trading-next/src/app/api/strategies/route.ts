import { NextResponse } from "next/server";
import { STRATEGY_CATALOG } from "@/lib/trading/config";

export async function GET() {
  return NextResponse.json({
    strategies: STRATEGY_CATALOG,
  });
}
