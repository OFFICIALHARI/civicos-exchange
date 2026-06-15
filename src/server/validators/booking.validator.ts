import { z } from "zod";

import {
  BookingCreateInputSchema,
  BookingSchema,
  BookingStatusSchema,
  BookingUpdateInputSchema,
} from "@/server/models/booking";

export const BookingCreateSchema = BookingCreateInputSchema.extend({
  matchedPrice: z
    .number({
      required_error: "Matched price is required.",
      invalid_type_error: "Matched price must be a number.",
    })
    .nonnegative("Matched price cannot be negative."),
  score: z
    .number({
      required_error: "Score is required.",
      invalid_type_error: "Score must be a number.",
    })
    .min(0, "Score must be at least 0.")
    .max(1, "Score must be at most 1."),
  status: BookingStatusSchema,
});

export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;

export const BookingUpdateSchema = BookingSchema.omit({
  _id: true,
}).extend({
  matchedPrice: z
    .number({
      required_error: "Matched price is required.",
      invalid_type_error: "Matched price must be a number.",
    })
    .nonnegative("Matched price cannot be negative."),
  score: z
    .number({
      required_error: "Score is required.",
      invalid_type_error: "Score must be a number.",
    })
    .min(0, "Score must be at least 0.")
    .max(1, "Score must be at most 1."),
  status: BookingStatusSchema,
});

export type BookingUpdateInput = z.infer<typeof BookingUpdateSchema>;

export const BookingPatchSchema = BookingUpdateInputSchema.extend({
  matchedPrice: z
    .number({
      invalid_type_error: "Matched price must be a number.",
    })
    .nonnegative("Matched price cannot be negative.")
    .optional(),
  score: z
    .number({
      invalid_type_error: "Score must be a number.",
    })
    .min(0, "Score must be at least 0.")
    .max(1, "Score must be at most 1.")
    .optional(),
  status: BookingStatusSchema.optional(),
});

export type BookingPatchInput = z.infer<typeof BookingPatchSchema>;
