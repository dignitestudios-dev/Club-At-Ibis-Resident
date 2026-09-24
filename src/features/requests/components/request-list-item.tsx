import { memo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MessageSquare,
  MapPin,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { getRequestTypeById } from "@/lib/mock/request-types";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

const STATUS_TOP_ACCENT: Record<RequestStatus, string> = {
  draft: "bg-slate-300 dark:bg-slate-600",
  submitted: "bg-primary",
  under_review: "bg-sky-500",
  changes_required: "bg-amber-500",
  resubmitted: "bg-purple-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  completed: "bg-emerald-600",
  withdrawn: "bg-slate-400 dark:bg-slate-600",
};

export const RequestListItem = memo(function RequestListItem({
  request,
  viewMode = "grid",
  className,
  style,
}: {
  request: RequestRecord;
  viewMode?: "grid" | "list";
  className?: string;
  style?: React.CSSProperties;
}) {
  const requestType = getRequestTypeById(request.requestTypeId);
  const categoryTitle = request.categoryName || requestType?.name || "Architectural Request";
  const address = (request.fieldValues?.propertyAddress as string | undefined) || request.propertyAddress;
  const lotNo = (request.fieldValues?.lotNo as string | undefined) || request.lotNo;
  const fullAddress = address ? (lotNo ? `${address} (Lot #${lotNo})` : address) : undefined;
  const description = request.fieldValues?.projectDescription as string | undefined;
  const hasFeedback = request.comments && request.comments.length > 0;
  const topAccent = STATUS_TOP_ACCENT[request.status] ?? "bg-slate-300";

  if (viewMode === "list") {
    return (
      <Link
        href={`/requests/${request.id}`}
        aria-label={`View request ${request.code}: ${categoryTitle}`}
        style={style}
        className={cn(
          "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-xl border border-border/80 bg-card p-4 sm:p-4.5 pl-4.5 sm:pl-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md",
          className
        )}
      >
        {/* Left Side Status Accent Bar */}
        <span
          className={cn(
            "absolute left-0 inset-y-0 w-[3px] transition-all duration-300 group-hover:w-1",
            topAccent
          )}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {categoryTitle}
            </h3>
            <span className="rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">
              {request.code}
            </span>
            {hasFeedback && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:text-amber-300 shadow-2xs">
                <MessageSquare className="size-3 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                Note{request.comments.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {fullAddress && (
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">
                <MapPin className="size-3 text-brand-gold shrink-0" aria-hidden="true" />
                {fullAddress}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3 text-slate-400 shrink-0" aria-hidden="true" />
              Submitted {formatDate(request.submittedAt ?? request.createdAt)}
            </span>
            <span>·</span>
            <span>Last update {formatDate(request.updatedAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 pr-1">
          <StatusBadge status={request.status} />
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-border/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 group-hover:border-primary shadow-2xs"
          >
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/requests/${request.id}`}
      aria-label={`View request ${request.code}: ${categoryTitle}`}
      style={style}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300",
        "hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:bg-slate-50/40 dark:hover:bg-slate-800/30",
        className
      )}
    >
      {/* Top Subtle Status Accent Bar */}
      <span
        className={cn(
          "absolute top-0 inset-x-0 h-[3px] transition-all duration-300 group-hover:h-1",
          topAccent
        )}
        aria-hidden="true"
      />

      <div className="space-y-3 pt-1">
        {/* Top Header: Code Badge + Status Badge */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 shadow-2xs tracking-wide">
            {request.code}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasFeedback && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:text-amber-300 shadow-2xs">
                <MessageSquare className="size-3 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                Note{request.comments.length > 1 ? "s" : ""}
              </span>
            )}
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="font-heading text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {categoryTitle}
          </h3>
          {description ? (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-normal leading-relaxed min-h-[2.25rem]">
              {description}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic min-h-[2.25rem]">
              No additional description provided.
            </p>
          )}
        </div>
      </div>

      {/* Footer: Property Address, Date & Action */}
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

          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-border/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 group-hover:border-primary shadow-2xs"
          >
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
});
