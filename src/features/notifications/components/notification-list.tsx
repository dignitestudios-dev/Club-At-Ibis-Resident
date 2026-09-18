"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileText,
  Clock,
  XCircle,
  ArrowRight,
  Check,
  UserX,
  CreditCard,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { formatRelative, formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

type FilterType = "all" | "unread";

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case "approved":
    case "completed":
    case "approval_letter":
      return {
        icon: <CheckCircle2 className="size-4.5 text-emerald-700" />,
        badgeClass: "bg-slate-100 text-slate-800 border-slate-200/80",
        avatarBg: "bg-slate-50 border-slate-200/70",
        label: "Approved",
      };
    case "revision_required":
    case "action_required":
      return {
        icon: <AlertTriangle className="size-4.5 text-amber-700" />,
        badgeClass: "bg-amber-50 text-amber-950 border-amber-200/80",
        avatarBg: "bg-amber-50/50 border-amber-200/60",
        label: "Action Required",
      };
    case "feedback":
      return {
        icon: <MessageSquare className="size-4.5 text-slate-700" />,
        badgeClass: "bg-slate-100 text-slate-800 border-slate-200/80",
        avatarBg: "bg-slate-50 border-slate-200/70",
        label: "Feedback",
      };
    case "resubmitted":
      return {
        icon: <Clock className="size-4.5 text-slate-700" />,
        badgeClass: "bg-slate-100 text-slate-800 border-slate-200/80",
        avatarBg: "bg-slate-50 border-slate-200/70",
        label: "Resubmitted",
      };
    case "rejected":
      return {
        icon: <XCircle className="size-4.5 text-rose-700" />,
        badgeClass: "bg-rose-50 text-rose-950 border-rose-200/80",
        avatarBg: "bg-rose-50/50 border-rose-200/60",
        label: "Not Approved",
      };
    case "withdrawn":
      return {
        icon: <UserX className="size-4.5 text-slate-600" />,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        avatarBg: "bg-slate-50 border-slate-200/70",
        label: "Withdrawn",
      };
    case "refund_updated":
      return {
        icon: <CreditCard className="size-4.5 text-slate-700" />,
        badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
        avatarBg: "bg-slate-50 border-slate-200/70",
        label: "Deposit / Refund",
      };
    default:
      return {
        icon: <FileText className="size-4.5 text-slate-700" />,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        avatarBg: "bg-slate-50 border-slate-200/70",
        label: "Update",
      };
  }
}

export default function NotificationList() {
  const { notifications, isLoading, unreadCount, markRead, markAllRead, isMarkingAllRead } =
    useNotifications();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const handleMarkAll = () => {
    markAllRead();
    toast.success("All notifications marked as read");
  };

  const handleMarkOne = (id: string) => {
    markRead(id);
    toast.success("Notification marked as read");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Real-time updates, reviewer feedback, and ARB decisions on your submissions."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAll}
              disabled={isMarkingAllRead}
              className="bg-white gap-1.5 shadow-2xs hover:border-primary/40 hover:bg-slate-50"
            >
              <CheckCheck className="size-4 text-primary" />
              Mark all as read ({unreadCount})
            </Button>
          ) : undefined
        }
      />

      {/* Filter Navigation Tabs: All and Unread only */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
            filter === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-slate-700 border border-border/80 hover:bg-slate-50 hover:text-foreground"
          )}
        >
          <Layers className="size-3.5" />
          All
          <span
            className={cn(
              "rounded-full px-1.5 py-0.2 text-[10px]",
              filter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            )}
          >
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
            filter === "unread"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-slate-700 border border-border/80 hover:bg-slate-50 hover:text-foreground"
          )}
        >
          <Bell className="size-3.5" />
          Unread
          {unreadCount > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                filter === "unread" ? "bg-white/20 text-white" : "bg-slate-800 text-white"
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "All caught up" : "No notifications found"}
          description={
            filter === "unread"
              ? "You have reviewed all your notifications. New updates will appear here."
              : "Notifications regarding your submissions and approvals will be listed here."
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const visual = getNotificationVisuals(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white p-4.5 sm:p-5 shadow-2xs transition-all duration-200",
                  "hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md",
                  !notification.read
                    ? "border-l-4 border-l-primary border-slate-200 shadow-xs"
                    : "border-border/80"
                )}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border mt-0.5",
                      visual.avatarBg
                    )}
                  >
                    {visual.icon}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                          visual.badgeClass
                        )}
                      >
                        {visual.label}
                      </span>
                      {!notification.read && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary tracking-wide">
                          NEW
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span title={formatDateTime(notification.createdAt)}>
                          {formatRelative(notification.createdAt)}
                        </span>
                      </span>
                    </div>

                    <h3
                      className={cn(
                        "font-heading text-base font-medium text-foreground group-hover:text-primary transition-colors",
                        !notification.read && "font-semibold text-primary"
                      )}
                    >
                      {notification.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleMarkOne(notification.id)}
                      className="gap-1.5 text-xs text-muted-foreground hover:bg-slate-200/60 hover:text-foreground"
                    >
                      <Check className="size-3.5" />
                      Mark read
                    </Button>
                  )}
                  {notification.requestId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-white hover:bg-slate-100 hover:border-primary/50 text-xs font-medium shadow-2xs"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/requests/${notification.requestId}`}
                          onClick={() => {
                            if (!notification.read) markRead(notification.id);
                          }}
                        />
                      }
                    >
                      View Request
                      <ArrowRight className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


