import { ObjectId } from "mongodb";

import type { LedgerEntryDocument } from "@/server/models/ledger-entry";

import { getTypedCollections, toObjectId, type ObjectIdLike } from "./_shared";

async function getLedgerCollection() {
  const { ledger } = await getTypedCollections();
  return ledger;
}

export async function create(input: unknown): Promise<LedgerEntryDocument> {
  const document = input as LedgerEntryDocument;
  const collection = await getLedgerCollection();
  await collection.insertOne({ ...document, _id: document._id ?? new ObjectId() });

  return {
    ...document,
    _id: document._id ?? new ObjectId(),
  };
}

export async function findAll(): Promise<LedgerEntryDocument[]> {
  const collection = await getLedgerCollection();
  return collection.find({}).sort({ timestamp: -1 }).toArray();
}

export async function findByBooking(bookingId: ObjectIdLike): Promise<LedgerEntryDocument[]> {
  const collection = await getLedgerCollection();
  return collection
    .find({ bookingId: toObjectId(bookingId, "Booking id") })
    .sort({ timestamp: -1 })
    .toArray();
}

export async function findByResource(resourceId: ObjectIdLike): Promise<LedgerEntryDocument[]> {
  const collection = await getLedgerCollection();
  return collection
    .find({ resourceId: toObjectId(resourceId, "Resource id") })
    .sort({ timestamp: -1 })
    .toArray();
}
