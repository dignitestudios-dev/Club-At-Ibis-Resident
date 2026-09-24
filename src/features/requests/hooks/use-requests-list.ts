"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResidentRequestsQuery } from "@/features/requests/api/requests.queries";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";
import type { RequestsTabType } from "@/features/requests/components/list/requests-tabs-header";

export type DatePeriod = "all" | "30d" | "90d" | "year";

export function useRequestsList(activeTab: RequestsTabType = "requests") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");

  const urlStatus = (searchParams.get("status") as RequestStatus | "all") || "all";
  const [status, setStatusState] = useState<RequestStatus | "all">(urlStatus);

  useEffect(() => {
    setStatusState((searchParams.get("status") as RequestStatus | "all") || "all");
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

  const setStatus = useCallback(
    (nextStatus: RequestStatus | "all") => {
      setStatusState(nextStatus);
      updateQuery({ status: nextStatus === "all" ? null : nextStatus });
    },
    [updateQuery]
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusState("all");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("type");
    params.delete("period");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/requests?${query}` : "/requests", { scroll: false });
    });
  }, [searchParams, router]);

  const trimmedSearch = search.trim() || undefined;

  // 1. Single baseline query to calculate tab badge counts without refetching on search
  const { data: baseData, isLoading: isLoadingBase } = useResidentRequestsQuery(
    { limit: 100 },
    { enabled: true }
  );

  const allRecords = baseData?.requests ?? [];

  const activeTotalCount = useMemo(() => {
    return allRecords.filter(
      (r) =>
        r.status === "submitted" ||
        r.status === "under_review" ||
        r.status === "changes_required" ||
        r.status === "resubmitted" ||
        r.status === "approved"
    ).length;
  }, [allRecords]);

  const historyTotalCount = useMemo(() => {
    return allRecords.filter(
      (r) => r.status === "completed" || r.status === "rejected" || r.status === "withdrawn"
    ).length;
  }, [allRecords]);

  const draftsTotalCount = useMemo(() => {
    return allRecords.filter((r) => r.status === "draft").length;
  }, [allRecords]);

  // 2. Active tab query - ONLY runs when activeTab === "requests"
  const activeStatusQuery =
    status !== "all"
      ? status
      : "submitted,under_review,changes_required,resubmitted,approved";

  const isRequestsTab = activeTab === "requests";
  const { data: activeData, isLoading: isLoadingActive } = useResidentRequestsQuery(
    {
      status: activeStatusQuery,
      search: trimmedSearch,
    },
    { enabled: isRequestsTab }
  );

  // 3. History tab query - ONLY runs when activeTab === "history"
  const historyStatusQuery =
    status !== "all" ? status : "completed,rejected,withdrawn";

  const isHistoryTab = activeTab === "history";
  const { data: historyData, isLoading: isLoadingHistory } = useResidentRequestsQuery(
    {
      status: historyStatusQuery,
      search: trimmedSearch,
    },
    { enabled: isHistoryTab }
  );

  // 4. Drafts tab query - ONLY runs when activeTab === "drafts"
  const isDraftsTab = activeTab === "drafts";
  const { data: draftsData, isLoading: isLoadingDrafts } = useResidentDraftsQuery(
    {
      search: trimmedSearch,
    },
    { enabled: isDraftsTab }
  );

  const activeRequests = isRequestsTab ? activeData?.requests ?? [] : [];
  const historyRequests = isHistoryTab ? historyData?.requests ?? [] : [];
  const draftRequests = isDraftsTab ? draftsData ?? [] : [];

  return {
    activeRequests,
    activeTotalCount,
    historyRequests,
    historyTotalCount,
    draftRequests,
    draftsTotalCount,
    isLoading:
      isLoadingBase ||
      (isRequestsTab && isLoadingActive) ||
      (isHistoryTab && isLoadingHistory) ||
      (isDraftsTab && isLoadingDrafts),
    search,
    setSearch,
    status,
    setStatus,
    requestTypeId: "all",
    setRequestTypeId: () => {},
    period: "all" as DatePeriod,
    setPeriod: () => {},
    resetFilters,
  };
}
