import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "./mockApi";
import type {
  TimeRange,
  Resource,
  ResourceRequest,
  Match,
  LedgerEntry,
  Metrics,
  Insight,
  Status,
} from "./types";

import * as resourceApi from "@/lib/api/resources.functions";
import * as requestApi from "@/lib/api/requests.functions";
import * as analyticsApi from "@/lib/api/analytics.functions";
import * as ledgerApi from "@/lib/api/ledger.functions";
import * as matchingApi from "@/lib/api/matching.functions";
import * as insightsApi from "@/lib/api/insights.functions";

// --- Mappers ---

function mapResource(r: resourceApi.ResourceResponse): Resource {
  const kindMap: Record<string, Resource["kind"]> = {
    parking: "parking",
    ev: "ev_charger",
    solar: "solar_share",
    room: "community_room",
  };

  const statusMap: Record<string, Status> = {
    listed: "available",
    booked: "in_use",
    reserved: "reserved",
  };

  return {
    id: r._id,
    kind: kindMap[r.type] || "parking",
    title: r.title,
    owner: "Owner", // Name join not implemented in basic service
    community: r.location.split("·")[0]?.trim() || "Community",
    location: r.location,
    availability: {
      start: new Date(r.availability.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      end: new Date(r.availability.end).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    },
    pricePerHour: r.price,
    status: statusMap[r.status] || "offline",
    utilization: r.status === "booked" ? 1 : r.status === "reserved" ? 0.5 : 0,
  };
}

function mapRequest(q: requestApi.RequestResponse): ResourceRequest {
  const urgencyMap = (p: number): ResourceRequest["urgency"] => {
    if (p > 8) return "critical";
    if (p > 5) return "high";
    if (p > 2) return "medium";
    return "low";
  };

  const kindMap: Record<string, Resource["kind"]> = {
    parking: "parking",
    ev: "ev_charger",
    solar: "solar_share",
    room: "community_room",
  };

  const statusMap: Record<string, Status> = {
    pending: "pending",
    matched: "matched",
    completed: "confirmed",
  };

  return {
    id: q._id,
    kind: kindMap[q.resourceType] || "parking",
    requester: "Requester",
    location: q.location,
    window: {
      start: new Date(q.timeWindow.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      end: new Date(q.timeWindow.end).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    },
    maxBudget: q.maxPrice,
    urgency: urgencyMap(q.priority),
    demandScore: q.priority / 10,
    status: statusMap[q.status] || "pending",
  };
}

function mapLedger(l: ledgerApi.LedgerEntryResponse): LedgerEntry {
  const statusMap: Record<string, Status> = {
    active: "matched",
    completed: "confirmed",
    cancelled: "failed",
  };

  return {
    id: l._id,
    resource: "Resource", // Join needed for name
    requester: "Requester",
    matchedPrice: l.matchedPrice,
    score: l.score,
    status: (statusMap[l.status] || l.status) as Status,
    timestamp: new Date(l.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function mapInsight(i: insightsApi.CivicInsightResponse): Insight {
  const kindMap: Record<string, Insight["kind"]> = {
    opportunity: "recommendation",
    risk: "utilization",
    forecast: "forecast",
    recommendation: "recommendation",
  };

  return {
    id: i.id,
    kind: kindMap[i.category] || "recommendation",
    title: i.title,
    summary: i.description,
    bullets: i.bullets || [i.recommendation],
    confidence: i.confidenceScore / 100,
  };
}

function mapMatch(m: matchingApi.MatchResponse): Match {
  return {
    id: m.id,
    resourceId: m.resourceId,
    requestId: m.requestId,
    resourceTitle: m.resourceTitle,
    requesterName: m.requesterName,
    confidence: m.confidence,
    reason: m.reason,
    matchedPrice: m.matchedPrice,
    status: (m.status === "active" ? "matched" : m.status) as Status,
    createdAt: m.timestamp,
  };
}

export const DEFAULT_USER_ID = "000000000000000000000001";

// --- Queries ---

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof resourceApi.createResource>[0]["data"]) =>
      resourceApi.createResource({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof requestApi.createRequest>[0]["data"]) =>
      requestApi.createRequest({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
};

export const useResources = () =>
  useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      try {
        const data = await resourceApi.getResources();

        const result = data.map(mapResource);

        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

export const useRequests = () =>
  useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const data = await requestApi.getRequests();
      return data.map(mapRequest);
    },
  });

export const useMatches = () =>
  useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const data = await matchingApi.getRecentMatches();
      return data.map(mapMatch);
    },
  });

export const useLedger = () =>
  useQuery({
    queryKey: ["ledger"],
    queryFn: async () => {
      const data = await ledgerApi.getLedgerHistory();
      return data.map(mapLedger);
    },
  });

export const useInsights = () =>
  useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const data = await insightsApi.getMarketplaceInsights();
      return data.map(mapInsight);
    },
  });

export const useForecasts = () => useQuery({ queryKey: ["forecasts"], queryFn: mockApi.forecasts });
export const useActivity = () => useQuery({ queryKey: ["activity"], queryFn: mockApi.activity });

export const useMetrics = () =>
  useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const data = await analyticsApi.getDashboardMetrics();

      const utilizationIndex =
        data.totalResources > 0
          ? (data.bookedResources + data.reservedResources) / data.totalResources
          : 0;

      const demandPressure =
        data.availableResources > 0 ? data.pendingRequests / data.availableResources : 0;

      return {
        communityValue: data.totalRevenue + data.totalCommunitySavings,
        communityValueDeltaPct: 2.4, // Trend not yet calculated in backend
        activeResources: data.totalResources,
        matchesToday: data.totalBookings,
        revenue: data.totalRevenue,
        demandPressure: demandPressure,
        estCommunitySavings: data.totalCommunitySavings,
        impactScore: data.averageMatchScore,
        utilizationIndex: utilizationIndex,
        utilizationPL: data.totalRevenue * 0.12, // Operating margin estimate
        forecastDelta: (data.totalRevenue - 12000) / 12000, // Placeholder comparison
        netImpact: data.totalCommunitySavings + data.totalRevenue * 0.05,
      } as Metrics;
    },
  });

export const useTrend = (range: TimeRange) =>
  useQuery({
    queryKey: ["trend", range],
    queryFn: async () => {
      // For now, we'll map the UI TimeRange to a simple limit of snapshots
      const limitMap: Record<TimeRange, number> = {
        "1h": 10,
        "8h": 20,
        "1d": 30,
        "1w": 50,
        "1m": 100,
        "6m": 200,
        "1y": 500,
      };

      const data = await analyticsApi.getTrendData({
        data: {
          metric: "utilizationPercentage",
          limit: limitMap[range],
        },
      });

      if (!data || data.length === 0) {
        return mockApi.trend(range); // Fallback to mock if no historical data yet
      }

      return data.map((p: { t: string; value: number }) => ({
        t: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        value: p.value * 100, // Normalize for chart
        volume: 0, // Volume not yet tracked in snapshots
      }));
    },
  });

// --- Mutations ---

export const useExecuteMatching = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => matchingApi.executeMatchingCycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
};
