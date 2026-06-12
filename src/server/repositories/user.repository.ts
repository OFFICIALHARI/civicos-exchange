import { ObjectId } from "mongodb";

import { UserCreateInputSchema, UserUpdateInputSchema } from "@/server/models/user";
import type { UserDocument } from "@/server/models/user";

import { getTypedCollections, toObjectId, type ObjectIdLike } from "./_shared";

async function getUserCollection() {
  const { users } = await getTypedCollections();
  return users;
}

export async function create(input: unknown): Promise<UserDocument> {
  const data = UserCreateInputSchema.parse(input);
  const now = new Date();
  const document: UserDocument = {
    _id: new ObjectId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getUserCollection();
  await collection.insertOne(document);

  return document;
}

export async function findById(id: ObjectIdLike): Promise<UserDocument | null> {
  const collection = await getUserCollection();
  return collection.findOne({ _id: toObjectId(id, "User id") });
}

export async function findByEmail(email: string): Promise<UserDocument | null> {
  const collection = await getUserCollection();
  return collection.findOne({ email: email.trim() });
}

export async function findAll(): Promise<UserDocument[]> {
  const collection = await getUserCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function update(input: unknown): Promise<UserDocument | null> {
  const data = UserUpdateInputSchema.parse(input);
  const { _id, ...patch } = data;
  const collection = await getUserCollection();

  const result = await collection.updateOne(
    { _id: toObjectId(_id, "User id") },
    { $set: { ...patch, updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return collection.findOne({ _id: toObjectId(_id, "User id") });
}