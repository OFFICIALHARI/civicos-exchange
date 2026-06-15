import { ObjectId } from "mongodb";

import { ResourceCreateSchema, ResourcePatchSchema } from "@/server/validators/resource.validator";
import type { ResourceDocument, ResourceType } from "@/server/models/resource";

import { getTypedCollections, toObjectId, type ObjectIdLike } from "./_shared";

async function getResourceCollection() {
  const { resources } = await getTypedCollections();
  return resources;
}

export async function create(input: unknown): Promise<ResourceDocument> {
  const data = ResourceCreateSchema.parse(input);
  const now = new Date();
  const document: ResourceDocument = {
    _id: new ObjectId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getResourceCollection();
  await collection.insertOne(document);

  return document;
}

export async function findById(id: ObjectIdLike): Promise<ResourceDocument | null> {
  const collection = await getResourceCollection();
  return collection.findOne({ _id: toObjectId(id, "Resource id") });
}

export async function findAll(): Promise<ResourceDocument[]> {
  try {
    const collection = await getResourceCollection();

    const cursor = collection.find({}).sort({ createdAt: -1 });

    const results = await cursor.toArray();

    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function findAvailable(): Promise<ResourceDocument[]> {
  const collection = await getResourceCollection();
  return collection.find({ status: "listed" }).sort({ createdAt: -1 }).toArray();
}

export async function update(input: unknown): Promise<ResourceDocument | null> {
  const data = ResourcePatchSchema.parse(input);
  const { _id, ...patch } = data;
  const collection = await getResourceCollection();

  const result = await collection.updateOne(
    { _id: toObjectId(_id, "Resource id") },
    { $set: { ...patch, updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return collection.findOne({ _id: toObjectId(_id, "Resource id") });
}

export async function deleteResource(id: ObjectIdLike): Promise<boolean> {
  const collection = await getResourceCollection();
  const result = await collection.deleteOne({ _id: toObjectId(id, "Resource id") });
  return result.deletedCount > 0;
}

export async function findByType(type: ResourceType): Promise<ResourceDocument[]> {
  const collection = await getResourceCollection();
  return collection.find({ type }).sort({ createdAt: -1 }).toArray();
}

export async function findByOwner(ownerId: ObjectIdLike): Promise<ResourceDocument[]> {
  const collection = await getResourceCollection();
  return collection
    .find({ _id: { $exists: true }, ownerId: toObjectId(ownerId, "Owner id") })
    .sort({ createdAt: -1 })
    .toArray();
}
