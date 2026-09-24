"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";
import { useForgotPasswordMutation } from "@/features/auth/api/auth.mutations";

export function useForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);
  const { mutate: requestReset, isPending } = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordPayload>({
    mode: "onChange",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: ForgotPasswordPayload) {
    if (isSubmittingRef.current || isPending) return;
    isSubmittingRef.current = true;
    requestReset(data, {
      onSuccess: () => {
        isSubmittingRef.current = false;
        setSubmitted(true);
      },
      onError: () => {
        isSubmittingRef.current = false;
      },
      onSettled: () => {
        isSubmittingRef.current = false;
      },
    });
  }

  return { form, onSubmit, isPending, submitted };
}
