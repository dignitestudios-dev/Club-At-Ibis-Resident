import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getNotificationMeta,
  getNotificationsForResident,
  getNotificationsPageForResident,
  getUnreadNotificationCount,
} from "./notifications.service";

export function useNotificationsQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", residentId],
    queryFn: () => getNotificationsForResident(residentId as string),
    enabled: !!residentId,
  });
}

export function useInfiniteNotificationsQuery(
  residentId: string | undefined,
  status: "all" | "unread" | "read" = "all"
) {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite", residentId, status],
    queryFn: ({ pageParam = 1 }) =>
      getNotificationsPageForResident({ residentId, page: pageParam, limit: 20, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!residentId,
    staleTime: 15 * 1000,
  });
}

export function useNotificationMetaQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", "meta", residentId],
    queryFn: getNotificationMeta,
    enabled: !!residentId,
    staleTime: 15 * 1000,
  });
}

export function useUnreadNotificationCountQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", "unread-count", residentId],
    queryFn: getUnreadNotificationCount,
    enabled: !!residentId,
    staleTime: 15 * 1000,
    refetchInterval: 60 * 1000,
  });
}
