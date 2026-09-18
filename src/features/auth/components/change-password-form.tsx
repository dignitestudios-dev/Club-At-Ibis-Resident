"use client";

import { Controller } from "react-hook-form";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/password-input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";

export function ChangePasswordForm() {
  const { form, onSubmit, isPending } = useChangePassword();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4.5 text-primary" />
          Security &amp; Password
        </CardTitle>
        <CardDescription>
          Update your account password. Make sure it is at least 8 characters long.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.currentPassword}>
                  <FieldLabel htmlFor="currentPassword">
                    Current password
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      id="currentPassword"
                      autoComplete="current-password"
                      placeholder="******"
                      aria-invalid={!!errors.currentPassword}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <FieldError
                      errors={errors.currentPassword ? [errors.currentPassword] : []}
                    />
                  </FieldContent>
                </Field>
              )}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.newPassword}>
                    <FieldLabel htmlFor="newPassword">
                      New password
                      <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <PasswordInput
                        id="newPassword"
                        autoComplete="new-password"
                        placeholder="******"
                        aria-invalid={!!errors.newPassword}
                        showStrength
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                      <FieldError
                        errors={errors.newPassword ? [errors.newPassword] : []}
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                name="confirmNewPassword"
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.confirmNewPassword}>
                    <FieldLabel htmlFor="confirmNewPassword">
                      Confirm new password
                      <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <PasswordInput
                        id="confirmNewPassword"
                        autoComplete="new-password"
                        placeholder="******"
                        aria-invalid={!!errors.confirmNewPassword}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                      <FieldError
                        errors={
                          errors.confirmNewPassword ? [errors.confirmNewPassword] : []
                        }
                      />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner className="size-4" /> : <ShieldCheck className="size-4" />}
                Update Password
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
