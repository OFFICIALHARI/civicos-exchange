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

export const ResourceTypeSchema = z.enum(["parking", "ev", "solar", "room"]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const ResourceStatusSchema = z.enum(["listed", "reserved", "booked"]);
export type ResourceStatus = z.infer<typeof ResourceStatusSchema>;

export const ResourceAvailabilitySchema = z
  .object({
    start: dateSchema,
    end: dateSchema,
  })
  .refine((value) => value.end >= value.start, {
    message: "Availability end must be on or after the start time.",
    path: ["end"],
  });

export type ResourceAvailability = z.infer<typeof ResourceAvailabilitySchema>;

export const ResourceSchema = z.object({
  _id: objectIdSchema,
  ownerId: objectIdSchema,
  type: ResourceTypeSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  location: z.string().trim().min(1),
  availability: ResourceAvailabilitySchema,
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  status: ResourceStatusSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type ResourceDocument = z.infer<typeof ResourceSchema>;
export type Resource = ResourceDocument;

export const ResourceCreateInputSchema = ResourceSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});
export type ResourceCreateInput = z.input<typeof ResourceCreateInputSchema>;

export const ResourceUpdateInputSchema = ResourceCreateInputSchema.partial().extend({
  _id: objectIdSchema,
});
export type ResourceUpdateInput = z.input<typeof ResourceUpdateInputSchema>;
