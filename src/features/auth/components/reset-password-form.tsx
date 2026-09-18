"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/password-input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";

export default function ResetPasswordForm({ token }: { token: string }) {
  const { form, onSubmit, isPending } = useResetPassword(token);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>Invalid reset link</AlertTitle>
        <AlertDescription>
          This password reset link is missing or invalid. Request a new one from the sign-in
          page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-medium text-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">
                  New password
                  <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    aria-invalid={!!errors.password}
                    showStrength
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

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm new password
                  <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    aria-invalid={!!errors.confirmPassword}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <FieldError
                    errors={errors.confirmPassword ? [errors.confirmPassword] : []}
                  />
                </FieldContent>
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Spinner className="size-4" />}
            Reset password
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
