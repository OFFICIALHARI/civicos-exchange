import { ObjectId } from "mongodb";

import { RequestCreateSchema, RequestPatchSchema } from "@/server/validators/request.validator";
import type { RequestDocument, RequestResourceType, RequestStatus } from "@/server/models/request";

import { getTypedCollections, toObjectId, type ObjectIdLike } from "./_shared";

async function getRequestCollection() {
  const { requests } = await getTypedCollections();
  return requests;
}

export async function create(input: unknown): Promise<RequestDocument> {
  const data = RequestCreateSchema.parse(input);
  const now = new Date();
  const document: RequestDocument = {
    _id: new ObjectId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getRequestCollection();
  await collection.insertOne(document);

  return document;
}

export async function findById(id: ObjectIdLike): Promise<RequestDocument | null> {
  const collection = await getRequestCollection();
  return collection.findOne({ _id: toObjectId(id, "Request id") });
}

export async function findAll(): Promise<RequestDocument[]> {
  const collection = await getRequestCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function findPending(): Promise<RequestDocument[]> {
  const collection = await getRequestCollection();
  return collection
    .find({ status: "pending" satisfies RequestStatus })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function update(input: unknown): Promise<RequestDocument | null> {
  const data = RequestPatchSchema.parse(input);
  const { _id, ...patch } = data;
  const collection = await getRequestCollection();

  const result = await collection.updateOne(
    { _id: toObjectId(_id, "Request id") },
    { $set: { ...patch, updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return collection.findOne({ _id: toObjectId(_id, "Request id") });
}

export async function deleteRequest(id: ObjectIdLike): Promise<boolean> {
  const collection = await getRequestCollection();
  const result = await collection.deleteOne({ _id: toObjectId(id, "Request id") });
  return result.deletedCount > 0;
}

export async function findByUser(userId: ObjectIdLike): Promise<RequestDocument[]> {
  const collection = await getRequestCollection();
  return collection
    .find({ userId: toObjectId(userId, "User id") })
    .sort({ createdAt: -1 })
    .toArray();
}
