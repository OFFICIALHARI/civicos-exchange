import { ObjectId } from "mongodb";

import type { HistoricalMetricDocument } from "@/server/models/historical-metric";
import * as analyticsService from "@/server/services/analytics.service";
import * as historicalMetricRepository from "@/server/repositories/historical-metric.repository";

export async function recordMarketplaceSnapshot(): Promise<HistoricalMetricDocument> {
  const summary = await analyticsService.getAnalyticsSummary();
  const dashboard = summary.dashboardMetrics;

  const snapshot: HistoricalMetricDocument = {
    _id: new ObjectId(),
    timestamp: new Date(),
    
    // Resource metrics
    totalResources: dashboard.totalResources,
    availableResources: dashboard.availableResources,
    reservedResources: dashboard.reservedResources,
    bookedResources: dashboard.bookedResources,
    
    // Request metrics
    totalRequests: dashboard.totalRequests,
    pendingRequests: dashboard.pendingRequests,
    matchedRequests: dashboard.matchedRequests,
    completedRequests: dashboard.completedRequests,
    
    // Booking & Ledger metrics
    totalBookings: dashboard.totalBookings,
    activeBookings: dashboard.activeBookings,
    completedBookings: dashboard.completedBookings,
    totalLedgerEntries: dashboard.totalLedgerEntries,
    
    // Composite & Ratio metrics
    utilizationPercentage: summary.resourceUtilization.utilizationPercentage,
    demandPressure: summary.demandPressure.demandPressure,
    averageMatchScore: dashboard.averageMatchScore,
  };

  return historicalMetricRepository.create(snapshot);
}

export async function getHistoricalSnapshots(limit = 100): Promise<HistoricalMetricDocument[]> {
  const all = await historicalMetricRepository.findAll();
  return all.slice(-limit);
}

export interface TrendPoint {
  t: string;
  value: number;
}

export async function getMetricTrend(
  metricName: keyof Omit<HistoricalMetricDocument, "_id" | "timestamp">,
  limit = 30
): Promise<TrendPoint[]> {
  const snapshots = await getHistoricalSnapshots(limit);
  
  return snapshots.map((snapshot) => ({
    t: snapshot.timestamp.toISOString(),
    value: snapshot[metricName] as unknown as number,
  }));
}

// Specialized trend getters
export async function getUtilizationTrend(limit = 30): Promise<TrendPoint[]> {
  const snapshots = await getHistoricalSnapshots(limit);
  return snapshots.map(s => ({ t: s.timestamp.toISOString(), value: s.utilizationPercentage }));
}

export async function getDemandPressureTrend(limit = 30): Promise<TrendPoint[]> {
  const snapshots = await getHistoricalSnapshots(limit);
  return snapshots.map(s => ({ t: s.timestamp.toISOString(), value: s.demandPressure }));
}

export async function getBookingTrend(limit = 30): Promise<TrendPoint[]> {
  const snapshots = await getHistoricalSnapshots(limit);
  return snapshots.map(s => ({ t: s.timestamp.toISOString(), value: s.totalBookings }));
}

export async function getMatchScoreTrend(limit = 30): Promise<TrendPoint[]> {
  const snapshots = await getHistoricalSnapshots(limit);
  return snapshots.map(s => ({ t: s.timestamp.toISOString(), value: s.averageMatchScore }));
}
