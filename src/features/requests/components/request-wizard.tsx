"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Controller } from "react-hook-form";
import { ArrowLeft, ArrowRight, Bookmark, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Stepper } from "@/features/requests/components/stepper";
import { DynamicField } from "@/features/requests/components/dynamic-field";
import { RequestTypeCard } from "@/features/requests/components/request-type-card";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestHoaCard } from "@/features/requests/components/wizard/request-hoa-card";
import { requestTypes } from "@/lib/mock/request-types";
import { useRequestWizard } from "@/features/requests/hooks/use-request-wizard";
import { useDraftDetailQuery } from "@/features/drafts/api/drafts.queries";

export default function RequestWizard() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { data: draft, isLoading: isLoadingDraft } = useDraftDetailQuery(draftId ?? undefined);

  const [requestTypeId, setRequestTypeId] = useState<string | null>(null);

  // Sync request type if resuming from draft
  useEffect(() => {
    if (draft?.requestTypeId && !requestTypeId) {
      setRequestTypeId(draft.requestTypeId);
    }
  }, [draft, requestTypeId]);

  const activeTypeId = requestTypeId || draft?.requestTypeId || null;
  const requestType = requestTypes.find((t) => t.id === activeTypeId) ?? null;

  if (draftId && isLoadingDraft) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!requestType) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="New Request"
          description="Choose the type of architectural request you'd like to submit."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {requestTypes.map((type) => (
            <RequestTypeCard
              key={type.id}
              requestType={type}
              onSelect={() => setRequestTypeId(type.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <RequestTypeWizard
      key={requestType.id}
      requestType={requestType}
      initialDraft={draft}
      onChangeType={() => setRequestTypeId(null)}
    />
  );
}

function RequestTypeWizard({
  requestType,
  initialDraft,
  onChangeType,
}: {
  requestType: RequestType;
  initialDraft?: RequestDraft | null;
  onChangeType: () => void;
}) {
  const {
    form,
    stepIndex,
    isReviewStep,
    currentStep,
    stepperSteps,
    reviewReady,
    isPending,
    isSavingDraft,
    handleSaveDraft,
    handleNext,
    handleBack,
    confirmingChangeCategory,
    confirmChangeCategory,
    saveDraftAndExit,
    cancelChangeCategory,
    onSubmit,
  } = useRequestWizard(requestType, onChangeType, initialDraft);
  const hoaError = form.formState.errors.hoaApproved;

  return (
    <div className="space-y-6">
      <PageHeader
        title={requestType.name}
        description={requestType.description}
      />

      <Stepper steps={stepperSteps} currentIndex={stepIndex} />

      <Card className="p-5 sm:p-6">
        <form onSubmit={onSubmit}>
          {!isReviewStep && currentStep && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-medium text-foreground">
                  {currentStep.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {currentStep.fields.map((field) => (
                  <div
                    key={field.id}
                    className={
                      field.type === "textarea" ||
                      field.type === "file" ||
                      field.type === "checkbox"
                        ? "sm:col-span-2"
                        : undefined
                    }
                  >
                    <DynamicField
                      field={field}
                      control={form.control}
                      errors={form.formState.errors}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isReviewStep && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-medium text-foreground">
                  Review &amp; Submit
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please confirm the details below before submitting to the ARB.
                </p>
              </div>
              <RequestReview requestType={requestType} values={form.getValues()} />

              <Controller
                name="hoaApproved"
                control={form.control}
                render={({ field: rhf }) => (
                  <RequestHoaCard
                    checked={rhf.value === true}
                    onCheckedChange={(checked) => rhf.onChange(checked)}
                    error={hoaError?.message}
                  />
                )}
              />
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft />
              Back
            </Button>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSaveDraft({ redirect: true })}
                disabled={isSavingDraft || isPending}
              >
                {isSavingDraft ? <Spinner className="size-4" /> : <Bookmark className="size-4 text-brand-navy dark:text-brand-gold" />}
                Save as Draft
              </Button>

              {!isReviewStep ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending || !reviewReady}>
                  {isPending ? <Spinner className="size-4" /> : <Send />}
                  Submit Request
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      <AlertDialog open={confirmingChangeCategory} onOpenChange={(open) => !open && cancelChangeCategory()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save in-progress request?</AlertDialogTitle>
            <AlertDialogDescription>
              You have entered information in this request. Would you like to save it to your drafts before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={cancelChangeCategory}>
              Keep Editing
            </AlertDialogCancel>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={confirmChangeCategory}
            >
              Discard Changes
            </Button>
            <AlertDialogAction onClick={saveDraftAndExit}>
              Save Draft &amp; Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
