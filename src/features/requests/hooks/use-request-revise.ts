"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useResubmitRequestMutation } from "@/features/requests/api/requests.mutations";
import {
  buildStepSchema,
  getAllFieldsForRequestType,
} from "@/features/requests/schemas/request-step.schema";

export function useRequestRevise(
  request: RequestRecord,
  requestType?: RequestType | null,
  onDone?: () => void,
  customFields?: FieldConfig[]
) {
  const toast = useToast();
  const isSubmittingRef = useRef(false);
  const { mutate: resubmit, isPending } = useResubmitRequestMutation();

  const allFields =
    customFields && customFields.length > 0
      ? customFields
      : requestType
      ? getAllFieldsForRequestType(requestType)
      : (request.formSnapshot || request.form?.fields || []);
  const flagsByField = new Map((request.flags ?? []).map((f) => [f.fieldId, f.reason]));
  const flaggedFields = allFields.filter((field) => flagsByField.has(field.id));

  const schema = buildStepSchema(flaggedFields);

  const defaultValues: Record<string, unknown> = {};
  for (const field of allFields) {
    if (field.type === "file") {
      const existing = request.uploads[field.id] ?? [];
      defaultValues[field.id] = existing.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
      }));
    } else if (field.type === "checkbox") {
      defaultValues[field.id] = request.fieldValues[field.id] ?? [];
    } else {
      defaultValues[field.id] = request.fieldValues[field.id] ?? "";
    }
  }

  const form = useForm<Record<string, unknown>>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues,
  });

  function handleSubmit(values: Record<string, unknown>) {
    if (isSubmittingRef.current || isPending) return;
    isSubmittingRef.current = true;
    const fieldValues: Record<string, FieldValue> = { ...request.fieldValues };
    const uploads: Record<string, UploadedFile[]> = { ...request.uploads };

    for (const field of flaggedFields) {
      const value = values[field.id];
      if (field.type === "file") {
        const files = (value as DropzoneFile[]) ?? [];
        uploads[field.id] = files.map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          uploadedAt: new Date().toISOString(),
        }));
      } else {
        fieldValues[field.id] = value as FieldValue;
      }
    }

    resubmit(
      { id: request.id, fieldValues, uploads },
      {
        onSuccess: () => {
          isSubmittingRef.current = false;
          toast.success("Revised request resubmitted for ARB review.");
          onDone?.();
        },
        onError: () => {
          isSubmittingRef.current = false;
          toast.error("Unable to resubmit your request.");
        },
        onSettled: () => {
          isSubmittingRef.current = false;
        },
      }
    );
  }

  return {
    form,
    isPending,
    allFields,
    flaggedFields,
    flagsByField,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
