"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DatePeriod } from "@/features/requests/hooks/use-requests-list";

interface FilterOption<T> {
  label: string;
  value: T;
}

interface RequestsFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: RequestStatus | "all";
  onStatusChange: (status: RequestStatus | "all") => void;
  statusOptions: FilterOption<RequestStatus | "all">[];
  statusPlaceholder?: string;
  requestTypeId: string;
  onRequestTypeChange: (typeId: string) => void;
  categoryOptions: FilterOption<string>[];
  period: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
  periodOptions: FilterOption<DatePeriod>[];
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
  searchPlaceholder?: string;
}

export function RequestsFilterToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions,
  statusPlaceholder = "Filter by status",
  requestTypeId,
  onRequestTypeChange,
  categoryOptions,
  period,
  onPeriodChange,
  periodOptions,
  hasActiveFilters,
  filteredCount,
  totalCount,
  onResetFilters,
  searchPlaceholder = "Search by code, type, details...",
}: RequestsFilterToolbarProps) {
  return (
    <div className="space-y-2.5" role="search" aria-label="Requests filter toolbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-8 pr-8 bg-card dark:bg-card border-border"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Clear search input"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          items={statusOptions}
          value={status}
          onValueChange={(v) => onStatusChange(v as RequestStatus | "all")}
        >
          <SelectTrigger
            className="w-full bg-card dark:bg-card border-border"
            aria-label="Filter requests by status"
          >
            <SelectValue placeholder={statusPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          items={categoryOptions}
          value={requestTypeId}
          onValueChange={(v) => onRequestTypeChange(v as string)}
        >
          <SelectTrigger
            className="w-full bg-card dark:bg-card border-border"
            aria-label="Filter requests by category"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Period Filter */}
        <Select
          items={periodOptions}
          value={period}
          onValueChange={(v) => onPeriodChange(v as DatePeriod)}
        >
          <SelectTrigger
            className="w-full bg-card dark:bg-card border-border"
            aria-label="Filter requests by timeframe"
          >
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Clear Trigger */}
      {hasActiveFilters && (
        <div
          className="flex items-center justify-between text-xs text-muted-foreground px-1"
          role="status"
          aria-live="polite"
        >
          <span>
            Showing filtered results ({filteredCount} of {totalCount})
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Reset all search filters"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
