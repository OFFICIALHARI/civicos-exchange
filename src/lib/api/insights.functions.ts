import { createServerFn } from "@tanstack/react-start";

import type {
  CivicInsight,
  InsightCategory,
  InsightSeverity,
  InsightSummary,
} from "@/server/services/insight-generation.service";

async function loadInsightService() {
  return import("@/server/services/insight-generation.service");
}

export type CivicInsightResponse = {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation: string;
  confidenceScore: number;
  generatedAt: string;
  bullets?: string[];
};

export type InsightSummaryResponse = {
  totalInsights: number;
  criticalIssues: number;
  topRecommendation: string | null;
  generatedAt: string;
};

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, {
      cause: error,
    });
  }

  throw new Error(`Failed to ${operation}.`);
}

function serializeInsight(insight: CivicInsight): CivicInsightResponse {
  return {
    ...insight,
    generatedAt: insight.generatedAt.toISOString(),
  };
}

function serializeInsightSummary(summary: InsightSummary): InsightSummaryResponse {
  return {
    ...summary,
    generatedAt: summary.generatedAt.toISOString(),
  };
}

export const getMarketplaceInsights = createServerFn({ method: "POST" }).handler(
  async (): Promise<CivicInsightResponse[]> => {
    try {
      const { generateMarketplaceInsights } = await loadInsightService();
      const insights = await generateMarketplaceInsights();
      return insights.map(serializeInsight);
    } catch (error) {
      wrapError("generate marketplace insights", error);
    }
  },
);

export const getInsightSummary = createServerFn({ method: "POST" }).handler(
  async (): Promise<InsightSummaryResponse> => {
    try {
      const { getInsightSummary: serviceFn } = await loadInsightService();
      const summary = await serviceFn();
      return serializeInsightSummary(summary);
    } catch (error) {
      wrapError("fetch insight summary", error);
    }
  },
);
