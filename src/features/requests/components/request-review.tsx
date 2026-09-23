"use client";

import { useMemo, useState } from "react";
import { FileText, Eye } from "lucide-react";
import { baseProjectInfoFields } from "@/lib/mock/request-types";
import {
  FilePreviewDialog,
  type PreviewableFile,
} from "@/components/shared/file-preview-dialog";
import { formatFileSize } from "@/utils/format";

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
  onPreviewFile,
}: {
  requestType?: RequestType | null;
  fields?: FieldConfig[];
  commonFields?: FieldConfig[];
  categoryFields?: FieldConfig[];
  values: Record<string, unknown>;
  uploads?: Record<string, UploadedFile[]>;
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
          fields: comm,
        });
      }
      if (cat.length > 0) {
        result.push({
          title: "Category Details",
          fields: cat,
        });
      }
      return result;
    }

    if (requestType) {
      return [
        {
          title: "Project Information",
          fields: [...baseProjectInfoFields, ...(requestType.additionalFields || [])],
        },
        {
          title: "Documents & Photos",
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
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2.5">
          <p className="text-sm font-semibold text-foreground">{group.title}</p>
          <dl className="grid gap-3 rounded-xl border border-border bg-white dark:bg-card p-4 shadow-2xs sm:grid-cols-2">
            {group.fields.map((field) => {
              if (field.type === "file") {
                const files =
                  uploads?.[field.id] ??
                  (Array.isArray(values[field.id])
                    ? (values[field.id] as DropzoneFile[])
                    : []);
                return (
                  <div key={field.id} className="space-y-1 sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </dt>
                    <dd className="text-sm text-foreground">
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
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800 hover:text-primary hover:shadow-2xs cursor-pointer"
                            >
                              <FileText
                                className="size-3.5 text-primary"
                                aria-hidden="true"
                              />
                              <span className="max-w-44 truncate">
                                {file.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                ({formatFileSize(file.size)})
                              </span>
                              <Eye
                                className="size-3 text-muted-foreground"
                                aria-hidden="true"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </dd>
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-0.5">
                  <dt className="text-xs font-medium text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatFieldValue(
                      field,
                      values[field.id],
                      uploads?.[field.id]
                    )}
                  </dd>
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
