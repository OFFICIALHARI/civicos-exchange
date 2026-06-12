import { ObjectId } from "mongodb";

import type { HistoricalMetricDocument } from "@/server/models/historical-metric";

import { getTypedCollections } from "./_shared";

async function getHistoricalMetricsCollection() {
  const { historicalMetrics } = await getTypedCollections();
  return historicalMetrics;
}

export async function create(input: HistoricalMetricDocument): Promise<HistoricalMetricDocument> {
  const collection = await getHistoricalMetricsCollection();
  const document = { ...input, _id: input._id ?? new ObjectId() };
  await collection.insertOne(document);
  return document;
}

export async function findAll(): Promise<HistoricalMetricDocument[]> {
  const collection = await getHistoricalMetricsCollection();
  return collection.find({}).sort({ timestamp: 1 }).toArray();
}

export async function findByTimeRange(start: Date, end: Date): Promise<HistoricalMetricDocument[]> {
  const collection = await getHistoricalMetricsCollection();
  return collection
    .find({
      timestamp: {
        $gte: start,
        $lte: end,
      },
    })
    .sort({ timestamp: 1 })
    .toArray();
}

export async function findLatest(): Promise<HistoricalMetricDocument | null> {
  const collection = await getHistoricalMetricsCollection();
  return collection.find({}).sort({ timestamp: -1 }).limit(1).next();
}
