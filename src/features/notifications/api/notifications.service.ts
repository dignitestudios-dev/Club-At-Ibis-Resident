import axiosInstance from "@/lib/axios";
import { db, delay } from "@/lib/mock/store";

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
    const list = data?.data?.notifications || [];
    return list.map((n: any) => toNotificationRecord(n, residentId));
  } catch {
    const all = db
      .getNotifications()
      .filter((n) => n.residentId === residentId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return delay(all, 80);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await axiosInstance.patch(`/notifications/${id}/read`);
  } catch {
    const all = db.getNotifications();
    const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    db.setNotifications(next);
  }
}

export async function markAllNotificationsRead(residentId: string): Promise<void> {
  try {
    await axiosInstance.post("/notifications/read-all");
  } catch {
    const all = db.getNotifications();
    const next = all.map((n) => (n.residentId === residentId ? { ...n, read: true } : n));
    db.setNotifications(next);
  }
}
