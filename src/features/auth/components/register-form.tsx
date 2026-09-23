"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { MailCheck, RotateCw } from "lucide-react";
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
import { useRegister } from "@/features/auth/hooks/use-register";

export default function RegisterForm() {
  const { form, onSubmit, isPending, registeredEmail, handleResendVerification, isResendingVerification, resetRegistration } = useRegister();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  if (registeredEmail) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 sm:px-6 space-y-6 text-center auth-field-enter">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-medium text-foreground">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a verification link to <strong className="text-foreground">{registeredEmail}</strong>. Please check your inbox and click the link to activate your account.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={handleResendVerification}
            disabled={isResendingVerification}
          >
            {isResendingVerification ? <Spinner className="size-3" /> : <RotateCw className="size-3 mr-1.5" />}
            Resend verification email
          </Button>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={resetRegistration}
              className="text-sm font-medium text-primary hover:underline dark:text-amber-300 cursor-pointer"
            >
              Back to sign up
            </button>
            <Link
              href="/auth/login"
              onClick={resetRegistration}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline block pt-0.5"
            >
              Already verified? Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center auth-field-enter auth-stagger-1">
        <h1 className="font-heading text-xl sm:text-2xl font-medium text-foreground">Create your account</h1>
        <p className="text-xs text-muted-foreground">
          Register to submit and track ARB requests for your property.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-3">
          <div className="auth-field-enter auth-stagger-2">
            <Field data-invalid={!!errors.residentId}>
              <FieldLabel htmlFor="residentId">
                Resident ID
                <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="residentId"
                  placeholder="e.g. e157D or 00123"
                  maxLength={20}
                  autoComplete="off"
                  disabled={isPending}
                  aria-invalid={!!errors.residentId}
                  {...register("residentId")}
                />
                <FieldError errors={errors.residentId ? [errors.residentId] : []} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2.5 auth-field-enter auth-stagger-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName">
                First name
                <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="First name"
                  maxLength={30}
                  disabled={isPending}
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                <FieldError errors={errors.firstName ? [errors.firstName] : []} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">
                Last name
                <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Last name"
                  maxLength={30}
                  disabled={isPending}
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                <FieldError errors={errors.lastName ? [errors.lastName] : []} />
              </FieldContent>
            </Field>
          </div>

          <div className="auth-field-enter auth-stagger-3">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">
                Email address
                <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={100}
                  disabled={isPending}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 auth-field-enter auth-stagger-4">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">
                    Password
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      id="password"
                      autoComplete="new-password"
                      placeholder="Enter password"
                      aria-invalid={!!errors.password}
                      showStrength
                      disabled={isPending}
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
                    Confirm password
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      id="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      aria-invalid={!!errors.confirmPassword}
                      disabled={isPending}
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
          </div>

          <div className="auth-field-enter auth-stagger-5">
            <Button type="submit" className="w-full shadow-xs mt-1" disabled={isPending}>
              {isPending && <Spinner className="size-4" />}
              Create Resident Account
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
