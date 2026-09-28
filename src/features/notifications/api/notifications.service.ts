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

export async function markNotificationRead(id: string): Promise<void> {
  await axiosInstance.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(_residentId: string): Promise<void> {
  await axiosInstance.post("/notifications/read-all");
}
