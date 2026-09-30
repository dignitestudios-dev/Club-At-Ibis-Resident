"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Eye, RotateCw, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatFileSize } from "@/utils/format";
import { FilePreviewDialog, type PreviewableFile } from "@/components/shared/file-preview-dialog";
import {
  createUploadIntent,
  completeUpload,
  deleteRequestFile,
  getFileDownloadUrl,
} from "@/features/requests/api/requests.service";
import { putFileToBlob } from "@/features/requests/api/blob-upload";

const FAILURE_MESSAGES: Record<string, string> = {
  FILE_SIZE_MISMATCH: "The uploaded file didn't match the expected size. Please try again.",
  FILE_SIGNATURE_MISMATCH: "This file's content doesn't match its extension.",
  BLOB_CONTENT_TYPE_MISMATCH: "The uploaded file type could not be verified.",
  FILE_TYPE_NOT_ACCEPTED: "This file type isn't accepted for this field.",
  FILE_COUNT_LIMIT_EXCEEDED: "You've reached the maximum number of files for this field.",
  UPLOAD_NOT_FOUND: "The upload didn't complete. Please try again.",
};

function failureMessage(err: any): string {
  const code = err?.code || err?.responseData?.code || err?.response?.data?.code;
  return FAILURE_MESSAGES[code] || err?.message || "Upload failed. Please try again.";
}

export function FileDropzone({
  value = [],
  onChange,
  accept,
  multiple = false,
  invalid = false,
  disabled = false,
  requestId,
  fieldId,
  mediaRevision = 0,
  onMediaRevisionChange,
  replacesFileId,
}: {
  value?: DropzoneFile[];
  onChange: (files: DropzoneFile[]) => void;
  accept?: string;
  multiple?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  requestId?: string;
  fieldId?: string;
  mediaRevision?: number;
  onMediaRevisionChange?: (next: number) => void;
  replacesFileId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  // Allowed submission types per the backend's own v1 scope: PNG, JPG/JPEG, PDF, DOCX only
  // (no WEBP, no legacy .doc) — see club-at-ibis-backend AGENTS.md.
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf", ".docx"];
  const ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  function formatAcceptDisplay(acceptStr?: string): string {
    if (!acceptStr) return "Images (PNG, JPG, JPEG), PDF, Word (.docx)";
    const hasImages = acceptStr.includes("image") || acceptStr.includes(".png") || acceptStr.includes(".jpg");
    const hasPdf = acceptStr.includes("pdf") || acceptStr.includes(".pdf");
    const hasWord = acceptStr.includes("word") || acceptStr.includes(".docx");

    const parts: string[] = [];
    if (hasImages) parts.push("Images (PNG, JPG, JPEG)");
    if (hasPdf) parts.push("PDF (.pdf)");
    if (hasWord) parts.push("Word (.docx)");

    return parts.length > 0 ? parts.join(", ") : acceptStr.replaceAll(",", ", ");
  }

  function isFileAllowed(file: File): boolean {
    const name = file.name.toLowerCase();
    const ext = name.substring(name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext)) return false;
    // The extension alone can be spoofed (e.g. a video renamed to ".pdf"), so also
    // require the browser-reported MIME type to match one of the allowed types
    // when it reports one at all (some OS/browser combinations leave it blank).
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) return false;

    if (!accept) return true;
    const acceptLower = accept.toLowerCase();
    if (acceptLower.includes(ext)) return true;
    if (file.type && acceptLower.includes(file.type.toLowerCase())) return true;
    if (file.type?.startsWith("image/") && acceptLower.includes("image/")) return true;
    return false;
  }

  function toastError(title: string, description: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("app:toast", { detail: { variant: "error", title, description } })
    );
  }

  function patchRow(id: string, patch: Partial<DropzoneFile>) {
    onChange(valueRef.current.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function runUploadPipeline(row: DropzoneFile, file: File) {
    if (!requestId || !fieldId) {
      patchRow(row.id, { status: "failed", failureCode: "REQUEST_NOT_READY" });
      toastError("Not ready yet", "Please wait a moment and try again.");
      return;
    }
    try {
      const intent = await createUploadIntent(requestId, {
        fieldId,
        clientUploadId: row.id,
        originalName: file.name,
        size: file.size,
        declaredMimeType: file.type || "application/octet-stream",
        expectedMediaRevision: mediaRevision,
        ...(replacesFileId ? { replacesFileId } : {}),
      });
      onMediaRevisionChange?.(intent.mediaRevision);
      patchRow(row.id, { status: "verifying", fileId: intent.file.id });

      await putFileToBlob(intent.upload.url, file, intent.upload.requiredHeaders);

      const completed = await completeUpload(requestId, intent.file.id);
      onMediaRevisionChange?.(completed.mediaRevision);
      patchRow(row.id, {
        status: "ready",
        fileId: completed.file.id,
        version: completed.file.version,
        logicalFileId: completed.file.logicalFileId,
      });
    } catch (err: any) {
      const code = err?.code || err?.responseData?.code || err?.response?.data?.code;
      if (code === "STALE_MEDIA_REVISION") {
        const current = err?.responseData?.details?.currentMediaRevision ?? err?.response?.data?.details?.currentMediaRevision;
        if (typeof current === "number") onMediaRevisionChange?.(current);
      }
      patchRow(row.id, { status: "failed", failureCode: code });
      toastError("Upload failed", failureMessage(err));
    }
  }

  function addFiles(fileList: FileList | null) {
    if (disabled || !fileList || fileList.length === 0) return;
    const allFiles = Array.from(fileList);
    const validFiles = allFiles.filter(isFileAllowed);

    if (validFiles.length < allFiles.length) {
      toastError("Invalid file type", "Only Images (PNG, JPG, JPEG), PDF, and Word documents (.docx) are allowed.");
    }
    if (validFiles.length === 0) return;

    const incoming: DropzoneFile[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      file,
      status: "uploading",
    }));
    const next = multiple ? [...value, ...incoming] : incoming.slice(0, 1);
    onChange(next);
    for (const row of multiple ? incoming : incoming.slice(0, 1)) {
      void runUploadPipeline(row, row.file!);
    }
  }

  async function removeFile(row: DropzoneFile) {
    if (disabled) return;
    if (!row.fileId || !requestId) {
      onChange(value.filter((f) => f.id !== row.id));
      return;
    }
    patchRow(row.id, { status: "verifying" });
    try {
      const result = await deleteRequestFile(requestId, row.fileId, mediaRevision);
      onMediaRevisionChange?.(result.mediaRevision);
      onChange(valueRef.current.filter((f) => f.id !== row.id));
    } catch (err: any) {
      patchRow(row.id, { status: "ready" });
      toastError("Could not remove file", err?.message || "Please try again.");
    }
  }

  function retry(row: DropzoneFile) {
    if (!row.file) return;
    patchRow(row.id, { status: "uploading", failureCode: undefined });
    void runUploadPipeline(row, row.file);
  }

  function openPreview(row: DropzoneFile) {
    setPreviewFile({
      ...row,
      id: row.fileId || row.id,
      fileId: row.fileId,
    });
  }

  return (
    <div className="space-y-2">
      {!disabled && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files by clicking or dragging and dropping"
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
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white dark:bg-card p-6 text-center shadow-2xs transition-all duration-200 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-800/50",
            dragOver ? "border-primary bg-primary/5" : "border-input",
            invalid && "border-destructive bg-destructive/5"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
            <Upload className="size-5" />
          </span>
          <div>
            <p className="text-sm text-primary hover:underline font-medium ">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatAcceptDisplay(accept)}
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
          {value.map((f) => {
            const busy = f.status === "uploading" || f.status === "verifying";
            const failed = f.status === "failed";
            return (
              <li
                key={f.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm shadow-2xs transition-all",
                  failed
                    ? "border-destructive/40 bg-destructive/5 text-foreground"
                    : disabled
                    ? "border-border/80 bg-muted/20 text-muted-foreground"
                    : "border-border bg-white dark:bg-card text-foreground"
                )}
              >
                {busy ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary/70" />
                ) : (
                  <FileText className={cn("size-4 shrink-0", failed ? "text-destructive" : "text-primary/70")} />
                )}
                <span className="min-w-0 flex-1 truncate font-medium">
                  {f.name}
                  {busy && <span className="ml-1.5 text-xs font-normal text-muted-foreground">Uploading…</span>}
                  {failed && (
                    <span className="ml-1.5 text-xs font-normal text-destructive">
                      {FAILURE_MESSAGES[f.failureCode || ""] || "Upload failed"}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFileSize(f.size)}
                </span>
                {failed && !disabled && (
                  <button
                    type="button"
                    onClick={() => retry(f)}
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                    aria-label={`Retry uploading ${f.name}`}
                    title="Retry"
                  >
                    <RotateCw className="size-4" />
                  </button>
                )}
                {!busy && (
                  <button
                    type="button"
                    onClick={() => openPreview(f)}
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                    aria-label={`Preview ${f.name}`}
                    title="View file"
                  >
                    <Eye className="size-4" />
                  </button>
                )}
                {!disabled && !busy && (
                  <button
                    type="button"
                    onClick={() => removeFile(f)}
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${f.name}`}
                    title="Remove file"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        onRequestDownloadUrl={
          requestId
            ? (fileId) => getFileDownloadUrl(requestId, fileId).then((r) => r.url)
            : undefined
        }
      />
    </div>
  );
}
