"use client";

import { useMemo, useState } from "react";
import type {
  DashboardState,
  MarketSnapshot,
  PortfolioState,
  RiskLimits,
  Signal,
  StrategyCatalogItem,
  TradingStyle,
} from "@/lib/trading/types";

export interface ConfigResponse {
  capital: number;
  tradeMode: "paper" | "live";
  riskLimits: RiskLimits;
}

interface TradingConsoleProps {
  initialConfig: ConfigResponse;
  initialStrategies: StrategyCatalogItem[];
  initialDashboard: DashboardState;
}

const DEFAULT_SNAPSHOT: MarketSnapshot = {
  symbol: "NSE_EQ|INE009A01021",
  sector: "BANKS",
  timestamp: new Date().toISOString(),
  ltp: 2510,
  open: 2482,
  high: 2525,
  low: 2470,
  close: 2510,
  dayHigh: 2525,
  dayLow: 2470,
  volume: 2_200_000,
  avgVolume20: 1_050_000,
  vwap: 2498,
  ema20: 2500,
  ema50: 2475,
  ema200: 2320,
  rsi14: 57,
  adx14: 24,
  atr14: 22,
  zscoreVwap: -1.1,
  high20d: 2502,
  low20d: 2325,
  closePrev: 2488,
  isNr7: false,
};

const DEFAULT_PORTFOLIO: PortfolioState = {
  capital: 5_000_000,
  availableCash: 5_000_000,
  dailyPnl: 0,
  globalPnl: 0,
  openRisk: 0,
  intradayPositions: 0,
  swingPositions: 0,
  sectorExposure: {},
  consecutiveLossesIntraday: 0,
};

export function TradingConsole({ initialConfig, initialStrategies, initialDashboard }: TradingConsoleProps) {
  const [style, setStyle] = useState<TradingStyle>("intraday");
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(DEFAULT_SNAPSHOT);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [strategies] = useState<StrategyCatalogItem[]>(initialStrategies);
  const [dashboard, setDashboard] = useState<DashboardState | null>(initialDashboard);
  const [config] = useState<ConfigResponse | null>(initialConfig);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>(`System booted in ${initialConfig.tradeMode.toUpperCase()} mode.`);

  const strategiesForStyle = useMemo(
    () => strategies.filter((item) => item.style === style),
    [strategies, style],
  );

  async function generateSignals() {
    setBusy(true);
    setMessage("Generating signals...");

    const res = await fetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style, snapshot: { ...snapshot, timestamp: new Date().toISOString() } }),
    });

    const payload = (await res.json()) as { generated: number; signals: Signal[]; error?: string };

    if (!res.ok) {
      setMessage(payload.error ?? "Signal generation failed.");
      setBusy(false);
      return;
    }

    setSignals(payload.signals);
    setMessage(`Generated ${payload.generated} signal(s).`);
    await refreshDashboard();
    setBusy(false);
  }

  async function placeOrder(signal: Signal) {
    setBusy(true);
    setMessage(`Placing order for ${signal.symbol}...`);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signal, portfolio: { ...DEFAULT_PORTFOLIO, capital: config?.capital ?? DEFAULT_PORTFOLIO.capital } }),
    });

    const payload = (await res.json()) as { accepted?: boolean; error?: string; order?: { status: string; reason?: string } };

    if (!res.ok) {
      setMessage(payload.order?.reason ?? payload.error ?? "Order rejected by risk engine.");
      await refreshDashboard();
      setBusy(false);
      return;
    }

    setMessage(payload.accepted ? "Order accepted." : `Order rejected: ${payload.order?.reason ?? "unknown"}`);
    await refreshDashboard();
    setBusy(false);
  }

  async function refreshDashboard() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    const payload = (await response.json()) as DashboardState;
    setDashboard(payload);
  }

  function updateSnapshotField<K extends keyof MarketSnapshot>(field: K, value: MarketSnapshot[K]) {
    setSnapshot((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-8">
      <section className="rounded-2xl border border-slate-700/40 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Upstox Trading Control Plane</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">React + Next Automated Trading App</h1>
            <p className="mt-1 text-sm text-slate-300">Separate intraday and swing workflows with centralized risk gating.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
            <p>
              Mode: <span className="font-semibold text-emerald-300">{config?.tradeMode.toUpperCase() ?? "LOADING"}</span>
            </p>
            <p>
              Capital: <span className="font-semibold text-slate-100">₹{(config?.capital ?? 0).toLocaleString("en-IN")}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm ${style === "intraday" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}
              onClick={() => setStyle("intraday")}
            >
              Intraday Engine
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm ${style === "swing" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}
              onClick={() => setStyle("swing")}
            >
              Swing Engine
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Input label="Symbol Token" value={snapshot.symbol} onChange={(v) => updateSnapshotField("symbol", v)} />
            <Input label="Sector" value={snapshot.sector} onChange={(v) => updateSnapshotField("sector", v)} />
            <NumberInput label="LTP" value={snapshot.ltp} onChange={(v) => updateSnapshotField("ltp", v)} />
            <NumberInput label="VWAP" value={snapshot.vwap} onChange={(v) => updateSnapshotField("vwap", v)} />
            <NumberInput label="EMA20" value={snapshot.ema20} onChange={(v) => updateSnapshotField("ema20", v)} />
            <NumberInput label="EMA50" value={snapshot.ema50} onChange={(v) => updateSnapshotField("ema50", v)} />
            <NumberInput label="EMA200" value={snapshot.ema200} onChange={(v) => updateSnapshotField("ema200", v)} />
            <NumberInput label="RSI14" value={snapshot.rsi14} onChange={(v) => updateSnapshotField("rsi14", v)} />
            <NumberInput label="ADX14" value={snapshot.adx14} onChange={(v) => updateSnapshotField("adx14", v)} />
            <NumberInput label="ATR14" value={snapshot.atr14} onChange={(v) => updateSnapshotField("atr14", v)} />
            <NumberInput label="20D High" value={snapshot.high20d} onChange={(v) => updateSnapshotField("high20d", v)} />
            <NumberInput label="20D Low" value={snapshot.low20d} onChange={(v) => updateSnapshotField("low20d", v)} />
            <NumberInput label="Day High" value={snapshot.dayHigh} onChange={(v) => updateSnapshotField("dayHigh", v)} />
            <NumberInput label="Day Low" value={snapshot.dayLow} onChange={(v) => updateSnapshotField("dayLow", v)} />
            <NumberInput label="Volume" value={snapshot.volume} onChange={(v) => updateSnapshotField("volume", v)} />
            <NumberInput label="Avg Vol 20" value={snapshot.avgVolume20} onChange={(v) => updateSnapshotField("avgVolume20", v)} />
            <NumberInput label="Z-score VWAP" value={snapshot.zscoreVwap} onChange={(v) => updateSnapshotField("zscoreVwap", v)} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={snapshot.isNr7}
                onChange={(event) => updateSnapshotField("isNr7", event.target.checked)}
              />
              NR7 Day
            </label>
            <button
              type="button"
              className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-white disabled:opacity-50"
              disabled={busy}
              onClick={generateSignals}
            >
              Generate Signals
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-600 px-5 py-2 text-sm text-slate-200 hover:border-slate-400"
              onClick={() => void refreshDashboard()}
            >
              Refresh Dashboard
            </button>
          </div>
          <p className="mt-3 text-sm text-cyan-300">{message}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Active Strategy Set ({style})</h2>
          <div className="mt-4 space-y-3">
            {strategiesForStyle.map((strategy) => (
              <article key={strategy.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                <p className="text-sm font-semibold text-slate-100">{strategy.name}</p>
                <p className="mt-1 text-xs text-slate-400">{strategy.setup}</p>
                <p className="mt-2 text-xs text-cyan-300">Entry: {strategy.entryRule}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard title="Signals" value={dashboard?.counters.signalsGenerated ?? 0} />
            <StatCard title="Accepted" value={dashboard?.counters.ordersAccepted ?? 0} />
            <StatCard title="Rejected" value={dashboard?.counters.ordersRejected ?? 0} />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Generated Signals</h2>
          <div className="mt-3 space-y-2">
            {signals.length === 0 ? (
              <p className="text-sm text-slate-400">No signals in current run.</p>
            ) : (
              signals.map((signal) => (
                <div key={signal.signalId} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{signal.strategyId}</p>
                      <p className="text-xs text-slate-400">{signal.symbol}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-300"
                      onClick={() => void placeOrder(signal)}
                    >
                      Place Order
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">
                    Entry {signal.entry.toFixed(2)} | SL {signal.stopLoss.toFixed(2)} | Target {signal.target.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Order Events</h2>
          <div className="mt-3 space-y-2">
            {(dashboard?.recentOrders ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No order activity yet.</p>
            ) : (
              dashboard?.recentOrders.slice(0, 10).map((order) => (
                <div key={order.orderId} className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs">
                  <p className="font-semibold text-slate-100">{order.status}</p>
                  <p className="text-slate-300">{order.orderId}</p>
                  <p className="text-slate-500">{order.placedAt}</p>
                  {order.reason ? <p className="text-rose-300">{order.reason}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs text-slate-300">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="text-xs text-slate-300">
      {label}
      <input
        type="number"
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
