"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  FileEdit,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestListItem } from "@/features/requests/components/request-list-item";
import { useDashboard } from "@/features/requests/hooks/use-dashboard";

export default function DashboardOverview() {
  const { user, recentRequests, drafts, isLoading, stats } = useDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Welcome Section with Slide-in */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-3 duration-500">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Welcome back, {user?.firstName ?? "Resident"}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage your architectural modifications, review ARB decisions, and track submittal progress.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/requests/new" />}
            className="shadow-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="size-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {drafts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-gradient-to-r from-amber-50/90 to-amber-50/40 dark:from-amber-950/40 dark:to-amber-950/20 p-4.5 text-amber-950 dark:text-amber-200 shadow-2xs animate-in fade-in zoom-in-95 duration-400">
          <div className="flex items-center gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/60 shadow-2xs">
              <FileEdit className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                You have {drafts.length} saved in-progress draft{drafts.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-900/80 dark:text-amber-400/80">
                Your unsaved work is preserved. Resume right where you left off.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/requests?tab=drafts" />}
            className="shrink-0 border-amber-300/80 dark:border-amber-700/70 bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-slate-800 font-medium shadow-2xs transition-transform duration-200 hover:scale-[1.02]"
          >
            Review Saved Drafts
            <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Metrics Row with Staggered Entrance */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={FileText}
          accent="navy"
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          accent="blue"
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both"
        />
        <StatCard
          label="Needs Your Action"
          value={stats.needsAction}
          icon={AlertCircle}
          accent="amber"
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-both"
        />
        <StatCard
          label="Approved / Active"
          value={stats.approved}
          icon={CheckCircle2}
          accent="emerald"
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-both"
        />
      </div>

      {/* Recent Requests Section */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-200 fill-mode-both">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-medium text-foreground">Recent Requests</h2>
            <p className="text-xs text-muted-foreground">Your latest active submissions and updates</p>
          </div>
          {stats.total > 0 && (
            <Link
              href="/requests"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all Requests
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
            <Skeleton className="h-56 w-full rounded-2xl animate-pulse" />
            <Skeleton className="h-56 w-full rounded-2xl animate-pulse" />
            <Skeleton className="h-56 w-full rounded-2xl animate-pulse" />
          </div>
        )}

        {!isLoading && recentRequests.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No requests yet"
            description="Submit your first architectural modification to begin the ARB review workflow."
            action={
              <Button nativeButton={false} render={<Link href="/requests/new" />}>
                <PlusCircle className="size-4" />
                Start New Request
              </Button>
            }
          />
        )}

        {!isLoading && recentRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
            {recentRequests.map((request, idx) => (
              <RequestListItem
                key={request.id}
                request={request}
                className={`animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both ${
                  idx === 1 ? "delay-75" : idx === 2 ? "delay-150" : idx > 2 ? "delay-200" : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
