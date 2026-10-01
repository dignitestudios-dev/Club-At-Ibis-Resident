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
  if (Array.isArray(value)) return JSON.stringify(value.map((v) => String(v).trim()));
  if (value === undefined || value === null) return "";
  return String(value).trim();
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
  // Text/select/etc. flagged fields go through the field-value correction
  // endpoint (PATCH .../revision); flagged file fields are corrected by
  // uploading a replacement (POST .../files/upload-intents with
  // replacesFileId), never through fieldValues.
  const editableFlaggedFields = useMemo(
    () => flaggedFields.filter((f) => f.type !== "file"),
    [flaggedFields]
  );
  const flaggedFileFields = useMemo(
    () => flaggedFields.filter((f) => f.type === "file"),
    [flaggedFields]
  );
  /**
   * fieldId -> the live, actionable file id to pass as `replacesFileId`.
   * This must always be `currentFile.id`, never `fileId`/`flaggedFileId` —
   * those identify the historical file the reviewer originally flagged and
   * are kept only for audit purposes. Sending them once a correction has
   * already replaced v1 with v2 gets rejected by the backend with
   * FILE_NOT_FOUND, since v1 is no longer the current file.
   */
  const replacesFileIdByField = useMemo(
    () =>
      new Map(
        (request.revision?.items ?? [])
          .filter((item) => item.kind === "file" && item.currentFile?.id)
          .map((item) => [item.fieldId, item.currentFile!.id])
      ),
    [request.revision]
  );
  /** fieldId -> whether the backend already has a correction on file for this flagged document (`replacementSatisfied`). Authoritative, independent of local upload-pipeline state. */
  const replacementSatisfiedByField = useMemo(
    () =>
      new Map(
        (request.revision?.items ?? [])
          .filter((item) => item.kind === "file")
          .map((item) => [item.fieldId, !!item.replacementSatisfied])
      ),
    [request.revision]
  );
  /** Refresh the request after a file replacement completes so `currentFile`/`replacementStatus`/`mediaRevision` are current before any further replacement is attempted in the same session. */
  const refreshAfterFileReplaced = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["requests", "detail", request.id] });
  }, [queryClient, request.id]);

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
        description: "Only the documents flagged by the ARB below can be replaced.",
        fields: documentFields,
      },
    ],
    [commonFields, categoryFields, documentFields]
  );

  // The baseline values from the previous submission before any draft corrections were made.
  // We extract them from the latest submission in `request.submissions`, or freeze initial `request.fieldValues`.
  const initialFieldValuesRef = useRef<Record<string, FieldValue>>({ ...request.fieldValues });
  const originalSubmittedValues = useMemo(() => {
    if (request.submissions && request.submissions.length > 0) {
      const lastSub = request.submissions[request.submissions.length - 1];
      if (lastSub?.fieldValues) {
        return lastSub.fieldValues;
      }
    }
    return initialFieldValuesRef.current;
  }, [request.submissions]);

  // Schema validates syntax, required state, and format rules for flagged fields.
  // Per-step unchanged checks are performed dynamically in handleNext/handleSubmit
  // so steps are not blocked by flagged fields belonging to subsequent steps.
  const schema = useMemo(() => {
    return buildStepSchema(editableFlaggedFields);
  }, [editableFlaggedFields]);

  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const field of allFields) {
      if (field.type === "file") {
        values[field.id] = (request.uploads?.[field.id] ?? [])
          .filter((f) => f.status !== "deleted")
          .map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            url: f.url,
            status: "ready" as DropzoneFileStatus,
            fileId: f.id,
            version: f.version,
            logicalFileId: f.logicalFileId,
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
    // Form fields take priority over documents whenever both are flagged —
    // land on whichever field step has a flagged field first in form order,
    // never on Documents just because a flagged file happens to sort earlier
    // in `allFields` than a flagged field does. Documents only wins when
    // nothing else is flagged.
    const firstFlaggedField = editableFlaggedFields[0];
    if (firstFlaggedField) return firstFlaggedField.source === "category" ? 1 : 0;
    if (flaggedFileFields.length > 0) return 2;
    return 0;
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
  const [mediaRevision, setMediaRevision] = useState(request.mediaRevision ?? 0);
  const workflowVersionRef = useRef(workflowVersion);
  workflowVersionRef.current = workflowVersion;
  const revisionVersionRef = useRef(revisionVersion);
  revisionVersionRef.current = revisionVersion;
  const mediaRevisionRef = useRef(mediaRevision);
  mediaRevisionRef.current = mediaRevision;
  const handleMediaRevisionChange = useCallback((next: number) => {
    setMediaRevision(next);
    mediaRevisionRef.current = next;
  }, []);

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
  // File fields are deliberately excluded: a document replacement is already
  // persisted the moment its upload completes (its own pipeline, no draft
  // step), so watching it here only set `hasUnsavedChanges` without any
  // autosave ever able to clear it back — `triggerAutosave` only covers
  // `editableFlaggedFields` (text/choice), and its signature-unchanged guard
  // silently no-ops when the only real change was a file upload, leaving the
  // "Unsaved changes" badge stuck until the next full page reload.
  useEffect(() => {
    const subscription = form.watch((_value, { name }) => {
      if (!name || !editableFlaggedFields.some((f) => f.id === name)) return;
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
  }, [form, triggerAutosave, editableFlaggedFields]);

  async function handleNext() {
    if (isReviewStep) return;
    const currentStepFieldIds = currentStep.fields.map((f) => f.id);
    const valid = currentStepFieldIds.length === 0 ? true : await form.trigger(currentStepFieldIds);
    if (!valid) {
      const stepErrors = currentStepFieldIds
        .map((id) => form.formState.errors[id]?.message)
        .filter((msg): msg is string => typeof msg === "string");
      toast.error("Validation error", stepErrors[0] || "Please resolve the highlighted errors before continuing.");
      return;
    }

    const values = form.getValues();

    // 1. Check if any file fields on this step are currently uploading or failed
    const fileFieldsOnStep = currentStep.fields.filter((f) => f.type === "file");
    const uploadingOrFailed = fileFieldsOnStep.some((field) => {
      const rows = (values[field.id] as DropzoneFile[]) ?? [];
      return rows.some((f) => f.status === "uploading" || f.status === "verifying" || f.status === "failed");
    });
    if (uploadingOrFailed) {
      toast.error("Documents not ready", "Wait for the document upload to finish, or retry a failed one, before continuing.");
      return;
    }

    // 2. Check that flagged text/choice fields ON THIS CURRENT STEP have been changed from their original values
    const currentStepFlagged = currentStep.fields.filter(
      (f) => flagsByField.has(f.id) && f.type !== "file"
    );
    let hasUnchanged = false;
    let firstUnchangedLabel = "";

    for (const field of currentStepFlagged) {
      const current = normalizeForComparison(values[field.id]);
      const original = normalizeForComparison(originalSubmittedValues[field.id]);
      if (current === original) {
        form.setError(field.id as any, {
          type: "custom",
          message: `${field.label} must be corrected before continuing.`,
        });
        if (!hasUnchanged) firstUnchangedLabel = field.label;
        hasUnchanged = true;
      } else {
        if (form.formState.errors[field.id]?.message?.includes("must be corrected")) {
          form.clearErrors(field.id as any);
        }
      }
    }

    if (hasUnchanged) {
      toast.error(
        "Update the flagged field(s) to continue",
        firstUnchangedLabel
          ? `${firstUnchangedLabel} must be corrected before continuing.`
          : "One or more flagged fields on this step still match your original answer. Change the value before continuing."
      );
      return;
    }

    // 3. Check that flagged document fields ON THIS CURRENT STEP have been replaced
    const currentStepFlaggedFiles = currentStep.fields.filter(
      (f) => flagsByField.has(f.id) && f.type === "file"
    );
    let hasUnchangedDoc = false;
    let firstUnchangedDocLabel = "";

    for (const field of currentStepFlaggedFiles) {
      const flaggedOriginalFileId = replacesFileIdByField.get(field.id);
      const rows = (values[field.id] as DropzoneFile[]) ?? [];
      const hasReplacement =
        replacementSatisfiedByField.get(field.id) === true ||
        rows.some((f) => f.status === "ready" && f.fileId && (!flaggedOriginalFileId || f.fileId !== flaggedOriginalFileId));
      if (!hasReplacement) {
        form.setError(field.id as any, {
          type: "custom",
          message: `${field.label} must be replaced before continuing.`,
        });
        if (!hasUnchangedDoc) firstUnchangedDocLabel = field.label;
        hasUnchangedDoc = true;
      } else {
        if (form.formState.errors[field.id]?.message?.includes("must be replaced")) {
          form.clearErrors(field.id as any);
        }
      }
    }

    if (hasUnchangedDoc) {
      toast.error(
        "Replace the flagged document(s) to continue",
        firstUnchangedDocLabel
          ? `${firstUnchangedDocLabel} must be replaced before continuing.`
          : "Please upload replacement files for all flagged documents before continuing."
      );
      return;
    }

    setStepIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    triggerAutosave();
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
      const inDocs = documentFields.some((f) => errorFieldIds.includes(f.id));
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
      if (inDocs && stepIndex !== 2) {
        setStepIndex(2);
        toast.error("Validation error", "Please replace the required documents.");
        return;
      }
      toast.error("Validation error", "Please resolve the highlighted errors before resubmitting.");
      return;
    }

    // Verify all flagged text/choice fields have actually changed
    const values = form.getValues();
    let hasUnchanged = false;
    let unchangedField: FieldConfig | null = null;
    for (const field of editableFlaggedFields) {
      const current = normalizeForComparison(values[field.id]);
      const original = normalizeForComparison(originalSubmittedValues[field.id]);
      if (current === original) {
        form.setError(field.id as any, {
          type: "custom",
          message: `${field.label} must be corrected before resubmitting.`,
        });
        if (!hasUnchanged) unchangedField = field;
        hasUnchanged = true;
      }
    }

    if (hasUnchanged && unchangedField) {
      const targetStep = unchangedField.source === "common" ? 0 : 1;
      setStepIndex(targetStep);
      toast.error(
        "Update flagged fields before resubmitting",
        `${unchangedField.label} must be corrected before you can resubmit.`
      );
      return;
    }

    const unfinishedUpload = flaggedFileFields.some((field) => {
      const rows = (values[field.id] as DropzoneFile[]) ?? [];
      return rows.some((f) => f.status === "uploading" || f.status === "verifying" || f.status === "failed");
    });
    if (unfinishedUpload) {
      setStepIndex(2);
      toast.error("Documents not ready", "Wait for the replacement upload to finish, or retry a failed one, before resubmitting.");
      return;
    }

    // Verify all flagged document fields have actually been replaced
    let hasUnchangedDoc = false;
    let unchangedDocField: FieldConfig | null = null;
    for (const field of flaggedFileFields) {
      const flaggedOriginalFileId = replacesFileIdByField.get(field.id);
      const rows = (values[field.id] as DropzoneFile[]) ?? [];
      const hasReplacement =
        replacementSatisfiedByField.get(field.id) === true ||
        rows.some((f) => f.status === "ready" && f.fileId && (!flaggedOriginalFileId || f.fileId !== flaggedOriginalFileId));
      if (!hasReplacement) {
        form.setError(field.id as any, {
          type: "custom",
          message: `${field.label} must be replaced before resubmitting.`,
        });
        if (!hasUnchangedDoc) unchangedDocField = field;
        hasUnchangedDoc = true;
      }
    }

    if (hasUnchangedDoc && unchangedDocField) {
      setStepIndex(2);
      toast.error(
        "Replace flagged document before resubmitting",
        `${unchangedDocField.label} must be replaced before you can resubmit.`
      );
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
      const performResubmit = async (wv: number, rv: number, mr: number): Promise<RequestRecord> => {
        try {
          return await resubmitRequestRevision(
            request.id,
            { expectedWorkflowVersion: wv, expectedRevisionVersion: rv, expectedMediaRevision: mr },
            idempotencyKey
          );
        } catch (err: any) {
          const code = err?.code || err?.responseData?.code;
          if (isConcurrencyError(err)) {
            const { workflowVersion: nwv, revisionVersion: nrv } = extractConcurrencyVersions(err);
            const retryWv = nwv ?? wv;
            const retryRv = nrv ?? rv;
            if (retryWv !== wv || retryRv !== rv) {
              setWorkflowVersion(retryWv);
              setRevisionVersion(retryRv);
              return performResubmit(retryWv, retryRv, mr);
            }
          }
          if (code === "STALE_MEDIA_REVISION") {
            const current = err?.responseData?.details?.currentMediaRevision;
            if (typeof current === "number" && current !== mr) {
              handleMediaRevisionChange(current);
              return performResubmit(wv, rv, current);
            }
          }
          throw err;
        }
      };

      const saved = await performResubmit(workflowVersionRef.current, revisionVersionRef.current, mediaRevisionRef.current);
      applyUpdatedRecord(saved);
      setHasUnsavedChanges(false);
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
      } else if (code === "FLAGGED_FILE_UNCHANGED") {
        setStepIndex(2);
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
    flaggedFileFields,
    flagsByField,
    replacesFileIdByField,
    replacementSatisfiedByField,
    onFileReplaced: refreshAfterFileReplaced,
    mediaRevision,
    onMediaRevisionChange: handleMediaRevisionChange,
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
