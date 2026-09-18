"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, Clock, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getRequestTypeById } from "@/lib/mock/request-types";
import { formatRelative } from "@/utils/format";

export function DraftCard({
  draft,
  onDelete,
  isDeleting,
}: {
  draft: RequestDraft;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const requestType = getRequestTypeById(draft.requestTypeId);
  const address = (draft.fieldValues.propertyAddress as string) || "142 Egret Landing Way";
  const filledCount = Object.keys(draft.fieldValues).filter(
    (k) => draft.fieldValues[k] !== "" && draft.fieldValues[k] !== undefined
  ).length;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
            <FileEdit className="size-3.5" />
          </span>
          <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {requestType?.name ?? "Architectural Request"}
          </h3>
          <span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
            Draft
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {address} · {filledCount} field{filledCount !== 1 ? "s" : ""} filled
        </p>

        <p className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
          <Clock className="size-3" />
          <span>Last saved {formatRelative(draft.updatedAt)}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
          disabled={isDeleting}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
          title="Discard Draft"
        >
          <Trash2 className="size-4" />
          <span className="sr-only sm:not-sr-only text-xs">Discard</span>
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
