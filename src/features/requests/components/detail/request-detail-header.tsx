"use client";

import { BackButton } from "@/components/shared/back-button";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { ProcessingChip } from "@/components/shared/processing-chip";
import { formatDate } from "@/utils/format";

interface RequestDetailHeaderProps {
  request: RequestRecord;
  requestType?: RequestType | null;
}

export function RequestDetailHeader({
  request,
  requestType,
}: RequestDetailHeaderProps) {
  return (
    <div className="space-y-3">
      <BackButton fallbackHref="/requests" className="-ml-2" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl font-medium text-foreground break-words [overflow-wrap:anywhere]">
              {request.categoryName || requestType?.name || "Architectural Request"}
            </h1>
            <StatusBadge status={request.status} className="text-sm" />
            <ProcessingChip request={request} className="gap-1.5 px-2.5 py-0.5 text-sm font-medium shadow-2xs [&_svg]:size-3.5" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 break-all">
              {request.code}
            </span>{" "}
            · Submitted {formatDate(request.submittedAt ?? request.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
