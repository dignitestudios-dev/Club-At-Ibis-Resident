"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/utils/cn";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  debounceMs?: number;
}

/**
 * Reusable SearchInput component with shared useDebounce hook.
 * Updates local input immediately for responsive typing, and debounces
 * notifying the parent onChange handler to prevent redundant filter recalculations and API requests.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ariaLabel,
  debounceMs = 400,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebounce(internalValue, debounceMs);
  const latestOnChange = useRef(onChange);
  latestOnChange.current = onChange;
  const isFirstMount = useRef(true);

  // Synchronize internal text if external value changes (e.g., reset filters)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce calling the parent's onChange via shared useDebounce
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (debouncedValue !== value) {
      latestOnChange.current(debouncedValue);
    }
  }, [debouncedValue, value]);

  const handleClear = () => {
    setInternalValue("");
    latestOnChange.current("");
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        maxLength={100}
        className="bg-card pr-9 pl-9 border-border"
      />
      {internalValue && internalValue.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Clear search"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
