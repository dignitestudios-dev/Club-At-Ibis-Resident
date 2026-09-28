import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .max(100, "Email must not exceed 100 characters.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password must not exceed 128 characters."),
});
