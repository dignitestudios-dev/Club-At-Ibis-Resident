"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  MessageSquare,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { formatDate, formatRelative } from "@/utils/format";

interface RequestDetailAlertsProps {
  request: RequestRecord;
  revising: boolean;
  onStartRevising: () => void;
  onPreviewLetter: (file: PreviewableFile) => void;
}

export function RequestDetailAlerts({
  request,
  revising,
  onStartRevising,
  onPreviewLetter,
}: RequestDetailAlertsProps) {
  const latestComment =
    request.comments.length > 0 ? request.comments[request.comments.length - 1] : null;

  return (
    <div className="space-y-4" role="region" aria-label="Request Status Alerts">
      {/* Unified Directive Banner for Changes Required */}
      {request.status === "changes_required" && !revising && (
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
                  ARB Action Required — Changes Requested
                </h3>
                <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                  The Review Board has flagged items on this submission. Review the directive below, revise the indicated details, and resubmit.
                </p>
              </div>
            </div>
            <Button
              size="default"
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold"
              onClick={onStartRevising}
            >
              Revise &amp; Resubmit
            </Button>
          </div>

          {/* Latest Reviewer Directives & Comment */}
          {latestComment && (
            <div className="rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-white/90 dark:bg-card/90 p-4 text-xs text-amber-950 dark:text-amber-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between font-semibold text-[11px] text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                  Reviewer Directive
                </span>
                <span className="font-normal text-muted-foreground">
                  {latestComment.author} · {formatRelative(latestComment.createdAt)}
                </span>
              </div>
              <p className="font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                &ldquo;{latestComment.message}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {request.status === "resubmitted" && (
        <Alert className="border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/40">
          <Info className="size-4 text-purple-700 dark:text-purple-400" aria-hidden="true" />
          <AlertTitle className="text-purple-900 dark:text-purple-200">Resubmitted</AlertTitle>
          <AlertDescription className="text-purple-800 dark:text-purple-300">
            Your revised request has been resubmitted and is awaiting reviewer follow-up.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "rejected" && request.rejectionReason && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>Request rejected</AlertTitle>
          <AlertDescription>{request.rejectionReason}</AlertDescription>
        </Alert>
      )}

      {request.status === "approved" && (
        <Alert className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-200">Request approved</AlertTitle>
          <AlertDescription className="text-emerald-800 dark:text-emerald-300">
            Final processing (deposit, if applicable, and the approval letter) is in progress. You will be notified once this request is marked completed.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "completed" && request.approvalLetterAvailable && (
        <Alert className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-200">Request completed</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-emerald-800 dark:text-emerald-300">Your final approval letter is ready to download.</span>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 bg-card gap-1.5"
              onClick={() => {
                const doc = request.approvalLetter ?? {
                  name: `${request.code}-approval-letter.pdf`,
                  size: 245000,
                  uploadedAt: new Date().toISOString(),
                };
                onPreviewLetter(doc);
              }}
              aria-label="Download or view approval letter"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Download Letter
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {request.status === "withdrawn" && (
        <Alert>
          <UserX className="size-4 text-muted-foreground" aria-hidden="true" />
          <AlertTitle>Request withdrawn</AlertTitle>
          <AlertDescription>
            This request was withdrawn on {formatDate(request.withdrawnAt ?? request.updatedAt)}. Further review and approval processing has stopped.
          </AlertDescription>
        </Alert>
      )}

      {/* Reviewer feedback banner for non-changes-required statuses */}
      {latestComment && !revising && request.status !== "changes_required" && (
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
            <p className="text-sm font-medium text-foreground leading-relaxed">
              &ldquo;{latestComment.message}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              — {latestComment.author} · {formatRelative(latestComment.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
