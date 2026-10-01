"use client";

import Link from "next/link";
import { useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { Stepper } from "@/features/requests/components/stepper";
import { DynamicField } from "@/features/requests/components/dynamic-field";
import { RequestReview } from "@/features/requests/components/request-review";
import { useRequestRevise } from "@/features/requests/hooks/use-request-revise";

export function RequestReviseWizard({ request }: { request: RequestRecord }) {
  const {
    form,
    stepIndex,
    isReviewStep,
    currentStep,
    stepperSteps,
    flaggedFields,
    flagsByField,
    replacesFileIdByField,
    onFileReplaced,
    mediaRevision,
    onMediaRevisionChange,
    isSavingDraft,
    lastSavedAt,
    hasUnsavedChanges,
    isSubmitting,
    submissionErrors,
    reviewReady,
    handleNext,
    handleBack,
    onSubmit,
  } = useRequestRevise(request);

  const flaggedIds = new Set(flaggedFields.map((f) => f.id));

  const flaggedFileFieldIds = flaggedFields.filter((f) => f.type === "file").map((f) => f.id);
  const watchedDocuments = useWatch({ control: form.control, name: flaggedFileFieldIds });
  const documentsUploading = watchedDocuments.some(
    (rows: any) => Array.isArray(rows) && rows.some((r: any) => r?.status === "uploading" || r?.status === "verifying")
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3">
        <PageHeader
          title="Revise Submission"
          description={`Correct the fields flagged by the ARB for ${request.reference || request.code}. Everything else from your original submission is locked and will be preserved as-is.`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-border px-2.5 py-1 text-xs font-mono font-semibold text-foreground">
            {request.reference || request.code}
          </span>
          {isSavingDraft ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Spinner className="size-3" />
              Saving...
            </span>
          ) : hasUnsavedChanges ? (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="size-3.5" />
              Unsaved changes
            </span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5" />
              Saved
            </span>
          ) : null}
        </div>
      </div>

      <Stepper steps={stepperSteps} currentIndex={stepIndex} />

      <form onSubmit={onSubmit}>
        <Card className="p-5 sm:p-6">
          {!isReviewStep && currentStep && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-medium text-foreground">{currentStep.title}</h2>
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              </div>

              {currentStep.fields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nothing in this section. Click &ldquo;Next&rdquo; to continue.
                </div>
              ) : (
                <div className="space-y-5">
                  {currentStep.fields.map((field) => {
                    const isFlagged = flaggedIds.has(field.id);
                    const isFileFlag = isFlagged && field.type === "file";
                    const reason = flagsByField.get(field.id);
                    return (
                      <div key={field.id}>
                        <DynamicField
                          field={field}
                          control={form.control}
                          errors={form.formState.errors}
                          disabled={!isFlagged || isSubmitting}
                          requestId={request.id}
                          mediaRevision={mediaRevision}
                          onMediaRevisionChange={onMediaRevisionChange}
                          replacesFileId={isFileFlag ? replacesFileIdByField.get(field.id) : undefined}
                          onUploadComplete={isFileFlag ? onFileReplaced : undefined}
                        />
                        {isFlagged && reason && (
                          <div
                            role="note"
                            className="mt-2 rounded-lg border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/30 p-3 text-xs shadow-2xs min-w-0 break-words [overflow-wrap:anywhere]"
                          >
                            <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200 min-w-0">
                              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
                              <div className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                                <span className="font-semibold">Reviewer Flag: </span>
                                <span className="text-amber-800 dark:text-amber-300 break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">{reason}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isReviewStep && (
            <div className="space-y-5 min-w-0">
              <div>
                <h2 className="font-heading text-xl font-medium text-foreground">Review &amp; Resubmit</h2>
                <p className="text-sm text-muted-foreground">
                  Confirm your corrected answers below before sending this back to the ARB.
                </p>
              </div>

              {submissionErrors.length > 0 && (
                <Alert variant="destructive" className="border-destructive/40 bg-destructive/5 dark:bg-destructive/10">
                  <AlertTriangle className="size-4" />
                  <AlertTitle className="font-semibold">Unable to resubmit</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <ul className="list-disc list-inside space-y-1 text-xs break-words [overflow-wrap:anywhere]">
                      {submissionErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {flaggedFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No flagged fields to review.
                </div>
              ) : (
                <RequestReview
                  commonFields={flaggedFields.filter((f) => f.source === "common" && f.type !== "file")}
                  categoryFields={flaggedFields.filter((f) => f.source === "category" && f.type !== "file")}
                  documentFields={flaggedFields.filter((f) => f.type === "file")}
                  values={form.getValues()}
                  errors={form.formState.errors}
                  requestId={request.id}
                />
              )}
            </div>
          )}
        </Card>

        <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mt-6">
          <div className="border-t border-border/80 bg-[#F8FAFC] dark:bg-[#0D1522] px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {stepIndex === 0 ? (
                <Button type="button" variant="outline" nativeButton={false} render={<Link href={`/requests/${request.id}`} />}>
                  <ArrowLeft className="size-4 mr-1" />
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
              )}

              <div className="flex items-center gap-2.5">
                {!isReviewStep ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={documentsUploading}
                    title={documentsUploading ? "Wait for the document upload to finish before continuing." : undefined}
                  >
                    Next
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || isSavingDraft || !reviewReady}>
                    {isSubmitting ? <Spinner className="size-4 mr-1" /> : <Send className="size-4 mr-1" />}
                    {isSubmitting ? "Resubmitting..." : "Resubmit for Review"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
