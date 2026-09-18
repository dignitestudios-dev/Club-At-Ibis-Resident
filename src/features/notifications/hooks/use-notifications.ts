"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNotificationsQuery } from "@/features/notifications/api/notifications.queries";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/api/notifications.mutations";

export function useNotifications() {
  const user = useCurrentUser();
  const { data: notifications, isLoading } = useNotificationsQuery(user?.id);
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  return {
    notifications: notifications ?? [],
    isLoading,
    unreadCount,
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => user && markAllRead.mutate(user.id),
    isMarkingAllRead: markAllRead.isPending,
  };
}
