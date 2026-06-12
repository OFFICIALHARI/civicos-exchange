import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .union([
    z.instanceof(ObjectId),
    z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Expected a MongoDB ObjectId string"),
  ])
  .transform((value) => (typeof value === "string" ? new ObjectId(value) : value));

const dateSchema = z.coerce.date();

export const BookingStatusSchema = z.enum(["active", "completed", "cancelled"]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  _id: objectIdSchema,
  resourceId: objectIdSchema,
  requestId: objectIdSchema,
  matchedPrice: z.number().nonnegative(),
  score: z.number().min(0).max(1),
  status: BookingStatusSchema,
  timestamp: dateSchema,
});

export type BookingDocument = z.infer<typeof BookingSchema>;
export interface Booking extends BookingDocument {}

export const BookingCreateInputSchema = BookingSchema.omit({
  _id: true,
});
export type BookingCreateInput = z.input<typeof BookingCreateInputSchema>;

export const BookingUpdateInputSchema = BookingCreateInputSchema.partial().extend({
  _id: objectIdSchema,
});
export type BookingUpdateInput = z.input<typeof BookingUpdateInputSchema>;