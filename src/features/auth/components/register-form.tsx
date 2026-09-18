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
import { useRegister } from "@/features/auth/hooks/use-register";

export default function RegisterForm() {
  const { form, onSubmit, isPending } = useRegister();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-medium text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Register to submit and track ARB requests for your property.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.residentIdNumber}>
            <FieldLabel htmlFor="residentIdNumber">
              Resident ID
              <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id="residentIdNumber"
                placeholder="RES-30291"
                aria-invalid={!!errors.residentIdNumber}
                {...register("residentIdNumber")}
              />
              <FieldError
                errors={errors.residentIdNumber ? [errors.residentIdNumber] : []}
              />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName">
                First name
                <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                <FieldError errors={errors.firstName ? [errors.firstName] : []} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">
                Last name <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                <FieldError errors={errors.lastName ? [errors.lastName] : []} />
              </FieldContent>
            </Field>
          </div>

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
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-2 gap-3">
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
                    Confirm password
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      id="confirmPassword"
                      autoComplete="new-password"
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
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Spinner className="size-4" />}
            Create account
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
