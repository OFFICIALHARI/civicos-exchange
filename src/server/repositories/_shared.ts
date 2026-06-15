import { ObjectId, type Collection } from "mongodb";

import { getCollections } from "@/server/db/collections.server";
import type { BookingDocument } from "@/server/models/booking";
import type { InsightDocument } from "@/server/models/insight";
import type { LedgerEntryDocument } from "@/server/models/ledger-entry";
import type { RequestDocument } from "@/server/models/request";
import type { ResourceDocument } from "@/server/models/resource";
import type { UserDocument } from "@/server/models/user";
import type { HistoricalMetricDocument } from "@/server/models/historical-metric";

export type ObjectIdLike = string | ObjectId;

export function toObjectId(value: ObjectIdLike, label: string): ObjectId {
  if (value instanceof ObjectId) {
    return value;
  }

  if (!ObjectId.isValid(value)) {
    throw new Error(`${label} must be a valid MongoDB ObjectId.`);
  }

  return new ObjectId(value);
}

type TypedCollections = {
  bookings: Collection<BookingDocument>;
  insights: Collection<InsightDocument>;
  ledger: Collection<LedgerEntryDocument>;
  requests: Collection<RequestDocument>;
  resources: Collection<ResourceDocument>;
  users: Collection<UserDocument>;
  historicalMetrics: Collection<HistoricalMetricDocument>;
};

export async function getTypedCollections(): Promise<TypedCollections> {
  const collections = await getCollections();

  return {
    bookings: collections.bookings as unknown as Collection<BookingDocument>,
    insights: collections.insights as unknown as Collection<InsightDocument>,
    ledger: collections.ledger as unknown as Collection<LedgerEntryDocument>,
    requests: collections.requests as unknown as Collection<RequestDocument>,
    resources: collections.resources as unknown as Collection<ResourceDocument>,
    users: collections.users as unknown as Collection<UserDocument>,
    historicalMetrics:
      collections.historicalMetrics as unknown as Collection<HistoricalMetricDocument>,
  };
}
