"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
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

export default function LoginForm() {
  const { form, onSubmit, isPending } = useLogin();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center auth-field-enter auth-stagger-1">
        <h1 className="font-heading text-xl sm:text-2xl font-medium text-foreground">Welcome back</h1>
        <p className="text-xs text-muted-foreground">
          Enter your resident credentials to manage your requests.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className="auth-field-enter auth-stagger-2">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </FieldContent>
            </Field>
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
                      Forgot password?
                    </Link>
                  </div>
                  <FieldContent>
                    <PasswordInput
                      id="password"
                      autoComplete="current-password"
                      placeholder="******"
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
              Sign in to Portal
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
