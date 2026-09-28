import { z } from "zod";
import { strongPassword } from "./register.schema";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required.").max(128, "Password must not exceed 128 characters."),
    newPassword: strongPassword,
    confirmNewPassword: z.string().min(1, "Please confirm your new password.").max(128, "Password must not exceed 128 characters."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password.",
    path: ["newPassword"],
  });
