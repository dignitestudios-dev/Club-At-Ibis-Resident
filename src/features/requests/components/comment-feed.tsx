import { MessageSquare, ShieldCheck, User } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";
import { EmptyState } from "@/components/shared/empty-state";

export function CommentFeed({ comments }: { comments: CommentEntry[] }) {
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviewer comments yet"
        description="Official ARB reviewer notes, instructions, and feedback will be posted here."
      />
    );
  }

  const sorted = [...comments].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  return (
    <div className="space-y-3.5">
      {sorted.map((comment) => {
        const isArb = comment.authorRole === "arb";
        return (
          <div
            key={comment.id}
            className={cn(
              "rounded-xl border p-4.5 shadow-2xs transition-colors",
              isArb
                ? "border-slate-200/90 bg-slate-50/70"
                : "border-border/80 bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                    isArb
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  {isArb ? <ShieldCheck className="size-3.5" /> : <User className="size-3.5" />}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {comment.author}
                  </p>
                  {isArb && (
                    <span className="text-[10px] text-brand-gold font-medium uppercase tracking-wider">
                      ARB Committee Reviewer
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                {formatDateTime(comment.createdAt)}
              </p>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-9">
              {comment.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
