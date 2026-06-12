export type ResourceKind = "parking" | "ev_charger" | "solar_share" | "community_room";
export type Status = "available" | "reserved" | "in_use" | "offline" | "pending" | "matched" | "confirmed" | "failed" | "unmatched";
export type Urgency = "low" | "medium" | "high" | "critical";
export type TimeRange = "1h" | "8h" | "1d" | "1w" | "1m" | "6m" | "1y";

export interface Resource {
  id: string;
  kind: ResourceKind;
  title: string;
  owner: string;
  community: string;
  location: string;
  availability: { start: string; end: string };
  pricePerHour?: number;
  status: Status;
  matchScore?: number;
  utilization?: number;
}

export interface ResourceRequest {
  id: string;
  kind: ResourceKind;
  requester: string;
  location: string;
  window: { start: string; end: string };
  maxBudget?: number;
  urgency: Urgency;
  demandScore: number;
  status: Status;
}

export interface Match {
  id: string;
  resourceId: string;
  requestId: string;
  resourceTitle: string;
  requesterName: string;
  confidence: number;
  matchedPrice?: number;
  status: Status;
  reason: string[];
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  resource: string;
  requester: string;
  matchedPrice: number;
  score: number;
  status: Status;
  timestamp: string;
}

export interface Insight {
  id: string;
  kind: "recommendation" | "pricing" | "utilization" | "forecast";
  title: string;
  summary: string;
  bullets: string[];
  confidence: number;
  delta?: number;
}

export interface ForecastPoint { t: string; value: number }
export interface Forecast { id: string; label: string; horizon: string; series: ForecastPoint[]; expected: number }

export interface Metrics {
  communityValue?: number;
  communityValueDeltaPct?: number;
  utilizationIndex?: number;
  activeResources?: number;
  matchesToday?: number;
  estCommunitySavings?: number;
  revenue?: number;
  demandPressure?: number;
  impactScore?: number;
  utilizationPL?: number;
  forecastDelta?: number;
  netImpact?: number;
}

export interface TrendPoint { t: string; value: number; volume?: number }
export interface ActivityItem { id: string; kind: "match" | "list" | "request" | "ledger" | "system"; title: string; meta: string; timestamp: string }
