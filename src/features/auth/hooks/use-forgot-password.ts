"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";
import { useForgotPasswordMutation } from "@/features/auth/api/auth.mutations";

export function useForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: requestReset, isPending } = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordPayload>({
    mode: "onChange",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: ForgotPasswordPayload) {
    requestReset(data, {
      onSuccess: () => setSubmitted(true),
    });
  }

  return { form, onSubmit, isPending, submitted };
}
