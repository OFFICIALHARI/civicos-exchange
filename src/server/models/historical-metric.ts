import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .union([
    z.instanceof(ObjectId),
    z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Expected a MongoDB ObjectId string"),
  ])
  .transform((value) => (typeof value === "string" ? new ObjectId(value) : value));

const dateSchema = z.coerce.date();

export const HistoricalMetricSchema = z.object({
  _id: objectIdSchema,
  timestamp: dateSchema,
  
  // Resource metrics
  totalResources: z.number().int().nonnegative(),
  availableResources: z.number().int().nonnegative(),
  reservedResources: z.number().int().nonnegative(),
  bookedResources: z.number().int().nonnegative(),
  
  // Request metrics
  totalRequests: z.number().int().nonnegative(),
  pendingRequests: z.number().int().nonnegative(),
  matchedRequests: z.number().int().nonnegative(),
  completedRequests: z.number().int().nonnegative(),
  
  // Booking & Ledger metrics
  totalBookings: z.number().int().nonnegative(),
  activeBookings: z.number().int().nonnegative(),
  completedBookings: z.number().int().nonnegative(),
  totalLedgerEntries: z.number().int().nonnegative(),
  
  // Composite & Ratio metrics
  utilizationPercentage: z.number().min(0).max(1),
  demandPressure: z.number().nonnegative(),
  averageMatchScore: z.number().min(0).max(1),
});

export type HistoricalMetricDocument = z.infer<typeof HistoricalMetricSchema>;

export const HistoricalMetricCreateInputSchema = HistoricalMetricSchema.omit({
  _id: true,
});
export type HistoricalMetricCreateInput = z.input<typeof HistoricalMetricCreateInputSchema>;
