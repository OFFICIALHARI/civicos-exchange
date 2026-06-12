import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .union([
    z.instanceof(ObjectId),
    z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Expected a MongoDB ObjectId string"),
  ])
  .transform((value) => (typeof value === "string" ? new ObjectId(value) : value));

const dateSchema = z.coerce.date();

export const RequestStatusSchema = z.enum(["pending", "matched", "completed"]);
export type RequestStatus = z.infer<typeof RequestStatusSchema>;

export const RequestPrioritySchema = z.number().int().nonnegative();
export type RequestPriority = z.infer<typeof RequestPrioritySchema>;

export const RequestResourceTypeSchema = z.enum(["parking", "ev", "solar", "room"]);
export type RequestResourceType = z.infer<typeof RequestResourceTypeSchema>;

export const RequestTimeWindowSchema = z
  .object({
    start: dateSchema,
    end: dateSchema,
  })
  .refine((value) => value.end >= value.start, {
    message: "Time window end must be on or after the start time.",
    path: ["end"],
  });

export interface RequestTimeWindow extends z.infer<typeof RequestTimeWindowSchema> {}

export const RequestSchema = z.object({
  _id: objectIdSchema,
  userId: objectIdSchema,
  resourceType: RequestResourceTypeSchema,
  location: z.string().trim().min(1),
  maxPrice: z.number().nonnegative(),
  priority: RequestPrioritySchema,
  timeWindow: RequestTimeWindowSchema,
  status: RequestStatusSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type RequestDocument = z.infer<typeof RequestSchema>;
export interface Request extends RequestDocument {}

export const RequestCreateInputSchema = RequestSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});
export type RequestCreateInput = z.input<typeof RequestCreateInputSchema>;

export const RequestUpdateInputSchema = RequestCreateInputSchema.partial().extend({
  _id: objectIdSchema,
});
export type RequestUpdateInput = z.input<typeof RequestUpdateInputSchema>;