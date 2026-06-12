import { createServerFn } from "@tanstack/react-start";

import type { CivicInsight, InsightSummary } from "@/server/services/insight-generation.service";

async function loadInsightService() {
  return import("@/server/services/insight-generation.service");
}

function wrapError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`, { cause: error });
  }

  throw new Error(`Failed to ${operation}.`);
}

export const getMarketplaceInsights = createServerFn({ method: "POST" })
  .handler(async (): Promise<CivicInsight[]> => {
    try {
      const { generateMarketplaceInsights } = await loadInsightService();
      return await generateMarketplaceInsights();
    } catch (error) {
      wrapError("generate marketplace insights", error);
    }
  });

export const getInsightSummary = createServerFn({ method: "POST" })
  .handler(async (): Promise<InsightSummary> => {
    try {
      const { getInsightSummary: serviceFn } = await loadInsightService();
      return await serviceFn();
    } catch (error) {
      wrapError("fetch insight summary", error);
    }
  });
