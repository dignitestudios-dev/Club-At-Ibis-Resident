"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResidentRequestsQuery } from "@/features/requests/api/requests.queries";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";
import type { RequestsTabType } from "@/features/requests/components/list/requests-tabs-header";
import { usableRange } from "@/lib/date-range";

// Stable references: a fresh `[]` each render re-triggers effects that depend on these lists.
const EMPTY_REQUESTS: NonNullable<ReturnType<typeof useResidentRequestsQuery>["data"]>["requests"] = [];
const EMPTY_DRAFTS: NonNullable<ReturnType<typeof useResidentDraftsQuery>["data"]>["drafts"] = [];

export function useRequestsList(activeTab: RequestsTabType = "requests") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const urlSearch = searchParams.get("search") || "";
  const [search, setSearchState] = useState(urlSearch);

  // "review_started" is the resident-facing status for both assigned and under-review requests.
  const urlStatus = searchParams.get("status") || "all";
  const [status, setStatusState] = useState<string>(urlStatus);

  // The remaining filters live in the URL only.
  const categoryId = searchParams.get("category") || "all";
  const categoryStatus = searchParams.get("categoryStatus") || "all";
  const submittedFrom = searchParams.get("from") || "";
  const submittedTo = searchParams.get("to") || "";

  useEffect(() => {
    setStatusState(searchParams.get("status") || "all");
    setSearchState(searchParams.get("search") || "");
  }, [searchParams]);

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (!val || val === "all") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `/requests?${query}` : "/requests", { scroll: false });
      });
    },
    [searchParams, router]
  );

  const setSearch = useCallback(
    (nextSearch: string) => {
      setSearchState(nextSearch);
      updateQuery({ search: nextSearch.trim() || null });
    },
    [updateQuery]
  );

  const setCategory = useCallback((next: string) => updateQuery({ category: next === "all" ? null : next }), [updateQuery]);
  const setCategoryStatus = useCallback((next: string) => updateQuery({ categoryStatus: next === "all" ? null : next }), [updateQuery]);
  const setDateRange = useCallback(
    (range: { from: string; to: string }) => updateQuery({ from: range.from || null, to: range.to || null }),
    [updateQuery]
  );

  const setStatus = useCallback(
    (nextStatus: string) => {
      setStatusState(nextStatus);
      updateQuery({ status: nextStatus === "all" ? null : nextStatus });
    },
    [updateQuery]
  );

  const resetFilters = useCallback(() => {
    setSearchState("");
    setStatusState("all");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("search");
    params.delete("type");
    params.delete("period");
    params.delete("category");
    params.delete("categoryStatus");
    params.delete("from");
    params.delete("to");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/requests?${query}` : "/requests", { scroll: false });
    });
  }, [searchParams, router]);

  const trimmedSearch = search.trim() || undefined;

  // Every tab's own (correctly filtered) query is always enabled, so its
  // badge count can come straight from that same response's
  // `pagination.total` — never a separate, differently-filtered "baseline"
  // fetch that can drift from what the tab actually shows. The tab that
  // isn't currently open only needs the total, so it's fetched with
  // `limit: 1` to keep the background requests cheap.
  const activeStatusQuery =
    status !== "all"
      ? status
      : "submitted,assigned,under_review,changes_required,resubmitted,approved";

  // An invalid range (start after end) is never sent to the API.
  const range = usableRange(submittedFrom, submittedTo);
  const extraFilters = {
    categoryId: categoryId !== "all" ? categoryId : undefined,
    categoryStatus: categoryStatus !== "all" ? categoryStatus : undefined,
    submittedFrom: range.from,
    submittedTo: range.to,
  };

  const isRequestsTab = activeTab === "requests";
  const {
    data: activeData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    isFetching: isFetchingActive,
    refetch: refetchActive,
  } = useResidentRequestsQuery({
    status: activeStatusQuery,
    search: trimmedSearch,
    limit: isRequestsTab ? undefined : 1,
    ...extraFilters,
  });

  const historyStatusQuery =
    status !== "all" ? status : "rejected,completed,withdrawn";

  const isHistoryTab = activeTab === "history";
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useResidentRequestsQuery({
    status: historyStatusQuery,
    search: trimmedSearch,
    limit: isHistoryTab ? undefined : 1,
    ...extraFilters,
  });

  const isDraftsTab = activeTab === "drafts";
  const { data: draftsData, isLoading: isLoadingDrafts } = useResidentDraftsQuery({
    search: trimmedSearch,
    limit: isDraftsTab ? undefined : 1,
  });

  const activeTotalCount = activeData?.pagination?.total ?? 0;
  const historyTotalCount = historyData?.pagination?.total ?? 0;
  const draftsTotalCount = draftsData?.pagination?.total ?? 0;

  const activeRequests = (isRequestsTab && activeData?.requests) || EMPTY_REQUESTS;
  const historyRequests = (isHistoryTab && historyData?.requests) || EMPTY_REQUESTS;
  const draftRequests = (isDraftsTab && draftsData?.drafts) || EMPTY_DRAFTS;

  const isError = (isRequestsTab && isErrorActive) || (isHistoryTab && isErrorHistory);
  const isRetrying = (isRequestsTab && isFetchingActive) || (isHistoryTab && isFetchingHistory);
  const retry = () => {
    if (isRequestsTab) void refetchActive();
    if (isHistoryTab) void refetchHistory();
  };
  const dateRangeError = submittedFrom && submittedTo && submittedFrom > submittedTo;

  return {
    activeRequests,
    activeTotalCount,
    historyRequests,
    historyTotalCount,
    draftRequests,
    draftsTotalCount,
    isLoading:
      (isRequestsTab && isLoadingActive) ||
      (isHistoryTab && isLoadingHistory) ||
      (isDraftsTab && isLoadingDrafts),
    search,
    setSearch,
    status,
    setStatus,
    categoryId,
    setCategory,
    categoryStatus,
    setCategoryStatus,
    submittedFrom,
    submittedTo,
    setDateRange,
    dateRangeInvalid: !!dateRangeError,
    isError,
    isRetrying,
    retry,
    resetFilters,
  };
}
