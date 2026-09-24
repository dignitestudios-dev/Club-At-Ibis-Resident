"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bell, CheckCheck, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils/cn";

type FilterType = "all" | "unread";

export default function NotificationList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const urlFilter = (searchParams.get("filter") as FilterType) || "all";
  const [filter, setFilterState] = useState<FilterType>(urlFilter);

  useEffect(() => {
    const nextFilter = (searchParams.get("filter") as FilterType) || "all";
    setFilterState(nextFilter);
  }, [searchParams]);

  const setFilter = useCallback(
    (nextFilter: FilterType) => {
      setFilterState(nextFilter);
      const params = new URLSearchParams(searchParams.toString());
      if (nextFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", nextFilter);
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `/notifications?${query}` : "/notifications", { scroll: false });
      });
    },
    [searchParams, router]
  );

  const {
    notifications,
    isLoading,
    unreadCount,
    markRead,
    markAllRead,
    isMarkingAllRead,
  } = useNotifications();
  const toast = useToast();

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
              className="bg-white dark:bg-card gap-1.5 shadow-2xs hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label={`Mark all ${unreadCount} unread notifications as read`}
            >
              <CheckCheck className="size-4 text-primary" aria-hidden="true" />
              Mark all as read ({unreadCount})
            </Button>
          ) : undefined
        }
      />

      {/* Filter Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Filter notifications"
        className="flex items-center gap-2 border-b border-border/80 pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          aria-controls="panel-all-notifications"
          id="tab-all-notifications"
          onClick={() => setFilter("all")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            filter === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-white dark:bg-card text-slate-700 dark:text-slate-300 border border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground"
          )}
        >
          <Layers className="size-3.5" aria-hidden="true" />
          All
          <span
            className={cn(
              "rounded-full px-1.5 py-0.2 text-[10px]",
              filter === "all"
                ? "bg-white/20 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
            aria-label={`${notifications.length} total notifications`}
          >
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === "unread"}
          aria-controls="panel-unread-notifications"
          id="tab-unread-notifications"
          onClick={() => setFilter("unread")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            filter === "unread"
              ? "bg-primary text-white shadow-xs"
              : "bg-white dark:bg-card text-slate-700 dark:text-slate-300 border border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground"
          )}
        >
          <Bell className="size-3.5" aria-hidden="true" />
          Unread
          {unreadCount > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                filter === "unread"
                  ? "bg-white/20 text-white"
                  : "bg-slate-800 dark:bg-slate-700 text-white"
              )}
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
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
        <div
          id={filter === "unread" ? "panel-unread-notifications" : "panel-all-notifications"}
          role="tabpanel"
          aria-labelledby={filter === "unread" ? "tab-unread-notifications" : "tab-all-notifications"}
          className="space-y-3"
          aria-label="Notification list"
        >
          {filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkOne}
            />
          ))}
        </div>
      )}
    </div>
  );
}
