"use client";

import { useState, useEffect, useTransition, useMemo, useCallback } from "react";
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

  const setRequestTypeId = useCallback(
    (nextType: string) => {
      setRequestTypeIdState(nextType);
      updateQuery({ type: nextType === "all" ? null : nextType });
    },
    [updateQuery]
  );

  const setPeriod = useCallback(
    (nextPeriod: DatePeriod) => {
      setPeriodState(nextPeriod);
      updateQuery({ period: nextPeriod === "all" ? null : nextPeriod });
    },
    [updateQuery]
  );

  const resetFilters = useCallback(() => {
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
  }, [searchParams, router]);

  // Active / in-progress reviews (submitted, under_review, changes_required, resubmitted, approved)
  const activeRequests = useMemo(() => {
    return rawRequests.filter(
      (r) => !["completed", "rejected", "withdrawn"].includes(r.status)
    );
  }, [rawRequests]);

  // History records (completed, rejected, withdrawn)
  const historyRequests = useMemo(() => {
    return rawRequests.filter((r) =>
      ["completed", "rejected", "withdrawn"].includes(r.status)
    );
  }, [rawRequests]);

  const matchesDatePeriod = useCallback(
    (dateStr?: string): boolean => {
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
    },
    [period]
  );

  // Filtered active requests
  const filteredActiveRequests = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    return activeRequests.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (requestTypeId !== "all" && r.requestTypeId !== requestTypeId) return false;
      if (!matchesDatePeriod(r.submittedAt ?? r.createdAt)) return false;
      if (trimmedSearch) {
        const type = getRequestTypeById(r.requestTypeId);
        const haystack = `${r.code} ${type?.name ?? ""} ${r.fieldValues.propertyAddress ?? ""} ${r.fieldValues.projectDescription ?? ""}`.toLowerCase();
        if (!haystack.includes(trimmedSearch)) return false;
      }
      return true;
    });
  }, [activeRequests, status, requestTypeId, matchesDatePeriod, search]);

  // Filtered history requests
  const filteredHistoryRequests = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    return historyRequests.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (requestTypeId !== "all" && r.requestTypeId !== requestTypeId) return false;
      if (!matchesDatePeriod(r.decidedAt ?? r.updatedAt ?? r.createdAt)) return false;
      if (trimmedSearch) {
        const type = getRequestTypeById(r.requestTypeId);
        const haystack = `${r.code} ${type?.name ?? ""} ${r.fieldValues.propertyAddress ?? ""} ${r.fieldValues.projectDescription ?? ""}`.toLowerCase();
        if (!haystack.includes(trimmedSearch)) return false;
      }
      return true;
    });
  }, [historyRequests, status, requestTypeId, matchesDatePeriod, search]);

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
