"use client";

import { useMemo, useState } from "react";
import { FileText, Eye, AlertCircle, Pencil } from "lucide-react";
import { type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { baseProjectInfoFields } from "@/lib/mock/request-types";
import {
  FilePreviewDialog,
  type PreviewableFile,
} from "@/components/shared/file-preview-dialog";
import { formatFileSize } from "@/utils/format";
import { formatUsPhone } from "@/features/requests/schemas/request-step.schema";

export function formatFieldValue(
  field: FieldConfig,
  value: unknown,
  uploadedFiles?: UploadedFile[]
): string {
  if (field.type === "file") {
    const files =
      uploadedFiles ??
      (Array.isArray(value) ? (value as DropzoneFile[]) : []);
    if (!files || files.length === 0) return "—";
    return files.map((f) => f.name).join(", ");
  }

  if (value === undefined || value === null || value === "") return "—";

  if (field.type === "phone") {
    return formatUsPhone(String(value)) || String(value);
  }

  const getOptionLabel = (optVal: string) => {
    if (!field.options) return optVal;
    const found = field.options.find((o) =>
      typeof o === "string" ? o === optVal : o.value === optVal
    );
    if (!found) return optVal;
    return typeof found === "string" ? found : found.label;
  };

  if (field.type === "checkbox" && Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => getOptionLabel(String(v))).join(", ");
  }

  if (field.type === "select" || field.type === "radio") {
    return getOptionLabel(String(value));
  }

  return String(value);
}

export function RequestReview({
  requestType,
  fields,
  commonFields,
  categoryFields,
  values,
  uploads,
  errors,
  disabled,
  onNavigateToStep,
  onPreviewFile,
}: {
  requestType?: RequestType | null;
  fields?: FieldConfig[];
  commonFields?: FieldConfig[];
  categoryFields?: FieldConfig[];
  values: Record<string, unknown>;
  uploads?: Record<string, UploadedFile[]>;
  errors?: FieldErrors;
  disabled?: boolean;
  onNavigateToStep?: (stepIndex: number) => void;
  onPreviewFile?: (file: PreviewableFile) => void;
}) {
  const [internalPreviewFile, setInternalPreviewFile] =
    useState<PreviewableFile | null>(null);

  const groups = useMemo(() => {
    if (commonFields || categoryFields || fields) {
      const comm =
        commonFields ?? (fields ? fields.filter((f) => f.source === "common") : []);
      const cat =
        categoryFields ??
        (fields ? fields.filter((f) => f.source === "category") : []);

      const result = [];
      if (comm.length > 0) {
        result.push({
          title: "Project Information",
          stepIndex: 0,
          fields: comm,
        });
      }
      if (cat.length > 0) {
        result.push({
          title: "Category Details",
          stepIndex: comm.length > 0 ? 1 : 0,
          fields: cat,
        });
      }
      return result;
    }

    if (requestType) {
      return [
        {
          title: "Project Information",
          stepIndex: 0,
          fields: [...baseProjectInfoFields, ...(requestType.additionalFields || [])],
        },
        {
          title: "Documents & Photos",
          stepIndex: 1,
          fields: requestType.documentFields || [],
        },
      ];
    }

    return [];
  }, [commonFields, categoryFields, fields, requestType]);

  function handleFileClick(file: UploadedFile | DropzoneFile) {
    if (onPreviewFile) {
      onPreviewFile(file);
    } else {
      setInternalPreviewFile(file);
    }
  }

  return (
    <div className="space-y-6 min-w-0">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground break-words [overflow-wrap:anywhere]">{group.title}</p>
            {onNavigateToStep && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToStep(group.stepIndex)}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80 shrink-0"
              >
                <Pencil className="size-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
          <dl className="grid gap-3.5 rounded-xl border border-border bg-white dark:bg-card p-4 shadow-2xs min-w-0">
            {group.fields.map((field) => {
              const fieldError = errors?.[field.id];
              const isInvalid = !disabled && !!fieldError;
              const errorMsg = fieldError?.message ? String(fieldError.message) : null;

              if (field.type === "file") {
                const files =
                  uploads?.[field.id] ??
                  (Array.isArray(values[field.id])
                    ? (values[field.id] as DropzoneFile[])
                    : []);
                return (
                  <div
                    key={field.id}
                    className={cn(
                      "space-y-1 rounded-lg transition-all min-w-0 overflow-hidden",
                      isInvalid && "border border-destructive/40 bg-destructive/5 dark:bg-destructive/10 p-2.5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-xs font-medium text-muted-foreground break-words [overflow-wrap:anywhere]">
                        {field.label}
                      </dt>
                      {isInvalid && onNavigateToStep && !disabled && (
                        <button
                          type="button"
                          onClick={() => onNavigateToStep(group.stepIndex)}
                          className="text-[11px] font-semibold text-destructive underline hover:opacity-80 shrink-0"
                        >
                          Fix upload
                        </button>
                      )}
                    </div>
                    <dd className="text-sm text-foreground min-w-0">
                      {files.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {files.map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => handleFileClick(file)}
                              aria-label={`Preview ${file.name}`}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800 hover:text-primary hover:shadow-2xs cursor-pointer"
                            >
                              <FileText
                                className="size-3.5 text-primary shrink-0"
                                aria-hidden="true"
                              />
                              <span className="max-w-44 truncate">
                                {file.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                ({formatFileSize(file.size)})
                              </span>
                              <Eye
                                className="size-3 text-muted-foreground shrink-0"
                                aria-hidden="true"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </dd>
                    {isInvalid && errorMsg && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive break-words [overflow-wrap:anywhere]">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{errorMsg}</span>
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={field.id}
                  className={cn(
                    "space-y-0.5 rounded-lg transition-all min-w-0 overflow-hidden",
                    isInvalid && "border border-destructive/40 bg-destructive/5 dark:bg-destructive/10 p-2.5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-xs font-medium text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {field.label}
                    </dt>
                    {isInvalid && onNavigateToStep && !disabled && (
                      <button
                        type="button"
                        onClick={() => onNavigateToStep(group.stepIndex)}
                        className="text-[11px] font-semibold text-destructive underline hover:opacity-80 shrink-0"
                      >
                        Fix field
                      </button>
                    )}
                  </div>
                  <dd className="text-sm font-medium text-foreground break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap min-w-0">
                    {formatFieldValue(
                      field,
                      values[field.id],
                      uploads?.[field.id]
                    )}
                  </dd>
                  {isInvalid && errorMsg && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive break-words [overflow-wrap:anywhere]">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </dl>
        </div>
      ))}

      <FilePreviewDialog
        file={internalPreviewFile}
        open={!!internalPreviewFile}
        onOpenChange={(open) => !open && setInternalPreviewFile(null)}
      />
    </div>
  );
}
