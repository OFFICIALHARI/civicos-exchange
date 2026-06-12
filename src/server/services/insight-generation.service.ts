import type { AnalyticsSummary } from "@/server/services/analytics.service";
import type { HistoricalMetricDocument } from "@/server/models/historical-metric";
import * as analyticsService from "@/server/services/analytics.service";
import * as historicalMetricService from "@/server/services/historical-metric.service";

export type InsightCategory = "opportunity" | "risk" | "forecast" | "recommendation";
export type InsightSeverity = "low" | "medium" | "high" | "critical";

export interface CivicInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation: string;
  confidenceScore: number;
  generatedAt: Date;
  bullets?: string[];
}

export interface InsightSummary {
  totalInsights: number;
  criticalIssues: number;
  topRecommendation: string | null;
  generatedAt: Date;
}

function calculateConfidence(history: HistoricalMetricDocument[]): number {
  if (history.length === 0) return 40; // Base confidence
  if (history.length < 5) return 60; // Low sample size
  return 85; // High sample size
}

export async function generateOpportunityInsights(summary: AnalyticsSummary): Promise<CivicInsight[]> {
  const insights: CivicInsight[] = [];
  const { demandPressure, resourceBreakdown } = summary;

  if (demandPressure.demandPressure > 1.5) {
    insights.push({
      id: `opp-high-demand-${Date.now()}`,
      category: "opportunity",
      severity: "high",
      title: "High Demand Pressure Detected",
      description: `Current demand pressure is ${demandPressure.demandPressure.toFixed(2)}x supply.`,
      recommendation: "Encourage community members to list more underutilized resources.",
      confidenceScore: 90,
      generatedAt: new Date(),
      bullets: ["Demand exceeds supply significantly", "Marketplace expansion potential identified"],
    });
  }

  // Breakdown specific opportunities
  if (resourceBreakdown.ev < 2) {
    insights.push({
      id: `opp-ev-shortage-${Date.now()}`,
      category: "opportunity",
      severity: "medium",
      title: "EV Charger Shortage",
      description: "EV charger listings are currently below optimal levels for this community.",
      recommendation: "Target local EV owners for resource onboarding.",
      confidenceScore: 75,
      generatedAt: new Date(),
    });
  }

  return insights;
}

export async function generateRiskInsights(summary: AnalyticsSummary): Promise<CivicInsight[]> {
  const insights: CivicInsight[] = [];
  const { marketplaceHealth } = summary;

  if (marketplaceHealth.status === "critical") {
    insights.push({
      id: `risk-market-critical-${Date.now()}`,
      category: "risk",
      severity: "critical",
      title: "Marketplace Saturation Risk",
      description: "Multiple health indicators have reached critical thresholds simultaneously.",
      recommendation: "Immediate intervention required to balance supply and demand.",
      confidenceScore: 95,
      generatedAt: new Date(),
      bullets: ["High utilization (>85%)", "Extreme demand pressure", "Match quality monitoring required"],
    });
  } else if (marketplaceHealth.utilization > 0.75) {
    insights.push({
      id: `risk-high-util-${Date.now()}`,
      category: "risk",
      severity: "medium",
      title: "Rising Utilization Warning",
      description: `Resource utilization is currently at ${(marketplaceHealth.utilization * 100).toFixed(0)}%.`,
      recommendation: "Monitor availability to prevent booking failures.",
      confidenceScore: 80,
      generatedAt: new Date(),
    });
  }

  if (marketplaceHealth.averageMatchScore < 0.5) {
    insights.push({
      id: `risk-match-quality-${Date.now()}`,
      category: "risk",
      severity: "high",
      title: "Declining Match Quality",
      description: "Automated match scores have fallen below efficiency targets.",
      recommendation: "Review matching parameters and resource location accuracy.",
      confidenceScore: 85,
      generatedAt: new Date(),
    });
  }

  return insights;
}

export async function generateForecastInsights(history: HistoricalMetricDocument[]): Promise<CivicInsight[]> {
  const insights: CivicInsight[] = [];
  if (history.length < 3) return insights;

  const latest = history[history.length - 1];
  const previous = history[history.length - 3];
  const confidence = calculateConfidence(history);

  if (latest.utilizationPercentage > previous.utilizationPercentage) {
    insights.push({
      id: `forecast-util-up-${Date.now()}`,
      category: "forecast",
      severity: "low",
      title: "Rising Utilization Trend",
      description: "Utilization has shown a consistent upward trend over the last recorded periods.",
      recommendation: "Pre-emptively secure additional resources for peak periods.",
      confidenceScore: confidence,
      generatedAt: new Date(),
    });
  }

  if (latest.demandPressure > previous.demandPressure * 1.2) {
    insights.push({
      id: `forecast-demand-surge-${Date.now()}`,
      category: "forecast",
      severity: "high",
      title: "Predicted Demand Surge",
      description: "Demand signals are accelerating faster than historical norms.",
      recommendation: "Deploy demand-shaping strategies or temporary resource incentives.",
      confidenceScore: confidence - 10,
      generatedAt: new Date(),
    });
  }

  return insights;
}

export async function generateRecommendationInsights(summary: AnalyticsSummary): Promise<CivicInsight[]> {
  const insights: CivicInsight[] = [];
  const { resourceBreakdown, marketplaceHealth } = summary;

  if (resourceBreakdown.room < 1) {
    insights.push({
      id: `rec-room-sharing-${Date.now()}`,
      category: "recommendation",
      severity: "low",
      title: "Promote Community Room Sharing",
      description: "No community rooms are currently listed in the exchange.",
      recommendation: "Onboard existing community center spaces into the platform.",
      confidenceScore: 70,
      generatedAt: new Date(),
    });
  }

  if (marketplaceHealth.averageMatchScore > 0.9) {
    insights.push({
      id: `rec-optimize-pricing-${Date.now()}`,
      category: "recommendation",
      severity: "low",
      title: "Optimal Match Efficiency Detected",
      description: "Match quality is exceptional; consider testing price elasticity.",
      recommendation: "Apply a minor 5% premium to high-confidence resource matches.",
      confidenceScore: 60,
      generatedAt: new Date(),
    });
  }

  return insights;
}

export async function generateMarketplaceInsights(): Promise<CivicInsight[]> {
  const [summary, history] = await Promise.all([
    analyticsService.getAnalyticsSummary(),
    historicalMetricService.getHistoricalSnapshots(10),
  ]);

  const all = await Promise.all([
    generateOpportunityInsights(summary),
    generateRiskInsights(summary),
    generateForecastInsights(history),
    generateRecommendationInsights(summary),
  ]);

  return all.flat().sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export async function getInsightSummary(): Promise<InsightSummary> {
  const insights = await generateMarketplaceInsights();
  const critical = insights.filter((i) => i.severity === "critical" || i.severity === "high");

  return {
    totalInsights: insights.length,
    criticalIssues: critical.length,
    topRecommendation: insights[0]?.recommendation || null,
    generatedAt: new Date(),
  };
}
