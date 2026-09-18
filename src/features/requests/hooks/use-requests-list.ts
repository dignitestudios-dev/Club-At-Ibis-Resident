"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRequestsQuery } from "@/features/requests/api/requests.queries";
import { getRequestTypeById } from "@/lib/mock/request-types";

export function useRequestsList() {
  const user = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const { data: rawRequests = [], isLoading } = useRequestsQuery(user?.id);
  const [search, setSearch] = useState("");

  const urlStatus = (searchParams.get("status") as RequestStatus | "all") || "all";
  const [status, setStatusState] = useState<RequestStatus | "all">(urlStatus);

  useEffect(() => {
    const current = (searchParams.get("status") as RequestStatus | "all") || "all";
    setStatusState(current);
  }, [searchParams]);

  function setStatus(nextStatus: RequestStatus | "all") {
    setStatusState(nextStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (nextStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/requests?${query}` : "/requests", { scroll: false });
    });
  }

  // Active (Submitted/In-Review) requests: status !== "completed"
  const activeRequests = rawRequests.filter((r) => r.status !== "completed");

  // History requests: status === "completed"
  const completedRequests = rawRequests.filter((r) => r.status === "completed");

  // Filtered active requests by status & search
  const filteredActiveRequests = activeRequests.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (search.trim()) {
      const type = getRequestTypeById(r.requestTypeId);
      const haystack = `${r.code} ${type?.name ?? ""} ${r.fieldValues.propertyAddress ?? ""}`.toLowerCase();
      if (!haystack.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  // Filtered completed requests by search
  const filteredCompletedRequests = completedRequests.filter((r) => {
    if (search.trim()) {
      const type = getRequestTypeById(r.requestTypeId);
      const haystack = `${r.code} ${type?.name ?? ""} ${r.fieldValues.propertyAddress ?? ""}`.toLowerCase();
      if (!haystack.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  return {
    activeRequests: filteredActiveRequests,
    allActiveRequests: activeRequests,
    completedRequests: filteredCompletedRequests,
    allCompletedRequests: completedRequests,
    allRequests: rawRequests,
    isLoading,
    search,
    setSearch,
    status,
    setStatus,
  };
}
