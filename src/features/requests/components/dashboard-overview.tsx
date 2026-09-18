"use client";

import Link from "next/link";
import { FileText, Clock, AlertCircle, CheckCircle2, PlusCircle, FileEdit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestListItem } from "@/features/requests/components/request-list-item";
import { useDashboard } from "@/features/requests/hooks/use-dashboard";

export default function DashboardOverview() {
  const { user, recentRequests, drafts, isLoading, stats } = useDashboard();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? ""}`}
        description="Here's an overview of your architectural requests."
        actions={
          <Button nativeButton={false} render={<Link href="/requests/new" />}>
            <PlusCircle />
            New Request
          </Button>
        }
      />

      {drafts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-amber-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-300/60">
              <FileEdit className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-950">
                You have {drafts.length} saved in-progress draft{drafts.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-800">
                Resume right where you left off or submit when ready.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/requests?tab=drafts" />}
            className="shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-50 font-medium"
          >
            Review Saved Drafts
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total requests" value={stats.total} icon={FileText} accent="slate" />
        <StatCard label="Pending review" value={stats.pending} icon={Clock} accent="blue" />
        <StatCard
          label="Needs your action"
          value={stats.needsAction}
          icon={AlertCircle}
          accent="amber"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-medium text-foreground">Recent Requests</h2>
          <Button variant="link" size="sm" nativeButton={false} render={<Link href="/requests" />}>
            View all
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {!isLoading && recentRequests.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No requests yet"
            description="Start your first architectural request to get ARB review underway."
            action={
              <Button nativeButton={false} render={<Link href="/requests/new" />}>
                <PlusCircle />
                New Request
              </Button>
            }
          />
        )}

        {!isLoading && recentRequests.length > 0 && (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <RequestListItem key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
