"use client";

import Link from "next/link";
import { PlusCircle, FileEdit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DraftCard } from "@/features/drafts/components/draft-card";
import { useDrafts } from "@/features/drafts/hooks/use-drafts";

export default function DraftsListPage() {
  const { drafts, isLoading, isDeleting, deleteDraft } = useDrafts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Drafts"
        description="In-progress architectural requests saved for later submission."
        actions={
          <Button nativeButton={false} render={<Link href="/requests/new" />}>
            <PlusCircle />
            New Request
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && drafts.length === 0 && (
        <EmptyState
          icon={FileEdit}
          title="No saved drafts"
          description="When you start a request and step away, your in-progress work is automatically saved here."
          action={
            <Button nativeButton={false} render={<Link href="/requests/new" />}>
              <PlusCircle />
              Start a Request
            </Button>
          }
        />
      )}

      {!isLoading && drafts.length > 0 && (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onDelete={deleteDraft}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
