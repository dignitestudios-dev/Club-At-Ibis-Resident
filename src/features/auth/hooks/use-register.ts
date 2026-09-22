"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import { useRegisterMutation, useResendEmailVerificationMutation } from "@/features/auth/api/auth.mutations";

export function useRegister() {
  const toast = useToast();
  const { mutate: register, isPending } = useRegisterMutation();
  const { mutate: resendVerification, isPending: isResendingVerification } = useResendEmailVerificationMutation();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const form = useForm<RegisterPayload>({
    mode: "onChange",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      residentId: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: RegisterPayload) {
    register(data, {
      onSuccess: () => {
        setRegisteredEmail(data.email);
        toast.success("Registration received", "Please check your email to verify your account.");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Unable to create account.");
      },
    });
  }

  function handleResendVerification() {
    if (!registeredEmail) return;
    resendVerification(
      { email: registeredEmail },
      {
        onSuccess: () => {
          toast.success("Verification link sent", "Please check your inbox.");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  function resetRegistration() {
    setRegisteredEmail(null);
    form.reset();
  }

  return { form, onSubmit, isPending, registeredEmail, handleResendVerification, isResendingVerification, resetRegistration };
}
