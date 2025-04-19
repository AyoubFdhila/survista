import { z } from "zod";
import { Role } from "../type";

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name cannot be empty"),
  firstName: z.string().optional().nullable(), 
  lastName: z.string().optional().nullable(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;


export const updateMyDetailsSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  // Use .nullable() to allow clearing the field by submitting empty string which becomes null/undefined
  firstName: z.string().min(1, "First name cannot be empty").optional().or(z.literal('')).nullable(),
  lastName: z.string().min(1, "Last name cannot be empty").optional().or(z.literal('')).nullable(),
});
export type UpdateMyDetailsFormData = z.infer<typeof updateMyDetailsSchema>;
