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
  draft: "bg-slate-300",
  submitted: "bg-primary",
  under_review: "bg-sky-500",
  changes_required: "bg-amber-500",
  resubmitted: "bg-purple-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  completed: "bg-emerald-600",
  withdrawn: "bg-slate-400",
};

export function RequestListItem({
  request,
  className,
  style,
}: {
  request: RequestRecord;
  className?: string;
  style?: React.CSSProperties;
}) {
  const requestType = getRequestTypeById(request.requestTypeId);
  const address = request.fieldValues?.propertyAddress as string | undefined;
  const description = request.fieldValues?.projectDescription as string | undefined;
  const hasFeedback = request.comments && request.comments.length > 0;
  const topAccent = STATUS_TOP_ACCENT[request.status] ?? "bg-slate-300";

  return (
    <Link
      href={`/requests/${request.id}`}
      style={style}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-300",
        "hover:-translate-y-1 hover:border-slate-300 hover:shadow-md hover:bg-slate-50/40",
        className
      )}
    >
      {/* Top Subtle Status Accent Bar */}
      <span
        className={cn(
          "absolute top-0 inset-x-0 h-1 transition-all duration-300 group-hover:h-1.5",
          topAccent
        )}
        aria-hidden="true"
      />

      <div className="space-y-3 pt-1">
        {/* Top Header: Code Badge + Status Badge */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="rounded-lg bg-slate-100 border border-slate-200/90 px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 shadow-2xs tracking-wide">
            {request.code}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasFeedback && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300/80 px-2 py-0.5 text-[10px] font-semibold text-amber-900 shadow-2xs">
                <MessageSquare className="size-3 text-amber-700" />
                Note{request.comments.length > 1 ? "s" : ""}
              </span>
            )}
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="font-heading text-lg sm:text-xl font-medium text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
            {requestType?.name ?? "Architectural Request"}
          </h3>
          {description ? (
            <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed min-h-[2.25rem]">
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
      <div className="pt-3 mt-4 border-t border-slate-100 space-y-2.5">
        {address && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
            <MapPin className="size-3.5 text-brand-gold shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-[11px]">
            <Calendar className="size-3 text-slate-400 shrink-0" />
            Submitted {formatDate(request.submittedAt ?? request.createdAt)}
          </span>

          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:translate-x-0.5 group-hover:border-primary shadow-2xs">
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
