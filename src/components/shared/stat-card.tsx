import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const ACCENT_CLASSES = {
  slate: {
    icon: "bg-slate-100 text-slate-700 border-slate-200/80",
    topBar: "from-slate-400 to-slate-600",
    glow: "group-hover:border-slate-300",
  },
  navy: {
    icon: "bg-primary/8 text-primary border-primary/15",
    topBar: "from-primary to-slate-800",
    glow: "group-hover:border-primary/40",
  },
  blue: {
    icon: "bg-sky-50 text-sky-800 border-sky-200/80",
    topBar: "from-sky-400 to-sky-600",
    glow: "group-hover:border-sky-300",
  },
  amber: {
    icon: "bg-amber-50 text-amber-900 border-amber-200/80",
    topBar: "from-amber-400 to-amber-600",
    glow: "group-hover:border-amber-300",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
    topBar: "from-emerald-400 to-emerald-600",
    glow: "group-hover:border-emerald-300",
  },
  gold: {
    icon: "bg-amber-50 text-amber-900 border-amber-200/80",
    topBar: "from-brand-gold to-amber-600",
    glow: "group-hover:border-brand-gold/50",
  },
  red: {
    icon: "bg-rose-50 text-rose-900 border-rose-200/80",
    topBar: "from-rose-400 to-rose-600",
    glow: "group-hover:border-rose-300",
  },
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
  const accentStyle = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.slate;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between gap-3.5 overflow-hidden rounded-2xl border border-border/80 bg-white p-5 shadow-2xs transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-md",
        accentStyle.glow,
        className
      )}
    >
      {/* Top accent line */}
      <span
        className={cn(
          "absolute top-0 inset-x-0 h-1 bg-gradient-to-r transition-opacity duration-300 opacity-80 group-hover:opacity-100",
          accentStyle.topBar
        )}
      />

      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110",
            accentStyle.icon
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="font-heading text-3xl font-semibold text-foreground tracking-tight tabular-nums">
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.positive === false
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
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
