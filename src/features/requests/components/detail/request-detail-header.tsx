"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { formatDate } from "@/utils/format";

interface RequestDetailHeaderProps {
  request: RequestRecord;
  requestType?: RequestType | null;
  onBack: () => void;
}

export function RequestDetailHeader({
  request,
  requestType,
  onBack,
}: RequestDetailHeaderProps) {
  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
        aria-label="Back to requests list"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl font-medium text-foreground">
              {requestType?.name ?? "Architectural Request"}
            </h1>
            <StatusBadge status={request.status} className="text-sm" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {request.code}
            </span>{" "}
            · Submitted {formatDate(request.submittedAt ?? request.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
