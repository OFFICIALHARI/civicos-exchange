import type { Collection } from "mongodb";

import { getDatabase } from "./client.server";

export const COLLECTION_NAMES = {
  bookings: "bookings",
  insights: "insights",
  ledger: "ledger",
  requests: "requests",
  resources: "resources",
  users: "users",
  historicalMetrics: "historical_metrics",
} as const;

type CivicosCollectionName = (typeof COLLECTION_NAMES)[keyof typeof COLLECTION_NAMES];
type CivicosCollectionMap = {
  bookings: Collection<Record<string, unknown>>;
  insights: Collection<Record<string, unknown>>;
  ledger: Collection<Record<string, unknown>>;
  requests: Collection<Record<string, unknown>>;
  resources: Collection<Record<string, unknown>>;
  users: Collection<Record<string, unknown>>;
  historicalMetrics: Collection<Record<string, unknown>>;
};

function getCollection(name: CivicosCollectionName) {
  return async () => {
    const database = await getDatabase();
    return database.collection(name);
  };
}

export const getResourcesCollection = getCollection(COLLECTION_NAMES.resources) as () => Promise<CivicosCollectionMap["resources"]>;
export const getRequestsCollection = getCollection(COLLECTION_NAMES.requests) as () => Promise<CivicosCollectionMap["requests"]>;
export const getBookingsCollection = getCollection(COLLECTION_NAMES.bookings) as () => Promise<CivicosCollectionMap["bookings"]>;
export const getLedgerCollection = getCollection(COLLECTION_NAMES.ledger) as () => Promise<CivicosCollectionMap["ledger"]>;
export const getInsightsCollection = getCollection(COLLECTION_NAMES.insights) as () => Promise<CivicosCollectionMap["insights"]>;
export const getUsersCollection = getCollection(COLLECTION_NAMES.users) as () => Promise<CivicosCollectionMap["users"]>;
export const getHistoricalMetricsCollection = getCollection(COLLECTION_NAMES.historicalMetrics) as () => Promise<CivicosCollectionMap["historicalMetrics"]>;

export async function getCollections(): Promise<CivicosCollectionMap> {
  const database = await getDatabase();

  return {
    bookings: database.collection(COLLECTION_NAMES.bookings),
    insights: database.collection(COLLECTION_NAMES.insights),
    ledger: database.collection(COLLECTION_NAMES.ledger),
    requests: database.collection(COLLECTION_NAMES.requests),
    resources: database.collection(COLLECTION_NAMES.resources),
    users: database.collection(COLLECTION_NAMES.users),
  };
}