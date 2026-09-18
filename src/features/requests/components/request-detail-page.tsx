"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  UserX,
  MessageSquare,
  ReceiptText,
  DollarSign,
  CalendarCheck,
  Clock,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FilePreviewDialog, type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { Timeline } from "@/features/requests/components/timeline";
import { CommentFeed } from "@/features/requests/components/comment-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestReviseForm } from "@/features/requests/components/request-revise-form";
import { useRequestDetail } from "@/features/requests/hooks/use-request-detail";
import { getAllFieldsForRequestType } from "@/features/requests/schemas/request-step.schema";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime, formatFileSize, formatRelative } from "@/utils/format";

export default function RequestDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { request, requestType, isLoading, revising, startRevising, stopRevising } =
    useRequestDetail(id);
  const toast = useToast();
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/requests");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <EmptyState
        icon={FileText}
        title="Request not found"
        description="This request doesn't exist or you don't have access to it."
        action={
          <Button onClick={handleBack}>
            Back to Requests
          </Button>
        }
      />
    );
  }

  const uploadEntries = Object.entries(request.uploads).filter(
    ([, files]) => files.length > 0
  );
  const allFields = requestType ? getAllFieldsForRequestType(requestType) : [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="-ml-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-medium text-foreground">
                {requestType?.name ?? "Architectural Request"}
              </h1>
              <StatusBadge status={request.status} className="text-sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              {request.code} · Submitted {formatDate(request.submittedAt ?? request.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Unified Single Directive Banner for Changes Required */}
      {request.status === "changes_required" && !revising && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 to-amber-100/40 dark:from-amber-950/50 dark:to-amber-950/20 p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shadow-2xs">
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
              onClick={startRevising}
            >
              Revise &amp; Resubmit
            </Button>
          </div>

          {/* Latest Reviewer Directives & Comment */}
          {request.comments.length > 0 && (
            <div className="rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-white/90 dark:bg-card/90 p-4 text-xs text-amber-950 dark:text-amber-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between font-semibold text-[11px] text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-amber-700 dark:text-amber-400" />
                  Reviewer Directive
                </span>
                <span className="font-normal text-muted-foreground">
                  {request.comments[request.comments.length - 1].author} · {formatRelative(request.comments[request.comments.length - 1].createdAt)}
                </span>
              </div>
              <p className="font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                &ldquo;{request.comments[request.comments.length - 1].message}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {request.status === "resubmitted" && (
        <Alert className="border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/40">
          <Info className="size-4 text-purple-700 dark:text-purple-400" />
          <AlertTitle className="text-purple-900 dark:text-purple-200">Resubmitted</AlertTitle>
          <AlertDescription className="text-purple-800 dark:text-purple-300">
            Your revised request has been resubmitted and is awaiting reviewer follow-up.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "rejected" && request.rejectionReason && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Request rejected</AlertTitle>
          <AlertDescription>{request.rejectionReason}</AlertDescription>
        </Alert>
      )}

      {request.status === "approved" && (
        <Alert className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-200">Request approved</AlertTitle>
          <AlertDescription className="text-emerald-800 dark:text-emerald-300">
            Final processing (deposit, if applicable, and the approval letter) is in
            progress. You'll be notified once this request is marked completed.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "completed" && request.approvalLetterAvailable && (
        <Alert className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-200">Request completed</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-emerald-800 dark:text-emerald-300">Your final approval letter is ready to download.</span>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 bg-card"
              onClick={() => {
                const doc = request.approvalLetter ?? {
                  name: `${request.code}-approval-letter.pdf`,
                  size: 245000,
                  uploadedAt: new Date().toISOString(),
                };
                setPreviewFile(doc);
              }}
            >
              <Download />
              Download Letter
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {request.status === "withdrawn" && (
        <Alert>
          <UserX className="size-4 text-muted-foreground" />
          <AlertTitle>Request withdrawn</AlertTitle>
          <AlertDescription>
            This request was withdrawn on {formatDate(request.withdrawnAt ?? request.updatedAt)}
            . Further review and approval processing has stopped.
          </AlertDescription>
        </Alert>
      )}

      {revising && requestType && (
        <Card>
          <CardHeader>
            <CardTitle>Revise Your Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestReviseForm
              request={request}
              requestType={requestType}
              onDone={stopRevising}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviewer feedback banner for non-changes-required statuses */}
      {request.comments.length > 0 && !revising && request.status !== "changes_required" && (
        <div className="rounded-2xl border border-border/80 bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-5 shadow-2xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700/60 shadow-2xs">
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
              &ldquo;{request.comments[request.comments.length - 1].message}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              — {request.comments[request.comments.length - 1].author} · {formatRelative(request.comments[request.comments.length - 1].createdAt)}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-1">
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="documents">
                    Documents{uploadEntries.length > 0 ? ` (${uploadEntries.length})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="feedback">
                    Feedback{request.comments.length > 0 ? ` (${request.comments.length})` : ""}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="pt-4">
                  {requestType && (
                    <RequestReview
                      requestType={requestType}
                      values={request.fieldValues}
                      uploads={request.uploads}
                      onPreviewFile={(f) => setPreviewFile(f)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="documents" className="pt-4">
                  {uploadEntries.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No documents uploaded"
                      className="border-none py-8"
                    />
                  ) : (
                    <div className="space-y-4">
                      {uploadEntries.map(([fieldId, files]) => {
                        const fieldLabel = allFields.find((f) => f.id === fieldId)?.label;
                        return (
                          <div key={fieldId} className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {fieldLabel ?? fieldId}
                            </p>
                            <ul className="space-y-2">
                              {files.map((file) => (
                                <li
                                  key={file.id}
                                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-white dark:bg-card p-3 shadow-2xs transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                                >
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                                      onClick={() => setPreviewFile(file)}
                                      className="gap-1 bg-white dark:bg-card"
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
                                    >
                                      <Download className="size-3.5" />
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
                  )}
                </TabsContent>

                <TabsContent value="feedback" className="pt-4">
                  <CommentFeed comments={request.comments} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden bg-white dark:bg-card">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-3.5" />
                </span>
                <div>
                  <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
                  <p className="text-xs text-muted-foreground">Audit log of all actions & reviews</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Timeline entries={request.activity} />
            </CardContent>
          </Card>

          {(request.depositRequired || request.decidedAt) && (
            <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    <ReceiptText className="size-3.5" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-semibold">Summary</CardTitle>
                    <p className="text-xs text-muted-foreground">Financial &amp; board decisions</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {request.depositRequired && (
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
                          <DollarSign className="size-3.5" />
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Deposit Required
                        </span>
                      </div>
                      <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                        ${request.depositAmount?.toLocaleString() ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800 text-xs">
                      <span className="text-muted-foreground font-medium">Deposit Status</span>
                      {request.depositReceived ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/60 px-2.5 py-0.5 font-semibold text-emerald-800 dark:text-emerald-400 shadow-2xs">
                          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                          Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 px-2.5 py-0.5 font-semibold text-amber-900 dark:text-amber-400">
                          <Clock className="size-3 text-amber-600 dark:text-amber-400" />
                          Outstanding
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {request.decidedAt && (
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <CalendarCheck className="size-3.5 text-primary" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Decision Date</p>
                        <p className="text-[11px] text-muted-foreground">{formatRelative(request.decidedAt)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/70 dark:border-slate-700">
                      {formatDate(request.decidedAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {request.depositReceived && (
            <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                    <Banknote className="size-3.5" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-semibold">Refund</CardTitle>
                    <p className="text-xs text-muted-foreground">Post-review return of deposit funds</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {request.refundStatus === "refunded" ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-emerald-950/20 p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="size-4" />
                        </span>
                        <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                          Refund Processed
                        </span>
                      </div>
                      {request.depositAmount && (
                        <span className="font-mono text-base font-bold text-emerald-900 dark:text-emerald-300">
                          ${request.depositAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {request.refundDate && (
                      <div className="flex items-center justify-between text-xs text-emerald-900/80 dark:text-emerald-300/80 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="size-3 text-emerald-700 dark:text-emerald-400" />
                          Disbursement Date
                        </span>
                        <span className="font-semibold text-emerald-950 dark:text-emerald-200">{formatDate(request.refundDate)}</span>
                      </div>
                    )}
                    <p className="text-xs text-emerald-900/85 dark:text-emerald-300/85 leading-relaxed pt-1">
                       Your security deposit has been refunded to your original payment method.
                    </p>
                  </div>
                ) : request.refundStatus === "awaiting" ? (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-amber-950/40 dark:via-slate-900/80 dark:to-amber-950/20 p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                          <Clock className="size-4" />
                        </span>
                        <span className="text-xs font-semibold text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                          Pending Closeout
                        </span>
                      </div>
                      {request.depositAmount && (
                        <span className="font-mono text-base font-bold text-amber-900 dark:text-amber-300">
                          ${request.depositAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                      Your deposit refund is queued and will be disbursed following final project inspection and completion sign-off.
                    </p>
                  </div>
                ) : request.refundStatus === "no_refund" ? (
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Refund Status</span>
                      <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 font-medium text-slate-700 dark:text-slate-300">
                        No Refund Issued
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No refundable portion was returned according to ARB policy terms.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Refund Status</span>
                      <span className="text-muted-foreground italic font-medium">Eligible upon closeout</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A refund record will appear here if this request is withdrawn or completed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </div>
  );
}
