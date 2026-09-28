import { z } from "zod";
import { strongPassword } from "./register.schema";

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Please confirm your password.").max(128, "Password must not exceed 128 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
