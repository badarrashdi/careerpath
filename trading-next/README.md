# NIFTY 200 Trading Console (Next.js)

Production-oriented React/Next.js app scaffold for intraday + swing strategy operations with a risk-gated execution path and Upstox integration points.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Server-side API routes for signal generation, risk checks, and order routing

## Implemented modules

- `src/server/strategies/intraday.ts` - ORB + RVOL, VWAP pullback, mean reversion
- `src/server/strategies/swing.ts` - 20D breakout, trend pullback, contraction breakout
- `src/server/risk/engine.ts` - sizing + hard risk checks
- `src/server/execution/order-router.ts` - paper/live routing abstraction
- `src/server/upstox/client.ts` - Upstox REST adapter skeleton
- `src/app/api/*` - operational API endpoints
- `src/components/dashboard/trading-console.tsx` - control-plane UI

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
TRADE_MODE=paper # or live
UPSTOX_API_KEY=
UPSTOX_API_SECRET=
UPSTOX_REDIRECT_URI=http://localhost:3000/api/auth/upstox/callback
UPSTOX_ACCESS_TOKEN=
UPSTOX_BASE_URL=https://api.upstox.com
```

## API endpoints

- `GET /api/health` - liveness
- `GET /api/config` - capital + risk limits + mode
- `GET /api/strategies` - strategy catalog
- `POST /api/signals` - generate intraday/swing signals from snapshot input
- `POST /api/orders` - risk-check and submit paper/live order
- `GET /api/dashboard` - in-memory event/counter state
- `GET /api/backtest` - walk-forward test configuration stub

## Important notes

- `TRADE_MODE=paper` is default and safe.
- Live mode needs valid Upstox access token and broker instrument keys.
- In-memory state is reset on process restart; replace with PostgreSQL/Redis for production.
