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
  className,
  style,
}: {
  draft: RequestDraft;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const requestType = getRequestTypeById(draft.requestTypeId);
  const address = (draft.fieldValues.propertyAddress as string) || "142 Egret Landing Way";
  const filledCount = Object.keys(draft.fieldValues).filter(
    (k) => draft.fieldValues[k] !== "" && draft.fieldValues[k] !== undefined
  ).length;

  return (
    <div
      style={style}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/80 bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md",
        className
      )}
    >
      {/* Top Accent */}
      <span
        className="absolute top-0 inset-x-0 h-1 bg-amber-400 transition-all duration-300 group-hover:h-1.5"
        aria-hidden="true"
      />

      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-2.5">
          <span className="rounded-lg bg-amber-50 border border-amber-200/90 px-2.5 py-1 text-xs font-mono font-semibold text-amber-900 shadow-2xs tracking-wide">
            Draft
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {filledCount} field{filledCount !== 1 ? "s" : ""} filled
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-heading text-lg sm:text-xl font-medium text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
            {requestType?.name ?? "Architectural Request"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.25rem]">
            In progress submittal · Unsubmitted changes preserved
          </p>
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 space-y-3">
        {address && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
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
