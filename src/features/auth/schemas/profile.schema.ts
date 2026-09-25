import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(30, "First name must not exceed 30 characters.")
    .regex(/^[a-zA-Z\s]+$/, "First name cannot contain numbers or special characters."),
  lastName: z
    .string()
    .trim()
    .max(30, "Last name must not exceed 30 characters.")
    .regex(/^[a-zA-Z\s]*$/, "Last name cannot contain numbers or special characters.")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
});
