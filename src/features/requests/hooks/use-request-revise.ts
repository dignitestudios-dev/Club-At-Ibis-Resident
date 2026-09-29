"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { applyCommonFieldRules } from "@/features/requests/config/common-form-fields";
import { buildStepSchema } from "@/features/requests/schemas/request-step.schema";
import { updateRequestRevision, resubmitRequestRevision } from "@/features/requests/api/requests.service";

/** Comparable, order/type-insensitive form of a field value — mirrors the backend's own `JSON.stringify(...) === JSON.stringify(...)` unchanged-check in review.service.js. */
function normalizeForComparison(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map(String));
  if (value === undefined || value === null) return "";
  return String(value);
}

export interface RevisionWizardStep {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}

function extractConcurrencyVersions(err: any): { workflowVersion?: number; revisionVersion?: number } {
  const details = err?.responseData?.details;
  if (!details || typeof details !== "object") return {};
  return {
    workflowVersion: typeof details.currentWorkflowVersion === "number" ? details.currentWorkflowVersion : undefined,
    revisionVersion: typeof details.currentRevisionVersion === "number" ? details.currentRevisionVersion : undefined,
  };
}

function isConcurrencyError(err: any): boolean {
  const code = err?.code || err?.responseData?.code;
  return code === "STALE_WORKFLOW_VERSION" || code === "STALE_REVISION_VERSION";
}

/**
 * Drives the "revise a changes_required request" wizard. Unlike the
 * create/draft wizard, the field set comes from the request's own frozen
 * `form.fields` snapshot (not the live category definition) and only the
 * fields the reviewer flagged — `request.revision.items` — are ever
 * editable or validated; everything else is displayed read-only with its
 * original answer preserved.
 */
export function useRequestRevise(request: RequestRecord) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const allFields: FieldConfig[] = useMemo(() => {
    const raw =
      request.form?.fields && request.form.fields.length > 0
        ? request.form.fields
        : request.formSnapshot ?? [];
    return raw.map((f) => (f.source === "common" ? applyCommonFieldRules(f) : f));
  }, [request.form?.fields, request.formSnapshot]);

  // Same 4-step shape as the create-request wizard: documents get their own
  // step instead of sitting inside whichever of Project Info/Category
  // Details they happened to belong to.
  const commonFields = useMemo(() => allFields.filter((f) => f.source === "common" && f.type !== "file"), [allFields]);
  const categoryFields = useMemo(() => allFields.filter((f) => f.source === "category" && f.type !== "file"), [allFields]);
  const documentFields = useMemo(() => allFields.filter((f) => f.type === "file"), [allFields]);

  const flagsByField = useMemo(
    () => new Map((request.revision?.items ?? []).map((item) => [item.fieldId, item.reason])),
    [request.revision]
  );
  const flaggedFields = useMemo(
    () => allFields.filter((field) => flagsByField.has(field.id)),
    [allFields, flagsByField]
  );
  // The backend has no file-correction workflow yet (FILE_WORKFLOW_DEFERRED),
  // so a flagged file field can be shown with its flag but never made editable.
  const editableFlaggedFields = useMemo(
    () => flaggedFields.filter((f) => f.type !== "file"),
    [flaggedFields]
  );

  const steps: RevisionWizardStep[] = useMemo(
    () => [
      {
        id: "project-info",
        title: "Project Information",
        description: "Only the fields flagged by the ARB below can be edited.",
        fields: commonFields,
      },
      {
        id: "category-details",
        title: "Category Details",
        description: "Only the fields flagged by the ARB below can be edited.",
        fields: categoryFields,
      },
      {
        id: "documents",
        title: "Documents",
        description: "Document corrections aren't supported yet — contact the ARB office if a flagged file needs to be replaced.",
        fields: documentFields,
      },
    ],
    [commonFields, categoryFields, documentFields]
  );

  // The reviewer flagged these fields specifically because they need to
  // change — the backend rejects a resubmit if a flagged field's value still
  // matches the original submission (FLAGGED_FIELD_UNCHANGED). Checking it
  // here too means the resident sees the error inline, before ever hitting
  // Next/Resubmit, instead of only after a round trip to the server.
  const schema = useMemo(() => {
    const base = buildStepSchema(editableFlaggedFields);
    return base.superRefine((values, ctx) => {
      for (const field of editableFlaggedFields) {
        const current = normalizeForComparison(values[field.id]);
        const original = normalizeForComparison(request.fieldValues[field.id]);
        if (current === original) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field.id],
            message: `${field.label} must be corrected before resubmitting.`,
          });
        }
      }
    });
  }, [editableFlaggedFields, request.fieldValues]);

  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const field of allFields) {
      if (field.type === "file") {
        values[field.id] = (request.uploads?.[field.id] ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          url: f.url,
        }));
      } else if (field.type === "checkbox") {
        values[field.id] = request.fieldValues[field.id] ?? [];
      } else {
        values[field.id] = request.fieldValues[field.id] ?? "";
      }
    }
    return values;
  }, [allFields, request.fieldValues, request.uploads]);

  const form = useForm<Record<string, unknown>>({
    mode: "onChange",
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  // Land the resident directly on whichever step holds the first flagged
  // field (in form order), not always Project Information — if everything
  // flagged is in Category Details, starting on an all-locked step one
  // click away from the actual work just adds a hop.
  const [stepIndex, setStepIndex] = useState(() => {
    const firstFlagged = allFields.find((field) => flagsByField.has(field.id));
    if (!firstFlagged) return 0;
    if (firstFlagged.type === "file") return 2;
    return firstFlagged.source === "category" ? 1 : 0;
  });
  const isReviewStep = stepIndex === steps.length;
  const currentStep = steps[stepIndex];
  const stepperSteps = [...steps.map((s) => ({ id: s.id, title: s.title })), { id: "review", title: "Review & Resubmit" }];

  // The Resubmit button sits in the exact same spot the Next button just
  // occupied, so a click meant for "Next" can land on "Resubmit" the instant
  // the step swaps in underneath it and fire an unintended resubmission.
  // Keeping Resubmit disabled for a beat after arrival (same guard the
  // create-request wizard uses for its Submit button) forces a deliberate,
  // separate click before anything is actually sent.
  const [reviewReady, setReviewReady] = useState(false);
  useEffect(() => {
    if (!isReviewStep) {
      setReviewReady(false);
      return;
    }
    const timer = setTimeout(() => setReviewReady(true), 400);
    return () => clearTimeout(timer);
  }, [isReviewStep]);

  const [workflowVersion, setWorkflowVersion] = useState(request.workflowVersion ?? 0);
  const [revisionVersion, setRevisionVersion] = useState(request.revision?.revisionVersion ?? 0);
  const workflowVersionRef = useRef(workflowVersion);
  workflowVersionRef.current = workflowVersion;
  const revisionVersionRef = useRef(revisionVersion);
  revisionVersionRef.current = revisionVersion;

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);

  const isSavingRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const lastSavedSignatureRef = useRef("");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const applyUpdatedRecord = useCallback(
    (updated: RequestRecord) => {
      setWorkflowVersion(updated.workflowVersion ?? workflowVersionRef.current);
      setRevisionVersion(updated.revision?.revisionVersion ?? 0);
      queryClient.setQueryData(["requests", "detail", request.id], updated);
    },
    [queryClient, request.id]
  );

  const extractFlaggedValues = useCallback((): Record<string, FieldValue> => {
    const values = form.getValues();
    const out: Record<string, FieldValue> = {};
    for (const field of editableFlaggedFields) {
      const value = values[field.id];
      if (Array.isArray(value)) out[field.id] = value.map(String);
      else if (value === undefined || value === null) out[field.id] = "";
      else out[field.id] = String(value);
    }
    return out;
  }, [editableFlaggedFields, form]);

  const triggerAutosave = useCallback(async () => {
    if (isSavingRef.current || editableFlaggedFields.length === 0) return;
    const fieldValues = extractFlaggedValues();
    const signature = JSON.stringify(fieldValues);
    if (signature === lastSavedSignatureRef.current) return;

    try {
      isSavingRef.current = true;
      setIsSavingDraft(true);
      let saved: RequestRecord;
      try {
        saved = await updateRequestRevision(request.id, {
          expectedWorkflowVersion: workflowVersionRef.current,
          expectedRevisionVersion: revisionVersionRef.current,
          fieldValues,
        });
      } catch (err: any) {
        if (!isConcurrencyError(err)) throw err;
        const { workflowVersion: wv, revisionVersion: rv } = extractConcurrencyVersions(err);
        if (wv !== undefined) setWorkflowVersion(wv);
        if (rv !== undefined) setRevisionVersion(rv);
        if (wv !== undefined) workflowVersionRef.current = wv;
        if (rv !== undefined) revisionVersionRef.current = rv;
        saved = await updateRequestRevision(request.id, {
          expectedWorkflowVersion: workflowVersionRef.current,
          expectedRevisionVersion: revisionVersionRef.current,
          fieldValues,
        });
      }
      applyUpdatedRecord(saved);
      lastSavedSignatureRef.current = signature;
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (err: any) {
      toast.error("Failed to save your corrections.", err?.responseData?.message || err?.message);
    } finally {
      isSavingRef.current = false;
      setIsSavingDraft(false);
    }
  }, [applyUpdatedRecord, editableFlaggedFields.length, extractFlaggedValues, request.id, toast]);

  // Debounced autosave on field changes, mirroring the create-request wizard.
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        triggerAutosave();
      }, 1500);
    });
    return () => {
      subscription.unsubscribe();
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [form, triggerAutosave]);

  async function handleNext() {
    if (isReviewStep) return;
    const fieldIds = currentStep.fields.map((f) => f.id);
    const valid = fieldIds.length === 0 ? true : await form.trigger(fieldIds);
    if (valid) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      triggerAutosave();
      return;
    }
    const stepErrors = fieldIds
      .map((id) => form.formState.errors[id]?.message)
      .filter((msg): msg is string => typeof msg === "string");
    const stillUnchanged = stepErrors.some((msg) => msg.includes("must be corrected before resubmitting"));
    toast.error(
      stillUnchanged ? "Update the flagged field(s) to continue" : "Validation error",
      stillUnchanged
        ? "One or more flagged fields on this step still match your original answer. Change the value before continuing."
        : stepErrors[0] || "Please resolve the highlighted errors before continuing."
    );
  }

  function handleBack() {
    if (stepIndex === 0) {
      router.push(`/requests/${request.id}`);
      return;
    }
    setStepIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!isReviewStep || !reviewReady || isSubmittingRef.current || isSubmitting) return;

    const isValid = await form.trigger();
    if (!isValid) {
      const errorFieldIds = Object.keys(form.formState.errors);
      const inCommon = commonFields.some((f) => errorFieldIds.includes(f.id));
      const inCategory = categoryFields.some((f) => errorFieldIds.includes(f.id));
      if (inCommon && stepIndex !== 0) {
        setStepIndex(0);
        toast.error("Validation error", "Please complete the required corrections.");
        return;
      }
      if (inCategory && stepIndex !== 1) {
        setStepIndex(1);
        toast.error("Validation error", "Please complete the required corrections.");
        return;
      }
      toast.error("Validation error", "Please resolve the highlighted errors before resubmitting.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionErrors([]);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    try {
      // Make sure the latest edits are saved before finalizing — the resubmit
      // endpoint itself carries no field values, only the version guards.
      if (hasUnsavedChanges) {
        await triggerAutosave();
      }

      const idempotencyKey = `resubmit-${request.id}-${Date.now()}`;
      const performResubmit = async (wv: number, rv: number): Promise<RequestRecord> => {
        try {
          return await resubmitRequestRevision(
            request.id,
            { expectedWorkflowVersion: wv, expectedRevisionVersion: rv },
            idempotencyKey
          );
        } catch (err: any) {
          if (isConcurrencyError(err)) {
            const { workflowVersion: nwv, revisionVersion: nrv } = extractConcurrencyVersions(err);
            const retryWv = nwv ?? wv;
            const retryRv = nrv ?? rv;
            if (retryWv !== wv || retryRv !== rv) {
              setWorkflowVersion(retryWv);
              setRevisionVersion(retryRv);
              return performResubmit(retryWv, retryRv);
            }
          }
          throw err;
        }
      };

      const saved = await performResubmit(workflowVersionRef.current, revisionVersionRef.current);
      applyUpdatedRecord(saved);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Revised request resubmitted for ARB review.", `Reference ${saved.reference || saved.code}`);
      router.push(`/requests/${request.id}`);
    } catch (err: any) {
      const code = err?.code || err?.responseData?.code;
      const fieldId = err?.responseData?.details?.[0]?.fieldId;
      const message = err?.responseData?.message || err?.message || "Unable to resubmit your request.";
      if (code === "FLAGGED_FIELD_UNCHANGED" && fieldId) {
        form.setError(fieldId as any, { type: "server", message });
        const field = editableFlaggedFields.find((f) => f.id === fieldId);
        const fieldStep = field?.source === "common" ? 0 : 1;
        setStepIndex(fieldStep);
      }
      setSubmissionErrors([message]);
      toast.error("Resubmission failed", message);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    form,
    stepIndex,
    setStepIndex,
    isReviewStep,
    currentStep,
    stepperSteps,
    commonFields,
    categoryFields,
    documentFields,
    allFields,
    flaggedFields,
    flagsByField,
    isSavingDraft,
    lastSavedAt,
    hasUnsavedChanges,
    isSubmitting,
    submissionErrors,
    reviewReady,
    handleNext,
    handleBack,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
