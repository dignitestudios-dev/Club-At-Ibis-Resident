import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const ACCENT_CLASSES = {
  slate: "bg-slate-100 text-slate-700 border border-slate-200/70",
  blue: "bg-slate-100 text-slate-800 border border-slate-200/70",
  amber: "bg-amber-50/80 text-amber-900 border border-amber-200/60",
  emerald: "bg-emerald-50/80 text-emerald-900 border border-emerald-200/60",
  red: "bg-rose-50/80 text-rose-900 border border-rose-200/60",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "slate",
  trend,
  className,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: keyof typeof ACCENT_CLASSES;
  trend?: { value: string; direction: "up" | "down"; positive?: boolean };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-card p-4.5 shadow-2xs transition-all duration-200 hover:bg-slate-50/60 hover:border-slate-300 hover:shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8.5 shrink-0 items-center justify-center rounded-lg",
            ACCENT_CLASSES[accent]
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="font-heading text-3xl font-medium text-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.positive === false ? "text-rose-600" : "text-emerald-600"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUp className="size-3" />
            ) : (
              <ArrowDown className="size-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
