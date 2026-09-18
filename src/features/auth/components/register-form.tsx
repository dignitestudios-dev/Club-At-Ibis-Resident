"use client";

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
    <div className="space-y-4">
      <div className="space-y-0.5 text-center">
        <h1 className="font-heading text-xl font-medium text-foreground">Create your account</h1>
        <p className="text-xs text-muted-foreground">
          Register to submit and track ARB requests for your property.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2.5">
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
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                <FieldError errors={errors.firstName ? [errors.firstName] : []} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">
                Last name <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Last name"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      placeholder="******"
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
                      placeholder="******"
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

          <Button type="submit" className="w-full shadow-xs mt-1" disabled={isPending}>
            {isPending && <Spinner className="size-4" />}
            Create Resident Account
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
