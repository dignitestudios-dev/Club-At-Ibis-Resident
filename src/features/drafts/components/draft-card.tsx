import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getRequestTypeById } from "@/lib/mock/request-types";
import { formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

export function DraftCard({
  draft,
  onDelete,
  isDeleting,
  viewMode = "grid",
  className,
  style,
}: {
  draft: RequestDraft;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  viewMode?: "grid" | "list";
  className?: string;
  style?: React.CSSProperties;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const requestType = getRequestTypeById(draft.requestTypeId);
  const address = (draft.fieldValues.propertyAddress as string) || "142 Egret Landing Way";
  const filledCount = Object.keys(draft.fieldValues).filter(
    (k) => draft.fieldValues[k] !== "" && draft.fieldValues[k] !== undefined
  ).length;

  if (viewMode === "list") {
    return (
      <div
        style={style}
        className={cn(
          "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-card p-4 sm:p-4.5 pl-4.5 sm:pl-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md",
          className
        )}
      >
        {/* Left Side Draft Accent Bar */}
        <span
          className="absolute left-0 inset-y-0 w-[3px] bg-amber-400 transition-all duration-300 group-hover:w-1"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {requestType?.name ?? "Architectural Request"}
            </h3>
            <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 px-2 py-0.5 text-xs font-mono font-semibold text-amber-900 dark:text-amber-300">
              Draft
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {filledCount} field{filledCount !== 1 ? "s" : ""} filled
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {address && (
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">
                <MapPin className="size-3 text-brand-gold shrink-0" />
                {address}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-slate-400" />
              Saved {formatRelative(draft.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100 dark:border-amber-900/40 pr-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
            title="Discard Draft"
          >
            <Trash2 className="size-3.5" />
            <span className="text-xs ml-1">Discard</span>
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/requests/new?draftId=${draft.id}`} />}
            className="h-8 gap-1.5"
          >
            <span>Resume</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        <ConfirmDialog
          open={confirmingDelete}
          onOpenChange={setConfirmingDelete}
          title="Discard Draft?"
          description="Are you sure you want to discard this draft? All saved progress for this request will be permanently removed."
          confirmLabel="Discard Draft"
          onConfirm={() => {
            onDelete(draft.id);
            setConfirmingDelete(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={style}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-card p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md",
        className
      )}
    >
      {/* Top Accent */}
      <span
        className="absolute top-0 inset-x-0 h-[3px] bg-amber-400 transition-all duration-300 group-hover:h-1"
        aria-hidden="true"
      />

      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-2.5">
          <span className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 px-2.5 py-1 text-xs font-mono font-semibold text-amber-900 dark:text-amber-300 shadow-2xs tracking-wide">
            Draft
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {filledCount} field{filledCount !== 1 ? "s" : ""} filled
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-heading text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {requestType?.name ?? "Architectural Request"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.25rem]">
            In progress submittal · Unsubmitted changes preserved
          </p>
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-border/60 space-y-3">
        {address && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
            <MapPin className="size-3.5 text-brand-gold shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-slate-400" />
            Saved {formatRelative(draft.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-2.5 flex-1"
            title="Discard Draft"
          >
            <Trash2 className="size-3.5" />
            <span className="text-xs">Discard</span>
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/requests/new?draftId=${draft.id}`} />}
            className="h-8 gap-1.5 flex-1"
          >
            <span>Resume</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Discard Draft?"
        description="Are you sure you want to discard this draft? All saved progress for this request will be permanently removed."
        confirmLabel="Discard Draft"
        onConfirm={() => {
          onDelete(draft.id);
          setConfirmingDelete(false);
        }}
      />
    </div>
  );
}
