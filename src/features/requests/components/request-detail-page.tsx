"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { type PreviewableFile } from "@/components/shared/file-preview-dialog";
import { CommentFeed } from "@/features/requests/components/comment-feed";
import { RequestReview } from "@/features/requests/components/request-review";
import { RequestReviseForm } from "@/features/requests/components/request-revise-form";
import { RequestDetailHeader } from "@/features/requests/components/detail/request-detail-header";
import { RequestDetailAlerts } from "@/features/requests/components/detail/request-detail-alerts";
import { RequestDetailSidebar } from "@/features/requests/components/detail/request-detail-sidebar";
import { RequestDocumentsTab } from "@/features/requests/components/detail/request-documents-tab";
import { useRequestDetail } from "@/features/requests/hooks/use-request-detail";
import { getAllFieldsForRequestType } from "@/features/requests/schemas/request-step.schema";

const FilePreviewDialog = dynamic(
  () => import("@/components/shared/file-preview-dialog").then((m) => m.FilePreviewDialog),
  { ssr: false }
);

export default function RequestDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { request, requestType, isLoading, revising, startRevising, stopRevising } =
    useRequestDetail(id);
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

  const uploadEntries = Object.entries(request.uploads).filter(
    ([, files]) => files.length > 0
  );
  const allFields = requestType ? getAllFieldsForRequestType(requestType) : [];

  return (
    <div className="space-y-6">
      <RequestDetailHeader
        request={request}
        requestType={requestType}
        onBack={handleBack}
      />

      <RequestDetailAlerts
        request={request}
        revising={revising}
        onStartRevising={startRevising}
        onPreviewLetter={(file) => setPreviewFile(file)}
      />

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

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="space-y-6 lg:col-span-2 lg:sticky lg:top-20 self-start">
          <Card className="shadow-2xs">
            <CardContent className="pt-1">
              <Tabs defaultValue="details">
                <TabsList aria-label="Request sections">
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
                  <RequestDocumentsTab
                    uploadEntries={uploadEntries}
                    allFields={allFields}
                    onPreviewFile={(f) => setPreviewFile(f)}
                  />
                </TabsContent>

                <TabsContent value="feedback" className="pt-4">
                  <CommentFeed comments={request.comments} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1 lg:sticky lg:top-20 self-start">
          <RequestDetailSidebar request={request} />
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
