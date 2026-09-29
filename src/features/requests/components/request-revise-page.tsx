"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestReviseWizard } from "@/features/requests/components/request-revise-wizard";
import { useRequestQuery } from "@/features/requests/api/requests.queries";

export default function RequestRevisePage({ id }: { id: string }) {
  const router = useRouter();
  const { data: request, isLoading } = useRequestQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" aria-live="polite" aria-busy="true">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Loading request" />
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
          <Button onClick={() => router.push("/requests")} aria-label="Back to requests list">
            Back to Requests
          </Button>
        }
      />
    );
  }

  // The backend only exposes revision.items while status is changes_required;
  // anywhere else there is nothing to revise, so send the resident back to
  // the read-only details page instead of showing an empty/broken wizard.
  if (request.status !== "changes_required" || !request.revision) {
    return (
      <EmptyState
        icon={FileText}
        title="Nothing to revise"
        description="This request isn't currently awaiting a revision from you."
        action={
          <Button nativeButton={false} render={<Link href={`/requests/${id}`} />}>
            Back to Request Details
          </Button>
        }
      />
    );
  }

  return <RequestReviseWizard request={request} />;
}
