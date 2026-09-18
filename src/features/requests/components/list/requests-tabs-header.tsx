"use client";

import { FileEdit, History, LayoutGrid, List, ListChecks } from "lucide-react";
import { cn } from "@/utils/cn";

export type RequestsTabType = "requests" | "history" | "drafts";

interface RequestsTabsHeaderProps {
  activeTab: RequestsTabType;
  onTabChange: (tab: RequestsTabType) => void;
  activeCount: number;
  historyCount: number;
  draftsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function RequestsTabsHeader({
  activeTab,
  onTabChange,
  activeCount,
  historyCount,
  draftsCount,
  viewMode,
  onViewModeChange,
}: RequestsTabsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-400 delay-75">
      {/* Modern Pill Tab Switcher */}
      <div
        role="tablist"
        aria-label="Request categories"
        className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 w-fit max-w-full overflow-x-auto"
      >
        {/* Tab 1: Active Requests */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requests"}
          aria-controls="panel-requests"
          id="tab-requests"
          onClick={() => onTabChange("requests")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            activeTab === "requests"
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ListChecks className="size-3.5" aria-hidden="true" />
          <span>Active Requests</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
              activeTab === "requests"
                ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-300"
                : "bg-slate-200 dark:bg-slate-800 text-muted-foreground"
            )}
            aria-label={`${activeCount} active requests`}
          >
            {activeCount}
          </span>
        </button>

        {/* Tab 2: History */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          aria-controls="panel-history"
          id="tab-history"
          onClick={() => onTabChange("history")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            activeTab === "history"
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="size-3.5" aria-hidden="true" />
          <span>History</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
              activeTab === "history"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                : "bg-slate-200 dark:bg-slate-800 text-muted-foreground"
            )}
            aria-label={`${historyCount} past records`}
          >
            {historyCount}
          </span>
        </button>

        {/* Tab 3: Saved Drafts */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "drafts"}
          aria-controls="panel-drafts"
          id="tab-drafts"
          onClick={() => onTabChange("drafts")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            activeTab === "drafts"
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileEdit className="size-3.5" aria-hidden="true" />
          <span>Saved Drafts</span>
          {draftsCount > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                activeTab === "drafts"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300"
                  : "bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400"
              )}
              aria-label={`${draftsCount} saved drafts`}
            >
              {draftsCount}
            </span>
          )}
        </button>
      </div>

      {/* View Switcher: Cards vs List */}
      <div
        role="group"
        aria-label="Display layout mode"
        className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0 self-start sm:self-auto"
      >
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          aria-pressed={viewMode === "grid"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            viewMode === "grid"
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Card Grid View"
          aria-label="Switch to Card Grid View"
        >
          <LayoutGrid className="size-3.5" aria-hidden="true" />
          <span>Cards</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          aria-pressed={viewMode === "list"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
            viewMode === "list"
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="List View"
          aria-label="Switch to List View"
        >
          <List className="size-3.5" aria-hidden="true" />
          <span>List</span>
        </button>
      </div>
    </div>
  );
}
