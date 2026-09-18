"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";

export default function ForgotPasswordForm() {
  const { form, onSubmit, isPending, submitted } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
          <MailCheck className="size-5" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-medium text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email address, we've sent a link to reset your
            password.
          </p>
        </div>
        <Link href="/auth/login" className="text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-medium text-foreground">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email and we'll send you a link to reset your password.
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Spinner className="size-4" />}
            Send reset link
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
