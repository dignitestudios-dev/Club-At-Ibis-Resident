"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { CommentFeed } from "@/features/requests/components/comment-feed";
import { EarlierSubmissions } from "@/features/requests/components/earlier-submissions";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestDetailHeader } from "@/features/requests/components/detail/request-detail-header";
import { RequestDetailAlerts } from "@/features/requests/components/detail/request-detail-alerts";
import { RequestDetailSidebar } from "@/features/requests/components/detail/request-detail-sidebar";
import { RequestDocumentsTab } from "@/features/requests/components/detail/request-documents-tab";
import { useRequestDetail } from "@/features/requests/hooks/use-request-detail";
import { earlierSubmissions } from "@/features/requests/utils/submissions";
import { getFileDownloadUrl } from "@/features/requests/api/requests.service";

const FilePreviewDialog = dynamic(
  () => import("@/components/shared/file-preview-dialog").then((m) => m.FilePreviewDialog),
  { ssr: false }
);

export default function RequestDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { request, isLoading } = useRequestDetail(id);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

  const handleBack = () => {
    // Always land on the requests list, not wherever browser history happens
    // to point (a notification link, a deep link, another page entirely) —
    // this page's back action should be deterministic.
    router.push("/requests");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" aria-live="polite" aria-busy="true">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Loading request details" />
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
          <Button onClick={handleBack} aria-label="Back to requests list">
            Back to Requests
          </Button>
        }
      />
    );
  }

  const uploadEntries = Object.entries(request.uploads || {}).filter(
    ([, files]) => files && files.length > 0
  );
  const formFields: FieldConfig[] =
    request.formSnapshot && request.formSnapshot.length > 0
      ? request.formSnapshot
      : request.form?.fields && request.form.fields.length > 0
      ? request.form.fields
      : [];
  // Documents get their own card within Details (matching the admin/reviewer
  // detail pages), not mixed into the answer list and not a separate tab.
  const nonFileFields = formFields.filter((f) => f.type !== "file");

  const isDraft = request.status === "draft";
  const earlierRounds = earlierSubmissions(request);

  return (
    <div className="space-y-6">
      <RequestDetailHeader
        request={request}
        onBack={handleBack}
      />

      {isDraft && (
        <Alert className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
          <FileText className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold">Unsubmitted In-Progress Draft</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              This request has not been submitted for ARB review yet. You can resume editing and complete your submittal.
            </span>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/requests/new?draftId=${request.id}`} />}
              className="shrink-0"
            >
              Resume Draft
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <RequestDetailAlerts
        request={request}
        onPreviewLetter={(file) => setPreviewFile(file)}
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="min-w-0 space-y-6 lg:col-span-2 lg:sticky lg:top-20 self-start">
          <Card className="shadow-2xs">
            <CardContent className="pt-1">
              <Tabs defaultValue="details">
                <TabsList aria-label="Request sections">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="feedback">
                    Feedback{request.comments.length > 0 ? ` (${request.comments.length})` : ""}
                  </TabsTrigger>
                  {earlierRounds.length > 0 && (
                    <TabsTrigger value="submissionHistory">
                      Submission History ({earlierRounds.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="space-y-5 pt-4">
                  <RequestReview
                    fields={nonFileFields.length > 0 ? nonFileFields : undefined}
                    values={request.fieldValues}
                    onPreviewFile={(f) => setPreviewFile(f)}
                  />

                  <Card className="rounded-xl border border-border/70 bg-transparent shadow-none ring-0">
                    <CardHeader className="border-b border-border/70 pb-3">
                      <CardTitle className="font-heading text-lg font-medium">
                        Documents{uploadEntries.length > 0 ? ` (${uploadEntries.length})` : ""}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <RequestDocumentsTab
                        requestId={request.id}
                        uploadEntries={uploadEntries}
                        allFields={formFields}
                        onPreviewFile={(f) => setPreviewFile(f)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback" className="pt-4">
                  <CommentFeed comments={request.comments} />
                </TabsContent>

                {earlierRounds.length > 0 && (
                  <TabsContent value="submissionHistory" className="pt-4">
                    <EarlierSubmissions request={request} onPreview={(f) => setPreviewFile(f)} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-1 lg:sticky lg:top-20 self-start">
          <RequestDetailSidebar request={request} />
        </div>
      </div>

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        onRequestDownloadUrl={(fileId) => getFileDownloadUrl(request.id, fileId).then((r) => r.url)}
      />
    </div>
  );
}
