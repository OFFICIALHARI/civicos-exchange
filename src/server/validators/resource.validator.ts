import { z } from "zod";

import {
  ResourceAvailabilitySchema,
  ResourceCreateInputSchema,
  ResourceSchema,
  ResourceStatusSchema,
  ResourceTypeSchema,
  ResourceUpdateInputSchema,
} from "@/server/models/resource";

export const ResourceCreateSchema = ResourceCreateInputSchema.extend({
  type: ResourceTypeSchema,
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  location: z.string().trim().min(1, "Location is required."),
  availability: ResourceAvailabilitySchema,
  quantity: z.number({
    required_error: "Quantity is required.",
    invalid_type_error: "Quantity must be a number.",
  }).int("Quantity must be a whole number.").nonnegative("Quantity cannot be negative."),
  price: z.number({
    required_error: "Price is required.",
    invalid_type_error: "Price must be a number.",
  }).nonnegative("Price cannot be negative."),
  status: ResourceStatusSchema,
});

export type ResourceCreateInput = z.infer<typeof ResourceCreateSchema>;

export const ResourceUpdateSchema = ResourceSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: ResourceTypeSchema,
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  location: z.string().trim().min(1, "Location is required."),
  availability: ResourceAvailabilitySchema,
  quantity: z.number({
    required_error: "Quantity is required.",
    invalid_type_error: "Quantity must be a number.",
  }).int("Quantity must be a whole number.").nonnegative("Quantity cannot be negative."),
  price: z.number({
    required_error: "Price is required.",
    invalid_type_error: "Price must be a number.",
  }).nonnegative("Price cannot be negative."),
  status: ResourceStatusSchema,
});

export type ResourceUpdateInput = z.infer<typeof ResourceUpdateSchema>;

export const ResourcePatchSchema = ResourceUpdateInputSchema.extend({
  type: ResourceTypeSchema.optional(),
  title: z.string().trim().min(1, "Title is required.").optional(),
  description: z.string().trim().min(1, "Description is required.").optional(),
  location: z.string().trim().min(1, "Location is required.").optional(),
  availability: ResourceAvailabilitySchema.optional(),
  quantity: z.number({
    invalid_type_error: "Quantity must be a number.",
  }).int("Quantity must be a whole number.").nonnegative("Quantity cannot be negative.").optional(),
  price: z.number({
    invalid_type_error: "Price must be a number.",
  }).nonnegative("Price cannot be negative.").optional(),
  status: ResourceStatusSchema.optional(),
});

export type ResourcePatchInput = z.infer<typeof ResourcePatchSchema>;