import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .union([
    z.instanceof(ObjectId),
    z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, "Expected a MongoDB ObjectId string"),
  ])
  .transform((value) => (typeof value === "string" ? new ObjectId(value) : value));

const dateSchema = z.coerce.date();

export const LedgerEntrySchema = z.object({
  _id: objectIdSchema,
  resourceId: objectIdSchema,
  requestId: objectIdSchema,
  bookingId: objectIdSchema,
  matchedPrice: z.number().nonnegative(),
  score: z.number().min(0).max(1),
  timestamp: dateSchema,
});

export type LedgerEntryDocument = z.infer<typeof LedgerEntrySchema>;
export type LedgerEntry = LedgerEntryDocument;

export const LedgerEntryCreateInputSchema = LedgerEntrySchema.omit({
  _id: true,
});
export type LedgerEntryCreateInput = z.input<typeof LedgerEntryCreateInputSchema>;

export const LedgerEntryUpdateInputSchema = LedgerEntryCreateInputSchema.partial().extend({
  _id: objectIdSchema,
});
export type LedgerEntryUpdateInput = z.input<typeof LedgerEntryUpdateInputSchema>;
