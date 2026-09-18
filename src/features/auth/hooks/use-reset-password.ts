"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import { useResetPasswordMutation } from "@/features/auth/api/auth.mutations";

export function useResetPassword(token: string) {
  const router = useRouter();
  const toast = useToast();
  const { mutate: reset, isPending } = useResetPasswordMutation();

  const form = useForm<ResetPasswordPayload>({
    mode: "onChange",
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  function onSubmit(data: ResetPasswordPayload) {
    reset(
      { ...data, token },
      {
        onSuccess: () => {
          toast.success("Password updated.", "You can now sign in with your new password.");
          router.push("/auth/login");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Unable to reset your password.");
        },
      }
    );
  }

  return { form, onSubmit, isPending };
}
