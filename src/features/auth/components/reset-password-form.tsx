"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { Clock, MailCheck, RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { RequiredMark } from "@/components/shared/required-mark";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";

export default function ResetPasswordForm({ token }: { token: string }) {
  const {
    resetForm,
    resendForm,
    onResetSubmit,
    onResendSubmit,
    isResetting,
    isResending,
    isTokenExpired,
    setIsTokenExpired,
    resendSubmitted,
  } = useResetPassword(token);

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = resetForm;

  const {
    register: registerResend,
    handleSubmit: handleResendSubmit,
    formState: { errors: resendErrors },
  } = resendForm;

  if (isTokenExpired) {
    if (resendSubmitted) {
      return (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 sm:px-8 space-y-6 text-center auth-field-enter">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            <MailCheck className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl font-medium text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, we&apos;ve sent a new password reset link.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline dark:text-amber-300"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 sm:px-8 space-y-6 auth-field-enter">
        <div className="text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
            <Clock className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-medium text-foreground">Reset link expired or invalid</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is missing, expired, or has already been used. Enter your email below to receive a fresh link.
            </p>
          </div>
        </div>

        <form onSubmit={handleResendSubmit(onResendSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!resendErrors.email}>
              <FieldLabel htmlFor="resend-email">
                Registered email address<RequiredMark />
              </FieldLabel>
              <FieldContent>
                <Input
                  id="resend-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={320}
                  disabled={isResending}
                  aria-invalid={!!resendErrors.email}
                  {...registerResend("email")}
                />
                <FieldError errors={resendErrors.email ? [resendErrors.email] : []} />
              </FieldContent>
            </Field>
            <Button type="submit" className="w-full" disabled={isResending}>
              {isResending ? <Spinner className="size-4" /> : <RotateCw className="size-4 mr-1.5" />}
              Resend reset link
            </Button>
          </FieldGroup>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-primary hover:underline dark:text-amber-300">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 sm:px-8 space-y-6 auth-field-enter">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-medium text-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new strong password for your account.
        </p>
      </div>

      <form onSubmit={handleResetSubmit(onResetSubmit)} noValidate>
        <FieldGroup>
          <Controller
            name="password"
            control={resetControl}
            render={({ field }) => (
              <Field data-invalid={!!resetErrors.password}>
                <FieldLabel htmlFor="password">
                  New password
                  <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    maxLength={128}
                    disabled={isResetting}
                    aria-invalid={!!resetErrors.password}
                    showStrength
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <FieldError errors={resetErrors.password ? [resetErrors.password] : []} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={resetControl}
            render={({ field }) => (
              <Field data-invalid={!!resetErrors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm new password
                  <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    maxLength={128}
                    disabled={isResetting}
                    aria-invalid={!!resetErrors.confirmPassword}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <FieldError
                    errors={resetErrors.confirmPassword ? [resetErrors.confirmPassword] : []}
                  />
                </FieldContent>
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isResetting}>
            {isResetting && <Spinner className="size-4" />}
            Reset password
          </Button>
        </FieldGroup>
      </form>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={() => setIsTokenExpired(true)}
          className="text-xs text-muted-foreground hover:text-primary underline cursor-pointer"
        >
          Need a new reset link? Resend here
        </button>
      </div>
    </div>
  );
}
