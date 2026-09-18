"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileText,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

function getNotificationAvatar(type: NotificationType) {
  switch (type) {
    case "approved":
    case "completed":
    case "approval_letter":
      return {
        icon: <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />,
        bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60",
      };
    case "revision_required":
    case "action_required":
      return {
        icon: <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />,
        bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/60",
      };
    case "feedback":
      return {
        icon: <MessageSquare className="size-4 text-blue-600 dark:text-blue-400" />,
        bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/60",
      };
    case "resubmitted":
      return {
        icon: <Clock className="size-4 text-purple-600 dark:text-purple-400" />,
        bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/60",
      };
    case "rejected":
      return {
        icon: <XCircle className="size-4 text-rose-600 dark:text-rose-400" />,
        bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60",
      };
    default:
      return {
        icon: <FileText className="size-4 text-primary" />,
        bg: "bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700",
      };
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, isMarkingAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-92 sm:w-96 p-0 shadow-xl border-border/80">
        <div className="flex items-center justify-between border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-heading text-base font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={isMarkingAllRead}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Mark all read
              </button>
            )}
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up."
            className="border-none py-8"
          />
        ) : (
          <ScrollArea className="max-h-92 overflow-hidden">
            <ul className="divide-y divide-border/50">
              {notifications.slice(0, 8).map((notification) => {
                const avatar = getNotificationAvatar(notification.type);
                return (
                  <li key={notification.id}>
                    <Link
                      href={
                        notification.requestId
                          ? `/requests/${notification.requestId}`
                          : "/notifications"
                      }
                      onClick={() => {
                        if (!notification.read) markRead(notification.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60",
                        !notification.read ? "bg-white dark:bg-card" : "bg-white/60 dark:bg-card/60 text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          avatar.bg
                        )}
                      >
                        {avatar.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={cn(
                              "truncate text-xs text-foreground",
                              notification.read ? "font-normal" : "font-semibold text-primary"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          {formatRelative(notification.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}

        <div className="border-t border-border/80 bg-slate-50/50 dark:bg-slate-900/50 p-2 text-center">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline py-1"
          >
            Open full notifications center
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
