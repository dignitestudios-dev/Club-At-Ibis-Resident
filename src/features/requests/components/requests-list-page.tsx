"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PlusCircle, FileText, FileEdit, History } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestListItem } from "@/features/requests/components/request-list-item";
import { DraftCard } from "@/features/drafts/components/draft-card";
import { RequestsTabsHeader, type RequestsTabType } from "@/features/requests/components/list/requests-tabs-header";
import { RequestsFilterToolbar } from "@/features/requests/components/list/requests-filter-toolbar";
import { useRequestsList, type DatePeriod } from "@/features/requests/hooks/use-requests-list";
import { useDrafts } from "@/features/drafts/hooks/use-drafts";
import { requestTypes } from "@/lib/mock/request-types";
import { cn } from "@/utils/cn";

const VIEW_MODE_STORAGE_KEY = "ib_requests_view_mode";

const ACTIVE_STATUS_OPTIONS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All Active Statuses", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Required", value: "changes_required" },
  { label: "Resubmitted", value: "resubmitted" },
  { label: "Approved", value: "approved" },
];

const HISTORY_STATUS_OPTIONS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All History Records", value: "all" },
  { label: "Completed & Closed", value: "completed" },
  { label: "Not Approved", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  ...requestTypes.map((t) => ({ label: t.name, value: t.id })),
];

const PERIOD_OPTIONS: { label: string; value: DatePeriod }[] = [
  { label: "All Time", value: "all" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Year (2026)", value: "year" },
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
    allActiveRequests,
    historyRequests,
    allHistoryRequests,
    isLoading: isLoadingRequests,
    search,
    setSearch,
    status,
    setStatus,
    requestTypeId,
    setRequestTypeId,
    period,
    setPeriod,
    resetFilters,
  } = useRequestsList();

  const { drafts, isLoading: isLoadingDrafts, isDeleting, deleteDraft } = useDrafts();

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || requestTypeId !== "all" || period !== "all";

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
        onTabChange={handleTabChange}
        activeCount={allActiveRequests.length}
        historyCount={allHistoryRequests.length}
        draftsCount={drafts.length}
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
            requestTypeId={requestTypeId}
            onRequestTypeChange={setRequestTypeId}
            categoryOptions={CATEGORY_OPTIONS}
            period={period}
            onPeriodChange={setPeriod}
            periodOptions={PERIOD_OPTIONS}
            hasActiveFilters={hasActiveFilters}
            filteredCount={activeRequests.length}
            totalCount={allActiveRequests.length}
            onResetFilters={resetFilters}
            searchPlaceholder="Search by code, type, details..."
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
                title="No active requests found"
                description="Try adjusting your search criteria or filters, or start a new architectural submission."
                action={
                  <Button
                    nativeButton={false}
                    render={<Link href="/requests/new" />}
                    aria-label="Start a new request"
                  >
                    <PlusCircle className="size-4" aria-hidden="true" />
                    Start New Request
                  </Button>
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
            requestTypeId={requestTypeId}
            onRequestTypeChange={setRequestTypeId}
            categoryOptions={CATEGORY_OPTIONS}
            period={period}
            onPeriodChange={setPeriod}
            periodOptions={PERIOD_OPTIONS}
            hasActiveFilters={hasActiveFilters}
            filteredCount={historyRequests.length}
            totalCount={allHistoryRequests.length}
            onResetFilters={resetFilters}
            searchPlaceholder="Search history records..."
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
                title="No historical records found"
                description="Requests that have completed final inspection, concluded with a decision, or been archived will appear here in your permanent record."
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
          {isLoadingDrafts && (
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

          {!isLoadingDrafts && drafts.length === 0 && (
            <div className="animate-in fade-in duration-300">
              <EmptyState
                icon={FileEdit}
                title="No saved drafts"
                description="When you start a request and step away, your in-progress work is automatically saved here."
                action={
                  <Button
                    nativeButton={false}
                    render={<Link href="/requests/new" />}
                    aria-label="Start a new request draft"
                  >
                    <PlusCircle className="size-4" aria-hidden="true" />
                    Start a Request
                  </Button>
                }
              />
            </div>
          )}

          {!isLoadingDrafts && drafts.length > 0 && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3"
              )}
              role="list"
              aria-label="Saved drafts"
            >
              {drafts.map((draft, idx) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  viewMode={viewMode}
                  onDelete={deleteDraft}
                  isDeleting={isDeleting}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${Math.min(idx * 50, 350)}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
