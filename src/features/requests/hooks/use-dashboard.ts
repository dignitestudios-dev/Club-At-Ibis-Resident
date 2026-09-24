"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRequestsQuery } from "@/features/requests/api/requests.queries";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";

export function useDashboard() {
  const user = useCurrentUser();
  const { data: requests, isLoading: isLoadingRequests } = useRequestsQuery(user?.id);
  const { data: drafts = [], isLoading: isLoadingDrafts } = useResidentDraftsQuery();

  const stats = useMemo(() => {
    return {
      total: requests?.length ?? 0,
      pending:
        requests?.filter((r) => r.status === "submitted" || r.status === "under_review")
          .length ?? 0,
      needsAction: requests?.filter((r) => r.status === "changes_required").length ?? 0,
      approved:
        requests?.filter((r) => r.status === "approved" || r.status === "completed").length ??
        0,
    };
  }, [requests]);

  const recentRequests = useMemo(() => {
    return (requests ?? []).slice(0, 5);
  }, [requests]);

  const requestsList = useMemo(() => {
    return requests ?? [];
  }, [requests]);

  return {
    user,
    requests: requestsList,
    recentRequests,
    drafts,
    isLoading: isLoadingRequests || isLoadingDrafts,
    stats,
  };
}
