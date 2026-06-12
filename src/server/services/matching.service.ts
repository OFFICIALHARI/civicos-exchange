import type { RequestDocument, RequestResourceType } from "@/server/models/request";
import type { ResourceDocument } from "@/server/models/resource";
import * as requestRepository from "@/server/repositories/request.repository";
import * as resourceRepository from "@/server/repositories/resource.repository";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): Set<string> {
  const normalized = normalizeText(value);
  return new Set(normalized.length === 0 ? [] : normalized.split(" "));
}

function durationInDays(start: Date, end: Date): number {
  return Math.max((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY, 0);
}

function overlapInDays(resourceStart: Date, resourceEnd: Date, requestStart: Date, requestEnd: Date): number {
  const overlapStart = Math.max(resourceStart.getTime(), requestStart.getTime());
  const overlapEnd = Math.min(resourceEnd.getTime(), requestEnd.getTime());
  return Math.max((overlapEnd - overlapStart) / MILLISECONDS_PER_DAY, 0);
}

export interface MatchResult {
  resourceId: string;
  requestId: string;
  score: number;
  matchedPrice: number;
  resourceType: RequestResourceType;
  explanation: string;
}

export interface MatchScoreBreakdown {
  timeMatch: number;
  locationMatch: number;
  priceMatch: number;
  priorityMatch: number;
  availabilityMatch: number;
}

interface MatchCandidate extends MatchResult, MatchScoreBreakdown {
  resource: ResourceDocument;
  request: RequestDocument;
}

// Time is the strongest signal: a resource only matches if its window meaningfully overlaps the request window.
export function calculateTimeMatch(resource: ResourceDocument, request: RequestDocument): number {
  const resourceDuration = durationInDays(resource.availability.start, resource.availability.end);
  const requestDuration = durationInDays(request.timeWindow.start, request.timeWindow.end);

  if (resourceDuration === 0 || requestDuration === 0) {
    return 0;
  }

  const availabilityMatch = calculateAvailabilityMatch(resource, request);
  if (availabilityMatch === 0) {
    return 0;
  }

  // When durations are similar, the timing fit is better; large duration gaps reduce the score.
  const durationSimilarity = 1 - Math.min(Math.abs(resourceDuration - requestDuration) / Math.max(resourceDuration, requestDuration, 1), 1);
  return clamp01(availabilityMatch * durationSimilarity);
}

// Location compatibility rewards exact or near-exact textual matches for the current backend-only phase.
export function calculateLocationMatch(resource: ResourceDocument, request: RequestDocument): number {
  const resourceLocation = normalizeText(resource.location);
  const requestLocation = normalizeText(request.location);

  if (!resourceLocation || !requestLocation) {
    return 0;
  }

  if (resourceLocation === requestLocation) {
    return 1;
  }

  if (resourceLocation.includes(requestLocation) || requestLocation.includes(resourceLocation)) {
    return 0.85;
  }

  const resourceTokens = tokenize(resourceLocation);
  const requestTokens = tokenize(requestLocation);

  let intersection = 0;
  for (const token of requestTokens) {
    if (resourceTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...resourceTokens, ...requestTokens]).size;
  if (union === 0) {
    return 0;
  }

  return clamp01(intersection / union);
}

// Price compatibility is highest when the resource is comfortably within the request budget.
export function calculatePriceMatch(resource: ResourceDocument, request: RequestDocument): number {
  if (request.maxPrice <= 0) {
    return resource.price <= 0 ? 1 : 0;
  }

  if (resource.price > request.maxPrice) {
    return 0;
  }

  return clamp01(1 - resource.price / request.maxPrice);
}

// Priority is normalized onto a 0-1 scale so urgent requests gain a small boost without dominating the score.
export function calculatePriorityMatch(request: RequestDocument): number {
  return clamp01(request.priority / 10);
}

// Availability acts as both an eligibility filter and a modifier: no overlap means no match.
export function calculateAvailabilityMatch(resource: ResourceDocument, request: RequestDocument): number {
  const overlap = overlapInDays(
    resource.availability.start,
    resource.availability.end,
    request.timeWindow.start,
    request.timeWindow.end,
  );

  const requestDuration = durationInDays(request.timeWindow.start, request.timeWindow.end);
  if (requestDuration === 0) {
    return 0;
  }

  return clamp01(overlap / requestDuration);
}

export function calculateMatchScore(resource: ResourceDocument, request: RequestDocument): MatchScoreBreakdown & { score: number } {
  const availabilityMatch = calculateAvailabilityMatch(resource, request);
  if (availabilityMatch === 0) {
    return {
      timeMatch: 0,
      locationMatch: 0,
      priceMatch: 0,
      priorityMatch: 0,
      availabilityMatch: 0,
      score: 0,
    };
  }

  const timeMatch = calculateTimeMatch(resource, request);
  const locationMatch = calculateLocationMatch(resource, request);
  const priceMatch = calculatePriceMatch(resource, request);
  const priorityMatch = calculatePriorityMatch(request);

  // Weighted composite score: time alignment carries the most weight, followed by location, price, and priority.
  const weightedScore =
    0.4 * timeMatch +
    0.3 * locationMatch +
    0.2 * priceMatch +
    0.1 * priorityMatch;

  return {
    timeMatch,
    locationMatch,
    priceMatch,
    priorityMatch,
    availabilityMatch,
    score: clamp01(weightedScore * availabilityMatch),
  };
}

function buildExplanation(breakdown: MatchScoreBreakdown): string {
  const phrases: Array<{ score: number; label: string }> = [
    { score: breakdown.timeMatch, label: "strong time alignment" },
    { score: breakdown.locationMatch, label: "high location compatibility" },
    { score: breakdown.priceMatch, label: "acceptable pricing" },
    { score: breakdown.priorityMatch, label: "priority fit" },
  ]
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (phrases.length === 0) {
    return "Matching criteria are only partially aligned.";
  }

  const primary = phrases[0]?.label;
  const secondary = phrases[1]?.label;

  if (secondary) {
    return `${primary.charAt(0).toUpperCase()}${primary.slice(1)} and ${secondary}.`;
  }

  return `${primary.charAt(0).toUpperCase()}${primary.slice(1)}.`;
}

function toMatchResult(resource: ResourceDocument, request: RequestDocument): MatchCandidate {
  const breakdown = calculateMatchScore(resource, request);
  const { score, ...factors } = breakdown;

  return {
    resourceId: resource._id.toHexString(),
    requestId: request._id.toHexString(),
    matchedPrice: resource.price,
    resourceType: request.resourceType,
    explanation: buildExplanation(breakdown),
    resource,
    request,
    score,
    ...factors,
  };
}

export function rankMatches<T extends MatchResult>(matches: T[]): T[] {
  return [...matches].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (left.matchedPrice !== right.matchedPrice) {
      return left.matchedPrice - right.matchedPrice;
    }

    return left.resourceId.localeCompare(right.resourceId);
  });
}

export async function findBestMatchForRequest(
  request: RequestDocument,
  resources?: ResourceDocument[],
): Promise<MatchResult | null> {
  const resourcePool = resources ?? (await resourceRepository.findAvailable());
  const compatibleResources = resourcePool.filter((resource) => resource.type === request.resourceType);

  const scored = compatibleResources.map((resource) => toMatchResult(resource, request));
  const ranked = rankMatches(scored);
  const best = ranked[0];

  if (!best || best.score <= 0) {
    return null;
  }

  const { resource, request: matchedRequest, timeMatch, locationMatch, priceMatch, priorityMatch, availabilityMatch, ...result } = best;
  void resource;
  void matchedRequest;
  void timeMatch;
  void locationMatch;
  void priceMatch;
  void priorityMatch;
  void availabilityMatch;

  return result;
}

export async function findBestMatches(): Promise<MatchResult[]> {
  const [resources, pendingRequests] = await Promise.all([
    resourceRepository.findAvailable(),
    requestRepository.findPending(),
  ]);

  const usedResourceIds = new Set<string>();
  const prioritizedRequests = [...pendingRequests].sort((left, right) => right.priority - left.priority);
  const matches: MatchResult[] = [];

  for (const request of prioritizedRequests) {
    const availableCompatibleResources = resources.filter(
      (resource) => resource.type === request.resourceType && !usedResourceIds.has(resource._id.toHexString()),
    );

    const bestMatch = await findBestMatchForRequest(request, availableCompatibleResources);
    if (!bestMatch) {
      continue;
    }

    usedResourceIds.add(bestMatch.resourceId);
    matches.push(bestMatch);
  }

  return rankMatches(matches);
}