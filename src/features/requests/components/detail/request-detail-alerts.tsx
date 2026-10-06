"use client";

import { WithdrawnNotice } from "@/components/shared/withdrawn-notice";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { ExpandableText } from "@/components/shared/expandable-text";
import { formatDate, formatDateTime, formatRelative } from "@/utils/format";

interface RequestDetailAlertsProps {
  request: RequestRecord;
  onPreviewLetter: (file: PreviewableFile) => void;
}

export function RequestDetailAlerts({
  request,
  onPreviewLetter,
}: RequestDetailAlertsProps) {
  const latestComment =
    request.comments.length > 0 ? request.comments[request.comments.length - 1] : null;

  return (
    <div className="space-y-4" role="region" aria-label="Request Status Alerts">
      {/* Unified Directive Banner for Changes Required */}
      {request.status === "changes_required" && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 to-amber-100/40 dark:from-amber-950/50 dark:to-amber-950/20 p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shadow-2xs"
                aria-hidden="true"
              >
                <AlertTriangle className="size-5 text-amber-700 dark:text-amber-400" />
              </span>
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-medium text-amber-950 dark:text-amber-200">
                  ARB Action Required: Changes Requested
                </h3>
                <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                  The Review Board has flagged items on this submission. Review the directive below, revise the indicated details, and resubmit.
                </p>
              </div>
            </div>
            <Button
              size="default"
              nativeButton={false}
              render={<Link href={`/requests/${request.id}/revise`} />}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold"
            >
              Revise &amp; Resubmit
            </Button>
          </div>

          {/* Latest Reviewer Directives & Feedback */}
          {(request.feedback || latestComment) && (
            <div className="rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-white/90 dark:bg-card/90 p-4 text-xs text-amber-950 dark:text-amber-200 space-y-1.5 shadow-2xs min-w-0 break-words [overflow-wrap:anywhere]">
              <div className="flex items-center justify-between font-semibold text-[11px] text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
                  Reviewer Directive &amp; Feedback
                </span>
                {latestComment && (
                  <span className="font-normal text-muted-foreground break-words [overflow-wrap:anywhere]">
                    {latestComment.author} · {formatRelative(latestComment.createdAt)}
                  </span>
                )}
              </div>
              <p className="font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed text-sm break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                &ldquo;<ExpandableText text={request.feedback || latestComment?.message || ""} />&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {(request.status === "submitted" || request.status === "under_review") && (
        <Alert className="border-sky-200 dark:border-sky-800/60 bg-sky-50/80 dark:bg-sky-950/40 min-w-0 break-words [overflow-wrap:anywhere]">
          <Info className="size-4 text-sky-700 dark:text-sky-400 shrink-0" aria-hidden="true" />
          <AlertTitle className="text-sky-900 dark:text-sky-200">
            {request.status === "submitted" ? "Request Submitted" : "Under ARB Review"}
          </AlertTitle>
          <AlertDescription className="text-sky-800 dark:text-sky-300 break-words [overflow-wrap:anywhere]">
            This request is currently under review by the Architectural Review Board. Submissions are locked and cannot be edited while in review unless changes are specifically requested by a reviewer.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "resubmitted" && (
        <Alert className="border-purple-200 dark:purple-800/60 bg-purple-50/80 dark:bg-purple-950/40 min-w-0 break-words [overflow-wrap:anywhere]">
          <Info className="size-4 text-purple-700 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <AlertTitle className="text-purple-900 dark:text-purple-200">Resubmission Under Review</AlertTitle>
          <AlertDescription className="text-purple-800 dark:text-purple-300 break-words [overflow-wrap:anywhere]">
            Your revised submission has been received and is currently under ARB follow-up review. Submissions cannot be edited while in review unless additional changes are requested.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "rejected" && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-300 dark:border-rose-800/80 bg-gradient-to-r from-rose-50 to-rose-100/40 dark:from-rose-950/50 dark:to-rose-950/20 p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-300"
        >
          <div className="flex items-start gap-3.5">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border border-rose-300/80 dark:border-rose-700/60 shadow-2xs"
              aria-hidden="true"
            >
              <XCircle className="size-5 text-rose-700 dark:text-rose-400" />
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="font-heading text-lg font-medium text-rose-950 dark:text-rose-200">
                Request Rejected
              </h3>
              <p className="text-xs sm:text-sm text-rose-900/90 dark:text-rose-300/90 leading-relaxed">
                The Review Board did not approve this submission. Review the reason below.
              </p>
            </div>
          </div>

          {request.rejectionReason && (
            <div className="rounded-xl border border-rose-200/90 dark:border-rose-800/60 bg-white/90 dark:bg-card/90 p-4 text-xs text-rose-950 dark:text-rose-200 space-y-1.5 shadow-2xs min-w-0 break-words [overflow-wrap:anywhere]">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-semibold text-[11px] text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-rose-700 dark:text-rose-400 shrink-0" aria-hidden="true" />
                  Rejection Reason
                </span>
                {(request.decision?.decidedBy || request.decidedAt) && (
                  <span className="font-normal normal-case tracking-normal text-muted-foreground break-words [overflow-wrap:anywhere]">
                    {request.decision?.decidedBy ? request.decision.decidedBy.displayName : "Decided"}
                    {request.decidedAt ? ` · ${formatRelative(request.decidedAt)}` : ""}
                  </span>
                )}
              </div>
              <p className="font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed text-sm break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                &ldquo;<ExpandableText text={request.rejectionReason} />&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {request.status === "approved" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-100 p-4 dark:border-emerald-700/60 dark:bg-emerald-950/40"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="font-semibold text-emerald-950 dark:text-emerald-200">Request Approved</p>
            <p className="text-emerald-900 dark:text-emerald-300">
              {request.deposit?.required
                ? `A security deposit${request.deposit.amount ? ` of $${Number(request.deposit.amount).toLocaleString()}` : ""} is required. Once the deposit and final approval documentation are recorded, you will be notified.`
                : "Final processing (final approval letter) is in progress. You will be notified once this request is marked completed."}
            </p>
            {(request.decision?.decidedBy || request.decidedAt) && (
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                {request.decision?.decidedBy ? `Decided by ${request.decision.decidedBy.displayName}` : "Decided"}
                {request.decidedAt ? ` · ${formatDateTime(request.decidedAt)}` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {request.status === "completed" && (
        <Alert className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-200">Request Completed</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-emerald-800 dark:text-emerald-300">Your final approval letter is ready to download.</span>
            {(request.completion?.finalApprovalLetter || request.approvalLetter || request.approvalLetterAvailable) && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 bg-card gap-1.5"
                onClick={() => {
                  const doc = request.completion?.finalApprovalLetter ?? request.approvalLetter ?? {
                    id: "final-approval-letter",
                    name: `${request.code}-approval-letter.pdf`,
                    size: 245000,
                    uploadedAt: request.completedAt ?? new Date().toISOString(),
                  };
                  onPreviewLetter(doc as PreviewableFile);
                }}
                aria-label="Download or view approval letter"
              >
                <Download className="size-3.5" aria-hidden="true" />
                Download Letter
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {request.status === "withdrawn" && (
        <div className="space-y-3">
          <WithdrawnNotice
            audience="resident"
            withdrawnAt={formatDate(request.withdrawal?.withdrawnAt ?? request.withdrawnAt ?? request.updatedAt)}
            withdrawnFrom={request.withdrawal?.withdrawnFrom ?? null}
            by={
              request.withdrawal?.withdrawnBy?.displayName
                ? `${request.withdrawal.withdrawnBy.displayName}${request.withdrawal.withdrawnBy.role === "REVIEWER" ? " (ARB Reviewer)" : request.withdrawal.withdrawnBy.role === "SUPER_ADMIN" ? " (Admin)" : ""}`
                : undefined
            }
            refund={
              request.deposit?.status === "received" || request.depositReceived
                ? request.refund?.outcome === "refunded" || request.refundStatus === "refunded"
                  ? {
                      state: "refunded",
                      date:
                        request.refund?.refundDate || request.refundDate
                          ? formatDate(request.refund?.refundDate || request.refundDate!)
                          : undefined,
                      amount:
                        request.deposit?.amount != null
                          ? `$${Number(request.deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : undefined,
                      by: request.refund?.recordedBy,
                    }
                  : request.refund?.outcome === "no_refund" || request.refundStatus === "no_refund"
                    ? { state: "no_refund", explanation: request.refund?.explanation, by: request.refund?.recordedBy }
                    : { state: "awaiting" }
                : undefined
            }
          />

          {request.completion?.finalApprovalLetter && (
            <Alert className="border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
              <AlertTitle>Issued Final Approval Letter</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground text-xs">
                  A final approval letter was issued prior to request withdrawal and remains accessible.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 bg-card gap-1.5"
                  onClick={() => {
                    onPreviewLetter(request.completion!.finalApprovalLetter! as PreviewableFile);
                  }}
                  aria-label="Download or view issued approval letter"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Download Letter
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Reviewer feedback banner for non-changes-required statuses */}
      {latestComment && request.status !== "changes_required" && (
        <div className="rounded-2xl border border-border/80 bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-5 shadow-2xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700/60 shadow-2xs"
                aria-hidden="true"
              >
                <MessageSquare className="size-3.5" />
              </span>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                ARB Reviewer Note
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {request.comments.length} note{request.comments.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="sm:pl-9 space-y-1">
            <p className="text-sm font-medium text-foreground leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
              &ldquo;<ExpandableText text={latestComment.message} />&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              by {latestComment.author} • {formatRelative(latestComment.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
