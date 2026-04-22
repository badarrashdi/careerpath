import { DEFAULT_CAPITAL, RISK_LIMITS, STRATEGY_CATALOG, getTradeMode } from "@/lib/trading/config";
import { TradingConsole } from "@/components/dashboard/trading-console";
import { getDashboardState } from "@/server/state/store";

export default function Home() {
  return (
    <TradingConsole
      initialConfig={{
        capital: DEFAULT_CAPITAL,
        tradeMode: getTradeMode(),
        riskLimits: RISK_LIMITS,
      }}
      initialStrategies={STRATEGY_CATALOG}
      initialDashboard={getDashboardState()}
    />
  );
}
