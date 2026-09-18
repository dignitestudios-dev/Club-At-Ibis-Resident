"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useRequestsQuery } from "@/features/requests/api/requests.queries";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";

export function useDashboard() {
  const user = useCurrentUser();
  const { data: requests, isLoading: isLoadingRequests } = useRequestsQuery(user?.id);
  const { data: drafts = [], isLoading: isLoadingDrafts } = useResidentDraftsQuery(user?.id);

  const stats = {
    total: requests?.length ?? 0,
    pending:
      requests?.filter((r) => r.status === "submitted" || r.status === "under_review")
        .length ?? 0,
    needsAction: requests?.filter((r) => r.status === "changes_required").length ?? 0,
    approved:
      requests?.filter((r) => r.status === "approved" || r.status === "completed").length ??
      0,
  };

  return {
    user,
    requests: requests ?? [],
    recentRequests: (requests ?? []).slice(0, 5),
    drafts,
    isLoading: isLoadingRequests || isLoadingDrafts,
    stats,
  };
}
