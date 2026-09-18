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
  return matches.reduce((best, item) =>
    item.href.length > best.href.length ? item : best
  ).href;
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const allItems = navGroups.flatMap((g) => g.items);
  const activeHref = findActiveHref(pathname, allItems);

  return (
    <div className="flex h-full flex-col bg-card border-r border-border text-card-foreground transition-colors duration-200">
      {/* Header with stacked logo and title */}
      <div className="flex flex-col items-center justify-center border-b border-border px-4 py-5 text-center">
        <Logo
          variant="navy"
          href="/dashboard"
          size={46}
          layout="vertical"
          titleClassName="text-[22px] sm:text-2xl font-medium tracking-tight text-foreground"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.href === activeHref;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800/90 text-primary dark:text-foreground font-semibold shadow-2xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r bg-primary dark:bg-brand-gold" />
                    )}
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive
                          ? "text-primary dark:text-brand-gold"
                          : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Clean, Subtle Footer */}
      <div className="border-t border-border px-5 py-3 text-center">
        <p className="text-[10px] font-medium text-muted-foreground">Architectural Review Board</p>
      </div>
    </div>
  );
}
