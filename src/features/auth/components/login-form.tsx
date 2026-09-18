"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { LogIn, UserPlus } from "lucide-react";
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
import { cn } from "@/utils/cn";

export default function LoginForm() {
  const { form, onSubmit, isPending } = useLogin();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      {/* Creative Auth Tab Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-white text-primary shadow-xs transition-all"
        >
          <LogIn className="size-3.5" />
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          <UserPlus className="size-3.5" />
          Create Account
        </Link>
      </div>

      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl font-medium text-foreground">Welcome back</h1>
        <p className="text-xs text-muted-foreground">
          Enter your resident credentials to manage your requests.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
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

          <Button type="submit" className="w-full shadow-xs" disabled={isPending}>
            {isPending && <Spinner className="size-4" />}
            Sign in to Portal
          </Button>
        </FieldGroup>
      </form>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-center text-xs text-muted-foreground">
        <span className="font-medium text-slate-700">Demo Resident:</span> avery.collins@example.com / password123
      </div>
    </div>
  );
}
