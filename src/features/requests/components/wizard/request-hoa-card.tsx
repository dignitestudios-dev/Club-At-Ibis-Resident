"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils/cn";

interface RequestHoaCardProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function RequestHoaCard({
  checked,
  onCheckedChange,
  error,
  disabled,
}: RequestHoaCardProps) {
  const hasError = !disabled && !!error;

  return (
    <div className="space-y-2 pt-1" role="group" aria-labelledby="hoa-approval-title">
      <label
        htmlFor="hoaApproved"
        className={cn(
          "group relative flex items-start gap-3.5 sm:gap-4 rounded-2xl border p-4.5 sm:p-5 transition-all duration-200 select-none",
          disabled ? "opacity-60 cursor-not-allowed bg-muted/30 border-border/70" : "cursor-pointer",
          checked
            ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs ring-1 ring-emerald-500/20"
            : hasError
            ? "border-rose-400 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 ring-1 ring-rose-500/20"
            : "border-border/90 bg-card hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 shadow-2xs"
        )}
      >
        {/* Left Icon Badge */}
        <div
          className={cn(
            "flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 mt-0.5",
            checked
              ? "border-emerald-500/80 bg-emerald-500 text-white shadow-xs"
              : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:border-slate-300 dark:group-hover:border-slate-600"
          )}
          aria-hidden="true"
        >
          <ShieldCheck className="size-5 sm:size-5.5" />
        </div>

        {/* Center Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id="hoa-approval-title" className="font-heading text-sm sm:text-base font-semibold text-foreground">
              Homeowners Association (HOA) Approval
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase transition-colors",
                checked
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800"
              )}
              aria-live="polite"
            >
              {checked ? (
                <>
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Confirmed
                </>
              ) : (
                "Required"
              )}
            </span>
          </div>

          <p className="text-sm font-medium text-foreground leading-snug">
            I have HOA Approval for this project.
          </p>

          <p id="hoa-helper-text" className="text-xs text-muted-foreground leading-relaxed">
            The Club at Ibis Architectural Review Board requires prior written HOA approval from your sub-association before processing this request.
          </p>
        </div>

        {/* Right Checkbox */}
        <div className="mt-0.5 pl-1 shrink-0">
          <Checkbox
            id="hoaApproved"
            checked={checked}
            disabled={disabled}
            onCheckedChange={(c) => !disabled && onCheckedChange(c === true)}
            aria-describedby={hasError ? "hoa-error-msg hoa-helper-text" : "hoa-helper-text"}
            aria-invalid={hasError}
            aria-required="true"
            className={cn(
              "size-5 rounded-md transition-all",
              checked
                ? "border-emerald-600 bg-emerald-600 text-white data-checked:bg-emerald-600 data-checked:border-emerald-600 dark:data-checked:bg-emerald-600"
                : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
            )}
          />
        </div>
      </label>

      {hasError && (
        <div
          id="hoa-error-msg"
          role="alert"
          className="flex items-center gap-1.5 px-1 pt-0.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
