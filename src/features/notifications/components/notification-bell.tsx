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
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
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

function NotificationPanel({ mobile, onClose }: { mobile: boolean; onClose: () => void }) {
  const { notifications, unreadCount, markRead, markAllRead, isMarkingAllRead } = useNotifications();

  const list = (
    <ul className="divide-y divide-border/50">
      {notifications.slice(0, mobile ? 20 : 8).map((notification) => {
        const avatar = getNotificationAvatar(notification.type);
        return (
          <li key={notification.id}>
            <Link
              href={notification.requestId ? `/requests/${notification.requestId}` : "/notifications"}
              onClick={() => {
                if (!notification.read) markRead(notification.id);
                onClose();
              }}
              className={cn(
                "flex gap-3 px-4 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60 dark:active:bg-slate-800",
                mobile ? "py-4" : "py-3.5",
                !notification.read ? "bg-white dark:bg-card" : "bg-white/60 dark:bg-card/60 text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex shrink-0 items-center justify-center rounded-lg border",
                  mobile ? "size-10" : "size-8",
                  avatar.bg
                )}
              >
                {avatar.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={cn(
                      "truncate text-foreground",
                      mobile ? "text-sm" : "text-xs",
                      notification.read ? "font-normal" : "font-semibold text-primary"
                    )}
                  >
                    {notification.title}
                  </p>
                  {!notification.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p
                  className={cn(
                    "mt-0.5 line-clamp-2 leading-relaxed text-muted-foreground",
                    mobile ? "text-[13px]" : "text-xs"
                  )}
                >
                  {notification.message}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">{formatRelative(notification.createdAt)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border/80 bg-slate-50/50 px-4 py-3 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <p className="font-heading text-base font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className={cn("flex items-center gap-3", mobile && "pr-10")}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAllRead}
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Mark all read
            </button>
          )}
          {!mobile && (
            <Link href="/notifications" onClick={onClose} className="text-[11px] font-medium text-primary hover:underline">
              View all
            </Link>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." className="border-none py-8" />
      ) : mobile ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{list}</div>
      ) : (
        <ScrollArea className="max-h-92 overflow-hidden">{list}</ScrollArea>
      )}

      <div className="border-t border-border/80 bg-slate-50/50 p-2 text-center dark:bg-slate-900/50">
        <Link
          href="/notifications"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-1 py-1 text-xs font-medium text-primary hover:underline"
        >
          Open full notifications center
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </>
  );
}

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const badge =
    unreadCount > 0 ? (
      <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white shadow-xs">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    ) : null;
  const label = unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications";

  // Phones: a bottom sheet instead of a floating popover that can't fit a narrow viewport.
  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="relative" aria-label={label} onClick={() => setOpen(true)}>
          <Bell className="size-4.5" aria-hidden="true" />
          {badge}
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="h-[82svh] gap-0 p-0">
            <SheetTitle className="sr-only">Notifications</SheetTitle>
            <SheetDescription className="sr-only">Your latest request updates.</SheetDescription>
            <NotificationPanel mobile onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label={label} />}>
        <Bell className="size-4.5" aria-hidden="true" />
        {badge}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-92 border-border/80 p-0 shadow-xl sm:w-96">
        <NotificationPanel mobile={false} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
