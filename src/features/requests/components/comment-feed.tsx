import { MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";
import { EmptyState } from "@/components/shared/empty-state";

export function CommentFeed({ comments }: { comments: CommentEntry[] }) {
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No feedback yet"
        description="ARB comments and feedback on this request will appear here."
      />
    );
  }

  const sorted = [...comments].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  return (
    <div className="space-y-3">
      {sorted.map((comment) => (
        <div
          key={comment.id}
          className={cn(
            "rounded-lg border p-3.5",
            comment.authorRole === "arb"
              ? "border-blue-200 bg-blue-50/50"
              : "border-border bg-muted/40"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{comment.author}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(comment.createdAt)}
            </p>
          </div>
          <p className="mt-1.5 text-sm text-foreground/90">{comment.message}</p>
        </div>
      ))}
    </div>
  );
}
