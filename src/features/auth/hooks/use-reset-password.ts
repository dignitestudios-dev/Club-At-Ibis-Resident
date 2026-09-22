"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import { useResetPasswordMutation, useForgotPasswordMutation } from "@/features/auth/api/auth.mutations";
import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";

export function useResetPassword(token: string) {
  const router = useRouter();
  const toast = useToast();
  const { mutate: reset, isPending: isResetting } = useResetPasswordMutation();
  const { mutate: resend, isPending: isResending } = useForgotPasswordMutation();
  const [isTokenExpired, setIsTokenExpired] = useState(!token);
  const [resendSubmitted, setResendSubmitted] = useState(false);

  const resetForm = useForm<{ password: string; confirmPassword: string }>({
    mode: "onChange",
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resendForm = useForm<ForgotPasswordPayload>({
    mode: "onChange",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onResetSubmit(data: { password: string; confirmPassword: string }) {
    reset(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success("Password updated.", "You can now sign in with your new password.");
          router.push("/auth/login");
        },
        onError: (error: Error) => {
          const msg = error.message.toLowerCase();
          if (msg.includes("expired") || msg.includes("invalid") || msg.includes("token")) {
            setIsTokenExpired(true);
          }
          toast.error(error.message || "Unable to reset your password.");
        },
      }
    );
  }

  function onResendSubmit(data: ForgotPasswordPayload) {
    resend(data, {
      onSuccess: () => {
        setResendSubmitted(true);
        toast.success("Reset link sent", "Check your email for a new link.");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Unable to send reset link.");
      },
    });
  }

  return {
    resetForm,
    resendForm,
    onResetSubmit,
    onResendSubmit,
    isResetting,
    isResending,
    isTokenExpired,
    setIsTokenExpired,
    resendSubmitted,
  };
}
