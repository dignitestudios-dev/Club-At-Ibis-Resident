"use client";

import { useState } from "react";
import { Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/utils/cn";
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
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeLabel = statusOptions.find((o) => o.value === status)?.label;

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

        {/* Phone: status filter opens a bottom sheet */}
        {isMobile ? (
          <>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Filter requests by status"
              className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 text-sm outline-none transition-colors active:bg-muted"
            >
              <span className="flex min-w-0 items-center gap-2">
                <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{status === "all" ? statusPlaceholder : activeLabel}</span>
              </span>
            </button>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetContent side="bottom" showCloseButton={false} className="px-4 pb-4">
                <SheetHeader className="px-1 pt-1">
                  <SheetTitle>Filter by status</SheetTitle>
                  <SheetDescription>Choose which requests to show.</SheetDescription>
                </SheetHeader>
                <div className="mt-2 flex flex-col gap-1" role="radiogroup" aria-label="Status">
                  {statusOptions.map((opt) => {
                    const selected = opt.value === status;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          onStatusChange(opt.value);
                          setFiltersOpen(false);
                        }}
                        className={cn(
                          "flex h-12 items-center justify-between rounded-xl px-3.5 text-left text-sm font-medium outline-none transition-colors active:bg-muted",
                          selected ? "bg-primary/10 text-primary dark:text-foreground" : "text-foreground"
                        )}
                      >
                        {opt.label}
                        {selected && <Check className="size-4" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
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
        )}
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
