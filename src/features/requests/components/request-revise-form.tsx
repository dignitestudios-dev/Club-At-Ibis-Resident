"use client";

import { Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DynamicField } from "@/features/requests/components/dynamic-field";
import { useRequestRevise } from "@/features/requests/hooks/use-request-revise";

export function RequestReviseForm({
  request,
  requestType,
  onDone,
}: {
  request: RequestRecord;
  requestType: RequestType;
  onDone?: () => void;
}) {
  const { form, isPending, allFields, flaggedFields, flagsByField, onSubmit } =
    useRequestRevise(request, requestType, onDone);
  const flaggedIds = new Set(flaggedFields.map((f) => f.id));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-lg border border-border/80 bg-slate-50/70 p-3.5 text-xs text-muted-foreground leading-relaxed">
        Only the fields flagged by the ARB below can be edited. All other fields from your
        original submission are displayed in disabled mode and will be preserved as-is.
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {allFields.map((field) => {
          const isFlagged = flaggedIds.has(field.id);
          const colSpan =
            field.type === "textarea" || field.type === "file" || field.type === "checkbox"
              ? "sm:col-span-2"
              : undefined;

          return (
            <div key={field.id} className={colSpan}>
              <DynamicField
                field={field}
                control={form.control}
                errors={form.formState.errors}
                disabled={!isFlagged}
              />
              {isFlagged && flagsByField.get(field.id) && (
                <div role="note" className="mt-2 rounded-lg border border-amber-200/90 bg-amber-50/90 p-3 text-xs shadow-2xs">
                  <div className="flex items-start gap-2 text-amber-900">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="font-semibold">Reviewer Flag: </span>
                      <span className="text-amber-800">
                        {flagsByField.get(field.id)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => onDone?.()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="size-4" /> : <Send className="size-4" />}
          Resubmit for Review
        </Button>
      </div>
    </form>
  );
}
