import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .union([
    z.instanceof(ObjectId),
    z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Expected a MongoDB ObjectId string"),
  ])
  .transform((value) => (typeof value === "string" ? new ObjectId(value) : value));

const dateSchema = z.coerce.date();

export const UserSchema = z.object({
  _id: objectIdSchema,
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.string().trim().min(1),
  communityId: objectIdSchema,
  location: z.string().trim().min(1),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type UserDocument = z.infer<typeof UserSchema>;
export interface User extends UserDocument {}

export const UserCreateInputSchema = UserSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});
export type UserCreateInput = z.input<typeof UserCreateInputSchema>;

export const UserUpdateInputSchema = UserCreateInputSchema.partial().extend({
  _id: objectIdSchema,
});
export type UserUpdateInput = z.input<typeof UserUpdateInputSchema>;