import { useQuery } from "@tanstack/react-query";
import { getNotificationMeta, getNotificationsForResident, getUnreadNotificationCount } from "./notifications.service";

export function useNotificationsQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", residentId],
    queryFn: () => getNotificationsForResident(residentId as string),
    enabled: !!residentId,
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
