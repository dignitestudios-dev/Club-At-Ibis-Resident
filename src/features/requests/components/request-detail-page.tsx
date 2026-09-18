"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FilePreviewDialog, type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { Timeline } from "@/features/requests/components/timeline";
import { CommentFeed } from "@/features/requests/components/comment-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestReviseForm } from "@/features/requests/components/request-revise-form";
import { useRequestDetail } from "@/features/requests/hooks/use-request-detail";
import { getAllFieldsForRequestType } from "@/features/requests/schemas/request-step.schema";
import { useWithdrawRequestMutation } from "@/features/requests/api/requests.mutations";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatFileSize } from "@/utils/format";

const REFUND_LABEL: Record<RefundStatus, string> = {
  awaiting: "Awaiting Refund Action",
  refunded: "Refunded",
  no_refund: "No Refund",
};

export default function RequestDetailPage({ id }: { id: string }) {
  const { request, requestType, isLoading, revising, startRevising, stopRevising } =
    useRequestDetail(id);
  const toast = useToast();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawRequestMutation();
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

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
          <Button nativeButton={false} render={<Link href="/requests" />}>
            Back to My Requests
          </Button>
        }
      />
    );
  }

  const uploadEntries = Object.entries(request.uploads).filter(
    ([, files]) => files.length > 0
  );
  const allFields = requestType ? getAllFieldsForRequestType(requestType) : [];
  const canWithdraw = request.status !== "withdrawn";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/requests" />}
          className="-ml-2"
        >
          <ArrowLeft />
          Back to My Requests
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
          {canWithdraw && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmingWithdraw(true)}
            >
              <UserX />
              Withdraw Request
            </Button>
          )}
        </div>
      </div>

      {request.status === "changes_required" && !revising && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="size-4 text-amber-600" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <AlertTitle className="text-amber-900">Changes required</AlertTitle>
              <AlertDescription className="text-amber-800">
                The ARB has flagged specific items on this request. Review the feedback below, then revise and resubmit.
              </AlertDescription>
            </div>
            <Button size="sm" className="shrink-0 self-start sm:self-center" onClick={startRevising}>
              Revise &amp; Resubmit
            </Button>
          </div>
        </Alert>
      )}

      {request.status === "resubmitted" && (
        <Alert className="border-purple-200 bg-purple-50/80">
          <Info className="size-4 text-purple-700" />
          <AlertTitle className="text-purple-900">Resubmitted</AlertTitle>
          <AlertDescription className="text-purple-800">
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
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <AlertTitle className="text-emerald-900">Request approved</AlertTitle>
          <AlertDescription className="text-emerald-800">
            Final processing (deposit, if applicable, and the approval letter) is in
            progress. You'll be notified once this request is marked completed.
          </AlertDescription>
        </Alert>
      )}

      {request.status === "completed" && request.approvalLetterAvailable && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <AlertTitle className="text-emerald-900">Request completed</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-emerald-800">Your final approval letter is ready to download.</span>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 bg-white"
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
                                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-white p-3 shadow-2xs transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs"
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
                                      className="gap-1 bg-white"
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
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline entries={request.activity} />
            </CardContent>
          </Card>

          {(request.depositRequired || request.decidedAt) && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {request.depositRequired && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Deposit required</span>
                      <span className="font-medium text-foreground">
                        ${request.depositAmount?.toLocaleString() ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Deposit status</span>
                      <span className="font-medium text-foreground">
                        {request.depositReceived ? "Received" : "Outstanding"}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                {request.decidedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Decision date</span>
                    <span className="font-medium text-foreground">
                      {formatDate(request.decidedAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {request.depositReceived && (
            <Card>
              <CardHeader>
                <CardTitle>Refund</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-foreground">
                    {request.refundStatus === "no_refund"
                      ? "–"
                      : request.refundStatus
                        ? REFUND_LABEL[request.refundStatus]
                        : "–"}
                  </span>
                </div>
                {request.refundStatus === "refunded" && request.refundDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Refund date</span>
                    <span className="font-medium text-foreground">
                      {formatDate(request.refundDate)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {request.refundStatus === "awaiting" &&
                    "Your deposit refund is being processed by the ARB."}
                  {request.refundStatus === "refunded" &&
                    "Your deposit has been refunded."}
                  {request.refundStatus === "no_refund" &&
                    "No refund was issued for this deposit."}
                  {!request.refundStatus &&
                    "A refund outcome will appear here if this request is withdrawn."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingWithdraw}
        onOpenChange={setConfirmingWithdraw}
        title="Withdraw this request?"
        description="Further processing will stop. This cannot be undone, but your documents and history remain available."
        confirmLabel="Withdraw Request"
        destructive
        loading={isWithdrawing}
        onConfirm={() =>
          withdraw(request.id, {
            onSuccess: () => setConfirmingWithdraw(false),
          })
        }
      />

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </div>
  );
}
