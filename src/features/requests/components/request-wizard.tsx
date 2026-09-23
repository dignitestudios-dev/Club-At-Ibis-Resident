"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Controller } from "react-hook-form";
import { ArrowLeft, ArrowRight, Bookmark, Send, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { EmptyState } from "@/components/shared/empty-state";
import { Stepper } from "@/features/requests/components/stepper";
import { DynamicField } from "@/features/requests/components/dynamic-field";
import { RequestTypeCard } from "@/features/requests/components/request-type-card";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestHoaCard } from "@/features/requests/components/wizard/request-hoa-card";
import { useRequestWizard } from "@/features/requests/hooks/use-request-wizard";
import { useDraftDetailQuery } from "@/features/drafts/api/drafts.queries";
import {
  useActiveCategoriesQuery,
  useActiveCategoryFormQuery,
} from "@/features/categories/api/categories.queries";
import {
  saveWizardState,
  getWizardState,
  clearWizardState,
} from "@/features/requests/utils/request-storage";
import type {
  ActiveCategory,
  CategoryFormField,
} from "@/features/categories/types/categories.types";
import { requestTypes } from "@/lib/mock/request-types";

export default function RequestWizard() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { data: draft, isLoading: isLoadingDraft } = useDraftDetailQuery(draftId ?? undefined);

  const {
    data: categoriesResult,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useActiveCategoriesQuery();

  const [requestTypeId, setRequestTypeId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = getWizardState();
    return stored?.requestTypeId || null;
  });

  // Sync category ID if resuming from draft
  useEffect(() => {
    if (draft?.requestTypeId && !requestTypeId) {
      setRequestTypeId(draft.requestTypeId);
    }
  }, [draft, requestTypeId]);

  const activeTypeId = requestTypeId || draft?.requestTypeId || null;

  // Fetch live category form definition once a category is selected
  const {
    data: categoryFormData,
    isLoading: isLoadingCategoryForm,
    error: categoryFormError,
    refetch: refetchCategoryForm,
  } = useActiveCategoryFormQuery(activeTypeId);

  const categories = categoriesResult?.categories ?? [];

  // Fallback category metadata if found in categories list or static request types
  const selectedCategory: ActiveCategory | null =
    categoryFormData?.category ||
    categories.find((c) => c.id === activeTypeId) ||
    (activeTypeId
      ? (() => {
          const match = requestTypes.find((t) => t.id === activeTypeId);
          return match
            ? {
                id: match.id,
                name: match.name,
                description: match.description,
                status: "active" as const,
                currentVersion: 1,
              }
            : null;
        })()
      : null);

  if (draftId && isLoadingDraft) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  // 1. Category Selection View
  if (!activeTypeId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="New Request"
          description="Choose the type of architectural request you'd like to submit."
        />

        {isLoadingCategories && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="size-7 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoadingCategories && categoriesError && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load categories</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4 mt-2">
              <span>There was a problem loading active architectural categories.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCategories()}
                className="shrink-0"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingCategories && !categoriesError && categories.length === 0 && (
          <EmptyState
            icon={Layers}
            title="No Categories Available"
            description="There are currently no active request categories configured. Please check back later."
          />
        )}

        {!isLoadingCategories && !categoriesError && categories.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((cat) => (
              <RequestTypeCard
                key={cat.id}
                category={cat}
                onSelect={() => {
                  saveWizardState({
                    requestTypeId: cat.id,
                    stepIndex: 0,
                    fieldValues: {},
                  });
                  setRequestTypeId(cat.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Loading Form Definition
  if (isLoadingCategoryForm) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  // 3. Category Form Loading Error
  if (categoryFormError || !selectedCategory) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="New Request"
          description="Submit an architectural review request."
        />
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load request form</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>We encountered an issue loading the form questions for this category.</p>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearWizardState();
                  setRequestTypeId(null);
                }}
              >
                <ArrowLeft className="size-3.5 mr-1.5" />
                Choose Another Category
              </Button>
              <Button
                size="sm"
                onClick={() => refetchCategoryForm()}
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const dynamicFields: CategoryFormField[] = categoryFormData?.fields ?? [];

  return (
    <CategoryFormWizard
      key={selectedCategory.id}
      category={selectedCategory}
      dynamicFields={dynamicFields}
      initialDraft={draft}
      onChangeType={() => {
        clearWizardState();
        setRequestTypeId(null);
      }}
    />
  );
}

function CategoryFormWizard({
  category,
  dynamicFields,
  initialDraft,
  onChangeType,
}: {
  category: ActiveCategory;
  dynamicFields: CategoryFormField[];
  initialDraft?: RequestDraft | null;
  onChangeType: () => void;
}) {
  const {
    form,
    stepIndex,
    isReviewStep,
    currentStep,
    stepperSteps,
    commonFields,
    categoryFields,
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
    guardDialog,
    onSubmit,
  } = useRequestWizard(category, onChangeType, initialDraft, dynamicFields);

  const hoaError = form.formState.errors.hoaApproved;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title={category.name}
        description={category.description || "Submit an architectural review request."}
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

              {currentStep.fields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No additional information required for this step. Click &ldquo;Next&rdquo; to proceed.
                </div>
              ) : (
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
                        disabled={isPending || isSavingDraft}
                      />
                    </div>
                  ))}
                </div>
              )}
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

              <RequestReview
                commonFields={commonFields}
                categoryFields={categoryFields}
                values={form.getValues()}
              />

              <Controller
                name="hoaApproved"
                control={form.control}
                render={({ field: rhf }) => (
                  <RequestHoaCard
                    checked={rhf.value === true}
                    onCheckedChange={(checked) => rhf.onChange(checked)}
                    error={hoaError?.message as string | undefined}
                  />
                )}
              />
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSaveDraft({ redirect: true })}
                disabled={isSavingDraft || isPending}
              >
                {isSavingDraft ? (
                  <Spinner className="size-4" />
                ) : (
                  <Bookmark className="size-4 text-brand-navy dark:text-brand-gold mr-1" />
                )}
                Save as Draft
              </Button>

              {!isReviewStep ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending || !reviewReady}>
                  {isPending ? <Spinner className="size-4" /> : <Send className="size-4 mr-1" />}
                  Submit Request
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      <AlertDialog
        open={confirmingChangeCategory}
        onOpenChange={(open) => !open && cancelChangeCategory()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save in-progress request?</AlertDialogTitle>
            <AlertDialogDescription>
              You have entered information in this request. Would you like to save it to your drafts before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3">
            <AlertDialogCancel onClick={cancelChangeCategory}>
              Keep Editing
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
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

      {guardDialog}
    </div>
  );
}
