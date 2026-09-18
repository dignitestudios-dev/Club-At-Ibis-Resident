"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { navGroups, type NavItem } from "@/components/shared/nav-items";
import { cn } from "@/utils/cn";

function findActiveHref(pathname: string, items: NavItem[]): string | null {
  const exact = items.find((item) => pathname === item.href);
  if (exact) return exact.href;
  const matches = items.filter(
    (item) => item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)
  );
  if (matches.length === 0) return null;
  // Longest matching prefix wins
  return matches.reduce((best, item) =>
    item.href.length > best.href.length ? item : best
  ).href;
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const allItems = navGroups.flatMap((g) => g.items);
  const activeHref = findActiveHref(pathname, allItems);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b border-sidebar-border px-5">
        <Logo variant="ivory" href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = item.href === activeHref;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-white shadow-xs"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
                  )}
                >
                  {isActive && (
                    <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-md bg-brand-gold" />
                  )}
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0 transition-colors",
                      isActive ? "text-brand-gold" : "text-sidebar-foreground/60"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs font-medium text-white/90">Club At Ibis</p>
        <p className="text-[11px] text-sidebar-foreground/60">Architectural Review Board</p>
      </div>
    </div>
  );
}
