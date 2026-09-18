import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export function RequestTypeCard({
  requestType,
  onSelect,
}: {
  requestType: RequestType;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-2xs transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/50 hover:bg-slate-50/40 hover:shadow-md cursor-pointer"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-lg sm:text-xl font-medium text-slate-900 group-hover:text-primary transition-colors">
            {requestType.name}
          </h3>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:translate-x-0.5">
            <ChevronRight className="size-4" />
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {requestType.description}
        </p>
      </div>
    </button>
  );
}
