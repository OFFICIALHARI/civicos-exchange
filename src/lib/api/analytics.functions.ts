import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type {
  AnalyticsSummary,
  DashboardMetrics,
  DemandPressure,
  MarketplaceHealth,
  ResourceBreakdown,
  ResourceUtilization,
} from "@/server/services/analytics.service";

async function loadAnalyticsService() {
  return import("@/server/services/analytics.service");
}

async function loadHistoricalMetricService() {
  return import("@/server/services/historical-metric.service");
}

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
}

export const getDashboardMetrics = createServerFn({ method: "POST" })
  .handler(async (): Promise<DashboardMetrics> => {
    try {
      const { getDashboardMetrics: serviceFn } = await loadAnalyticsService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch dashboard metrics", error);
    }
  });

export const getResourceUtilization = createServerFn({ method: "POST" })
  .handler(async (): Promise<ResourceUtilization> => {
    try {
      const { getResourceUtilization: serviceFn } = await loadAnalyticsService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch resource utilization", error);
    }
  });

export const getDemandPressure = createServerFn({ method: "POST" })
  .handler(async (): Promise<DemandPressure> => {
    try {
      const { getDemandPressure: serviceFn } = await loadAnalyticsService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch demand pressure", error);
    }
  });

export const getResourceBreakdown = createServerFn({ method: "POST" })
  .handler(async (): Promise<ResourceBreakdown> => {
    try {
      const { getResourceBreakdown: serviceFn } = await loadAnalyticsService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch resource breakdown", error);
    }
  });

export const getMarketplaceHealth = createServerFn({ method: "POST" })
  .handler(async (): Promise<MarketplaceHealth> => {
    try {
      const { getMarketplaceHealth: serviceFn } = await loadAnalyticsService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch marketplace health", error);
    }
  });

export const getAnalyticsSummary = createServerFn({ method: "POST" })
  .handler(async (): Promise<AnalyticsSummary> => {
    try {
      const { getAnalyticsSummary: serviceFn } = await loadAnalyticsService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch analytics summary", error);
    }
  });

// Historical & Trend Functions

export const recordSnapshot = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { recordMarketplaceSnapshot } = await loadHistoricalMetricService();
      return await recordMarketplaceSnapshot();
    } catch (error) {
      wrapError("record marketplace snapshot", error);
    }
  });

export const getTrendData = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    metric: z.enum([
      "utilizationPercentage",
      "demandPressure",
      "totalBookings",
      "averageMatchScore"
    ]),
    limit: z.number().optional().default(30)
  }))
  .handler(async ({ data }) => {
    try {
      const { getMetricTrend } = await loadHistoricalMetricService();
      return await getMetricTrend(data.metric, data.limit);
    } catch (error) {
      wrapError(`fetch ${data.metric} trend`, error);
    }
  });
