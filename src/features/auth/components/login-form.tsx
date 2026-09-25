"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/features/auth/hooks/use-login";
import { clearPendingRegistration } from "@/features/auth/hooks/use-register";

export default function LoginForm() {
  const {
    form,
    onSubmit,
    isPending,
    unverifiedEmail,
    handleResendVerification,
    isResendingVerification,
    resendCountdown,
    resendFormattedTime,
  } = useLogin();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Clear any pending registration state when visiting/viewing the login form
  useEffect(() => {
    clearPendingRegistration();
  }, []);

  // Keep React Hook Form state synchronized with browser / password-manager autofill
  useEffect(() => {
    const syncAutofill = () => {
      const emailEl = document.getElementById("email") as HTMLInputElement | null;
      const passEl = document.getElementById("password") as HTMLInputElement | null;
      if (emailEl?.value) {
        setValue("email", emailEl.value, { shouldValidate: false });
      }
      if (passEl?.value) {
        setValue("password", passEl.value, { shouldValidate: false });
      }
    };

    syncAutofill();
    const t1 = setTimeout(syncAutofill, 100);
    const t2 = setTimeout(syncAutofill, 500);
    const t3 = setTimeout(syncAutofill, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [setValue]);

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center auth-field-enter auth-stagger-1">
        <h1 className="font-heading text-xl sm:text-2xl font-medium text-foreground">Welcome Back</h1>
        <p className="text-xs text-muted-foreground">
          Enter your resident credentials to manage your requests.
        </p>
      </div>

      {unverifiedEmail && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 space-y-2 auth-field-enter">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium">Email Verification Required</p>
              <p className="text-muted-foreground mt-0.5">
                Your account is pending email verification. Please verify your email before logging in.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-7"
            onClick={handleResendVerification}
            disabled={isResendingVerification || resendCountdown > 0}
          >
            {isResendingVerification ? (
              <Spinner className="size-3" />
            ) : (
              <RotateCw className="size-3 mr-1" />
            )}
            {resendCountdown > 0
              ? `Resend Verification Email (${resendFormattedTime})`
              : "Resend Verification Email"}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className="auth-field-enter auth-stagger-2">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      maxLength={100}
                      disabled={isPending}
                      aria-invalid={!!errors.email}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <FieldError errors={errors.email ? [errors.email] : []} />
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          <div className="auth-field-enter auth-stagger-3">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.password}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <FieldContent>
                    <PasswordInput
                      id="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      maxLength={128}
                      disabled={isPending}
                      aria-invalid={!!errors.password}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <FieldError errors={errors.password ? [errors.password] : []} />
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          <div className="auth-field-enter auth-stagger-4">
            <Button type="submit" className="w-full shadow-xs" disabled={isPending}>
              {isPending && <Spinner className="size-4" />}
              Sign In to Portal
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
