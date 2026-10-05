"use client";

import { useState } from "react";
import { ChevronDown, Eye, Flag, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandableText } from "@/components/shared/expandable-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PreviewableFile } from "@/components/shared/file-preview-dialog";
import { earlierSubmissions, flaggedItemsForSubmission } from "@/features/requests/utils/submissions";
import { formatDateTime, formatFileSize } from "@/utils/format";
import { cn } from "@/utils/cn";

function SubmissionRow({
  request,
  submission,
  onPreview,
  defaultOpen,
}: {
  request: RequestRecord;
  submission: SubmissionVersionRecord;
  onPreview: (f: PreviewableFile) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const fields = [...(request.formSnapshot ?? request.form?.fields ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const answerFields = fields.filter((f) => f.type !== "file");
  const docFields = fields.filter((f) => f.type === "file");
  const flaggedReasons = flaggedItemsForSubmission(request, submission.number);

  function renderFieldItem(field: FieldConfig) {
    const reason = flaggedReasons.get(field.id);
    const flagged = reason !== undefined;
    const files = submission.files?.[field.id] ?? [];
    const value = submission.fieldValues?.[field.id];
    if (field.type === "file" ? files.length === 0 : !value) return null;
    return (
      <li
        key={field.id}
        className={cn(
          "space-y-1.5 rounded-lg border p-3",
          flagged ? "border-amber-300/70 bg-amber-50/40 dark:border-amber-800/60 dark:bg-amber-950/10" : "border-border/70"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 text-[11px] font-semibold tracking-wider text-foreground uppercase break-words [overflow-wrap:anywhere]">
            {field.label}
          </p>
          {flagged && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <Flag className="size-3" aria-hidden="true" />
              Flagged by the ARB
            </span>
          )}
        </div>
        {field.type === "file" ? (
          files.map((f) => (
            <div key={f.id} className="flex items-center gap-2.5 text-sm">
              <FileText className="size-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="text-[11px] text-muted-foreground">{formatFileSize(f.size)}</span>
              <Button variant="outline" size="xs" onClick={() => onPreview(f)}>
                <Eye />
                Preview
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm whitespace-pre-line break-words [overflow-wrap:anywhere] text-foreground">{value}</p>
        )}
        {flagged && reason && (
          <p className="text-xs break-words [overflow-wrap:anywhere] text-amber-900 dark:text-amber-300">Note: <ExpandableText text={reason} limit={120} /></p>
        )}
      </li>
    );
  }

  const answerItems = answerFields.map(renderFieldItem).filter(Boolean);
  const docItems = docFields.map(renderFieldItem).filter(Boolean);

  return (
    <div className="rounded-xl border border-border/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-heading text-sm font-semibold">
          #{submission.number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">Submission {submission.number}</span>
          <span className="block text-xs text-muted-foreground">Submitted {formatDateTime(submission.submittedAt)}</span>
        </span>
        {flaggedReasons.size > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <Flag className="size-3" aria-hidden="true" />
            {flaggedReasons.size} flagged
          </span>
        )}
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border/70 px-4 py-4">
          {answerItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Answers</p>
              <ul className="space-y-2">{answerItems}</ul>
            </div>
          )}
          {docItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Documents</p>
              <ul className="space-y-2">{docItems}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Earlier submissions stay on the request after you resubmit, exactly as you originally sent them. */
export function EarlierSubmissions({ request, onPreview }: { request: RequestRecord; onPreview: (f: PreviewableFile) => void }) {
  const list = earlierSubmissions(request);
  if (list.length === 0) return null;
  return (
    <Card className="rounded-xl border border-border/70 bg-transparent shadow-none ring-0">
      <CardHeader className="border-b border-border/70 pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-medium">
          <History className="size-4 text-muted-foreground" aria-hidden="true" />
          Earlier submissions
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          What you originally submitted and what the ARB asked you to fix. Kept after you resubmit and never changes.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {list.map((s, i) => (
          <SubmissionRow key={s.id} request={request} submission={s} onPreview={onPreview} defaultOpen={i === 0} />
        ))}
      </CardContent>
    </Card>
  );
}
