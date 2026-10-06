"use client";

import { useMemo, useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNotificationsQuery, useUnreadNotificationCountQuery } from "@/features/notifications/api/notifications.queries";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/api/notifications.mutations";

export function useNotifications() {
  const user = useCurrentUser();
  const { data: notifications, isLoading } = useNotificationsQuery(user?.id);
  const { data: unreadTotal } = useUnreadNotificationCountQuery(user?.id);
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

  return {
    notifications: notificationsList,
    isLoading,
    unreadCount,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    isMarkingAllRead: markAllRead.isPending,
  };
}
