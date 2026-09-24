"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import {
  createDraftRequest,
  autosaveDraft,
} from "@/features/requests/api/requests.service";
import {
  useMigrateDraftFormMutation,
  useSubmitRequestMutation,
} from "@/features/requests/api/requests.mutations";
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
  initialDraft?: RequestDraft | RequestRecord | null,
  dynamicFields?: CategoryFormField[]
) {
  const router = useRouter();
  const user = useCurrentUser();
  const toast = useToast();

  const migrateDraftMutate = useMigrateDraftFormMutation();
  const submitRequestMutate = useSubmitRequestMutation();

  const [currentDraftId, setCurrentDraftId] = useState<string | null>(initialDraft?.id ?? null);
  const [draftRevision, setDraftRevision] = useState<number>(() => {
    if (initialDraft && "draftRevision" in initialDraft && typeof initialDraft.draftRevision === "number") {
      return initialDraft.draftRevision;
    }
    return 0;
  });
  const [reference, setReference] = useState<string | null>(() => {
    if (initialDraft && "reference" in initialDraft && initialDraft.reference) {
      return initialDraft.reference;
    }
    if (initialDraft && "code" in initialDraft && initialDraft.code) {
      return initialDraft.code;
    }
    return null;
  });

  const [stepIndex, setStepIndex] = useState<number>(() => {
    if (initialDraft) {
      if ("stepIndex" in initialDraft && typeof initialDraft.stepIndex === "number") {
        return initialDraft.stepIndex;
      }
      if ("currentStep" in initialDraft && typeof initialDraft.currentStep === "number") {
        return Math.max(0, initialDraft.currentStep - 1);
      }
    }
    const stored = getWizardState();
    if (stored && stored.requestTypeId === categoryOrType.id && typeof stored.stepIndex === "number") {
      return stored.stepIndex;
    }
    return 0;
  });

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isStaleForm, setIsStaleForm] = useState(false);
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

  // Extract structured values and uploads for autosave or submit
  const extractPayload = useCallback(
    (targetStepIndex?: number) => {
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
        } else if (value !== undefined && value !== null) {
          if (typeof value === "string") {
            fieldValues[field.id] = value;
          } else if (Array.isArray(value)) {
            fieldValues[field.id] = value.map(String);
          } else {
            fieldValues[field.id] = String(value);
          }
        }
      }

      return {
        fieldValues,
        uploads,
        currentStep: (targetStepIndex ?? stepIndex) + 1,
        hoaApproved: values.hoaApproved === true,
        hoaConfirmed: values.hoaApproved === true,
      };
    },
    [allFields, form, stepIndex]
  );

  // Synchronous refs to prevent duplicate calls and loops
  const draftInitializingRef = useRef(false);
  const currentDraftIdRef = useRef<string | null>(currentDraftId);
  currentDraftIdRef.current = currentDraftId;

  const draftRevisionRef = useRef(draftRevision);
  draftRevisionRef.current = draftRevision;

  const isSavingRef = useRef(false);
  const lastSavedSignatureRef = useRef<string>("");

  // Initialize draft once if entering fresh
  useEffect(() => {
    if (!currentDraftIdRef.current && categoryOrType.id && !initialDraft && !draftInitializingRef.current) {
      draftInitializingRef.current = true;
      const idempotencyKey = `draft-init-${categoryOrType.id}-${Date.now()}`;
      createDraftRequest(
        {
          categoryId: categoryOrType.id,
          commonFormVersion: 1,
          categoryFormVersion: (categoryOrType as ActiveCategory).currentVersion ?? 1,
        },
        idempotencyKey
      )
        .then((record) => {
          setCurrentDraftId(record.id);
          currentDraftIdRef.current = record.id;
          setDraftRevision(record.draftRevision ?? 0);
          draftRevisionRef.current = record.draftRevision ?? 0;
          setReference(record.reference || record.code || null);
        })
        .catch((err) => {
          console.error("Failed to initialize draft request:", err);
          draftInitializingRef.current = false;
        });
    }
  }, [categoryOrType.id, initialDraft]);

  // Sync draft if loaded asynchronously from query
  useEffect(() => {
    if (initialDraft) {
      setCurrentDraftId(initialDraft.id);
      currentDraftIdRef.current = initialDraft.id;
      if ("draftRevision" in initialDraft && typeof initialDraft.draftRevision === "number") {
        setDraftRevision(initialDraft.draftRevision);
        draftRevisionRef.current = initialDraft.draftRevision;
      }
      if ("reference" in initialDraft && initialDraft.reference) {
        setReference(initialDraft.reference);
      } else if ("code" in initialDraft && initialDraft.code) {
        setReference(initialDraft.code);
      }
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
      if ("stepIndex" in initialDraft && typeof initialDraft.stepIndex === "number") {
        setStepIndex(initialDraft.stepIndex);
      } else if ("currentStep" in initialDraft && typeof initialDraft.currentStep === "number") {
        setStepIndex(Math.max(0, initialDraft.currentStep - 1));
      }
    }
  }, [initialDraft, allFields, form]);

function extractCurrentRevision(err: any): number | null {
  const details = err?.responseData?.details || err?.response?.data?.details;
  if (details && typeof details.currentDraftRevision === "number") {
    return details.currentDraftRevision;
  }
  return null;
}

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(
    async (targetStepIndex?: number) => {
      const draftId = currentDraftIdRef.current;
      if (!draftId || isSavingRef.current) return;

      const payload = extractPayload(targetStepIndex);
      const signature = JSON.stringify(payload);
      if (signature === lastSavedSignatureRef.current) {
        return; // Nothing changed, skip redundant network call
      }

      try {
        isSavingRef.current = true;
        setIsSavingDraft(true);
        let saved: RequestRecord;
        try {
          saved = await autosaveDraft(draftId, {
            expectedDraftRevision: draftRevisionRef.current,
            currentStep: payload.currentStep,
            fieldValues: payload.fieldValues,
          });
        } catch (err: any) {
          const remoteRev = extractCurrentRevision(err);
          if (remoteRev !== null) {
            draftRevisionRef.current = remoteRev;
            setDraftRevision(remoteRev);
            // Auto-retry with the server's current draft revision
            saved = await autosaveDraft(draftId, {
              expectedDraftRevision: remoteRev,
              currentStep: payload.currentStep,
              fieldValues: payload.fieldValues,
            });
          } else {
            throw err;
          }
        }

        const nextRev = saved.draftRevision ?? draftRevisionRef.current + 1;
        setDraftRevision(nextRev);
        draftRevisionRef.current = nextRev;
        lastSavedSignatureRef.current = signature;
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
        setIsStaleForm(false);
      } catch (err: any) {
        const message = err?.message || "";
        if (message.includes("FORM_VERSION_STALE") || err?.statusCode === 409 || err?.response?.status === 409) {
          if (message.includes("FORM_VERSION_STALE")) {
            setIsStaleForm(true);
          } else if (message.includes("STALE_DRAFT_REVISION")) {
            const remoteRev = extractCurrentRevision(err);
            if (remoteRev !== null) {
              draftRevisionRef.current = remoteRev;
              setDraftRevision(remoteRev);
            }
            toast.warning("Draft was synced with latest server version.");
          }
        }
      } finally {
        isSavingRef.current = false;
        setIsSavingDraft(false);
      }
    },
    [extractPayload, toast]
  );

  // Debounced autosave on field changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      setHasUnsavedChanges(true);
      saveWizardState({
        requestTypeId: categoryOrType.id,
        stepIndex,
        fieldValues: values as Record<string, unknown>,
      });

      if (currentDraftIdRef.current) {
        if (autosaveTimerRef.current) {
          clearTimeout(autosaveTimerRef.current);
        }
        autosaveTimerRef.current = setTimeout(() => {
          triggerAutosave();
        }, 1500);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [form, categoryOrType.id, stepIndex, triggerAutosave]);

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

  // Prevent accidental reload or link navigation when in-progress unsaved data exists
  const { dialog: guardDialog, allowLeave: guardAllowLeave } = useUnsavedChanges(
    hasUnsavedChanges || isSavingDraft
  );

  async function handleSaveDraft(options: { redirect?: boolean } = { redirect: true }) {
    const draftId = currentDraftIdRef.current;
    if (!draftId) {
      toast.error("Draft is initializing, please try again in a moment.");
      return;
    }

    const payload = extractPayload();
    try {
      setIsSavingDraft(true);
      let saved: RequestRecord;
      try {
        saved = await autosaveDraft(draftId, {
          expectedDraftRevision: draftRevisionRef.current,
          currentStep: payload.currentStep,
          fieldValues: payload.fieldValues,
        });
      } catch (err: any) {
        const remoteRev = extractCurrentRevision(err);
        if (remoteRev !== null) {
          draftRevisionRef.current = remoteRev;
          setDraftRevision(remoteRev);
          saved = await autosaveDraft(draftId, {
            expectedDraftRevision: remoteRev,
            currentStep: payload.currentStep,
            fieldValues: payload.fieldValues,
          });
        } else {
          throw err;
        }
      }

      const nextRev = saved.draftRevision ?? draftRevisionRef.current + 1;
      setDraftRevision(nextRev);
      draftRevisionRef.current = nextRev;
      lastSavedSignatureRef.current = JSON.stringify(payload);
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      saveWizardState({
        requestTypeId: categoryOrType.id,
        stepIndex,
        fieldValues: form.getValues(),
      });
      toast.success("Draft saved successfully.");
      if (options.redirect) {
        clearWizardState();
        guardAllowLeave();
        router.push("/drafts");
      }
    } catch {
      toast.error("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
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
      triggerAutosave(nextIndex);
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
    triggerAutosave(prevIndex);
  }

  function handleMigrateForm() {
    const draftId = currentDraftIdRef.current;
    if (!draftId) return;
    const performMigrate = (rev: number) => {
      migrateDraftMutate.mutate(
        {
          id: draftId,
          expectedDraftRevision: rev,
        },
        {
          onSuccess: (migrated) => {
            const nextRev = migrated.draftRevision ?? rev + 1;
            setDraftRevision(nextRev);
            draftRevisionRef.current = nextRev;
            setIsStaleForm(false);
            toast.success("Form upgraded to latest category version.");
          },
          onError: (err: any) => {
            const remoteRev = extractCurrentRevision(err);
            if (remoteRev !== null && remoteRev !== rev) {
              draftRevisionRef.current = remoteRev;
              setDraftRevision(remoteRev);
              performMigrate(remoteRev);
              return;
            }
            toast.error("Failed to migrate draft form.");
          },
        }
      );
    };

    performMigrate(draftRevisionRef.current);
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
    if (!isReviewStep) return;
    const draftId = currentDraftIdRef.current;
    if (!draftId) {
      toast.error("Draft is initializing, please try again in a moment.");
      return;
    }
    if (values.hoaApproved !== true) {
      form.setError("hoaApproved", { message: "HOA confirmation is required before submission." });
      return;
    }

    const performSubmit = (rev: number) => {
      const idempotencyKey = `submit-${draftId}-${Date.now()}`;
      submitRequestMutate.mutate(
        {
          id: draftId,
          payload: {
            expectedDraftRevision: rev,
            hoaConfirmed: true,
            hoaApproved: true,
          },
          idempotencyKey,
        },
        {
          onSuccess: (record) => {
            clearWizardState();
            guardAllowLeave();
            toast.success(
              "Request submitted for ARB review.",
              `Your permanent reference number is ${record.reference || record.code}.`
            );
            router.push(`/requests/${record.id}`);
          },
          onError: (err: any) => {
            const remoteRev = extractCurrentRevision(err);
            if (remoteRev !== null && remoteRev !== rev) {
              draftRevisionRef.current = remoteRev;
              setDraftRevision(remoteRev);
              // Auto-retry once with the remote revision
              performSubmit(remoteRev);
              return;
            }
            const message = err?.message || "Something went wrong submitting your request.";
            toast.error("Submission failed", message);
          },
        }
      );
    };

    performSubmit(draftRevisionRef.current);
  }

  const isPending = submitRequestMutate.isPending || migrateDraftMutate.isPending;

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
    cancelChangeCategory: () => setConfirmingChangeCategory(false),
    guardDialog,
    guardAllowLeave,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
