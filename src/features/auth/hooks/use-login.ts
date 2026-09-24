"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth.slice";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_REDIRECT } from "@/config/routes";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { useLoginMutation, useResendEmailVerificationMutation } from "@/features/auth/api/auth.mutations";

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

  const form = useForm<LoginCredentials>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginCredentials) {
    if (isSubmittingRef.current || isPending) return;
    isSubmittingRef.current = true;
    setUnverifiedEmail(null);
    login(data, {
      onSuccess: ({ token, user }) => {
        isSubmittingRef.current = false;
        localStorage.removeItem("cai.logged-out");
        localStorage.setItem("auth-token", token);
        localStorage.setItem("auth-user", JSON.stringify(user));
        document.cookie = `auth-token=${token}; path=/; max-age=1209600; SameSite=Lax`;
        dispatch(setUser(user));
        toast.success(`Welcome back, ${user.firstName}.`);
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : DEFAULT_REDIRECT;
      },
      onError: (error: Error & { code?: string }) => {
        isSubmittingRef.current = false;
        if (error.code === "EMAIL_VERIFICATION_REQUIRED" || error.message?.toLowerCase().includes("verification")) {
          setUnverifiedEmail(data.email);
        }
        toast.error(error.message || "Unable to sign in.");
      },
      onSettled: () => {
        isSubmittingRef.current = false;
      },
    });
  }

  function handleResendVerification() {
    if (!unverifiedEmail) return;
    resendVerification(
      { email: unverifiedEmail },
      {
        onSuccess: () => {
          toast.success("Verification link sent", "Please check your email inbox.");
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  return { form, onSubmit, isPending, unverifiedEmail, handleResendVerification, isResendingVerification };
}
