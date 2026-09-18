import {
  PaintBucket,
  Fence,
  Trees,
  Waves,
  Home,
  Building2,
  HardHat,
  DoorOpen,
  Zap,
  LayoutGrid,
  Milestone,
  ShieldCheck,
  Construction,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  PaintBucket,
  Fence,
  Trees,
  Waves,
  Home,
  Building2,
  HardHat,
  DoorOpen,
  Zap,
  LayoutGrid,
  Milestone,
  ShieldCheck,
  Construction,
};

export function RequestTypeCard({
  requestType,
  onSelect,
}: {
  requestType: RequestType;
  onSelect: () => void;
}) {
  const Icon = ICONS[requestType.icon] ?? Home;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex items-start gap-3.5 rounded-xl border border-border/80 bg-card p-4.5 text-left shadow-2xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-slate-50 hover:border-brand-gold/70 hover:shadow-md"
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-base font-medium text-foreground group-hover:text-primary transition-colors">
          {requestType.name}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
          {requestType.description}
        </span>
      </span>
      <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </button>
  );
}
