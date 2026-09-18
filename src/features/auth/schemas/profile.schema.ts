import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().optional(),
});
