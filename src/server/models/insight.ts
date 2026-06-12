import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .union([
    z.instanceof(ObjectId),
    z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Expected a MongoDB ObjectId string"),
  ])
  .transform((value) => (typeof value === "string" ? new ObjectId(value) : value));

const dateSchema = z.coerce.date();

export const InsightForecastPointSchema = z.object({
  label: z.string().trim().min(1),
  value: z.number(),
});

export interface InsightForecastPoint extends z.infer<typeof InsightForecastPointSchema> {}

export const InsightSchema = z.object({
  _id: objectIdSchema,
  communityId: objectIdSchema,
  utilization: z.number().min(0).max(1),
  revenue: z.number().nonnegative(),
  forecast: z.array(InsightForecastPointSchema),
  recommendations: z.array(z.string().trim().min(1)),
  generatedAt: dateSchema,
});

export type InsightDocument = z.infer<typeof InsightSchema>;
export interface Insight extends InsightDocument {}

export const InsightCreateInputSchema = InsightSchema.omit({
  _id: true,
});
export type InsightCreateInput = z.input<typeof InsightCreateInputSchema>;

export const InsightUpdateInputSchema = InsightCreateInputSchema.partial().extend({
  _id: objectIdSchema,
});
export type InsightUpdateInput = z.input<typeof InsightUpdateInputSchema>;