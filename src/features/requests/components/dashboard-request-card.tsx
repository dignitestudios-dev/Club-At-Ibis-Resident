import { memo } from "react";
import { ProcessingChip } from "@/components/shared/processing-chip";
import Link from "next/link";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { StatusBadge } from "@/features/requests/components/status-badge";
import type { DashboardRequestCard as DashboardRequestCardData } from "@/features/requests/api/dashboard.service";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

const STATUS_TOP_ACCENT: Record<RequestStatus, string> = {
  draft: "bg-slate-300 dark:bg-slate-600",
  submitted: "bg-primary",
  assigned: "bg-indigo-500",
  under_review: "bg-sky-500",
  changes_required: "bg-amber-500",
  resubmitted: "bg-purple-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  completed: "bg-emerald-600",
  withdrawn: "bg-slate-400 dark:bg-slate-600",
  cancelled: "bg-slate-400 dark:bg-slate-600",
};

/**
 * Renders a dashboard `recentRequests` card. This is a separate, thinner
 * component from `RequestListItem` on purpose: the dashboard endpoint
 * (GET /dashboard) returns a smaller card projection (no fieldValues,
 * comments, uploads, etc.) than the full requests list endpoint, so this
 * only renders fields the dashboard API actually provides rather than
 * padding out a full RequestRecord with invented values.
 */
export const DashboardRequestCard = memo(function DashboardRequestCard({
  request,
  className,
  style,
}: {
  request: DashboardRequestCardData;
  className?: string;
  style?: React.CSSProperties;
}) {
  const categoryTitle = request.categoryName || "Architectural Request";
  const fullAddress = request.propertyAddress
    ? request.lotNo
      ? `${request.propertyAddress} (Lot #${request.lotNo})`
      : request.propertyAddress
    : undefined;
  const topAccent = STATUS_TOP_ACCENT[request.status] ?? "bg-slate-300";

  return (
    <Link
      href={`/requests/${request.id}`}
      aria-label={`View request ${request.reference}: ${categoryTitle}`}
      style={style}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300",
        "hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:bg-slate-50/40 dark:hover:bg-slate-800/30",
        className
      )}
    >
      <span className={cn("absolute top-0 inset-x-0 h-[3px] transition-all duration-300 group-hover:h-1", topAccent)} aria-hidden="true" />

      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-2.5">
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 shadow-2xs tracking-wide">
            {request.reference}
          </span>
          <StatusBadge status={request.status} />
        </div>

        <h3 className="font-heading text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {categoryTitle}
        </h3>
      </div>

      <div className="pt-3 mt-4 border-t border-border/60 space-y-2.5">
        {fullAddress && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
            <MapPin className="size-3.5 text-brand-gold shrink-0" aria-hidden="true" />
            <span className="truncate">{fullAddress}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-[11px]">
            <Calendar className="size-3 text-slate-400 shrink-0" aria-hidden="true" />
            Submitted {formatDate(request.submittedAt ?? request.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            <ProcessingChip
              request={{
                status: request.status,
                depositRequired: request.depositRequired,
                depositReceived: request.depositStatus === "received",
                refundStatus: request.refundOutcome,
              }}
            />
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-border/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 group-hover:border-primary shadow-2xs"
            >
              <ChevronRight className="size-3.5" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
});
