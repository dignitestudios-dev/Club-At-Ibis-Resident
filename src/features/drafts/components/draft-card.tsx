import { useState, memo } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getRequestTypeById } from "@/lib/mock/request-types";
import { formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

export const DraftCard = memo(function DraftCard({
  draft,
  onDelete,
  isDeleting,
  viewMode = "grid",
  selected = false,
  onToggleSelect,
  className,
  style,
}: {
  draft: RequestDraft;
  onDelete: (id: string, onSettled?: () => void) => void;
  isDeleting?: boolean;
  viewMode?: "grid" | "list";
  selected?: boolean;
  onToggleSelect?: (id: string, selected: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const requestType = getRequestTypeById(draft.requestTypeId);
  const categoryTitle = draft.categoryName || draft.title || requestType?.name || "Architectural Request";
  const reference = draft.reference || draft.code;
  const address = (draft.fieldValues?.propertyAddress as string | undefined) || draft.propertyAddress;
  const lotNo = (draft.fieldValues?.lotNo as string | undefined) || draft.lotNo;
  const fullAddress = address ? (lotNo ? `${address} (Lot #${lotNo})` : address) : undefined;
  const filledCount = Object.keys(draft.fieldValues || {}).filter(
    (k) => draft.fieldValues[k] !== "" && draft.fieldValues[k] !== undefined && draft.fieldValues[k] !== null
  ).length;

  if (viewMode === "list") {
    return (
      <div
        style={style}
        className={cn(
          "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-xl border bg-card p-4 sm:p-4.5 pl-4.5 sm:pl-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          selected
            ? "border-primary ring-1 ring-primary/30 bg-primary/[0.03] dark:bg-primary/[0.06]"
            : "border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700",
          className
        )}
      >
        {/* Left Side Draft Accent Bar */}
        <span
          className={cn(
            "absolute left-0 inset-y-0 w-[3px] transition-all duration-300 group-hover:w-1",
            selected ? "bg-primary" : "bg-amber-400"
          )}
          aria-hidden="true"
        />

        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {onToggleSelect && (
            <div className="pt-0.5 sm:pt-0 shrink-0">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onToggleSelect(draft.id, checked === true)}
                aria-label={`Select draft for ${categoryTitle}`}
                className={cn(
                  "size-4.5 rounded-[5px]",
                  selected && "border-primary bg-primary text-primary-foreground"
                )}
              />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {categoryTitle}
              </h3>
              {reference && (
                <span className="rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0">
                  {reference}
                </span>
              )}
              <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 px-2 py-0.5 text-xs font-mono font-semibold text-amber-900 dark:text-amber-300 whitespace-nowrap shrink-0">
                Draft
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {fullAddress && (
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">
                  <MapPin className="size-3 text-brand-gold shrink-0" />
                  {fullAddress}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 text-slate-400" />
                Saved {formatRelative(draft.updatedAt)}
              </span>
              <span>·</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {filledCount} field{filledCount !== 1 ? "s" : ""} filled
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100 dark:border-amber-900/40 pr-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            aria-label={`Discard draft for ${categoryTitle}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
            title="Discard Draft"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            <span className="text-xs ml-1">Discard</span>
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/requests/new?draftId=${draft.id}`} />}
            aria-label={`Resume draft for ${categoryTitle}`}
            className="h-8 gap-1.5"
          >
            <span>Resume</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>

        <ConfirmDialog
          open={confirmingDelete}
          onOpenChange={(open) => {
            if (!isDeleting) setConfirmingDelete(open);
          }}
          title="Discard Draft Permanently?"
          description="Are you sure you want to discard this draft? This request and all uploaded documents will be permanently deleted and cannot be recovered."
          confirmLabel={isDeleting ? "Discarding..." : "Discard Permanently"}
          destructive={true}
          loading={isDeleting}
          onConfirm={() => {
            onDelete(draft.id, () => setConfirmingDelete(false));
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={style}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        selected
          ? "border-primary ring-1 ring-primary/30 bg-primary/[0.03] dark:bg-primary/[0.06]"
          : "border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700",
        className
      )}
    >
      {/* Top Accent */}
      <span
        className={cn(
          "absolute top-0 inset-x-0 h-[3px] transition-all duration-300 group-hover:h-1",
          selected ? "bg-primary" : "bg-amber-400"
        )}
        aria-hidden="true"
      />

      <div className="space-y-3 pt-1">
        {/* Top Header: Checkbox + Reference Badge + Draft Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onToggleSelect(draft.id, checked === true)}
                aria-label={`Select draft for ${categoryTitle}`}
                className={cn(
                  "size-4.5 rounded-[5px]",
                  selected && "border-primary bg-primary text-primary-foreground"
                )}
              />
            )}
            {reference && (
              <span className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 shadow-2xs tracking-wide whitespace-nowrap shrink-0">
                {reference}
              </span>
            )}
          </div>
          <span className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 px-2.5 py-1 text-xs font-mono font-semibold text-amber-900 dark:text-amber-300 shadow-2xs tracking-wide whitespace-nowrap shrink-0">
            Draft
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-heading text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {categoryTitle}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.25rem]">
            In progress submittal · Unsubmitted changes preserved
          </p>
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-border/60 space-y-3">
        {fullAddress && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
            <MapPin className="size-3.5 text-brand-gold shrink-0" aria-hidden="true" />
            <span className="truncate">{fullAddress}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 gap-2">
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="size-3 text-slate-400" aria-hidden="true" />
            Saved {formatRelative(draft.updatedAt)}
          </span>
          <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
            {filledCount} field{filledCount !== 1 ? "s" : ""} filled
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            aria-label={`Discard draft for ${categoryTitle}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-2.5 flex-1"
            title="Discard Draft"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            <span className="text-xs">Discard</span>
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/requests/new?draftId=${draft.id}`} />}
            aria-label={`Resume draft for ${categoryTitle}`}
            className="h-8 gap-1.5 flex-1"
          >
            <span>Resume</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={(open) => {
          if (!isDeleting) setConfirmingDelete(open);
        }}
        title="Discard Draft Permanently?"
        description="Are you sure you want to discard this draft? This request and all uploaded documents will be permanently deleted and cannot be recovered."
        confirmLabel={isDeleting ? "Discarding..." : "Discard Permanently"}
        destructive={true}
        loading={isDeleting}
        onConfirm={() => {
          onDelete(draft.id, () => setConfirmingDelete(false));
        }}
      />
    </div>
  );
});
