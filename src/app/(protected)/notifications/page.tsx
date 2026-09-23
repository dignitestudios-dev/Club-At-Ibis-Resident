import type { Metadata } from "next";
import NotificationList from "@/features/notifications/components/notification-list";

export const metadata: Metadata = {
  title: "Notifications · Club At Ibis Resident Portal",
};

export default function NotificationsPage() {
  return <NotificationList />;
}
