"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatFileSize } from "@/utils/format";

interface RequestDocumentsTabProps {
  uploadEntries: [string, UploadedFile[]][];
  allFields: FieldConfig[];
  onPreviewFile: (file: PreviewableFile) => void;
}

export function RequestDocumentsTab({
  uploadEntries,
  allFields,
  onPreviewFile,
}: RequestDocumentsTabProps) {
  const toast = useToast();

  if (uploadEntries.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents uploaded"
        className="border-none py-8"
      />
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Uploaded Documents">
      {uploadEntries.map(([fieldId, files]) => {
        const fieldLabel = allFields.find((f) => f.id === fieldId)?.label;
        return (
          <div key={fieldId} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {fieldLabel ?? fieldId}
            </p>
            <ul className="space-y-2" aria-label={fieldLabel ?? fieldId}>
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-white dark:bg-card p-3 shadow-2xs transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <FileText className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · Uploaded {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onPreviewFile(file)}
                      className="gap-1 bg-white dark:bg-card"
                      aria-label={`View ${file.name}`}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        toast.success("Download started", `Downloading ${file.name}`);
                      }}
                      className="gap-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Download ${file.name}`}
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      Download
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
