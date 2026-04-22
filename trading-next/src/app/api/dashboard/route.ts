import { NextResponse } from "next/server";
import { getDashboardState } from "@/server/state/store";

export async function GET() {
  return NextResponse.json(getDashboardState());
}
