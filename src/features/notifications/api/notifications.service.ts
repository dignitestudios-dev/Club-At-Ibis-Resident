import { db, delay } from "@/lib/mock/store";

export async function getNotificationsForResident(
  residentId: string
): Promise<NotificationRecord[]> {
  const all = db
    .getNotifications()
    .filter((n) => n.residentId === residentId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return delay(all, 80);
}

export async function markNotificationRead(id: string): Promise<void> {
  const all = db.getNotifications();
  const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  db.setNotifications(next);
  return delay(undefined, 80);
}

export async function markAllNotificationsRead(residentId: string): Promise<void> {
  const all = db.getNotifications();
  const next = all.map((n) => (n.residentId === residentId ? { ...n, read: true } : n));
  db.setNotifications(next);
  return delay(undefined, 100);
}
