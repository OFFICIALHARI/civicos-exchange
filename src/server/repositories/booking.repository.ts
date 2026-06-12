import { ObjectId } from "mongodb";

import { BookingCreateSchema, BookingPatchSchema } from "@/server/validators/booking.validator";
import type { BookingDocument, BookingStatus } from "@/server/models/booking";

import { getTypedCollections, toObjectId, type ObjectIdLike } from "./_shared";

async function getBookingCollection() {
  const { bookings } = await getTypedCollections();
  return bookings;
}

export async function create(input: unknown): Promise<BookingDocument> {
  const data = BookingCreateSchema.parse(input);
  const document: BookingDocument = {
    _id: new ObjectId(),
    ...data,
  };

  const collection = await getBookingCollection();
  await collection.insertOne(document);

  return document;
}

export async function findById(id: ObjectIdLike): Promise<BookingDocument | null> {
  const collection = await getBookingCollection();
  return collection.findOne({ _id: toObjectId(id, "Booking id") });
}

export async function findAll(): Promise<BookingDocument[]> {
  const collection = await getBookingCollection();
  return collection.find({}).sort({ timestamp: -1 }).toArray();
}

export async function update(input: unknown): Promise<BookingDocument | null> {
  const data = BookingPatchSchema.parse(input);
  const { _id, ...patch } = data;
  const collection = await getBookingCollection();

  const result = await collection.updateOne(
    { _id: toObjectId(_id, "Booking id") },
    { $set: patch },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return collection.findOne({ _id: toObjectId(_id, "Booking id") });
}

export async function findActive(): Promise<BookingDocument[]> {
  const collection = await getBookingCollection();
  return collection.find({ status: "active" satisfies BookingStatus }).sort({ timestamp: -1 }).toArray();
}

export async function findCompleted(): Promise<BookingDocument[]> {
  const collection = await getBookingCollection();
  return collection.find({ status: "completed" satisfies BookingStatus }).sort({ timestamp: -1 }).toArray();
}