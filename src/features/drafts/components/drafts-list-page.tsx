"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PlusCircle, FileEdit, RotateCcw, Trash2, CheckSquare, Square } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DraftCard } from "@/features/drafts/components/draft-card";
import { useDrafts } from "@/features/drafts/hooks/use-drafts";

export default function DraftsListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearchState] = useState(urlSearch);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [confirmingBatchDelete, setConfirmingBatchDelete] = useState(false);

  useEffect(() => {
    setSearchState(searchParams.get("search") || "");
  }, [searchParams]);

  const setSearch = useCallback(
    (nextSearch: string) => {
      setSearchState(nextSearch);
      const params = new URLSearchParams(searchParams.toString());
      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      } else {
        params.delete("search");
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `/drafts?${query}` : "/drafts", { scroll: false });
      });
    },
    [searchParams, router]
  );

  const { drafts, isLoading, isDeleting, deletingId, deleteDraft, deleteDrafts } = useDrafts({ search });

  useEffect(() => {
    setSelectedDraftIds((prev) => prev.filter((id) => drafts.some((d) => d.id === id)));
  }, [drafts]);

  const hasSearch = search.trim().length > 0;
  const isAllSelected = drafts.length > 0 && selectedDraftIds.length === drafts.length;
  const selectedCount = selectedDraftIds.length;

  const handleToggleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedDraftIds((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedDraftIds([]);
    } else {
      setSelectedDraftIds(drafts.map((d) => d.id));
    }
  }, [isAllSelected, drafts]);

  const handleBatchDelete = useCallback(() => {
    if (!selectedDraftIds.length) return;
    deleteDrafts(selectedDraftIds, () => {
      setSelectedDraftIds([]);
      setConfirmingBatchDelete(false);
    });
  }, [selectedDraftIds, deleteDrafts]);

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

      {/* Batch selection and action toolbar */}
      {!isLoading && drafts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="select-all-drafts"
              checked={isAllSelected}
              onCheckedChange={handleToggleSelectAll}
              aria-label={isAllSelected ? "Deselect all drafts" : "Select all drafts"}
              className="size-4.5 rounded-[5px]"
            />
            <label
              htmlFor="select-all-drafts"
              className="text-xs font-medium text-foreground cursor-pointer select-none"
            >
              {isAllSelected ? "Deselect All" : "Select All"} ({drafts.length})
            </label>
            {selectedCount > 0 && (
              <span className="text-xs text-muted-foreground">
                · <strong className="text-foreground">{selectedCount}</strong> selected
              </span>
            )}
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDraftIds([])}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmingBatchDelete(true)}
                disabled={isDeleting}
                className="h-8 gap-1.5 px-3 text-xs shadow-2xs"
              >
                <Trash2 className="size-3.5" />
                <span>Discard Selected ({selectedCount})</span>
              </Button>
            </div>
          )}
        </div>
      )}

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
              selected={selectedDraftIds.includes(draft.id)}
              onToggleSelect={handleToggleSelect}
              onDelete={deleteDraft}
              isDeleting={isDeleting && (deletingId === draft.id || selectedDraftIds.includes(draft.id))}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmingBatchDelete}
        onOpenChange={(open) => {
          if (!isDeleting) setConfirmingBatchDelete(open);
        }}
        title={`Discard ${selectedCount} Draft${selectedCount > 1 ? "s" : ""} Permanently?`}
        description={`Are you sure you want to discard ${selectedCount} selected draft${selectedCount > 1 ? "s" : ""}? All submittals and uploaded files will be permanently deleted and cannot be recovered.`}
        confirmLabel={isDeleting ? "Discarding..." : `Discard ${selectedCount} Draft${selectedCount > 1 ? "s" : ""}`}
        destructive={true}
        loading={isDeleting}
        onConfirm={handleBatchDelete}
      />
    </div>
  );
}

