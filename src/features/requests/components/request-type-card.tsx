import { ChevronRight, Layers } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ActiveCategory } from "@/features/categories/types/categories.types";

export function RequestTypeCard({
  category,
  requestType,
  onSelect,
}: {
  category?: ActiveCategory;
  requestType?: RequestType;
  onSelect: () => void;
}) {
  const item = category || requestType;
  if (!item) return null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Select ${item.name} request category`}
      className={cn(
        "group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 text-left shadow-2xs transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/50 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 hover:shadow-md cursor-pointer"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
              aria-hidden="true"
            >
              <Layers className="size-4" />
            </span>
            <h3 className="font-heading text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {item.name}
            </h3>
          </div>
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-0.5"
          >
            <ChevronRight className="size-4" />
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {item.description || "Submit an architectural review request for this category."}
        </p>
      </div>
    </button>
  );
}
