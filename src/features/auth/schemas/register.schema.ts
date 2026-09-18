import { z } from "zod";

export const registerSchema = z
  .object({
    residentIdNumber: z.string().trim().min(1, "Resident ID is required."),
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().optional().or(z.literal("")),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
