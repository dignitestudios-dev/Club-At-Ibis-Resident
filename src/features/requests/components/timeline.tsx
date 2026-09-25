import {
  Banknote,
  CheckCircle2,
  FileEdit,
  MessageSquare,
  Send,
  UserCheck,
  UserX,
  XCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDateTime, formatRelative } from "@/utils/format";

const EVENT_CONFIG: Record<
  ActivityEntry["type"],
  {
    icon: LucideIcon;
    label: string;
    nodeBg: string;
    badgeBg: string;
  }
> = {
  submitted: {
    icon: Send,
    label: "Submitted for Review",
    nodeBg: "bg-primary text-primary-foreground ring-primary/20",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80",
  },
  updated: {
    icon: FileEdit,
    label: "Request Updated",
    nodeBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ring-slate-200/50 dark:ring-slate-700/50",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80",
  },
  assigned: {
    icon: UserCheck,
    label: "Reviewer Assigned",
    nodeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-slate-200/50 dark:ring-slate-700/50",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80",
  },
  comment: {
    icon: MessageSquare,
    label: "Reviewer Feedback",
    nodeBg: "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 ring-amber-200/50 dark:ring-amber-800/50",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80",
  },
  changes_required: {
    icon: FileEdit,
    label: "Changes Required",
    nodeBg: "bg-amber-500 text-white ring-amber-200 dark:ring-amber-900",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80",
  },
  resubmitted: {
    icon: Send,
    label: "Revised & Resubmitted",
    nodeBg: "bg-purple-600 text-white ring-purple-200 dark:ring-purple-900",
    badgeBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-950 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80",
  },
  approved: {
    icon: CheckCircle2,
    label: "ARB Approved",
    nodeBg: "bg-emerald-600 text-white ring-emerald-200 dark:ring-emerald-900",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80",
  },
  rejected: {
    icon: XCircle,
    label: "Not Approved",
    nodeBg: "bg-rose-600 text-white ring-rose-200 dark:ring-rose-900",
    badgeBg: "bg-rose-50 dark:bg-rose-950/50 text-rose-950 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed & Closed Out",
    nodeBg: "bg-emerald-600 text-white ring-emerald-200 dark:ring-emerald-900",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80",
  },
  withdrawn: {
    icon: UserX,
    label: "Withdrawn",
    nodeBg: "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 ring-slate-200/50 dark:ring-slate-700/50",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80",
  },
  refund_updated: {
    icon: Banknote,
    label: "Deposit / Refund Update",
    nodeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-slate-200/50 dark:ring-slate-700/50",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80",
  },
};

export function Timeline({ entries }: { entries: ActivityEntry[] }) {
  const list = entries ?? [];

  return (
    <div className="space-y-0">
      {list.map((entry, index) => {
        const config = EVENT_CONFIG[entry.type] ?? EVENT_CONFIG.updated;
        const Icon = config.icon;
        const isLatest = index === 0;
        const isLast = index === list.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4 group">
            {/* Left Column: Node Icon + Continuous Vertical Connecting Line */}
            <div className="flex flex-col items-center">
              {/* Node Icon */}
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-card shadow-2xs transition-transform duration-200 group-hover:scale-110",
                  config.nodeBg,
                  isLatest && "ring-4 ring-primary/20"
                )}
              >
                <Icon className="size-4" />
              </span>

              {/* Vertical connecting line to next item */}
              {!isLast && (
                <span
                  className="w-[2px] flex-1 bg-border my-1.5"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Right Column: Event Content */}
            <div className={cn("min-w-0 flex-1 space-y-2", !isLast ? "pb-6" : "pb-1")}>
              {/* Header: Label + Latest badge + Relative Time */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {config.label}
                  </span>
                  {isLatest && (
                    <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary dark:text-amber-300 tracking-wider uppercase">
                      LATEST
                    </span>
                  )}
                </div>
                <time
                  dateTime={entry.createdAt}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  title={formatDateTime(entry.createdAt)}
                >
                  <Clock className="size-3.5 text-slate-400" aria-hidden="true" />
                  {formatRelative(entry.createdAt)}
                </time>
              </div>

              {/* Message */}
              <p className="text-sm text-foreground/85 leading-relaxed font-normal break-words">
                {entry.message}
              </p>

              {/* Footer: Actor + Exact Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1.5 border-t border-border/60">
                <span>
                  By <span className="font-semibold text-foreground">{entry.actor}</span>
                </span>
                <time dateTime={entry.createdAt} className="text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </time>
              </div>
            </div>
          </div>
        );
      })}
      {list.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded.</p>}
    </div>
  );
}
