"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { downloadRequestPdf, type RequestPdfInput, type RequestPdfRow, type RequestPdfSection } from "@/lib/request-pdf";
import { getFileDownloadUrl } from "@/features/requests/api/requests.service";

/** Fields every request carries; the rest come from the category's own form. */
const COMMON_FIELD_IDS = new Set(["propertyAddress", "lotNo", "projectDescription", "contractorName", "contractorNumber", "additionalDetails"]);

function asText(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === false) return "";
  if (value === true) return "Yes";
  return String(value);
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function date(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function money(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function present(rows: RequestPdfRow[]): RequestPdfRow[] {
  return rows.filter((r) => r.value && r.value.trim());
}

/** Downloads this request (answers + uploaded documents) as a formal PDF record. */
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
      const answers = ordered.filter((f) => f.type !== "file");
      const fileFields = ordered.filter((f) => f.type === "file");
      const isCommon = (f: FieldConfig) => (f.source ? f.source === "common" : COMMON_FIELD_IDS.has(f.id));
      const toRow = (f: FieldConfig): RequestPdfRow => {
        const value = asText(request.fieldValues?.[f.id]);
        return { label: f.label, value, wide: f.type === "textarea" || value.length > 48 || value.includes("\n") };
      };
      const label = statusLabel(request.status);
      const category = request.categoryName || "Architectural Request";

      const sections: RequestPdfSection[] = [
        {
          title: "Request Information",
          rows: present([
            { label: "Reference number", value: request.reference || request.code },
            { label: "Category", value: category },
            { label: "Status", value: label },
            { label: "Date submitted", value: date(request.submittedAt ?? request.createdAt) },
            { label: "Last updated", value: date(request.updatedAt) },
          ]),
        },
        {
          title: "Resident Information",
          rows: present([
            { label: "Resident name", value: residentName ?? "" },
            { label: "Resident ID", value: residentIdNumber ?? "" },
          ]),
        },
        { title: "Project Information", rows: answers.filter(isCommon).map(toRow) },
        { title: `${category} Information`, rows: answers.filter((f) => !isCommon(f)).map(toRow) },
        ...(request.deposit?.required || request.depositRequired
          ? [
              {
                title: "Deposit",
                rows: present([
                  { label: "Deposit required", value: "Yes" },
                  { label: "Deposit amount", value: money(request.deposit?.amount ?? request.depositAmount) },
                  { label: "Deposit status", value: request.deposit?.status === "received" || request.depositReceived ? "Received" : "Pending" },
                ]),
              },
            ]
          : []),
      ];

      const input: RequestPdfInput = {
        reference: request.reference || request.code,
        categoryName: category,
        statusLabel: label,
        sections,
        documents: fileFields.flatMap((f) =>
          (request.uploads?.[f.id] ?? []).map((file) => ({
            title: f.label,
            fileId: file.id,
            name: file.name,
            mimeType: file.mimeType,
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
