import { cn } from "@/utils/cn";

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string; dotClass: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  },
  submitted: {
    label: "Submitted",
    className: "bg-slate-100 text-slate-800 border-slate-300",
    dotClass: "bg-slate-600",
  },
  under_review: {
    label: "Under Review",
    className: "bg-slate-100 text-slate-900 border-slate-300 font-medium",
    dotClass: "bg-primary",
  },
  changes_required: {
    label: "Changes Required",
    className: "bg-amber-50/70 text-amber-950 border-amber-200",
    dotClass: "bg-amber-600",
  },
  resubmitted: {
    label: "Resubmitted",
    className: "bg-slate-100 text-slate-800 border-slate-300",
    dotClass: "bg-indigo-600",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50/70 text-emerald-950 border-emerald-200",
    dotClass: "bg-emerald-600",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50/70 text-rose-950 border-rose-200",
    dotClass: "bg-rose-600",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50/70 text-emerald-950 border-emerald-200",
    dotClass: "bg-emerald-600",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-slate-50 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-2xs",
        config.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
