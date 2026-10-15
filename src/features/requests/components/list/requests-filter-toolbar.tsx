"use client";

import { useState } from "react";
import { Check, ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
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
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { FilterSidebar, FiltersButton } from "@/components/shared/filter-sidebar";

interface FilterOption<T> {
  label: string;
  value: T;
}

interface RequestsFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  statusOptions: FilterOption<string>[];
  statusPlaceholder?: string;
  categoryOptions?: FilterOption<string>[];
  categoryId?: string;
  onCategoryChange?: (id: string) => void;
  categoryStatus?: string;
  onCategoryStatusChange?: (status: string) => void;
  submittedFrom?: string;
  submittedTo?: string;
  onDateRangeChange?: (range: { from: string; to: string }) => void;
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
  categoryOptions,
  categoryId = "all",
  onCategoryChange,
  categoryStatus = "all",
  onCategoryStatusChange,
  submittedFrom = "",
  submittedTo = "",
  onDateRangeChange,
  hasActiveFilters,
  filteredCount,
  totalCount,
  onResetFilters,
  searchPlaceholder = "Search by code, category, title...",
}: RequestsFilterToolbarProps) {
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const extraActive = [categoryId !== "all", categoryStatus !== "all", !!submittedFrom || !!submittedTo].filter(Boolean).length;
  const [moreOpen, setMoreOpen] = useState(false);
  const hasExtra = !!(onCategoryChange || onCategoryStatusChange || onDateRangeChange);
  const categoryItems = [{ label: "All categories", value: "all" }, ...(categoryOptions ?? [])];
  const categoryStatusItems = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ];
  const activeLabel = statusOptions.find((o) => o.value === status)?.label;

  return (
    <div className="space-y-2.5" role="search" aria-label="Requests filter toolbar">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input with 1s Debounce */}
        <div className="min-w-0 flex-1">
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
          onValueChange={(v) => onStatusChange(v ?? "all")}
        >
          <SelectTrigger
            className="w-full bg-card dark:bg-card border-border sm:w-56"
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

        {/* The Filters button sits in the same row as the search and the status filter. */}
        {hasExtra && <FiltersButton count={extraActive} onClick={() => setMoreOpen(true)} expanded={moreOpen} />}
      </div>

      {/* More filters: category, category status and submitted date range, in a sidebar */}
      {hasExtra && (
        <>
          <FilterSidebar open={moreOpen} onOpenChange={setMoreOpen} title="More filters" onClear={onResetFilters} clearDisabled={!hasActiveFilters}>
            {onCategoryChange && (
              <div className="space-y-1.5">
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Category</span>
                <Select items={categoryItems} value={categoryId} onValueChange={(v) => onCategoryChange(v ?? "all")}>
                  <SelectTrigger className="w-full border-border bg-card dark:bg-card" aria-label="Filter by category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryItems.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {onCategoryStatusChange && (
              <div className="space-y-1.5">
                <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Category status</span>
                <Select items={categoryStatusItems} value={categoryStatus} onValueChange={(v) => onCategoryStatusChange(v ?? "all")}>
                  <SelectTrigger className="w-full border-border bg-card dark:bg-card" aria-label="Filter by category status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryStatusItems.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {onDateRangeChange && <DateRangeFilter from={submittedFrom} to={submittedTo} onChange={onDateRangeChange} idPrefix="resident-submitted" stacked />}
          </FilterSidebar>
        </>
      )}

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
            aria-label="Clear all filters"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
