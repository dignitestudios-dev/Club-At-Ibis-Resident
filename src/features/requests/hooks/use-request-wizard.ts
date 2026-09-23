"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  saveWizardState,
  getWizardState,
  clearWizardState,
} from "@/features/requests/utils/request-storage";
import { useCreateRequestMutation } from "@/features/requests/api/requests.mutations";
import {
  useSaveDraftMutation,
  useDeleteDraftMutation,
} from "@/features/drafts/api/drafts.mutations";
import { baseProjectInfoFields } from "@/lib/mock/request-types";
import {
  buildCategoryFormSchema,
  defaultValuesForFields,
} from "@/features/requests/schemas/request-step.schema";
import type { ActiveCategory, CategoryFormField } from "@/features/categories/types/categories.types";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}

export function useRequestWizard(
  categoryOrType: ActiveCategory | RequestType,
  onChangeType: () => void,
  initialDraft?: RequestDraft | null,
  dynamicFields?: CategoryFormField[]
) {
  const router = useRouter();
  const user = useCurrentUser();
  const toast = useToast();
  const { mutate: createRequest, isPending } = useCreateRequestMutation();
  const { mutate: saveDraftMutate, isPending: isSavingDraft } = useSaveDraftMutation();
  const { mutate: deleteDraftMutate } = useDeleteDraftMutation();

  const [stepIndex, setStepIndex] = useState<number>(() => {
    if (typeof initialDraft?.stepIndex === "number") return initialDraft.stepIndex;
    const stored = getWizardState();
    if (stored && stored.requestTypeId === categoryOrType.id && typeof stored.stepIndex === "number") {
      return stored.stepIndex;
    }
    return 0;
  });

  const [currentDraftId, setCurrentDraftId] = useState<string | null>(initialDraft?.id ?? null);
  const [confirmingChangeCategory, setConfirmingChangeCategory] = useState(false);

  // 1. Partition dynamic fields into Step 1 (Common) and Step 2 (Category-Specific)
  const commonFields: FieldConfig[] = useMemo(() => {
    if (dynamicFields && dynamicFields.length > 0) {
      const comm = dynamicFields.filter((f) => f.source === "common");
      if (comm.length > 0) return comm;
    }
    if ("fields" in categoryOrType && Array.isArray(categoryOrType.fields)) {
      const comm = (categoryOrType.fields as CategoryFormField[]).filter((f) => f.source === "common");
      if (comm.length > 0) return comm;
    }
    // Fallback for legacy request type structure
    return [...baseProjectInfoFields, ...((categoryOrType as RequestType).additionalFields || [])];
  }, [categoryOrType, dynamicFields]);

  const categoryFields: FieldConfig[] = useMemo(() => {
    if (dynamicFields && dynamicFields.length > 0) {
      return dynamicFields.filter((f) => f.source === "category");
    }
    if ("fields" in categoryOrType && Array.isArray(categoryOrType.fields)) {
      return (categoryOrType.fields as CategoryFormField[]).filter((f) => f.source === "category");
    }
    return (categoryOrType as RequestType).documentFields || [];
  }, [categoryOrType, dynamicFields]);

  const allFields = useMemo(
    () => [...commonFields, ...categoryFields],
    [commonFields, categoryFields]
  );

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "project-info",
        title: "Project Information",
        description: "Tell us about the property and the proposed project.",
        fields: commonFields,
      },
      {
        id: "category-details",
        title: "Category Details",
        description: "Provide the category-specific information and required documents.",
        fields: categoryFields,
      },
    ],
    [commonFields, categoryFields]
  );

  const schema = useMemo(() => buildCategoryFormSchema(allFields), [allFields]);

  const initialFormValues = useMemo(() => {
    const defaults = defaultValuesForFields(allFields);
    if (initialDraft) {
      const merged: Record<string, unknown> = {
        ...defaults,
        ...initialDraft.fieldValues,
        hoaApproved: initialDraft.hoaApproved ?? false,
      };

      if (initialDraft.uploads) {
        for (const [key, files] of Object.entries(initialDraft.uploads)) {
          merged[key] = (files || []).map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            url: f.url,
          }));
        }
      }
      return merged;
    }

    const stored = getWizardState();
    if (stored && stored.requestTypeId === categoryOrType.id && stored.fieldValues) {
      return {
        ...defaults,
        ...stored.fieldValues,
      };
    }

    return defaults;
  }, [allFields, initialDraft, categoryOrType.id]);

  const form = useForm<Record<string, unknown>>({
    mode: "onChange",
    resolver: zodResolver(schema) as unknown as Resolver<Record<string, unknown>>,
    defaultValues: initialFormValues,
  });

  // Watch and auto-save form values into sessionStorage as the user types
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveWizardState({
        requestTypeId: categoryOrType.id,
        stepIndex,
        fieldValues: values as Record<string, unknown>,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, categoryOrType.id, stepIndex]);

  // Sync draft if loaded asynchronously
  useEffect(() => {
    if (initialDraft) {
      setCurrentDraftId(initialDraft.id);
      const defaults = defaultValuesForFields(allFields);
      const merged: Record<string, unknown> = {
        ...defaults,
        ...initialDraft.fieldValues,
        hoaApproved: initialDraft.hoaApproved ?? false,
      };

      if (initialDraft.uploads) {
        for (const [key, files] of Object.entries(initialDraft.uploads)) {
          merged[key] = (files || []).map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            url: f.url,
          }));
        }
      }
      form.reset(merged);
      if (typeof initialDraft.stepIndex === "number") {
        setStepIndex(initialDraft.stepIndex);
      }
    }
  }, [initialDraft, allFields, form]);

  const isReviewStep = stepIndex === steps.length;
  const currentStep = steps[stepIndex];
  const stepperSteps = [
    ...steps.map((s) => ({ id: s.id, title: s.title })),
    { id: "review", title: "Review & Submit" },
  ];

  const [reviewReady, setReviewReady] = useState(false);
  useEffect(() => {
    if (!isReviewStep) {
      setReviewReady(false);
      return;
    }
    const timer = setTimeout(() => setReviewReady(true), 200);
    return () => clearTimeout(timer);
  }, [isReviewStep]);

  function hasEnteredData() {
    const values = form.getValues();
    return allFields.some((field) => {
      const value = values[field.id];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    });
  }

  // Prevent accidental reload or link navigation when in-progress data exists
  const isDirty = hasEnteredData() || stepIndex > 0;
  const { dialog: guardDialog, allowLeave: guardAllowLeave } = useUnsavedChanges(isDirty);

  function extractPayload(targetStepIndex?: number): SaveDraftPayload {
    const residentId = user?.id || "res-1";
    const values = form.getValues();
    const fieldValues: Record<string, FieldValue> = {};
    const uploads: Record<string, UploadedFile[]> = {};

    for (const field of allFields) {
      const value = values[field.id];
      if (field.type === "file") {
        uploads[field.id] = ((value as (DropzoneFile | UploadedFile)[]) ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          uploadedAt: (f as UploadedFile).uploadedAt || new Date().toISOString(),
          url: (f as UploadedFile).url,
        }));
      } else if (value !== undefined) {
        fieldValues[field.id] = value as FieldValue;
      }
    }

    return {
      id: currentDraftId || undefined,
      residentId,
      requestTypeId: categoryOrType.id,
      fieldValues,
      uploads,
      stepIndex: targetStepIndex ?? stepIndex,
      hoaApproved: values.hoaApproved === true,
    };
  }

  function handleSaveDraft(options: { redirect?: boolean } = { redirect: true }) {
    const payload = extractPayload();
    saveDraftMutate(payload, {
      onSuccess: (saved) => {
        setCurrentDraftId(saved.id);
        clearWizardState();
        guardAllowLeave();
        toast.success("Progress saved to drafts.");
        if (options.redirect) {
          router.push("/drafts");
        }
      },
      onError: () => {
        toast.error("Failed to save draft.");
      },
    });
  }

  async function handleNext() {
    if (isReviewStep) return;
    const fieldIds = currentStep.fields.map((f) => f.id);
    const valid = fieldIds.length === 0 ? true : await form.trigger(fieldIds);
    if (valid) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      saveWizardState({
        requestTypeId: categoryOrType.id,
        stepIndex: nextIndex,
        fieldValues: form.getValues(),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Auto-save progress quietly in the background
      const payload = extractPayload(nextIndex);
      saveDraftMutate(payload, {
        onSuccess: (saved) => {
          setCurrentDraftId(saved.id);
        },
      });
    }
  }

  function handleBack() {
    if (stepIndex === 0) {
      if (hasEnteredData()) {
        setConfirmingChangeCategory(true);
        return;
      }
      clearWizardState();
      guardAllowLeave();
      onChangeType();
      return;
    }
    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
    saveWizardState({
      requestTypeId: categoryOrType.id,
      stepIndex: prevIndex,
      fieldValues: form.getValues(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confirmChangeCategory() {
    setConfirmingChangeCategory(false);
    clearWizardState();
    guardAllowLeave();
    onChangeType();
  }

  function saveDraftAndExit() {
    setConfirmingChangeCategory(false);
    handleSaveDraft({ redirect: true });
  }

  function handleSubmit(values: Record<string, unknown>) {
    const residentId = user?.id || "res-1";
    if (!isReviewStep) return;

    const fieldValues: Record<string, FieldValue> = {};
    const uploads: Record<string, UploadedFile[]> = {};

    for (const field of allFields) {
      const value = values[field.id];
      if (field.type === "file") {
        uploads[field.id] = ((value as DropzoneFile[]) ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          uploadedAt: new Date().toISOString(),
          url: f.url,
        }));
      } else {
        fieldValues[field.id] = value as FieldValue;
      }
    }

    createRequest(
      {
        residentId,
        requestTypeId: categoryOrType.id,
        fieldValues,
        uploads,
        hoaApproved: values.hoaApproved === true,
      },
      {
        onSuccess: (record) => {
          if (currentDraftId) {
            deleteDraftMutate(currentDraftId);
          }
          clearWizardState();
          guardAllowLeave();
          toast.success("Request submitted for ARB review.");
          router.push(`/requests/${record.id}`);
        },
        onError: () => {
          toast.error("Something went wrong submitting your request.");
        },
      }
    );
  }

  return {
    form,
    stepIndex,
    isReviewStep,
    currentStep,
    stepperSteps,
    commonFields,
    categoryFields,
    allFields,
    reviewReady,
    isPending,
    isSavingDraft,
    handleSaveDraft,
    handleNext,
    handleBack,
    confirmingChangeCategory,
    confirmChangeCategory,
    saveDraftAndExit,
    cancelChangeCategory: () => setConfirmingChangeCategory(false),
    guardDialog,
    guardAllowLeave,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
