"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PlusCircle, FileText, FileEdit, History, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchInput } from "@/components/shared/search-input";
import { RequestListItem } from "@/features/requests/components/request-list-item";
import { DraftCard } from "@/features/drafts/components/draft-card";
import { RequestsTabsHeader, type RequestsTabType } from "@/features/requests/components/list/requests-tabs-header";
import { RequestsFilterToolbar } from "@/features/requests/components/list/requests-filter-toolbar";
import { useRequestsList } from "@/features/requests/hooks/use-requests-list";
import { useDeleteDraftMutation } from "@/features/drafts/api/drafts.mutations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils/cn";

const VIEW_MODE_STORAGE_KEY = "ib_requests_view_mode";

const ACTIVE_STATUS_OPTIONS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All Active Statuses", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Required", value: "changes_required" },
  { label: "Approved", value: "approved" },
];

const HISTORY_STATUS_OPTIONS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All History Records", value: "all" },
  { label: "Completed & Closed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export default function RequestsListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const initialTab: RequestsTabType =
    tabParam === "history" ? "history" : tabParam === "drafts" ? "drafts" : "requests";

  const [activeTab, setActiveTab] = useState<RequestsTabType>(initialTab);
  const [viewMode, setViewModeState] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === "grid" || saved === "list") {
        setViewModeState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "history") {
      setActiveTab("history");
    } else if (tab === "drafts") {
      setActiveTab("drafts");
    } else {
      setActiveTab("requests");
    }
  }, [searchParams]);

  function handleTabChange(tab: RequestsTabType) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "requests") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `/requests?${query}` : "/requests");
  }

  const {
    activeRequests,
    activeTotalCount,
    historyRequests,
    historyTotalCount,
    draftRequests,
    draftsTotalCount,
    isLoading: isLoadingRequests,
    search,
    setSearch,
    status,
    setStatus,
    resetFilters,
  } = useRequestsList(activeTab);

  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [confirmingBatchDelete, setConfirmingBatchDelete] = useState(false);
  const { mutate: deleteDraftMutate, isPending: isDeleting } = useDeleteDraftMutation();

  useEffect(() => {
    setSelectedDraftIds((prev) => prev.filter((id) => draftRequests.some((d) => d.id === id)));
  }, [draftRequests]);

  const handleDeleteDraft = (id: string, onSettled?: () => void) => {
    setDeletingId(id);
    deleteDraftMutate(id, {
      onSuccess: () => {
        setDeletingId(null);
        toast.success("Draft discarded", "The draft has been permanently deleted.");
        onSettled?.();
      },
      onError: (error: any) => {
        setDeletingId(null);
        toast.error("Failed to discard draft", error?.response?.data?.message || error?.message || "An unexpected error occurred.");
        onSettled?.();
      },
    });
  };

  const isAllDraftsSelected = draftRequests.length > 0 && selectedDraftIds.length === draftRequests.length;
  const selectedDraftsCount = selectedDraftIds.length;

  const handleToggleSelectDraft = (id: string, selected: boolean) => {
    setSelectedDraftIds((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleToggleSelectAllDrafts = () => {
    if (isAllDraftsSelected) {
      setSelectedDraftIds([]);
    } else {
      setSelectedDraftIds(draftRequests.map((d) => d.id));
    }
  };

  const handleBatchDeleteDrafts = () => {
    if (!selectedDraftIds.length) return;
    deleteDraftMutate(selectedDraftIds, {
      onSuccess: () => {
        const count = selectedDraftIds.length;
        setSelectedDraftIds([]);
        setConfirmingBatchDelete(false);
        toast.success("Drafts discarded", `${count} draft${count > 1 ? "s have" : " has"} been permanently deleted.`);
      },
      onError: (error: any) => {
        toast.error("Failed to discard drafts", error?.response?.data?.message || error?.message || "An unexpected error occurred.");
      },
    });
  };

  const hasActiveFilters = search.trim() !== "" || status !== "all";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="animate-in fade-in slide-in-from-top-2 duration-400">
        <PageHeader
          title="My Requests"
          description="Track your active architectural modifications, inspect past records, and resume saved drafts."
          actions={
            <Button
              nativeButton={false}
              render={<Link href="/requests/new" />}
              aria-label="Create a new architectural request"
            >
              <PlusCircle className="size-4" aria-hidden="true" />
              New Request
            </Button>
          }
        />
      </div>

      <RequestsTabsHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSearch("");
          setStatus("all");
          handleTabChange(tab);
        }}
        activeCount={activeTotalCount}
        historyCount={historyTotalCount}
        draftsCount={draftsTotalCount}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Submitted / Active Requests Tab Content */}
      {activeTab === "requests" && (
        <div
          id="panel-requests"
          role="tabpanel"
          aria-labelledby="tab-requests"
          className="space-y-4 animate-in fade-in duration-300"
        >
          <RequestsFilterToolbar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            statusOptions={ACTIVE_STATUS_OPTIONS}
            statusPlaceholder="Filter by status"
            hasActiveFilters={hasActiveFilters}
            filteredCount={activeRequests.length}
            totalCount={activeTotalCount}
            onResetFilters={resetFilters}
            searchPlaceholder="Search by reference, category, title..."
          />

          {isLoadingRequests && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3",
                "animate-in fade-in duration-200"
              )}
              aria-busy="true"
              aria-live="polite"
            >
              {viewMode === "grid" ? (
                <>
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <Skeleton className="h-56 w-full rounded-2xl" />
                </>
              ) : (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              )}
            </div>
          )}

          {!isLoadingRequests && activeRequests.length === 0 && (
            <div className="animate-in fade-in duration-300">
              <EmptyState
                icon={FileText}
                title={hasActiveFilters ? "No matching requests found" : "No active requests found"}
                description={
                  hasActiveFilters
                    ? "Try adjusting your search criteria or filters, or clear all filters."
                    : "You currently have no active requests in review. Start a new architectural submission."
                }
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      nativeButton={false}
                      render={<Link href="/requests/new" />}
                      aria-label="Start a new request"
                    >
                      <PlusCircle className="size-4" aria-hidden="true" />
                      Start New Request
                    </Button>
                  )
                }
              />
            </div>
          )}

          {!isLoadingRequests && activeRequests.length > 0 && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3"
              )}
              role="list"
              aria-label="Active requests"
            >
              {activeRequests.map((request, idx) => (
                <RequestListItem
                  key={request.id}
                  request={request}
                  viewMode={viewMode}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${Math.min(idx * 50, 350)}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History (Completed & Rejected Records) Tab Content */}
      {activeTab === "history" && (
        <div
          id="panel-history"
          role="tabpanel"
          aria-labelledby="tab-history"
          className="space-y-4 animate-in fade-in duration-300"
        >
          <RequestsFilterToolbar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            statusOptions={HISTORY_STATUS_OPTIONS}
            statusPlaceholder="All History Outcomes"
            hasActiveFilters={hasActiveFilters}
            filteredCount={historyRequests.length}
            totalCount={historyTotalCount}
            onResetFilters={resetFilters}
            searchPlaceholder="Search history by reference, category..."
          />

          {isLoadingRequests && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3",
                "animate-in fade-in duration-200"
              )}
              aria-busy="true"
              aria-live="polite"
            >
              {viewMode === "grid" ? (
                <>
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <Skeleton className="h-56 w-full rounded-2xl" />
                </>
              ) : (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              )}
            </div>
          )}

          {!isLoadingRequests && historyRequests.length === 0 && (
            <div className="animate-in fade-in duration-300">
              <EmptyState
                icon={History}
                title={hasActiveFilters ? "No matching history records" : "No historical records found"}
                description={
                  hasActiveFilters
                    ? "Try adjusting your search criteria or clearing filters."
                    : "Requests that have completed final inspection, concluded with a decision, or been archived will appear here in your permanent record."
                }
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}

          {!isLoadingRequests && historyRequests.length > 0 && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3"
              )}
              role="list"
              aria-label="Past request history"
            >
              {historyRequests.map((request, idx) => (
                <RequestListItem
                  key={request.id}
                  request={request}
                  viewMode={viewMode}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${Math.min(idx * 50, 350)}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Drafts Tab Content */}
      {activeTab === "drafts" && (
        <div
          id="panel-drafts"
          role="tabpanel"
          aria-labelledby="tab-drafts"
          className="space-y-4 animate-in fade-in duration-300"
        >
          <div className="w-full sm:max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search drafts by reference, category, title..."
              ariaLabel="Search drafts"
              debounceMs={400}
            />
          </div>

          {/* Batch selection and action toolbar */}
          {!isLoadingRequests && draftRequests.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="select-all-drafts-tab"
                  checked={isAllDraftsSelected}
                  onCheckedChange={handleToggleSelectAllDrafts}
                  aria-label={isAllDraftsSelected ? "Deselect all drafts" : "Select all drafts"}
                  className="size-4.5 rounded-[5px]"
                />
                <label
                  htmlFor="select-all-drafts-tab"
                  className="text-xs font-medium text-foreground cursor-pointer select-none"
                >
                  {isAllDraftsSelected ? "Deselect All" : "Select All"} ({draftRequests.length})
                </label>
                {selectedDraftsCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    · <strong className="text-foreground">{selectedDraftsCount}</strong> selected
                  </span>
                )}
              </div>

              {selectedDraftsCount > 0 && (
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
                    <span>Discard Selected ({selectedDraftsCount})</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {isLoadingRequests && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3",
                "animate-in fade-in duration-200"
              )}
              aria-busy="true"
              aria-live="polite"
            >
              {viewMode === "grid" ? (
                <>
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <Skeleton className="h-56 w-full rounded-2xl" />
                </>
              ) : (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              )}
            </div>
          )}

          {!isLoadingRequests && draftRequests.length === 0 && (
            <div className="animate-in fade-in duration-300">
              <EmptyState
                icon={FileEdit}
                title={search.trim() ? "No matching drafts found" : "No saved drafts"}
                description={
                  search.trim()
                    ? `No drafts matched your search query "${search}". Try searching by a different reference or term.`
                    : "When you start a request and step away, your in-progress work is automatically saved here."
                }
                action={
                  search.trim() ? (
                    <Button variant="outline" onClick={() => setSearch("")}>
                      Clear Search
                    </Button>
                  ) : (
                    <Button
                      nativeButton={false}
                      render={<Link href="/requests/new" />}
                      aria-label="Start a new request draft"
                    >
                      <PlusCircle className="size-4" aria-hidden="true" />
                      Start a Request
                    </Button>
                  )
                }
              />
            </div>
          )}

          {!isLoadingRequests && draftRequests.length > 0 && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3"
              )}
              role="list"
              aria-label="Saved drafts"
            >
              {draftRequests.map((draft, idx) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  viewMode={viewMode}
                  selected={selectedDraftIds.includes(draft.id)}
                  onToggleSelect={handleToggleSelectDraft}
                  onDelete={handleDeleteDraft}
                  isDeleting={isDeleting && (deletingId === draft.id || selectedDraftIds.includes(draft.id))}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${Math.min(idx * 50, 350)}ms` }}
                />
              ))}
            </div>
          )}

          <ConfirmDialog
            open={confirmingBatchDelete}
            onOpenChange={(open) => {
              if (!isDeleting) setConfirmingBatchDelete(open);
            }}
            title={`Discard ${selectedDraftsCount} Draft${selectedDraftsCount > 1 ? "s" : ""} Permanently?`}
            description={`Are you sure you want to discard ${selectedDraftsCount} selected draft${selectedDraftsCount > 1 ? "s" : ""}? All submittals and uploaded files will be permanently deleted and cannot be recovered.`}
            confirmLabel={isDeleting ? "Discarding..." : `Discard ${selectedDraftsCount} Draft${selectedDraftsCount > 1 ? "s" : ""}`}
            destructive={true}
            loading={isDeleting}
            onConfirm={handleBatchDeleteDrafts}
          />
        </div>
      )}
    </div>
  );
}
