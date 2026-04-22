import { getTradeMode } from "@/lib/trading/config";
import type { DashboardState, OrderResult, Signal } from "@/lib/trading/types";

const MAX_EVENTS = 100;

const state: DashboardState = {
  startedAt: new Date().toISOString(),
  mode: getTradeMode(),
  recentSignals: [],
  recentOrders: [],
  counters: {
    signalsGenerated: 0,
    ordersAccepted: 0,
    ordersRejected: 0,
  },
};

export function recordSignals(signals: Signal[]) {
  if (signals.length === 0) {
    return;
  }

  state.recentSignals = [...signals, ...state.recentSignals].slice(0, MAX_EVENTS);
  state.counters.signalsGenerated += signals.length;
}

export function recordOrder(order: OrderResult) {
  state.recentOrders = [order, ...state.recentOrders].slice(0, MAX_EVENTS);

  if (order.status === "ACCEPTED") {
    state.counters.ordersAccepted += 1;
  } else {
    state.counters.ordersRejected += 1;
  }
}

export function getDashboardState(): DashboardState {
  return structuredClone(state);
}
