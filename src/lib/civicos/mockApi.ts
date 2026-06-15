import type {
  ActivityItem,
  Forecast,
  Insight,
  LedgerEntry,
  Match,
  Metrics,
  Resource,
  ResourceRequest,
  TimeRange,
  TrendPoint,
} from "./types";

const delay = (ms = 380) => new Promise<void>((r) => setTimeout(r, ms));

// Demo state switch via URL: ?state=loading|empty|error
function demoState(): "ok" | "loading" | "empty" | "error" {
  if (typeof window === "undefined") return "ok";
  const v = new URLSearchParams(window.location.search).get("state");
  if (v === "loading" || v === "empty" || v === "error") return v;
  return "ok";
}

async function gate<T>(value: T, opts?: { emptyValue?: T }): Promise<T> {
  const s = demoState();
  if (s === "loading") {
    await new Promise(() => {});
    return value;
  }
  if (s === "error") {
    await delay(120);
    throw new Error("Upstream unavailable");
  }
  await delay();
  if (s === "empty" && opts?.emptyValue !== undefined) return opts.emptyValue;
  return value;
}

// Synthetic data shapes (intentionally not pretending to be real numbers)
const RESOURCES: Resource[] = [
  {
    id: "r-001",
    kind: "parking",
    title: "Bay 14 · Riverside Lot",
    owner: "M. Okafor",
    community: "Riverside",
    location: "Riverside · Lot B",
    availability: { start: "08:00", end: "20:00" },
    pricePerHour: 250,
    status: "available",
    matchScore: 0.86,
    utilization: 0.62,
  },
  {
    id: "r-002",
    kind: "ev_charger",
    title: "Charger #03 · 22kW",
    owner: "Northwind Co-op",
    community: "Northwind",
    location: "Northwind Hub",
    availability: { start: "06:00", end: "23:00" },
    pricePerHour: 450,
    status: "in_use",
    matchScore: 0.91,
    utilization: 0.78,
  },
  {
    id: "r-003",
    kind: "solar_share",
    title: "Solar Block A · 4kW",
    owner: "Sunfield HOA",
    community: "Sunfield",
    location: "Sunfield Grid",
    availability: { start: "00:00", end: "24:00" },
    pricePerHour: 120,
    status: "available",
    matchScore: 0.74,
    utilization: 0.41,
  },
  {
    id: "r-004",
    kind: "community_room",
    title: "Maker Room · 12 seats",
    owner: "East District",
    community: "East",
    location: "East Center · Fl 2",
    availability: { start: "09:00", end: "21:00" },
    pricePerHour: 1200,
    status: "reserved",
    matchScore: 0.67,
    utilization: 0.55,
  },
  {
    id: "r-005",
    kind: "parking",
    title: "Bay 02 · Civic Plaza",
    owner: "City Pool",
    community: "Civic",
    location: "Civic Plaza",
    availability: { start: "07:00", end: "19:00" },
    pricePerHour: 300,
    status: "available",
    matchScore: 0.81,
    utilization: 0.48,
  },
  {
    id: "r-006",
    kind: "ev_charger",
    title: "Charger #11 · 7kW",
    owner: "Greenfield",
    community: "Greenfield",
    location: "Greenfield North",
    availability: { start: "00:00", end: "24:00" },
    pricePerHour: 280,
    status: "offline",
    matchScore: 0.32,
    utilization: 0.12,
  },
];

const REQUESTS: ResourceRequest[] = [
  {
    id: "q-101",
    kind: "parking",
    requester: "A. Patel",
    location: "Riverside",
    window: { start: "09:30", end: "12:00" },
    maxBudget: 800,
    urgency: "high",
    demandScore: 0.88,
    status: "pending",
  },
  {
    id: "q-102",
    kind: "ev_charger",
    requester: "Fleet 03",
    location: "Northwind",
    window: { start: "10:00", end: "11:30" },
    maxBudget: 1400,
    urgency: "critical",
    demandScore: 0.95,
    status: "pending",
  },
  {
    id: "q-103",
    kind: "community_room",
    requester: "Workshop Group",
    location: "East",
    window: { start: "14:00", end: "17:00" },
    maxBudget: 3500,
    urgency: "medium",
    demandScore: 0.61,
    status: "matched",
  },
  {
    id: "q-104",
    kind: "solar_share",
    requester: "Building 7",
    location: "Sunfield",
    window: { start: "00:00", end: "24:00" },
    maxBudget: 2200,
    urgency: "low",
    demandScore: 0.44,
    status: "pending",
  },
];

const MATCHES: Match[] = [
  {
    id: "m-9001",
    resourceId: "r-002",
    requestId: "q-102",
    resourceTitle: "Charger #03 · 22kW",
    requesterName: "Fleet 03",
    confidence: 0.94,
    matchedPrice: 1260,
    status: "matched",
    reason: ["High demand urgency", "Location radius 0.4km", "Price within budget"],
    createdAt: "—",
  },
  {
    id: "m-9002",
    resourceId: "r-001",
    requestId: "q-101",
    resourceTitle: "Bay 14 · Riverside Lot",
    requesterName: "A. Patel",
    confidence: 0.82,
    matchedPrice: 600,
    status: "pending",
    reason: ["Availability overlap 2.5h", "Score above threshold"],
    createdAt: "—",
  },
  {
    id: "m-9003",
    resourceId: "r-004",
    requestId: "q-103",
    resourceTitle: "Maker Room · 12 seats",
    requesterName: "Workshop Group",
    confidence: 0.71,
    matchedPrice: 2400,
    status: "confirmed",
    reason: ["Window fit", "Capacity satisfied"],
    createdAt: "—",
  },
];

const LEDGER: LedgerEntry[] = Array.from({ length: 14 }, (_, i) => ({
  id: `L-${(7820 + i).toString()}`,
  resource: ["Bay 14", "Charger #03", "Maker Room", "Solar Block A", "Bay 02"][i % 5],
  requester: ["A. Patel", "Fleet 03", "Workshop", "Building 7", "C. Reyes"][i % 5],
  matchedPrice: Number((140 + (i % 7) * 185).toFixed(2)),
  score: Number((0.55 + (i % 9) * 0.04).toFixed(2)),
  status: (
    ["confirmed", "confirmed", "pending", "confirmed", "failed", "confirmed", "matched"] as const
  )[i % 7],
  timestamp: `T-${i + 1}m`,
}));

const INSIGHTS: Insight[] = [
  {
    id: "i-1",
    kind: "recommendation",
    title: "Shift EV pricing +6% during 17:00–19:00",
    summary: "Demand pressure consistently exceeds supply in evening peak across Northwind.",
    bullets: [
      "3 chargers over 90% utilization",
      "Avg wait 11 min",
      "Projected revenue lift modeled",
    ],
    confidence: 0.87,
    delta: 0.06,
  },
  {
    id: "i-2",
    kind: "utilization",
    title: "Re-allocate Solar Block C to Building 4",
    summary: "Block C underused while Building 4 shows persistent unmet draw.",
    bullets: [
      "Block C util tracking low",
      "Building 4 unmet draw rising",
      "Reroute path validated",
    ],
    confidence: 0.79,
  },
  {
    id: "i-3",
    kind: "pricing",
    title: "Maker Room weekday floor raise",
    summary: "Bookings clear instantly at current floor; price elasticity headroom detected.",
    bullets: ["Instant-clear ratio high", "No cancellation spike risk", "Apply gradual step"],
    confidence: 0.73,
  },
  {
    id: "i-4",
    kind: "forecast",
    title: "Tomorrow demand: parking peaks at 11:00",
    summary: "Forecast indicates pre-noon parking demand surge in Civic Plaza.",
    bullets: ["Match capacity in advance", "Pre-stage matching pool", "Notify owners"],
    confidence: 0.81,
  },
];

const FORECASTS: Forecast[] = [
  {
    id: "f-1",
    label: "Parking demand",
    horizon: "Next 24h",
    expected: 0,
    series: Array.from({ length: 24 }, (_, i) => ({
      t: `${i}:00`,
      value: 0.3 + 0.5 * Math.sin(i / 3) + i / 60,
    })),
  },
  {
    id: "f-2",
    label: "EV charger load",
    horizon: "Next 24h",
    expected: 0,
    series: Array.from({ length: 24 }, (_, i) => ({
      t: `${i}:00`,
      value: 0.4 + 0.4 * Math.cos(i / 4) + i / 80,
    })),
  },
];

const ACTIVITY: ActivityItem[] = [
  {
    id: "a-1",
    kind: "match",
    title: "Match m-9001 confirmed",
    meta: "Charger #03 → Fleet 03",
    timestamp: "just now",
  },
  { id: "a-2", kind: "list", title: "New listing", meta: "Solar Block A · 4kW", timestamp: "2m" },
  {
    id: "a-3",
    kind: "request",
    title: "High urgency request",
    meta: "Riverside · 09:30",
    timestamp: "5m",
  },
  { id: "a-4", kind: "ledger", title: "Ledger entry L-7833", meta: "+₹1260", timestamp: "7m" },
  {
    id: "a-5",
    kind: "system",
    title: "Matching cycle complete",
    meta: "12 pairs evaluated",
    timestamp: "12m",
  },
];

const METRICS: Metrics = {
  communityValue: 4181214,
  communityValueDeltaPct: 4.6,
  utilizationIndex: 0.68,
  activeResources: 142,
  matchesToday: 38,
  estCommunitySavings: 742050,
  revenue: 1294000,
  demandPressure: 0.72,
  impactScore: 0.74,
  utilizationPL: 142900,
  forecastDelta: -52110,
  netImpact: 49568,
};

function trendPoints(range: TimeRange): TrendPoint[] {
  const n = { "1h": 30, "8h": 32, "1d": 48, "1w": 56, "1m": 60, "6m": 60, "1y": 60 }[range];
  return Array.from({ length: n }, (_, i) => {
    const base = 20 + i * 0.6 + Math.sin(i / 4) * 4 + Math.cos(i / 7) * 3;
    return {
      t: `${i}`,
      value: Number(base.toFixed(2)),
      volume: Math.round(30 + Math.random() * 70),
    };
  });
}

export const mockApi = {
  resources: () => gate(RESOURCES, { emptyValue: [] }),
  requests: () => gate(REQUESTS, { emptyValue: [] }),
  matches: () => gate(MATCHES, { emptyValue: [] }),
  ledger: () => gate(LEDGER, { emptyValue: [] }),
  insights: () => gate(INSIGHTS, { emptyValue: [] }),
  forecasts: () => gate(FORECASTS, { emptyValue: [] }),
  activity: () => gate(ACTIVITY, { emptyValue: [] }),
  metrics: () => gate(METRICS, { emptyValue: {} as Metrics }),
  trend: (range: TimeRange) => gate(trendPoints(range), { emptyValue: [] }),
};
