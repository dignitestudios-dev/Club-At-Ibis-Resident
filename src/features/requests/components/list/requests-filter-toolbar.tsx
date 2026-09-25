"use client";

import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/shared/search-input";

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
  requestTypeId?: string;
  onRequestTypeChange?: (typeId: string) => void;
  categoryOptions?: FilterOption<string>[];
  period?: string;
  onPeriodChange?: (period: any) => void;
  periodOptions?: FilterOption<any>[];
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
  hasActiveFilters,
  filteredCount,
  totalCount,
  onResetFilters,
  searchPlaceholder = "Search by code, category, title...",
}: RequestsFilterToolbarProps) {
  return (
    <div className="space-y-2.5" role="search" aria-label="Requests filter toolbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {/* Search Input with 1s Debounce */}
        <div className="lg:col-span-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            ariaLabel={searchPlaceholder}
            debounceMs={400}
          />
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
