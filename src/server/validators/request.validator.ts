import { z } from "zod";

import {
  RequestPrioritySchema,
  RequestResourceTypeSchema,
  RequestSchema,
  RequestStatusSchema,
  RequestTimeWindowSchema,
  RequestCreateInputSchema,
  RequestUpdateInputSchema,
} from "@/server/models/request";

export const RequestCreateSchema = RequestCreateInputSchema.extend({
  resourceType: RequestResourceTypeSchema,
  location: z.string().trim().min(1, "Location is required."),
  maxPrice: z.number({
    required_error: "Max price is required.",
    invalid_type_error: "Max price must be a number.",
  }).nonnegative("Max price cannot be negative."),
  priority: RequestPrioritySchema,
  timeWindow: RequestTimeWindowSchema,
  status: RequestStatusSchema,
});

export type RequestCreateInput = z.infer<typeof RequestCreateSchema>;

export const RequestUpdateSchema = RequestSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  resourceType: RequestResourceTypeSchema,
  location: z.string().trim().min(1, "Location is required."),
  maxPrice: z.number({
    required_error: "Max price is required.",
    invalid_type_error: "Max price must be a number.",
  }).nonnegative("Max price cannot be negative."),
  priority: RequestPrioritySchema,
  timeWindow: RequestTimeWindowSchema,
  status: RequestStatusSchema,
});

export type RequestUpdateInput = z.infer<typeof RequestUpdateSchema>;

export const RequestPatchSchema = RequestUpdateInputSchema.extend({
  resourceType: RequestResourceTypeSchema.optional(),
  location: z.string().trim().min(1, "Location is required.").optional(),
  maxPrice: z.number({
    invalid_type_error: "Max price must be a number.",
  }).nonnegative("Max price cannot be negative.").optional(),
  priority: RequestPrioritySchema.optional(),
  timeWindow: RequestTimeWindowSchema.optional(),
  status: RequestStatusSchema.optional(),
});

export type RequestPatchInput = z.infer<typeof RequestPatchSchema>;