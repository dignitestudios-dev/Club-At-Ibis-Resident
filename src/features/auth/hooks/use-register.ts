"use client";

import { useState, useEffect  , useRef} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useResendTimer } from "@/hooks/use-resend-timer";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import { useRegisterMutation, useResendEmailVerificationMutation } from "@/features/auth/api/auth.mutations";

export const PENDING_REG_EMAIL_KEY = "cai.pending-registration-email";
export const REG_RESEND_COOLDOWN_KEY = "cai.resend-cooldown.register";

export function clearPendingRegistration() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_REG_EMAIL_KEY);
    localStorage.removeItem(REG_RESEND_COOLDOWN_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function useRegister() {
  const toast = useToast();
  const isSubmittingRef = useRef(false);
  const { mutate: register, isPending } = useRegisterMutation();
  const { mutate: resendVerification, isPending: isResendingVerification } = useResendEmailVerificationMutation();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    countdown: resendCountdown,
    isCoolingDown: isResendCoolingDown,
    formattedTime: resendFormattedTime,
    startTimer: startResendTimer,
    resetTimer: resetResendTimer,
  } = useResendTimer(REG_RESEND_COOLDOWN_KEY, 120);

  // Restore persisted pending registration email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedEmail = localStorage.getItem(PENDING_REG_EMAIL_KEY);
        if (savedEmail) {
          setRegisteredEmail(savedEmail);
        }
      } catch {
        // Ignore storage read errors
      }
    }
  }, []);

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

  // Re-validate confirmPassword in real-time when password changes
  useEffect(() => {
    const subscription = form.watch((_value, { name }) => {
      if (name === "password" && form.getValues("confirmPassword")) {
        form.trigger("confirmPassword");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  function onSubmit(data: RegisterPayload) {
    if (isSubmittingRef.current || isPending) return;
    isSubmittingRef.current = true;
    register(data, {
      onSuccess: () => {
        isSubmittingRef.current = false;
        setRegisteredEmail(data.email);
        try {
          localStorage.setItem(PENDING_REG_EMAIL_KEY, data.email);
        } catch {
          // Ignore storage write errors
        }
        startResendTimer(120);
        toast.success("Registration received", "Please check your email to verify your account.");
      },
      onError: (error: Error) => {
        isSubmittingRef.current = false;
        toast.error(error.message || "Unable to create account.");
      },
      onSettled: () => {
        isSubmittingRef.current = false;
      },
    });
  }

  function handleResendVerification() {
    if (!registeredEmail || isResendCoolingDown || isResendingVerification) return;
    resendVerification(
      { email: registeredEmail },
      {
        onSuccess: () => {
          startResendTimer(120);
          toast.success("Verification link sent", "Please check your inbox.");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  function resetRegistration() {
    setRegisteredEmail(null);
    clearPendingRegistration();
    resetResendTimer();
    form.reset();
  }

  return {
    form,
    onSubmit,
    isPending,
    registeredEmail,
    handleResendVerification,
    isResendingVerification,
    resetRegistration,
    resendCountdown,
    isResendCoolingDown,
    resendFormattedTime,
  };
}
