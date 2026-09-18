"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Eye, Lock } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatFileSize } from "@/utils/format";
import { FilePreviewDialog, type PreviewableFile } from "@/components/shared/file-preview-dialog";

export function FileDropzone({
  value = [],
  onChange,
  accept,
  multiple = false,
  invalid = false,
  disabled = false,
}: {
  value?: DropzoneFile[];
  onChange: (files: DropzoneFile[]) => void;
  accept?: string;
  multiple?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

  function addFiles(fileList: FileList | null) {
    if (disabled || !fileList || fileList.length === 0) return;
    const incoming: DropzoneFile[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      file,
    }));
    onChange(multiple ? [...value, ...incoming] : incoming.slice(0, 1));
  }

  function removeFile(id: string) {
    if (disabled) return;
    onChange(value.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-2">
      {!disabled && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white p-6 text-center shadow-2xs transition-all duration-200 hover:border-primary/60 hover:bg-slate-50",
            dragOver ? "border-primary bg-primary/5" : "border-input",
            invalid && "border-destructive bg-destructive/5"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {accept ? accept.replaceAll(",", ", ") : "PDF, PNG, JPG, or DOC files"}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {disabled && value.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
          <FileText className="size-4 shrink-0 text-muted-foreground/60" />
          <span>No documents attached in original submission.</span>
        </div>
      )}

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((f) => (
            <li
              key={f.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm shadow-2xs transition-all",
                disabled
                  ? "border-border/80 bg-muted/20 text-muted-foreground"
                  : "border-border bg-white text-foreground"
              )}
            >
              <FileText className="size-4 shrink-0 text-primary/70" />
              <span className="min-w-0 flex-1 truncate font-medium">
                {f.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(f.size)}
              </span>
              <button
                type="button"
                onClick={() => setPreviewFile(f)}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                aria-label={`Preview ${f.name}`}
                title="View file"
              >
                <Eye className="size-4" />
              </button>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${f.name}`}
                  title="Remove file"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </div>
  );
}
