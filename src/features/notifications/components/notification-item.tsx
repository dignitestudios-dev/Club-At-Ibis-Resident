"use client";

import { memo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MessageSquare,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case "approved":
    case "completed":
    case "approval_letter":
      return {
        icon: <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
        badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
        avatarBg: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/40",
        label: "Approved",
      };
    case "revision_required":
    case "action_required":
      return {
        icon: <AlertTriangle className="size-4.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
        badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
        avatarBg: "bg-amber-50/50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/40",
        label: "Action Required",
      };
    case "feedback":
      return {
        icon: <MessageSquare className="size-4.5 text-slate-700 dark:text-slate-300" aria-hidden="true" />,
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700",
        avatarBg: "bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700",
        label: "Feedback",
      };
    case "resubmitted":
      return {
        icon: <Clock className="size-4.5 text-slate-700 dark:text-slate-300" aria-hidden="true" />,
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700",
        avatarBg: "bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700",
        label: "Resubmitted",
      };
    case "rejected":
      return {
        icon: <XCircle className="size-4.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />,
        badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60",
        avatarBg: "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/40",
        label: "Not Approved",
      };
    case "withdrawn":
      return {
        icon: <UserX className="size-4.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />,
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        avatarBg: "bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700",
        label: "Withdrawn",
      };
    case "refund_updated":
      return {
        icon: <CreditCard className="size-4.5 text-slate-700 dark:text-slate-300" aria-hidden="true" />,
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700",
        avatarBg: "bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700",
        label: "Deposit / Refund",
      };
    default:
      return {
        icon: <FileText className="size-4.5 text-slate-700 dark:text-slate-300" aria-hidden="true" />,
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        avatarBg: "bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700",
        label: "Update",
      };
  }
}

interface NotificationItemProps {
  notification: NotificationRecord;
  onMarkRead: (id: string) => void;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const visual = getNotificationVisuals(notification.type);

  return (
    <article
      aria-label={`${notification.title} - ${notification.read ? "Read" : "Unread"}`}
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white dark:bg-card p-4.5 sm:p-5 shadow-2xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md",
        !notification.read
          ? "border-l-4 border-l-primary border-slate-200 dark:border-slate-700 shadow-xs"
          : "border-border/80"
      )}
    >
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border mt-0.5",
            visual.avatarBg
          )}
          aria-hidden="true"
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
              <Clock className="size-3" aria-hidden="true" />
              <time
                dateTime={notification.createdAt}
                title={formatDateTime(notification.createdAt)}
              >
                {formatRelative(notification.createdAt)}
              </time>
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

      <div className="flex shrink-0 items-center gap-2 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {!notification.read && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onMarkRead(notification.id)}
            className="gap-1.5 text-xs text-muted-foreground hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-foreground"
            aria-label={`Mark "${notification.title}" as read`}
          >
            <Check className="size-3.5" aria-hidden="true" />
            Mark read
          </Button>
        )}
        {notification.requestId && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50 text-xs font-medium shadow-2xs"
            nativeButton={false}
            render={
              <Link
                href={`/requests/${notification.requestId}`}
                onClick={() => {
                  if (!notification.read) onMarkRead(notification.id);
                }}
                aria-label={`View request details for ${notification.title}`}
              />
            }
          >
            View Request
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </article>
  );
});
