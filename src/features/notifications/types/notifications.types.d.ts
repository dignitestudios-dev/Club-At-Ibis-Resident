type NotificationType =
  | "submitted"
  | "updated"
  | "feedback"
  | "revision_required"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "completed"
  | "approval_letter"
  | "withdrawn"
  | "refund_updated"
  | "action_required";

interface NotificationRecord {
  id: string;
  residentId: string;
  requestId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
