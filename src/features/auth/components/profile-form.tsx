"use client";

import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useProfile } from "@/features/auth/hooks/use-profile";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { formatDate } from "@/utils/format";

import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { User, Calendar, Mail, Phone, Hash } from "lucide-react";

export default function ProfileForm() {
  const { form, onSubmit, isPending, user } = useProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;
  const guard = useUnsavedChanges(isDirty);

  if (!user) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4.5 text-primary" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor="firstName">
                      First name
                      <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="firstName"
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
                      Last name <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="lastName"
                        maxLength={30}
                        disabled={isPending}
                        aria-invalid={!!errors.lastName}
                        {...register("lastName")}
                      />
                      <FieldError errors={errors.lastName ? [errors.lastName] : []} />
                    </FieldContent>
                  </Field>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="email-readonly">Email address</FieldLabel>
                    <FieldContent>
                      <Input id="email-readonly" value={user.email} disabled />
                    </FieldContent>
                  </Field>
                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <FieldContent>
                      <Input
                        id="phone"
                        placeholder="(561) 555-0100"
                        maxLength={20}
                        disabled={isPending}
                        {...register("phone")}
                      />
                      <FieldError errors={errors.phone ? [errors.phone] : []} />
                    </FieldContent>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="residentId-readonly">Resident ID</FieldLabel>
                  <FieldContent>
                    <Input id="residentId-readonly" value={user.residentIdNumber} disabled />
                  </FieldContent>
                </Field>

                <div className="pt-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                    Save Changes
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <ChangePasswordForm />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 text-muted-foreground" />
                Member since
              </span>
              <span className="font-medium text-foreground">
                {formatDate(user.createdAt)}
              </span>
            </div>
            {user.address && (
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <User className="size-4 text-muted-foreground" />
                  Property
                </span>
                <span className="text-right text-xs font-medium text-foreground">
                  {user.address}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Hash className="size-4 text-muted-foreground" />
                Resident ID
              </span>
              <span className="font-mono text-xs font-semibold text-primary">
                {user.residentIdNumber}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {guard.dialog}
    </div>
  );
}
