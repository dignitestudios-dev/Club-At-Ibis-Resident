"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  FileText,
  FileEdit,
  ListChecks,
  History,
  RotateCcw,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestListItem } from "@/features/requests/components/request-list-item";
import { DraftCard } from "@/features/drafts/components/draft-card";
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
  const initialTab: "requests" | "history" | "drafts" =
    tabParam === "history" ? "history" : tabParam === "drafts" ? "drafts" : "requests";

  const [activeTab, setActiveTab] = useState<"requests" | "history" | "drafts">(initialTab);
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

  function handleTabChange(tab: "requests" | "history" | "drafts") {
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
            <Button nativeButton={false} render={<Link href="/requests/new" />}>
              <PlusCircle className="size-4" />
              New Request
            </Button>
          }
        />
      </div>

      {/* Header Controls: Tab Switcher & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-400 delay-75">
        {/* Simplified, Modern Pill Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit max-w-full overflow-x-auto">
          {/* Tab 1: Active Requests */}
          <button
            type="button"
            onClick={() => handleTabChange("requests")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0",
              activeTab === "requests"
                ? "bg-white text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListChecks className="size-3.5" />
            <span>Active Requests</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                activeTab === "requests"
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-200 text-muted-foreground"
              )}
            >
              {allActiveRequests.length}
            </span>
          </button>

          {/* Tab 2: History */}
          <button
            type="button"
            onClick={() => handleTabChange("history")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0",
              activeTab === "history"
                ? "bg-white text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="size-3.5" />
            <span>History &amp; Closed</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                activeTab === "history"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-muted-foreground"
              )}
            >
              {allHistoryRequests.length}
            </span>
          </button>

          {/* Tab 3: Saved Drafts */}
          <button
            type="button"
            onClick={() => handleTabChange("drafts")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0",
              activeTab === "drafts"
                ? "bg-white text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileEdit className="size-3.5" />
            <span>Saved Drafts</span>
            {drafts.length > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                  activeTab === "drafts"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-amber-100/70 text-amber-800"
                )}
              >
                {drafts.length}
              </span>
            )}
          </button>
        </div>

        {/* View Switcher: Cards vs List */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleViewModeChange("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              viewMode === "grid"
                ? "bg-white text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Card Grid View"
            aria-label="Card Grid View"
          >
            <LayoutGrid className="size-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              viewMode === "list"
                ? "bg-white text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="List View"
            aria-label="List View"
          >
            <List className="size-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Submitted / Active Requests Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Multi-Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, type, details..."
                className="pl-8 pr-8 bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select
              items={ACTIVE_STATUS_OPTIONS}
              value={status}
              onValueChange={(v) => setStatus(v as RequestStatus | "all")}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              items={CATEGORY_OPTIONS}
              value={requestTypeId}
              onValueChange={(v) => setRequestTypeId(v as string)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select
              items={PERIOD_OPTIONS}
              value={period}
              onValueChange={(v) => setPeriod(v as DatePeriod)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Clear Trigger */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Showing filtered results ({activeRequests.length} of {allActiveRequests.length})</span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Reset filters
              </button>
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
                  <Button nativeButton={false} render={<Link href="/requests/new" />}>
                    <PlusCircle className="size-4" />
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
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Multi-Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history records..."
                className="pl-8 pr-8 bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select
              items={HISTORY_STATUS_OPTIONS}
              value={status}
              onValueChange={(v) => setStatus(v as RequestStatus | "all")}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All History Outcomes" />
              </SelectTrigger>
              <SelectContent>
                {HISTORY_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              items={CATEGORY_OPTIONS}
              value={requestTypeId}
              onValueChange={(v) => setRequestTypeId(v as string)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select
              items={PERIOD_OPTIONS}
              value={period}
              onValueChange={(v) => setPeriod(v as DatePeriod)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Clear Trigger */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Showing filtered records ({historyRequests.length} of {allHistoryRequests.length})</span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Reset filters
              </button>
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
        <div className="space-y-4 animate-in fade-in duration-300">
          {isLoadingDrafts && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5"
                  : "flex flex-col gap-3",
                "animate-in fade-in duration-200"
              )}
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
                  <Button nativeButton={false} render={<Link href="/requests/new" />}>
                    <PlusCircle className="size-4" />
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
