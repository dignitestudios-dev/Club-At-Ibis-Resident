"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PlusCircle, Search, FileText, FileEdit, ListChecks, History } from "lucide-react";
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
import { useRequestsList } from "@/features/requests/hooks/use-requests-list";
import { useDrafts } from "@/features/drafts/hooks/use-drafts";
import { cn } from "@/utils/cn";

const ACTIVE_STATUS_OPTIONS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Required", value: "changes_required" },
  { label: "Resubmitted", value: "resubmitted" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

export default function RequestsListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const initialTab: "requests" | "history" | "drafts" =
    tabParam === "history" ? "history" : tabParam === "drafts" ? "drafts" : "requests";

  const [activeTab, setActiveTab] = useState<"requests" | "history" | "drafts">(initialTab);

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
      // Status filter is specific to active submitted requests
      params.delete("status");
    }
    const query = params.toString();
    router.replace(query ? `/requests?${query}` : "/requests");
  }

  const {
    activeRequests,
    allActiveRequests,
    completedRequests,
    allCompletedRequests,
    isLoading: isLoadingRequests,
    search,
    setSearch,
    status,
    setStatus,
  } = useRequestsList();

  const { drafts, isLoading: isLoadingDrafts, isDeleting, deleteDraft } = useDrafts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Requests"
        description="Track your active architectural requests, review past completed records, and continue saved drafts."
        actions={
          <Button nativeButton={false} render={<Link href="/requests/new" />}>
            <PlusCircle />
            New Request
          </Button>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-6 border-b border-border">
        {/* Tab 1: Submitted / Active Requests */}
        <button
          type="button"
          onClick={() => handleTabChange("requests")}
          className={cn(
            "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors outline-none",
            activeTab === "requests"
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ListChecks className="size-4" />
          <span>Submitted Requests</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              activeTab === "requests"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {allActiveRequests.length}
          </span>
          {activeTab === "requests" && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />
          )}
        </button>

        {/* Tab 2: History (Completed Requests) */}
        <button
          type="button"
          onClick={() => handleTabChange("history")}
          className={cn(
            "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors outline-none",
            activeTab === "history"
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="size-4" />
          <span>History</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              activeTab === "history"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                : "bg-muted text-muted-foreground"
            )}
          >
            {allCompletedRequests.length}
          </span>
          {activeTab === "history" && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />
          )}
        </button>

        {/* Tab 3: Saved Drafts */}
        <button
          type="button"
          onClick={() => handleTabChange("drafts")}
          className={cn(
            "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors outline-none",
            activeTab === "drafts"
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileEdit className="size-4" />
          <span>Saved Drafts</span>
          {drafts.length > 0 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                activeTab === "drafts"
                  ? "bg-amber-100 text-amber-900 border border-amber-300/60"
                  : "bg-amber-100/70 text-amber-800"
              )}
            >
              {drafts.length}
            </span>
          )}
          {activeTab === "drafts" && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Submitted Requests Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by request type, address, or code..."
                className="pl-8"
              />
            </div>
            <Select
              items={ACTIVE_STATUS_OPTIONS}
              value={status}
              onValueChange={(v) => setStatus(v as RequestStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoadingRequests && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}

          {!isLoadingRequests && activeRequests.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No active requests found"
              description="Try adjusting your search or filters, or start a new architectural request."
              action={
                <Button nativeButton={false} render={<Link href="/requests/new" />}>
                  <PlusCircle />
                  Start New Request
                </Button>
              }
            />
          )}

          {!isLoadingRequests && activeRequests.length > 0 && (
            <div className="space-y-3">
              {activeRequests.map((request) => (
                <RequestListItem key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History (Completed Requests) Tab Content */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search completed requests by type, address, or code..."
                className="pl-8"
              />
            </div>
          </div>

          {isLoadingRequests && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}

          {!isLoadingRequests && completedRequests.length === 0 && (
            <EmptyState
              icon={History}
              title="No completed records found"
              description="Requests that have completed final inspection and ARB closeout will appear here in your permanent record."
            />
          )}

          {!isLoadingRequests && completedRequests.length > 0 && (
            <div className="space-y-3">
              {completedRequests.map((request) => (
                <RequestListItem key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Drafts Tab Content */}
      {activeTab === "drafts" && (
        <div className="space-y-4">
          {isLoadingDrafts && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          )}

          {!isLoadingDrafts && drafts.length === 0 && (
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

          {!isLoadingDrafts && drafts.length > 0 && (
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
      )}
    </div>
  );
}
