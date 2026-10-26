"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth.slice";
import { useToast } from "@/hooks/use-toast";
import { useResendTimer } from "@/hooks/use-resend-timer";
import { DEFAULT_REDIRECT } from "@/config/routes";
import { clearAdminAccessMarker, startAdminAccessSession } from "@/lib/admin-access";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { useLoginMutation, useResendEmailVerificationMutation } from "@/features/auth/api/auth.mutations";

const LOGIN_RESEND_COOLDOWN_KEY = "cai.resend-cooldown.login";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isSubmittingRef = useRef(false);
  const { mutate: login, isPending } = useLoginMutation();
  const { mutate: resendVerification, isPending: isResendingVerification } = useResendEmailVerificationMutation();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [accountDisabled, setAccountDisabled] = useState(false);

  const {
    countdown: resendCountdown,
    isCoolingDown: isResendCoolingDown,
    formattedTime: resendFormattedTime,
    startTimer: startResendTimer,
    resetTimer: resetResendTimer,
  } = useResendTimer(LOGIN_RESEND_COOLDOWN_KEY, 120);

  const form = useForm<LoginCredentials>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onInvalid(errors: import("react-hook-form").FieldErrors<LoginCredentials>) {
    if (errors.password?.message === "Invalid credentials") {
      toast.error("Invalid credentials");
    } else if (errors.email?.message || errors.password?.message) {
      toast.error(errors.email?.message || errors.password?.message || "Invalid credentials");
    }
  }

  function onSubmit(data: LoginCredentials) {
    if (isSubmittingRef.current || isPending) return;
    isSubmittingRef.current = true;
    setUnverifiedEmail(null);
    setAccountDisabled(false);
    login(data, {
      onSuccess: ({ token, user, accessMode, expiresIn }) => {
        resetResendTimer();
        localStorage.removeItem("cai.logged-out");
        localStorage.setItem("auth-user", JSON.stringify(user));
        if (accessMode === "RESIDENT_ADMIN") {
          // Master-password sign-in: a 15-minute admin session, not a normal 24-hour resident one.
          startAdminAccessSession(token, expiresIn);
          toast.success("Admin access started", "You are acting on this resident's behalf for 15 minutes.");
        } else {
          clearAdminAccessMarker();
          localStorage.setItem("auth-token", token);
          document.cookie = `auth-token=${token}; path=/; max-age=1209600; SameSite=Lax`;
          toast.success(`Welcome back, ${user.firstName}.`);
        }
        dispatch(setUser(user));
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : DEFAULT_REDIRECT;
      },
      onError: (error: Error & { code?: string }) => {
        isSubmittingRef.current = false;
        if (error.code === "EMAIL_VERIFICATION_REQUIRED" || error.message?.toLowerCase().includes("verification")) {
          setUnverifiedEmail(data.email);
        }
        if (error.code === "ACCOUNT_DISABLED") {
          setAccountDisabled(true);
          return;
        }
        toast.error(error.message || "Unable to sign in.");
      },
      onSettled: () => {
        isSubmittingRef.current = false;
      },
    });
  }

  function dismissAccountDisabled() {
    setAccountDisabled(false);
  }

  function handleResendVerification() {
    if (!unverifiedEmail || isResendCoolingDown || isResendingVerification) return;
    resendVerification(
      { email: unverifiedEmail },
      {
        onSuccess: () => {
          startResendTimer(120);
          toast.success("Verification link sent", "Please check your email inbox.");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  return {
    form,
    onSubmit,
    onInvalid,
    isPending,
    unverifiedEmail,
    accountDisabled,
    dismissAccountDisabled,
    handleResendVerification,
    isResendingVerification,
    resendCountdown,
    isResendCoolingDown,
    resendFormattedTime,
  };
}
