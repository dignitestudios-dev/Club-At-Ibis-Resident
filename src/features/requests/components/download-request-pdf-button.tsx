"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { downloadRequestPdf, type RequestPdfInput } from "@/lib/request-pdf";
import { getFileDownloadUrl } from "@/features/requests/api/requests.service";

function asText(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === false) return "";
  if (value === true) return "Yes";
  return String(value);
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Downloads this request (answers + uploaded documents) as a branded PDF. */
export function DownloadRequestPdfButton({
  request,
  formFields,
  residentName,
  residentIdNumber,
}: {
  request: RequestRecord;
  formFields: FieldConfig[];
  residentName?: string;
  residentIdNumber?: string;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    setMessage("Preparing…");
    try {
      const ordered = [...formFields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const fields = ordered.filter((f) => f.type !== "file");
      const fileFields = ordered.filter((f) => f.type === "file");

      const input: RequestPdfInput = {
        reference: request.reference || request.code,
        categoryName: request.categoryName || "Architectural Request",
        title: request.title,
        status: request.status,
        statusLabel: statusLabel(request.status),
        submittedAt: request.submittedAt ?? request.createdAt,
        updatedAt: request.updatedAt,
        resident: { name: residentName, idNumber: residentIdNumber },
        property: {
          address: request.propertyAddress || asText(request.fieldValues?.propertyAddress),
          lotNo: request.lotNo || asText(request.fieldValues?.lotNo),
        },
        fields: fields.map((f) => ({
          label: f.label,
          value: asText(request.fieldValues?.[f.id]),
          required: f.required,
        })),
        documents: fileFields.flatMap((f) =>
          (request.uploads?.[f.id] ?? []).map((file) => ({
            title: f.label,
            fileId: file.id,
            name: file.name,
            size: file.size,
            mimeType: file.mimeType,
            uploadedAt: file.uploadedAt,
            required: f.required,
          }))
        ),
        getFileUrl: async (fileId) => {
          const { url } = await getFileDownloadUrl(request.id, fileId);
          return url;
        },
        onProgress: setMessage,
      };
      await downloadRequestPdf(input);
    } catch {
      toast.error("Could not create the PDF", "Please try again in a moment.");
    } finally {
      setBusy(false);
      setMessage("");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={busy} className="gap-1.5 shrink-0" title="Download this request as a PDF">
      {busy ? <Spinner className="size-3.5" /> : <Download className="size-3.5" aria-hidden="true" />}
      {busy ? message || "Preparing…" : "Download PDF"}
    </Button>
  );
}
