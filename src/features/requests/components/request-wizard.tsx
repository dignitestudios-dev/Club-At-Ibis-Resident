"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileCheck2,
  Trash2,
} from "lucide-react";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { Stepper } from "@/features/requests/components/stepper";
import { DynamicField } from "@/features/requests/components/dynamic-field";
import { RequestTypeCard } from "@/features/requests/components/request-type-card";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestHoaCard } from "@/features/requests/components/wizard/request-hoa-card";
import {
  useRequestWizard,
  isCategoryArchivedError,
  isCategoryNotFoundError,
  isCategoryUnavailableError,
} from "@/features/requests/hooks/use-request-wizard";
import { useQueryClient } from "@tanstack/react-query";
import { useDraftDetailQuery } from "@/features/drafts/api/drafts.queries";
import { useDeleteDraftMutation } from "@/features/drafts/api/drafts.mutations";
import {
  useActiveCategoriesQuery,
  useActiveCategoryFormQuery,
} from "@/features/categories/api/categories.queries";
import { createDraftRequest } from "@/features/requests/api/requests.service";
import { useToast } from "@/hooks/use-toast";
import { clearWizardState } from "@/features/requests/utils/request-storage";
import type {
  ActiveCategory,
  CategoryFormField,
} from "@/features/categories/types/categories.types";
import { requestTypes } from "@/lib/mock/request-types";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function RequestWizard({ draftIdProp }: { draftIdProp?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const draftId = draftIdProp || searchParams.get("draftId");
  const { data: draft, isLoading: isLoadingDraft } = useDraftDetailQuery(draftId ?? undefined);

  const [createdDraft, setCreatedDraft] = useState<any>(null);
  const [initializingCategory, setInitializingCategory] = useState<ActiveCategory | null>(null);

  const effectiveDraft = draft || createdDraft;
  const effectiveDraftId = draftId || createdDraft?.id;

  const {
    data: categoriesResult,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useActiveCategoriesQuery();

  const [requestTypeId, setRequestTypeId] = useState<string | null>(null);

  // Clear any legacy storage on mount if starting fresh
  useEffect(() => {
    if (!draftId) {
      clearWizardState();
    }
  }, [draftId]);

  // Sync category ID if resuming from draft
  useEffect(() => {
    const catId = effectiveDraft?.categoryId || effectiveDraft?.requestTypeId;
    if (catId && !requestTypeId) {
      setRequestTypeId(catId);
    }
  }, [effectiveDraft, requestTypeId]);

  const activeTypeId = requestTypeId || effectiveDraft?.categoryId || effectiveDraft?.requestTypeId || null;

  // Fetch live category form definition once a category is selected
  const {
    data: categoryFormData,
    isLoading: isLoadingCategoryForm,
    error: categoryFormError,
    refetch: refetchCategoryForm,
  } = useActiveCategoryFormQuery(activeTypeId);

  const categories = categoriesResult?.categories ?? [];

  const isRedirectingRef = useRef(false);

  // Auto-redirect if active category form returns not found or archived
  useEffect(() => {
    if (categoryFormError && isCategoryUnavailableError(categoryFormError)) {
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;

      clearWizardState();
      // Remove this failing form query so it stops refetching
      if (activeTypeId) {
        queryClient.removeQueries({ queryKey: ["categories", "form", activeTypeId] });
      }
      queryClient.invalidateQueries({ queryKey: ["categories", "active"] });
      queryClient.refetchQueries({ queryKey: ["categories", "active"] });
      queryClient.invalidateQueries({ queryKey: ["drafts"] });

      const isArchived = isCategoryArchivedError(categoryFormError);
      const isNotFound = isCategoryNotFoundError(categoryFormError);

      const title = isArchived
        ? "Category Archived"
        : isNotFound
        ? "Category Not Found"
        : "Category Unavailable";

      const message =
        (categoryFormError as any)?.responseData?.message ||
        categoryFormError.message ||
        (isArchived
          ? "Archived categories cannot be submitted"
          : "Active category not found");

      // CATEGORY_ARCHIVED -> /requests/new
      // CATEGORY_NOT_FOUND -> /requests
      const destination = isArchived ? "/requests/new" : "/requests";

      toast.error(
        title,
        `${message}. Redirecting...`
      );

      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = destination;
        } else {
          router.replace(destination);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [categoryFormError, activeTypeId, queryClient, router, toast]);

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

  async function handleSelectCategory(cat: ActiveCategory) {
    setInitializingCategory(cat);
    try {
      const key = `create-draft-${cat.id}-${Date.now()}`;
      const newDraft = await createDraftRequest(
        {
          categoryId: cat.id,
          commonFormVersion: 1,
          categoryFormVersion: cat.currentVersion || 1,
        },
        key
      );
      queryClient.setQueryData(["drafts", "detail", newDraft.id], newDraft);
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      setCreatedDraft(newDraft as any);
      setRequestTypeId(cat.id);
      toast.success("Draft initialized", `Reference: ${newDraft.reference || newDraft.code}`);
      router.replace(`/requests/new?draftId=${newDraft.id}`);
    } catch (err: any) {
      if (isCategoryUnavailableError(err)) {
        clearWizardState();
        queryClient.removeQueries({ queryKey: ["categories", "form", cat.id] });
        queryClient.invalidateQueries({ queryKey: ["categories", "active"] });
        queryClient.refetchQueries({ queryKey: ["categories", "active"] });
        queryClient.invalidateQueries({ queryKey: ["drafts"] });

        const isArchived = isCategoryArchivedError(err);
        const isNotFound = isCategoryNotFoundError(err);
        const title = isArchived ? "Category Archived" : isNotFound ? "Category Not Found" : "Category Unavailable";
        const message =
          err?.responseData?.message ||
          err?.message ||
          (isArchived
            ? "Archived categories cannot be submitted"
            : "Active category not found");
        const destination = isArchived ? "/requests/new" : "/requests";

        toast.error(
          title,
          `${message}. Redirecting...`
        );
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = destination;
          } else {
            router.replace(destination);
          }
        }, 3000);
        return;
      }
      const message = err?.message || "Failed to initialize draft request. Please try again.";
      toast.error("Initialization Failed", message);
    } finally {
      setInitializingCategory(null);
    }
  }

  if (initializingCategory) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title="Initializing Request"
          description={`Setting up your draft workspace for ${initializingCategory.name}...`}
        />
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-2xs">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Spinner className="size-6 animate-spin" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="font-heading text-lg font-medium text-foreground">
              Initializing request for {initializingCategory.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generating your permanent ARB reference code and loading latest questions. You will be redirected immediately.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (draftId && isLoadingDraft) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  // Handle non-existent draft ID in route
  if (draftId && !isLoadingDraft && !draft) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title="Draft Not Found"
          description="The requested draft record could not be found."
        />
        <EmptyState
          icon={AlertCircle}
          title="Draft Not Found"
          description="This draft may have already been submitted, deleted, or you may not have permission to view it."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button nativeButton={false} render={<Link href="/requests" />} variant="outline">
                Back to All Requests
              </Button>
              <Button nativeButton={false} render={<Link href="/requests/new" />}>
                Start New Request
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // Handle already-submitted / non-draft requests accessed via new/draft route
  if (draft && draft.status && draft.status !== "draft") {
    const isUnderReview = draft.status === "submitted" || draft.status === "under_review" || draft.status === "resubmitted";
    const isChangesRequired = draft.status === "changes_required";
    const isClosed = ["approved", "rejected", "completed", "withdrawn"].includes(draft.status);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title={
            isUnderReview
              ? "Request is Under Review"
              : isChangesRequired
              ? "Changes Requested"
              : "Request Submission Finalized"
          }
          description="Submitted and processed requests cannot be edited from the submission wizard."
        />

        <Card className="p-6 sm:p-8 shadow-2xs border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div
              className={cn(
                "size-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs",
                isUnderReview && "bg-sky-50 dark:bg-sky-950/60 border-sky-200 text-sky-700 dark:text-sky-300",
                isChangesRequired && "bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-700 dark:text-amber-300",
                isClosed && "bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300"
              )}
              aria-hidden="true"
            >
              {isUnderReview ? (
                <Lock className="size-6 text-sky-600 dark:text-sky-400" />
              ) : isChangesRequired ? (
                <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <FileCheck2 className="size-6 text-slate-600 dark:text-slate-400" />
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {isUnderReview
                    ? "This request is locked and currently under review"
                    : isChangesRequired
                    ? "The Review Board has requested changes"
                    : "This request has already been finalized"}
                </h2>
                <StatusBadge status={draft.status} />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {isUnderReview
                  ? "Once a request is submitted or resubmitted, it is locked and cannot be edited. Your submission is currently in the hands of the Architectural Review Board (ARB). You will not be able to edit this request until the review board specifically requests changes or additional details."
                  : isChangesRequired
                  ? "The Review Board has reviewed your submission and flagged items that need modification. Please go to the Request Details page to view the reviewer's instructions and submit your revision."
                  : "This architectural request has already reached a finalized decision status and can no longer be modified."}
              </p>
            </div>
          </div>

          {/* Request Metadata Box */}
          <div className="rounded-xl border border-border/70 bg-slate-50/60 dark:bg-slate-900/40 p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <span className="text-muted-foreground block font-medium">Reference Code</span>
              <span className="font-mono font-semibold text-foreground text-sm">
                {draft.reference || draft.code || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block font-medium">Category</span>
              <span className="font-semibold text-foreground text-sm truncate block">
                {draft.categoryName || draft.title || "Architectural Request"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block font-medium">Property Address</span>
              <span className="font-medium text-foreground truncate block">
                {draft.propertyAddress || (draft.lotNo ? `Lot #${draft.lotNo}` : "—")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block font-medium">Last Updated</span>
              <span className="font-medium text-foreground">
                {formatDate(draft.updatedAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/70">
            <Button
              nativeButton={false}
              render={<Link href={`/requests/${draft.id}`} />}
              className="font-semibold shadow-xs"
            >
              {isChangesRequired ? "Revise Submission" : "View Request Details"}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/requests" />}
            >
              Back to All Requests
            </Button>
          </div>
        </Card>
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
                onSelect={() => handleSelectCategory(cat)}
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
    const isArchived = isCategoryArchivedError(categoryFormError) || (selectedCategory as any)?.status === "archived";
    const isNotFound = isCategoryNotFoundError(categoryFormError);
    const isArchivedOrNotFound = isArchived || isNotFound;

    const title = isArchived
      ? "Category Archived"
      : isNotFound
      ? "Category Not Found"
      : "Unable to load request form";

    const defaultMsg = isArchived
      ? "Archived categories cannot be submitted."
      : isNotFound
      ? "Active category not found."
      : "We encountered an issue loading the form questions for this category.";

    const errorMessage =
      (categoryFormError as any)?.responseData?.message ||
      categoryFormError?.message ||
      defaultMsg;

    const destination = isArchived ? "/requests/new" : "/requests";
    const destinationLabel = isArchived ? "New Request" : "My Requests";

    return (
      <div className="space-y-6">
        <PageHeader
          title="New Request"
          description="Submit an architectural review request."
        />
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertCircle className="size-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              {isArchivedOrNotFound
                ? `${errorMessage} You will be redirected to ${destinationLabel} shortly.`
                : errorMessage}
            </p>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearWizardState();
                  setRequestTypeId(null);
                  if (typeof window !== "undefined") {
                    window.location.href = destination;
                  } else {
                    router.replace(destination);
                  }
                }}
              >
                <ArrowLeft className="size-3.5 mr-1.5" />
                Go to {destinationLabel}
              </Button>
              {!isArchivedOrNotFound && (
                <Button
                  size="sm"
                  onClick={() => refetchCategoryForm()}
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  Retry
                </Button>
              )}
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
      initialDraft={effectiveDraft}
      onChangeType={() => {
        clearWizardState();
        setRequestTypeId(null);
        setCreatedDraft(null);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.refetchQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["drafts"] });
        if (typeof window !== "undefined") {
          window.location.href = "/requests/new";
        } else {
          router.replace("/requests/new");
        }
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
    hasUnsavedChanges,
    lastSavedAt,
    isStaleForm,
    reference,
    currentDraftId,
    handleMigrateForm,
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

  const router = useRouter();
  const toast = useToast();
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const { mutate: deleteDraftMutate, isPending: isDeletingDraft } = useDeleteDraftMutation();

  const handleDiscard = () => {
    if (!currentDraftId) return;
    deleteDraftMutate(currentDraftId, {
      onSuccess: () => {
        clearWizardState();
        toast.success("Draft discarded", "The draft has been permanently deleted.");
        router.push("/requests?tab=drafts");
      },
      onError: (err: any) => {
        toast.error("Failed to discard draft", err?.response?.data?.message || err?.message || "An unexpected error occurred.");
      },
    });
  };

  const hoaError = form.formState.errors.hoaApproved;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title={category.name}
          description={category.description || "Submit an architectural review request."}
        />
        {reference && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-border px-2.5 py-1 text-xs font-mono font-semibold text-foreground">
              {reference}
            </span>
            {isSavingDraft ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Spinner className="size-3" />
                Saving...
              </span>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="size-3.5" />
                  Unsaved changes
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveDraft({ redirect: false })}
                  disabled={isSavingDraft}
                  className="h-7 px-2.5 text-xs gap-1 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-amber-950/50"
                >
                  Save
                </Button>
              </div>
            ) : lastSavedAt ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                Saved
              </span>
            ) : null}

            {currentDraftId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDiscard(true)}
                disabled={isPending || isSavingDraft || isDeletingDraft}
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Discard this draft permanently"
              >
                <Trash2 className="size-3.5" />
                Discard
              </Button>
            )}
          </div>
        )}
      </div>

      {isStaleForm && (
        <Alert className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold">Category Form Updated</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              The administrator has updated the questions for this category. Upgrade your draft to load the latest questions without losing your answers.
            </span>
            <Button
              size="sm"
              onClick={handleMigrateForm}
              disabled={isPending}
              className="shrink-0"
            >
              {isPending ? <Spinner className="size-3.5 mr-1" /> : <RefreshCw className="size-3.5 mr-1" />}
              Upgrade Form
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Stepper steps={stepperSteps} currentIndex={stepIndex} />

      <form onSubmit={onSubmit}>
        <Card className="p-5 sm:p-6">
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
                        disabled={isPending}
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
        </Card>

        <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mt-6">
          <div className="border-t border-border/80 bg-[#F8FAFC] dark:bg-[#0D1522] px-4 sm:px-6 lg:px-8 py-4 ">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>

              <div className="flex items-center gap-2.5">
                {!isReviewStep ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    {isSavingDraft && (
                      <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md px-2.5 py-1 flex items-center gap-1.5 animate-pulse">
                        <Spinner className="size-3.5" />
                        Saving draft in progress... Submit will be enabled once saved.
                      </span>
                    )}
                    <Button
                      type="submit"
                      disabled={isPending || isSavingDraft || !reviewReady}
                    >
                      {isPending ? (
                        <Spinner className="size-4 mr-1" />
                      ) : isSavingDraft ? (
                        <Spinner className="size-4 mr-1" />
                      ) : (
                        <Send className="size-4 mr-1" />
                      )}
                      {isSavingDraft
                        ? "Saving Draft..."
                        : isPending
                        ? "Submitting..."
                        : "Submit Request"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

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

      <ConfirmDialog
        open={confirmingDiscard}
        onOpenChange={setConfirmingDiscard}
        title="Discard Draft Permanently?"
        description="Are you sure you want to discard this draft? This request and all uploaded documents will be permanently deleted and cannot be recovered."
        confirmLabel="Discard Permanently"
        destructive={true}
        loading={isDeletingDraft}
        onConfirm={handleDiscard}
      />
    </div>
  );
}
