"use client";

import { useMemo, useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useInfiniteNotificationsQuery,
  useNotificationMetaQuery,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "@/features/notifications/api/notifications.queries";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/api/notifications.mutations";

export function useNotifications() {
  const user = useCurrentUser();
  const { data: notifications, isLoading, isFetching, refetch } = useNotificationsQuery(user?.id);
  const { data: unreadTotal, refetch: refetchUnread } = useUnreadNotificationCountQuery(user?.id);
  const { data: meta } = useNotificationMetaQuery(user?.id);
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  // Prefer the backend's total (covers every page); fall back to the loaded page.
  const unreadCount = useMemo(
    () => unreadTotal ?? (notifications ?? []).filter((n) => !n.read).length,
    [unreadTotal, notifications]
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      markRead.mutate(id);
    },
    [markRead]
  );

  const handleMarkAllRead = useCallback(() => {
    if (user) {
      markAllRead.mutate(user.id);
    }
  }, [user, markAllRead]);

  const notificationsList = useMemo(() => {
    return notifications ?? [];
  }, [notifications]);

  /** Reloads the list and the unread total. */
  const refresh = useCallback(async () => {
    await Promise.all([refetch(), refetchUnread()]);
  }, [refetch, refetchUnread]);

  return {
    notifications: notificationsList,
    isLoading,
    isFetching,
    refresh,
    unreadCount,
    totalCount: Math.max(meta?.total ?? 0, notificationsList.length),
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    isMarkingAllRead: markAllRead.isPending,
  };
}

export function useInfiniteNotifications(status: "all" | "unread" | "read" = "all") {
  const user = useCurrentUser();
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteNotificationsQuery(user?.id, status);

  const { data: unreadTotal, refetch: refetchUnread } = useUnreadNotificationCountQuery(user?.id);
  const { data: meta } = useNotificationMetaQuery(user?.id);
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  const notifications = useMemo(() => {
    const rawList = data?.pages.flatMap((page) => page.notifications) ?? [];
    const seen = new Set<string>();
    return rawList.filter((n) => {
      if (!n?.id || seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }, [data]);

  const unreadCount = useMemo(
    () => unreadTotal ?? meta?.unreadCount ?? data?.pages[0]?.unreadCount ?? notifications.filter((n) => !n.read).length,
    [unreadTotal, meta, data, notifications]
  );

  const totalCount = useMemo(
    () => Math.max(meta?.total ?? 0, data?.pages[0]?.pagination?.total ?? 0, notifications.length),
    [meta, data, notifications]
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      markRead.mutate(id);
    },
    [markRead]
  );

  const handleMarkAllRead = useCallback(() => {
    if (user) {
      markAllRead.mutate(user.id);
    }
  }, [user, markAllRead]);

  const refresh = useCallback(async () => {
    await Promise.all([refetch(), refetchUnread()]);
  }, [refetch, refetchUnread]);

  return {
    notifications,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refresh,
    unreadCount,
    totalCount,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    isMarkingAllRead: markAllRead.isPending,
  };
}
