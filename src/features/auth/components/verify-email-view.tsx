"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Clock, MailCheck, RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RequiredMark } from "@/components/shared/required-mark";
import { useInspectEmailVerificationQuery } from "@/features/auth/api/auth.queries";
import { useConfirmEmailVerificationMutation, useResendEmailVerificationMutation } from "@/features/auth/api/auth.mutations";
import { useToast } from "@/hooks/use-toast";

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required.").email("Enter a valid email address."),
});

export default function VerifyEmailView({ token }: { token: string }) {
  const router = useRouter();
  const toast = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [resendSubmitted, setResendSubmitted] = useState(false);

  // Inspect token validity
  const {
    isLoading: isInspecting,
    isError: isInspectionError,
    error: inspectionError,
  } = useInspectEmailVerificationQuery(token);

  // Confirm verification
  const { mutate: confirmEmail, isPending: isConfirming } = useConfirmEmailVerificationMutation();

  // Resend verification
  const { mutate: resendEmail, isPending: isResending } = useResendEmailVerificationMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
  });

  // Automatically trigger confirmation once token is verified as valid
  useEffect(() => {
    if (token && !isInspecting && !isInspectionError && !confirmed && !isConfirming) {
      confirmEmail(
        { token },
        {
          onSuccess: () => {
            setConfirmed(true);
            toast.success("Email verified", "Your resident account is now active.");
          },
          onError: (err: Error) => {
            toast.error(err.message || "Failed to confirm email verification.");
          },
        }
      );
    }
  }, [token, isInspecting, isInspectionError, confirmed, isConfirming, confirmEmail, toast]);

  if (!token || isInspectionError) {
    if (resendSubmitted) {
      return (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 sm:px-8 space-y-6 text-center auth-field-enter">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            <MailCheck className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl font-medium text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If a pending resident account exists for that email, we&apos;ve sent a fresh verification link.
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

    const errorMessage =
      (inspectionError as Error)?.message ||
      "This verification link is invalid, expired, or has already been used. Enter your email below to receive a new link.";

    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 sm:px-8 space-y-6 auth-field-enter">
        <div className="text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
            <Clock className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-medium text-foreground">Link expired or invalid</h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit((data) =>
            resendEmail(data, {
              onSuccess: () => {
                setResendSubmitted(true);
                toast.success("Verification sent", "Check your email inbox.");
              },
              onError: (e: Error) => toast.error(e.message),
            })
          )}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="resend-email">
                Registered email address<RequiredMark />
              </FieldLabel>
              <FieldContent>
                <Input
                  id="resend-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </FieldContent>
            </Field>
            <Button type="submit" className="w-full" disabled={isResending}>
              {isResending ? <Spinner className="size-4" /> : <RotateCw className="size-4 mr-1.5" />}
              Resend verification link
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

  if (isInspecting || isConfirming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 space-y-3 text-center auth-field-enter">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your email address...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 sm:px-8 space-y-6 text-center auth-field-enter">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-6" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium text-foreground">Email verified!</h1>
        <p className="text-sm text-muted-foreground">
          Your resident account has been verified successfully. You can now sign in to access your portal.
        </p>
      </div>
      <div className="pt-2">
        <Button onClick={() => router.push("/auth/login")} className="w-full">
          Sign in to your account
        </Button>
      </div>
    </div>
  );
}
