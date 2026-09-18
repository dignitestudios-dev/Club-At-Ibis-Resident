import {
  Banknote,
  CheckCircle2,
  FileEdit,
  MessageSquare,
  Send,
  UserCheck,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

const ICONS: Record<ActivityEntry["type"], LucideIcon> = {
  submitted: Send,
  updated: FileEdit,
  assigned: UserCheck,
  comment: MessageSquare,
  changes_required: FileEdit,
  resubmitted: Send,
  approved: CheckCircle2,
  rejected: XCircle,
  completed: CheckCircle2,
  withdrawn: UserX,
  refund_updated: Banknote,
};

export function Timeline({ entries }: { entries: ActivityEntry[] }) {
  const sorted = [...entries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <ol className="space-y-0">
      {sorted.map((entry, index) => {
        const Icon = ICONS[entry.type];
        const isLast = index === sorted.length - 1;

        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border shadow-2xs",
                  entry.type === "rejected"
                    ? "bg-rose-50 text-rose-700 border-rose-200/80"
                    : entry.type === "approved" || entry.type === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                      : entry.type === "withdrawn"
                        ? "bg-slate-100 text-slate-600 border-slate-200/80"
                        : "bg-slate-100 text-slate-800 border-slate-200/80"
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("min-w-0 pb-5", isLast && "pb-0")}>
              <p className="text-sm text-foreground">{entry.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entry.actor} · {formatDateTime(entry.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
