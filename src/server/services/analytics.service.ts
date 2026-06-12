import type { BookingDocument, BookingStatus } from "@/server/models/booking";
import type { RequestDocument, RequestStatus } from "@/server/models/request";
import type { ResourceDocument, ResourceStatus, ResourceType } from "@/server/models/resource";

import * as bookingRepository from "@/server/repositories/booking.repository";
import * as ledgerRepository from "@/server/repositories/ledger.repository";
import * as requestRepository from "@/server/repositories/request.repository";
import * as resourceRepository from "@/server/repositories/resource.repository";

export interface DashboardMetrics {
  totalResources: number;
  availableResources: number;
  reservedResources: number;
  bookedResources: number;
  totalRequests: number;
  pendingRequests: number;
  matchedRequests: number;
  completedRequests: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalLedgerEntries: number;
  averageMatchScore: number;
  totalRevenue: number;
  totalCommunitySavings: number;
}

export interface ResourceUtilization {
  utilizationPercentage: number;
}

export interface DemandPressure {
  pendingRequests: number;
  availableResources: number;
  demandPressure: number;
}

export interface ResourceBreakdown {
  parking: number;
  ev: number;
  solar: number;
  room: number;
}

export type MarketplaceHealthStatus = "healthy" | "moderate" | "critical";

export interface MarketplaceHealth {
  utilization: number;
  demandPressure: number;
  averageMatchScore: number;
  status: MarketplaceHealthStatus;
}

export interface AnalyticsSummary {
  dashboardMetrics: DashboardMetrics;
  resourceUtilization: ResourceUtilization;
  demandPressure: DemandPressure;
  resourceBreakdown: ResourceBreakdown;
  marketplaceHealth: MarketplaceHealth;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function countByStatus<T extends { status: string }>(documents: T[], status: string): number {
  return documents.filter((document) => document.status === status).length;
}

function countByType(resources: ResourceDocument[], type: ResourceType): number {
  return resources.filter((resource) => resource.type === type).length;
}

function calculateAverageMatchScore(bookings: BookingDocument[]): number {
  if (bookings.length === 0) {
    return 0;
  }

  const totalScore = bookings.reduce((sum, booking) => sum + booking.score, 0);
  return clamp01(totalScore / bookings.length);
}

async function loadAnalyticsSources(): Promise<{
  resources: ResourceDocument[];
  requests: RequestDocument[];
  bookings: BookingDocument[];
  ledgerEntries: Awaited<ReturnType<typeof ledgerRepository.findAll>>;
}> {
  const [resources, requests, bookings, ledgerEntries] = await Promise.all([
    resourceRepository.findAll(),
    requestRepository.findAll(),
    bookingRepository.findAll(),
    ledgerRepository.findAll(),
  ]);

  return {
    resources,
    requests,
    bookings,
    ledgerEntries,
  };
}

async function getLedgerAggregations(): Promise<{ revenue: number; savings: number }> {
  const entries = await ledgerRepository.findAll();
  return entries.reduce(
    (acc, entry) => ({
      revenue: acc.revenue + entry.matchedPrice,
      savings: acc.savings + entry.matchedPrice * 0.4, // Simplified 40% efficiency savings logic
    }),
    { revenue: 0, savings: 0 }
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { resources, requests, bookings, ledgerEntries } = await loadAnalyticsSources();
  const { revenue, savings } = await getLedgerAggregations();

  const totalResources = resources.length;
  const availableResources = countByStatus(resources, "listed");
  const reservedResources = countByStatus(resources, "reserved");
  const bookedResources = countByStatus(resources, "booked");

  const totalRequests = requests.length;
  const pendingRequests = countByStatus(requests, "pending");
  const matchedRequests = countByStatus(requests, "matched");
  const completedRequests = countByStatus(requests, "completed");

  const totalBookings = bookings.length;
  const activeBookings = countByStatus(bookings, "active");
  const completedBookings = countByStatus(bookings, "completed");

  return {
    totalResources,
    availableResources,
    reservedResources,
    bookedResources,
    totalRequests,
    pendingRequests,
    matchedRequests,
    completedRequests,
    totalBookings,
    activeBookings,
    completedBookings,
    totalLedgerEntries: ledgerEntries.length,
    averageMatchScore: calculateAverageMatchScore(bookings),
    totalRevenue: revenue,
    totalCommunitySavings: savings,
  };
}

export async function getResourceUtilization(): Promise<ResourceUtilization> {
  const { resources } = await loadAnalyticsSources();

  const bookedResources = countByStatus(resources, "booked");
  const reservedResources = countByStatus(resources, "reserved");
  const utilizationPercentage = safeDivide(bookedResources + reservedResources, resources.length);

  return {
    utilizationPercentage: clamp01(utilizationPercentage),
  };
}

export async function getDemandPressure(): Promise<DemandPressure> {
  const { resources, requests } = await loadAnalyticsSources();

  const availableResources = countByStatus(resources, "listed");
  const pendingRequests = countByStatus(requests, "pending");

  return {
    pendingRequests,
    availableResources,
    demandPressure: safeDivide(pendingRequests, availableResources),
  };
}

export async function getResourceBreakdown(): Promise<ResourceBreakdown> {
  const { resources } = await loadAnalyticsSources();

  return {
    parking: countByType(resources, "parking"),
    ev: countByType(resources, "ev"),
    solar: countByType(resources, "solar"),
    room: countByType(resources, "room"),
  };
}

function deriveMarketplaceStatus(utilization: number, demandPressure: number, averageMatchScore: number): MarketplaceHealthStatus {
  if (utilization >= 0.85 || demandPressure >= 3 || averageMatchScore < 0.4) {
    return "critical";
  }

  if (utilization >= 0.6 || demandPressure >= 1 || averageMatchScore < 0.7) {
    return "moderate";
  }

  return "healthy";
}

export async function getMarketplaceHealth(): Promise<MarketplaceHealth> {
  const [resourceUtilization, demandPressure, dashboardMetrics] = await Promise.all([
    getResourceUtilization(),
    getDemandPressure(),
    getDashboardMetrics(),
  ]);

  const utilization = resourceUtilization.utilizationPercentage;
  const pressure = demandPressure.demandPressure;
  const averageMatchScore = dashboardMetrics.averageMatchScore;

  return {
    utilization,
    demandPressure: pressure,
    averageMatchScore,
    status: deriveMarketplaceStatus(utilization, pressure, averageMatchScore),
  };
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [dashboardMetrics, resourceUtilization, demandPressure, resourceBreakdown, marketplaceHealth] = await Promise.all([
    getDashboardMetrics(),
    getResourceUtilization(),
    getDemandPressure(),
    getResourceBreakdown(),
    getMarketplaceHealth(),
  ]);

  return {
    dashboardMetrics,
    resourceUtilization,
    demandPressure,
    resourceBreakdown,
    marketplaceHealth,
  };
}