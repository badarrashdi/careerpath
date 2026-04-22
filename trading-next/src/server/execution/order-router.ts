import { getTradeMode } from "@/lib/trading/config";
import type { OrderIntent, OrderResult } from "@/lib/trading/types";
import { UpstoxClient } from "@/server/upstox/client";

function makeOrderId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

export async function submitOrder(intent: OrderIntent): Promise<OrderResult> {
  const mode = getTradeMode();
  const now = new Date().toISOString();

  if (mode === "paper") {
    return {
      orderId: makeOrderId("paper"),
      status: "ACCEPTED",
      brokerOrderId: "paper-simulated",
      placedAt: now,
    };
  }

  const client = new UpstoxClient();

  try {
    const response = await client.placeOrder({
      quantity: intent.quantity,
      product: intent.style === "intraday" ? "I" : "D",
      validity: "DAY",
      price: intent.entry,
      tag: intent.tag,
      instrument_token: intent.symbol,
      order_type: "LIMIT",
      transaction_type: intent.side,
    });

    return {
      orderId: makeOrderId("live"),
      status: "ACCEPTED",
      brokerOrderId: response?.data?.order_id ?? "unknown",
      placedAt: now,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown_order_submission_error";
    return {
      orderId: makeOrderId("live_reject"),
      status: "REJECTED",
      reason,
      placedAt: now,
    };
  }
}
