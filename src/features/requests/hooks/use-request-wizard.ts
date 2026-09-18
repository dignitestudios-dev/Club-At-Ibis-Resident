"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateRequestMutation } from "@/features/requests/api/requests.mutations";
import {
  useSaveDraftMutation,
  useDeleteDraftMutation,
} from "@/features/drafts/api/drafts.mutations";
import { baseProjectInfoFields } from "@/lib/mock/request-types";
import {
  buildRequestTypeSchema,
  defaultValuesForFields,
} from "@/features/requests/schemas/request-step.schema";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}

export function useRequestWizard(
  requestType: RequestType,
  onChangeType: () => void,
  initialDraft?: RequestDraft | null
) {
  const router = useRouter();
  const user = useCurrentUser();
  const toast = useToast();
  const { mutate: createRequest, isPending } = useCreateRequestMutation();
  const { mutate: saveDraftMutate, isPending: isSavingDraft } = useSaveDraftMutation();
  const { mutate: deleteDraftMutate } = useDeleteDraftMutation();

  const [stepIndex, setStepIndex] = useState<number>(initialDraft?.stepIndex ?? 0);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(initialDraft?.id ?? null);
  const [confirmingChangeCategory, setConfirmingChangeCategory] = useState(false);

  const projectInfoFields = useMemo(
    () => [...baseProjectInfoFields, ...requestType.additionalFields],
    [requestType.additionalFields]
  );
  const documentFields = requestType.documentFields;
  const allFields = useMemo(
    () => [...projectInfoFields, ...documentFields],
    [projectInfoFields, documentFields]
  );
  const schema = useMemo(() => buildRequestTypeSchema(requestType), [requestType]);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "project-info",
        title: "Project Information",
        description: "Tell us about the property and the proposed project.",
        fields: projectInfoFields,
      },
      {
        id: "documents",
        title: "Documents & Photos",
        description: "Upload the documents and photos required for this category.",
        fields: documentFields,
      },
    ],
    [projectInfoFields, documentFields]
  );

  const initialFormValues = useMemo(() => {
    const defaults = defaultValuesForFields(allFields);
    if (!initialDraft) return defaults;

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
  }, [allFields, initialDraft]);

  const form = useForm<Record<string, unknown>>({
    mode: "onChange",
    resolver: zodResolver(schema) as unknown as Resolver<Record<string, unknown>>,
    defaultValues: initialFormValues,
  });

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
      requestTypeId: requestType.id,
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
    const valid = await form.trigger(fieldIds);
    if (valid) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      // Auto-save progress quietly in the background
      const payload = extractPayload(nextIndex);
      saveDraftMutate(payload, {
        onSuccess: (saved) => {
          setCurrentDraftId(saved.id);
        },
      });
    }
  }

  function hasEnteredData() {
    const values = form.getValues();
    return allFields.some((field) => {
      const value = values[field.id];
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    });
  }

  function handleBack() {
    if (stepIndex === 0) {
      if (hasEnteredData()) {
        setConfirmingChangeCategory(true);
        return;
      }
      onChangeType();
      return;
    }
    setStepIndex((i) => i - 1);
  }

  function confirmChangeCategory() {
    setConfirmingChangeCategory(false);
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
        requestTypeId: requestType.id,
        fieldValues,
        uploads,
        hoaApproved: values.hoaApproved === true,
      },
      {
        onSuccess: (record) => {
          // If this submission was saved as a draft, remove it from drafts
          if (currentDraftId) {
            deleteDraftMutate(currentDraftId);
          }
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
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
