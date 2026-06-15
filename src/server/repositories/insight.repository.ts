import { ObjectId } from "mongodb";

import type { InsightDocument } from "@/server/models/insight";

import { getTypedCollections, toObjectId, type ObjectIdLike } from "./_shared";

async function getInsightCollection() {
  const { insights } = await getTypedCollections();
  return insights;
}

export async function create(input: unknown): Promise<InsightDocument> {
  const document = input as InsightDocument;
  const collection = await getInsightCollection();
  await collection.insertOne({ ...document, _id: document._id ?? new ObjectId() });

  return {
    ...document,
    _id: document._id ?? new ObjectId(),
  };
}

export async function findLatest(): Promise<InsightDocument | null> {
  const collection = await getInsightCollection();
  return collection.find({}).sort({ generatedAt: -1 }).limit(1).next();
}

export async function findByCommunity(communityId: ObjectIdLike): Promise<InsightDocument[]> {
  const collection = await getInsightCollection();
  return collection
    .find({ communityId: toObjectId(communityId, "Community id") })
    .sort({ generatedAt: -1 })
    .toArray();
}
