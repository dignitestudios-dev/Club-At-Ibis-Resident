"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { clearWizardState } from "@/features/requests/utils/request-storage";
import {
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

export interface ParsedBackendErrors {
  fieldErrors: Record<string, string>;
  generalErrors: string[];
}

export function parseBackendErrors(err: any): ParsedBackendErrors {
  const fieldErrors: Record<string, string> = {};
  const generalErrors: string[] = [];

  const responseData = err?.responseData || err?.response?.data || err;
  const details = responseData?.details;
  const code = responseData?.code || err?.code;
  const mainMessage = responseData?.message || err?.message || "An unexpected error occurred.";

  if (Array.isArray(details)) {
    for (const issue of details) {
      if (typeof issue === "string") {
        generalErrors.push(issue);
      } else if (issue && typeof issue === "object") {
        const issueMsg = issue.message || mainMessage;
        let fieldId = issue.fieldId;

        if (!fieldId && typeof issue.path === "string") {
          const parts = issue.path.split(".");
          const lastPart = parts[parts.length - 1];
          if (lastPart === "hoaConfirmed") {
            fieldId = "hoaApproved";
          } else {
            fieldId = lastPart;
          }
        }

        if (fieldId) {
          if (fieldId === "hoaConfirmed") fieldId = "hoaApproved";
          fieldErrors[fieldId] = issueMsg;
        } else {
          generalErrors.push(issueMsg);
        }
      }
    }
  } else if (details && typeof details === "object") {
    if (code === "FORM_VERSION_STALE") {
      // Handled exclusively by the top Stale Form Upgrade banner
    } else if (code === "STALE_DRAFT_REVISION") {
      generalErrors.push("The draft was modified in another session. Synchronizing with latest version...");
    } else {
      generalErrors.push(mainMessage);
    }
  } else {
    if (code === "HOA_CONFIRMATION_REQUIRED") {
      fieldErrors["hoaApproved"] = "HOA approval confirmation is required before submission.";
    } else if (code === "TITLE_REQUIRED") {
      generalErrors.push("Request title is required.");
    } else if (code === "CATEGORY_ARCHIVED") {
      generalErrors.push("This category is archived and cannot be submitted.");
    } else if (code === "DEFAULT_REVIEWER_NOT_CONFIGURED") {
      generalErrors.push("No intake reviewer is currently configured. Please contact the administrator.");
    } else if (mainMessage) {
      generalErrors.push(mainMessage);
    }
  }

  const uniqueGeneralErrors = Array.from(new Set(generalErrors.filter(Boolean)));

  return {
    fieldErrors,
    generalErrors: uniqueGeneralErrors,
  };
}

export function isStaleFormError(err: any): boolean {
  const errCode = err?.responseData?.code || err?.response?.data?.code || err?.code;
  const errMsg = err?.responseData?.message || err?.response?.data?.message || err?.message || "";
  return (
    errCode === "FORM_VERSION_STALE" ||
    (typeof errMsg === "string" && (
      errMsg.includes("FORM_VERSION_STALE") ||
      errMsg.includes("form changed while this draft was being completed")
    ))
  );
}

function extractCurrentRevision(err: any): number | null {
  const details = err?.responseData?.details || err?.response?.data?.details;
  if (details && typeof details.currentDraftRevision === "number") {
    return details.currentDraftRevision;
  }
  return null;
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
  const queryClient = useQueryClient();

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
    return 0;
  });

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isStaleForm, setIsStaleForm] = useState(false);
  const [hasMigratedNotice, setHasMigratedNotice] = useState(false);
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

    return defaults;
  }, [allFields, initialDraft]);

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
  const currentDraftIdRef = useRef<string | null>(currentDraftId);
  currentDraftIdRef.current = currentDraftId;

  const draftRevisionRef = useRef(draftRevision);
  draftRevisionRef.current = draftRevision;

  const isSavingRef = useRef(false);
  const lastSavedSignatureRef = useRef<string>("");

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
      const targetStep =
        "stepIndex" in initialDraft && typeof initialDraft.stepIndex === "number"
          ? initialDraft.stepIndex
          : "currentStep" in initialDraft && typeof initialDraft.currentStep === "number"
          ? Math.max(0, initialDraft.currentStep - 1)
          : 0;
      setStepIndex(targetStep);

      const cleanVals: Record<string, FieldValue> = {};
      for (const f of allFields) {
        const v = merged[f.id];
        if (f.type !== "file" && v !== undefined && v !== null) {
          if (typeof v === "string") cleanVals[f.id] = v;
          else if (Array.isArray(v)) cleanVals[f.id] = v.map(String);
          else cleanVals[f.id] = String(v);
        }
      }
      lastSavedSignatureRef.current = JSON.stringify({
        fieldValues: cleanVals,
        uploads: initialDraft.uploads || {},
        currentStep: targetStep + 1,
        hoaApproved: merged.hoaApproved === true,
        hoaConfirmed: merged.hoaApproved === true,
      });
      setHasUnsavedChanges(false);
    }
  }, [initialDraft, allFields, form]);

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
          if (isStaleFormError(err)) {
            throw err;
          }
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
        if (isStaleFormError(err)) {
          setIsStaleForm(true);
          toast.error(
            "Category Form Updated",
            "The category form was updated by an administrator. Please upgrade your draft to proceed."
          );
        } else {
          const errCode = err?.responseData?.code || err?.response?.data?.code || err?.code;
          const errMsg = err?.responseData?.message || err?.response?.data?.message || err?.message || "";
          if (errCode === "STALE_DRAFT_REVISION" || errMsg.includes("STALE_DRAFT_REVISION")) {
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
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);

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
  }, [form, triggerAutosave]);

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
        if (isStaleFormError(err)) {
          throw err;
        }
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
      toast.success("Draft saved successfully.");
      if (options.redirect) {
        clearWizardState();
        guardAllowLeave();
        router.push("/drafts");
      }
    } catch (err: any) {
      if (isStaleFormError(err)) {
        setIsStaleForm(true);
        toast.error(
          "Category Form Updated",
          "The category form was updated by an administrator. Please upgrade your draft to proceed."
        );
      } else {
        toast.error("Failed to save draft.");
      }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    triggerAutosave(prevIndex);
  }

  function handleMigrateForm() {
    const draftId = currentDraftIdRef.current;
    if (!draftId) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

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
            setSubmissionErrors([]);
            setHasMigratedNotice(true);

            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["drafts"] });
            queryClient.invalidateQueries({ queryKey: ["requests"] });

            const newFields: FieldConfig[] =
              migrated.form?.fields && migrated.form.fields.length > 0
                ? migrated.form.fields
                : dynamicFields || [];

            const defaults = defaultValuesForFields(newFields);
            const merged: Record<string, unknown> = {
              ...defaults,
              ...(migrated.fieldValues || {}),
              hoaApproved: migrated.hoaApproved ?? false,
            };

            if (migrated.uploads) {
              for (const [key, files] of Object.entries(migrated.uploads)) {
                merged[key] = (files || []).map((f) => ({
                  id: f.id,
                  name: f.name,
                  size: f.size,
                  url: f.url,
                }));
              }
            }

            form.reset(merged);

            // Redirect user to the Category Details dynamic form (stepIndex = 1)
            const targetStepIdx = newFields.length > 0 || categoryFields.length > 0 ? 1 : 0;
            setStepIndex(targetStepIdx);
            window.scrollTo({ top: 0, behavior: "smooth" });

            const cleanFieldValues: Record<string, FieldValue> = {};
            for (const f of newFields) {
              const val = merged[f.id];
              if (f.type !== "file" && val !== undefined && val !== null) {
                if (typeof val === "string") cleanFieldValues[f.id] = val;
                else if (Array.isArray(val)) cleanFieldValues[f.id] = val.map(String);
                else cleanFieldValues[f.id] = String(val);
              }
            }

            const signaturePayload = {
              fieldValues: cleanFieldValues,
              uploads: migrated.uploads || {},
              currentStep: targetStepIdx + 1,
              hoaApproved: merged.hoaApproved === true,
              hoaConfirmed: merged.hoaApproved === true,
            };
            lastSavedSignatureRef.current = JSON.stringify(signaturePayload);
            setHasUnsavedChanges(false);

            toast.info(
              "Form upgraded to latest version",
              "Please review the updated category fields below and update your responses accordingly before submitting."
            );
          },
          onError: (err: any) => {
            const remoteRev = extractCurrentRevision(err);
            if (remoteRev !== null && remoteRev !== rev) {
              draftRevisionRef.current = remoteRev;
              setDraftRevision(remoteRev);
              performMigrate(remoteRev);
              return;
            }
            toast.error("Failed to upgrade form", err?.message || "Please try again.");
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

  const isSubmittingRef = useRef(false);

  async function handleSubmit(values: Record<string, unknown>) {
    if (!isReviewStep || isSubmittingRef.current || isPending) return;

    // 1. Client-side full form validation
    const isValid = await form.trigger();
    if (!isValid) {
      const formErrors = form.formState.errors;
      const errorFieldIds = Object.keys(formErrors);

      const inCommon = commonFields.some((f) => errorFieldIds.includes(f.id));
      const inCategory = categoryFields.some((f) => errorFieldIds.includes(f.id));

      if (inCommon && stepIndex !== 0) {
        setStepIndex(0);
        toast.error("Validation error", "Please complete the required project information.");
        return;
      }
      if (inCategory && stepIndex !== 1) {
        setStepIndex(1);
        toast.error("Validation error", "Please complete the required category details.");
        return;
      }
      toast.error("Validation error", "Please resolve the highlighted errors before submitting.");
      return;
    }

    if (values.hoaApproved !== true) {
      form.setError("hoaApproved", { message: "HOA confirmation is required before submission." });
      toast.error("Validation error", "You must confirm HOA approval before submitting.");
      return;
    }

    const draftId = currentDraftIdRef.current;
    if (!draftId) {
      toast.error("Draft is initializing, please try again in a moment.");
      return;
    }

    // 2. Clear any pending debounced autosave timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionErrors([]);

    // 3. Silently save draft in background before submitting
    let currentRevision = draftRevisionRef.current;
    const payload = extractPayload();
    try {
      const saved = await autosaveDraft(draftId, {
        expectedDraftRevision: currentRevision,
        currentStep: payload.currentStep,
        fieldValues: payload.fieldValues,
      });
      currentRevision = saved.draftRevision ?? currentRevision + 1;
      setDraftRevision(currentRevision);
      draftRevisionRef.current = currentRevision;
      lastSavedSignatureRef.current = JSON.stringify(payload);
    } catch (err: any) {
      if (isStaleFormError(err)) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setIsStaleForm(true);
        toast.error(
          "Category Form Updated",
          "The category form was updated by an administrator. Please upgrade your draft to proceed."
        );
        return;
      }
      const remoteRev = extractCurrentRevision(err);
      if (remoteRev !== null) {
        currentRevision = remoteRev;
        draftRevisionRef.current = remoteRev;
        setDraftRevision(remoteRev);
        try {
          const saved = await autosaveDraft(draftId, {
            expectedDraftRevision: remoteRev,
            currentStep: payload.currentStep,
            fieldValues: payload.fieldValues,
          });
          currentRevision = saved.draftRevision ?? remoteRev + 1;
          setDraftRevision(currentRevision);
          draftRevisionRef.current = currentRevision;
        } catch (innerErr: any) {
          if (isStaleFormError(innerErr)) {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            setIsStaleForm(true);
            toast.error(
              "Category Form Updated",
              "The category form was updated by an administrator. Please upgrade your draft to proceed."
            );
            return;
          }
          // Proceed with submission attempt
        }
      }
    }

    // 4. Submit draft
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
            isSubmittingRef.current = false;
            setIsSubmitting(false);
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
            isSubmittingRef.current = false;
            setIsSubmitting(false);

            const { fieldErrors, generalErrors } = parseBackendErrors(err);

            // Apply field errors to React Hook Form
            for (const [fId, msg] of Object.entries(fieldErrors)) {
              form.setError(fId as any, {
                type: "server",
                message: msg,
              });
            }

            const isVersionStale = isStaleFormError(err);
            if (isVersionStale) {
              setIsStaleForm(true);
            }

            // Collect all messages for the review banner summary (excluding stale form version, which is shown once in the upgrade banner)
            const allMessages: string[] = [
              ...Object.values(fieldErrors),
              ...generalErrors.filter(
                (g) =>
                  !g.toLowerCase().includes("version") &&
                  !g.toLowerCase().includes("form changed")
              ),
            ];
            setSubmissionErrors(allMessages);

            const primaryMessage = isVersionStale
              ? "The category form was updated by an administrator. Please upgrade your draft to proceed."
              : generalErrors[0] || Object.values(fieldErrors)[0] || err?.message || "Submission failed.";
            toast.error(isVersionStale ? "Category Form Updated" : "Submission failed", primaryMessage);
          },
        }
      );
    };

    performSubmit(currentRevision);
  }

  const isPending = submitRequestMutate.isPending || migrateDraftMutate.isPending || isSubmitting;

  return {
    form,
    stepIndex,
    setStepIndex,
    isReviewStep,
    currentStep,
    stepperSteps,
    commonFields,
    categoryFields,
    allFields,
    reviewReady,
    isPending,
    isSubmitting,
    submissionErrors,
    clearSubmissionErrors: () => setSubmissionErrors([]),
    isSavingDraft,
    hasUnsavedChanges,
    lastSavedAt,
    isStaleForm,
    hasMigratedNotice,
    dismissMigratedNotice: () => setHasMigratedNotice(false),
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
