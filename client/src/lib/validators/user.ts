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
