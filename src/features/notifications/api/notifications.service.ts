import axiosInstance from "@/lib/axios";

function toNotificationRecord(raw: any, residentId?: string): NotificationRecord {
  return {
    id: raw.id || raw._id,
    residentId: residentId || raw.residentId || "",
    requestId: raw.entity?.kind === "request" ? raw.entity.id : (raw.requestId ?? null),
    type: (raw.type as NotificationType) || "updated",
    title: raw.title ?? "",
    message: raw.message ?? "",
    read: Boolean(raw.read || raw.readAt),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function getNotificationsForResident(
  residentId: string
): Promise<NotificationRecord[]> {
  try {
    const { data } = await axiosInstance.get("/notifications");
    const list = data?.data?.notifications || data?.notifications || [];
    return list.map((n: any) => toNotificationRecord(n, residentId));
  } catch {
    return [];
  }
}

/** Total unread across ALL pages, as reported by the backend (`data.unreadCount`). */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { data } = await axiosInstance.get("/notifications", { params: { limit: 1 } });
    return Number(data?.data?.unreadCount ?? 0) || 0;
  } catch {
    return 0;
  }
}


/** Server-side totals across ALL pages (the list itself is capped per request). */
export async function getNotificationMeta(): Promise<{ total: number; unreadCount: number }> {
  try {
    const { data } = await axiosInstance.get("/notifications", { params: { limit: 1 } });
    return {
      total: Number(data?.pagination?.total ?? data?.data?.pagination?.total ?? 0) || 0,
      unreadCount: Number(data?.data?.unreadCount ?? 0) || 0,
    };
  } catch {
    return { total: 0, unreadCount: 0 };
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await axiosInstance.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(_residentId: string): Promise<void> {
  await axiosInstance.post("/notifications/read-all");
}
