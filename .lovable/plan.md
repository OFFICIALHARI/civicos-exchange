
# CivicOS — Premium Resource Exchange UI

## Stack note
Your brief says Next.js App Router, but this project is **TanStack Start** (React 19 + Vite + file-based routing in `src/routes/`). I'll build the same UI/IA using TanStack Start conventions — visually and structurally identical, just with `createFileRoute` instead of `app/` directory. Everything else (TypeScript, Tailwind v4, shadcn, Lucide, Recharts) matches your spec.

## Design system (in `src/styles.css`)
- Background `oklch(0.14 0 0)` near-black, surface `oklch(0.18 0 0)` charcoal, card `oklch(0.21 0 0)`, border `oklch(0.28 0 0)`.
- Accent **neon lime** `oklch(0.92 0.20 120)` (matches reference), secondary soft green, warm yellow highlight, muted red for failed only.
- Typography: Inter for body, JetBrains Mono for numeric/ledger values (loaded via `<link>` in `__root.tsx`).
- Glass cards: `bg-card/60 backdrop-blur border border-border/60` with soft shadow.
- Dark-default; light mode deferred (token structure ready).

## Routes (`src/routes/`)
All under an `_app` pathless layout that renders `AppShell`:
- `index.tsx` → Dashboard
- `marketplace.tsx`
- `resources.tsx`
- `requests.tsx`
- `matching.tsx` (Live Matching)
- `ledger.tsx` (Transaction Ledger)
- `insights.tsx` (AI Insights)
- `analytics.tsx`
- `settings.tsx`

Each route sets its own `head()` metadata.

## Shared layout
- `AppShell`: sidebar + topbar + main + optional right context panel slot.
- `SidebarNav`: collapsible, Lucide icons, active state via `useRouterState`, mini-rail on collapse, mobile sheet.
- `TopBar`: command-style search, action buttons (`Run Matching`, `Add Resource`), notification bell, profile chip with status dot, community switcher.
- `RightContextPanel`: composable slot used on Dashboard, Matching, Insights.
- Responsive: desktop 3-column, tablet 2-column stacked, mobile single column with sticky bottom action bar.

## Components (`src/components/civicos/`)
`MetricCard`, `TrendChartCard` (Recharts area+line, neon stroke, vertical guide marker like reference), `TimeRangeTabs` (1h/8h/1d/1w/1m/6m/1y pill row), `ResourceCard`, `RequestCard`, `MatchCard`, `LedgerTable` (dense, mono numerics, sortable headers, sticky header), `InsightCard`, `ForecastCard`, `StatusBadge` (pending/matched/confirmed/failed), `FilterBar` (chips + sort + density), `EmptyState`, `LoadingSkeletons` (shimmer), `ActionButton`, `RiskScoreMeter` (horizontal gradient bar mimicking reference), `ImpactScore`, `MatchConfidenceRing`, `ActivityFeed`.

## Data layer (mock, ready for backend swap)
`src/lib/civicos/types.ts` — `Resource`, `ResourceRequest`, `Match`, `LedgerEntry`, `Insight`, `Forecast`, `Metric`, `TimeRange`.
`src/lib/civicos/hooks.ts` — React Query hooks `useResources`, `useRequests`, `useMatches`, `useLedger`, `useInsights`, `useForecasts`, `useMetrics(range)`, `useTrend(range)`. Each calls a `mockApi.*` function that returns `Promise<T>` with artificial latency and supports forced loading/empty/error states via query params (`?state=loading|empty|error`) for demo control.
`src/lib/civicos/mockApi.ts` — Returns shape-correct but obviously-synthetic data (or empty arrays). No hardcoded headline numbers in JSX; the dashboard reads `metrics.communityValue` etc. from the hook; when undefined, shows skeleton or em-dash.

## Page contents
**Dashboard**: headline `MetricCard` (Community Resource Value) + delta chip, `TimeRangeTabs`, large `TrendChartCard` (market-pulse styling: vertical tick grid behind a neon line, hovered point with callout — exactly mirroring reference), 4 small metric cards (Utilization, Active Resources, Matches Today, Est. Community Savings), bottom row of 4 KPI cards (Realized / Unrealized / Projected Growth / Net Change reframed as Utilization PL / Demand Pressure / Forecast Δ / Net Impact). Right panel: `RiskScoreMeter` reframed as **Impact Score** (low → high gradient bar), Live Match Status list, AI Recommendation card, Recent Activity feed.

**Marketplace**: filter bar (type, location, availability), responsive grid of `ResourceCard` with match score ring, empty + loading states.

**Resources**: table + grid toggle, "Add Resource" sheet (form skeleton, validates with zod, no submit wiring), availability mini-heat strip per row.

**Requests**: list with urgency chip, demand score bar, "Run Match" action per row.

**Live Matching**: split view — Supply column / Engine / Demand column. Engine center shows animated pairing lines (CSS only), `MatchCard` results below with confidence ring, why-matched explanation, ledger preview drawer.

**Ledger**: dense `LedgerTable`, sticky header, export/filter/sort controls, skeleton + empty.

**AI Insights**: grid of `InsightCard` (recommendation / pricing / utilization), `ForecastCard` with sparkline, "Ask AI" prompt bar (input only, not wired), structured output card placeholders.

**Analytics**: utilization trend, demand trend, demand zone grid heatmap (CSS grid of intensity cells), before/after impact cards, predicted next-day demand card.

**Settings**: tabbed (Profile, Community, Notifications, Theme, Permissions, API) — form fields only.

## States everywhere
Every hook-driven surface renders: skeleton on `isLoading`, `EmptyState` on empty array, error card with retry on error. No fallback fake numbers.

## Out of scope (skeleton only)
- No real backend, auth, or persistence.
- Forms don't submit.
- "Run Matching" triggers a mock optimistic flow that resolves to mock data.
- No charts library install assumed beyond Recharts (will `bun add recharts`).

## File plan
- `src/styles.css` — extend tokens + fonts.
- `src/routes/__root.tsx` — add font links, keep shell.
- `src/routes/_app.tsx` — pathless layout with `AppShell`.
- 9 route files under `src/routes/`.
- `src/components/civicos/*` — components above.
- `src/components/civicos/charts/*` — `MarketPulseChart`, `Sparkline`, `HeatmapGrid`.
- `src/lib/civicos/{types,hooks,mockApi}.ts`.

Approve and I'll build it.
