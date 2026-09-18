import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { getRequestTypeById } from "@/lib/mock/request-types";
import { formatDate } from "@/utils/format";

export function RequestListItem({ request }: { request: RequestRecord }) {
  const requestType = getRequestTypeById(request.requestTypeId);

  return (
    <Link
      href={`/requests/${request.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-base font-medium text-foreground group-hover:text-primary transition-colors">
            {requestType?.name ?? "Architectural Request"}
          </p>
          <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
            {request.code}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Submitted {formatDate(request.submittedAt ?? request.createdAt)} · Last Update{" "}
          {formatDate(request.updatedAt)}
        </p>
      </div>
      <StatusBadge status={request.status} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
