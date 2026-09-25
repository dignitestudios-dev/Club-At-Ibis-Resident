import { z } from "zod";

export const strongPassword = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128, "Password must not exceed 128 characters.")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

export const registerSchema = z
  .object({
    residentId: z
      .string()
      .trim()
      .min(1, "Resident ID is required.")
      .max(20, "Resident ID must not exceed 20 characters."),
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(30, "First name must not exceed 30 characters.")
      .regex(/^[a-zA-Z\s]+$/, "First name cannot contain numbers or special characters."),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(30, "Last name must not exceed 30 characters.")
      .regex(/^[a-zA-Z\s]+$/, "Last name cannot contain numbers or special characters."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email is required.")
      .max(100, "Email must not exceed 100 characters.")
      .email("Enter a valid email address."),
    password: strongPassword,
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password.")
      .max(128, "Confirm password must not exceed 128 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
