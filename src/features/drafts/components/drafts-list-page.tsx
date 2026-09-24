"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, FileEdit, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DraftCard } from "@/features/drafts/components/draft-card";
import { useDrafts } from "@/features/drafts/hooks/use-drafts";

export default function DraftsListPage() {
  const [search, setSearch] = useState("");
  const { drafts, isLoading, isDeleting, deleteDraft } = useDrafts({ search });

  const hasSearch = search.trim().length > 0;

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search drafts by reference, category, title..."
            ariaLabel="Search drafts"
            debounceMs={400}
          />
        </div>
        {hasSearch && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{drafts.length} draft{drafts.length !== 1 ? "s" : ""} found</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="h-7 px-2 text-xs gap-1"
            >
              <RotateCcw className="size-3" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && drafts.length === 0 && (
        <EmptyState
          icon={FileEdit}
          title={hasSearch ? "No matching drafts" : "No saved drafts"}
          description={
            hasSearch
              ? `No drafts matched your search query "${search}". Try searching by a different term or reference ID.`
              : "When you start a request and step away, your in-progress work is automatically saved here."
          }
          action={
            hasSearch ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                <RotateCcw className="size-4" />
                Clear Search
              </Button>
            ) : (
              <Button nativeButton={false} render={<Link href="/requests/new" />}>
                <PlusCircle className="size-4" />
                Start a Request
              </Button>
            )
          }
        />
      )}

      {!isLoading && drafts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
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
