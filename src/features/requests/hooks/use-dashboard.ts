"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getResidentDashboard } from "@/features/requests/api/dashboard.service";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";

export function useDashboard() {
  const user = useCurrentUser();
  const { data, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["dashboard", "resident"],
    queryFn: getResidentDashboard,
    staleTime: 30_000,
  });
  const { data: drafts = [], isLoading: isLoadingDrafts } = useResidentDraftsQuery();

  return {
    user,
    recentRequests: data?.recentRequests ?? [],
    drafts,
    isLoading: isLoadingDashboard || isLoadingDrafts,
    stats: {
      total: data?.summary.totalRequests ?? 0,
      pending: data?.summary.pendingReview ?? 0,
      needsAction: data?.summary.needsYourAction ?? 0,
      approved: data?.summary.approvedActive ?? 0,
    },
  };
}
