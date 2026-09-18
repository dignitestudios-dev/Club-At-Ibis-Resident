"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRequestsQuery } from "@/features/requests/api/requests.queries";
import { getRequestTypeById } from "@/lib/mock/request-types";

export type DatePeriod = "all" | "30d" | "90d" | "year";

export function useRequestsList() {
  const user = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const { data: rawRequests = [], isLoading } = useRequestsQuery(user?.id);
  const [search, setSearch] = useState("");

  const urlStatus = (searchParams.get("status") as RequestStatus | "all") || "all";
  const urlType = searchParams.get("type") || "all";
  const urlPeriod = (searchParams.get("period") as DatePeriod) || "all";

  const [status, setStatusState] = useState<RequestStatus | "all">(urlStatus);
  const [requestTypeId, setRequestTypeIdState] = useState<string>(urlType);
  const [period, setPeriodState] = useState<DatePeriod>(urlPeriod);

  useEffect(() => {
    setStatusState((searchParams.get("status") as RequestStatus | "all") || "all");
    setRequestTypeIdState(searchParams.get("type") || "all");
    setPeriodState((searchParams.get("period") as DatePeriod) || "all");
  }, [searchParams]);

  function updateQuery(updates: Record<string, string | null>) {
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
  }

  function setStatus(nextStatus: RequestStatus | "all") {
    setStatusState(nextStatus);
    updateQuery({ status: nextStatus === "all" ? null : nextStatus });
  }

  function setRequestTypeId(nextType: string) {
    setRequestTypeIdState(nextType);
    updateQuery({ type: nextType === "all" ? null : nextType });
  }

  function setPeriod(nextPeriod: DatePeriod) {
    setPeriodState(nextPeriod);
    updateQuery({ period: nextPeriod === "all" ? null : nextPeriod });
  }

  function resetFilters() {
    setSearch("");
    setStatusState("all");
    setRequestTypeIdState("all");
    setPeriodState("all");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("type");
    params.delete("period");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/requests?${query}` : "/requests", { scroll: false });
    });
  }

  // Active / in-progress reviews (submitted, under_review, changes_required, resubmitted, approved)
  const activeRequests = rawRequests.filter(
    (r) => !["completed", "rejected", "withdrawn"].includes(r.status)
  );

  // History records (completed, rejected, withdrawn)
  const historyRequests = rawRequests.filter((r) =>
    ["completed", "rejected", "withdrawn"].includes(r.status)
  );

  function matchesDatePeriod(dateStr?: string): boolean {
    if (!dateStr || period === "all") return true;
    const itemDate = new Date(dateStr).getTime();
    const now = Date.now();
    if (period === "30d") return now - itemDate <= 30 * 24 * 60 * 60 * 1000;
    if (period === "90d") return now - itemDate <= 90 * 24 * 60 * 60 * 1000;
    if (period === "year") {
      const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
      return itemDate >= yearStart;
    }
    return true;
  }

  // Filtered active requests
  const filteredActiveRequests = activeRequests.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (requestTypeId !== "all" && r.requestTypeId !== requestTypeId) return false;
    if (!matchesDatePeriod(r.submittedAt ?? r.createdAt)) return false;
    if (search.trim()) {
      const type = getRequestTypeById(r.requestTypeId);
      const haystack = `${r.code} ${type?.name ?? ""} ${r.fieldValues.propertyAddress ?? ""} ${r.fieldValues.projectDescription ?? ""}`.toLowerCase();
      if (!haystack.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  // Filtered history requests
  const filteredHistoryRequests = historyRequests.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (requestTypeId !== "all" && r.requestTypeId !== requestTypeId) return false;
    if (!matchesDatePeriod(r.decidedAt ?? r.updatedAt ?? r.createdAt)) return false;
    if (search.trim()) {
      const type = getRequestTypeById(r.requestTypeId);
      const haystack = `${r.code} ${type?.name ?? ""} ${r.fieldValues.propertyAddress ?? ""} ${r.fieldValues.projectDescription ?? ""}`.toLowerCase();
      if (!haystack.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  return {
    activeRequests: filteredActiveRequests,
    allActiveRequests: activeRequests,
    historyRequests: filteredHistoryRequests,
    allHistoryRequests: historyRequests,
    allRequests: rawRequests,
    isLoading,
    search,
    setSearch,
    status,
    setStatus,
    requestTypeId,
    setRequestTypeId,
    period,
    setPeriod,
    resetFilters,
  };
}
