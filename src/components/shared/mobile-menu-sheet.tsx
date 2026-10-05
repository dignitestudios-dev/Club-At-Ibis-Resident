"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  ChevronRight,
  FileEdit,
  FilePlus2,
  Laptop,
  ListChecks,
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useMobileMenu } from "@/components/shared/mobile-nav";
import { navGroups, type NavItem } from "@/components/shared/nav-items";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/utils/cn";

function initials(firstName?: string, lastName?: string) {
  return ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase() || "U";
}

function findActiveHref(pathname: string, items: NavItem[]): string | null {
  const exact = items.find((item) => pathname === item.href);
  if (exact) return exact.href;
  const matches = items.filter((item) => item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  if (matches.length === 0) return null;
  return matches.reduce((best, item) => (item.href.length > best.href.length ? item : best)).href;
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Laptop },
] as const;

/** Staggered slide-in so the menu content "settles" after the sheet lands. */
function enter(index: number) {
  return {
    className: "animate-in fade-in slide-in-from-left-3 fill-mode-both duration-300",
    style: { animationDelay: `${80 + index * 35}ms` },
  };
}

/**
 * The phone-sized "side menu": a left sheet with a branded profile hero,
 * thumb-friendly quick actions, the full navigation, an appearance switch
 * and sign-out. Opened from the bottom bar's Menu tab or the header avatar.
 */
export function MobileMenuSheet() {
  const { menuOpen, setMenuOpen } = useMobileMenu();
  const pathname = usePathname();
  const user = useCurrentUser();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const { logout, isPending } = useLogout();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Any navigation (including the browser back button) closes the menu.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  const allItems = navGroups.flatMap((g) => g.items);
  const activeHref = findActiveHref(pathname, allItems);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Resident";

  const quickActions = [
    { href: "/requests/new", label: "New request", icon: FilePlus2, tone: "gold" as const },
    { href: "/requests", label: "My requests", icon: ListChecks, tone: "navy" as const },
    { href: "/requests?tab=drafts", label: "Drafts", icon: FileEdit, tone: "amber" as const },
  ];

  const toneClass = {
    gold: "bg-linear-to-br from-brand-gold to-[#8a7339] text-white shadow-md shadow-brand-gold/30",
    navy: "bg-primary/10 text-primary dark:bg-brand-gold/15 dark:text-brand-gold",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  };

  let itemIndex = 0;
  // Reserve the appearance block's slot in the stagger after the nav rows (3 quick actions + every nav item).
  const appearanceAnim = enter(quickActions.length + allItems.length);

  return (
    <>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="scrollbar-none w-[88%] max-w-[22rem] gap-0 overflow-y-auto border-r-0 bg-background p-0 sm:max-w-[22rem]"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate the resident portal, change appearance, or sign out.</SheetDescription>

          {/* Hero */}
          <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-[#0b1b28] via-[#112636] to-[#1e3a5f] px-5 pt-safe pb-10 text-white">
            {/* Decorative architecture: gold glow + concentric arches */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-14 size-56 rounded-full bg-brand-gold/25 blur-3xl" />
            <svg
              aria-hidden="true"
              viewBox="0 0 200 120"
              className="pointer-events-none absolute right-0 bottom-0 h-28 w-44 text-white/10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M10 120V70a90 90 0 0 1 180 0v50" />
              <path d="M34 120V74a66 66 0 0 1 132 0v46" />
              <path d="M58 120V78a42 42 0 0 1 84 0v42" />
              <path d="M82 120V82a18 18 0 0 1 36 0v38" />
            </svg>

            <div className="relative flex items-center justify-between pt-3">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-brand-gold uppercase">
                Club at Ibis
              </span>
              <SheetClose
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 active:scale-90"
              >
                <X className="size-4.5" aria-hidden="true" />
              </SheetClose>
            </div>

            <div className="relative mt-4 flex items-center gap-4">
              <Avatar className="size-[4.5rem] ring-2 ring-brand-gold/70 ring-offset-2 ring-offset-[#112636]">
                <AvatarFallback className="bg-linear-to-br from-brand-gold to-[#8a7339] font-heading text-2xl font-semibold text-white">
                  {initials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-xl leading-tight font-medium">{displayName}</p>
                <p className="mt-0.5 truncate text-xs text-slate-300">{user?.email}</p>
                {user?.residentIdNumber && (
                  <span className="mt-2 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-slate-100 uppercase backdrop-blur">
                    Resident · {user.residentIdNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions float over the hero edge */}
          <div className="relative z-10 -mt-7 px-4">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-card p-2.5 shadow-lg">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const anim = enter(itemIndex++);
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40",
                      anim.className
                    )}
                    style={anim.style}
                  >
                    <span className={cn("flex size-11 items-center justify-center rounded-2xl", toneClass[action.tone])}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] leading-tight font-semibold text-foreground">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Menu" className="flex-1 space-y-4 px-4 pt-5">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className="px-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = item.href === activeHref;
                    const Icon = item.icon;
                    const badge = item.href === "/notifications" ? unreadCount : 0;
                    const anim = enter(itemIndex++);
                    return (
                      <li key={item.href} className={anim.className} style={anim.style}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40",
                            isActive ? "bg-primary/8 dark:bg-brand-gold/10" : "hover:bg-muted/60"
                          )}
                        >
                          {isActive && (
                            <span aria-hidden="true" className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold" />
                          )}
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-muted text-muted-foreground group-hover:text-foreground"
                            )}
                          >
                            <Icon className="size-[18px]" aria-hidden="true" />
                          </span>
                          <span
                            className={cn(
                              "flex-1 text-sm",
                              isActive ? "font-semibold text-foreground" : "font-medium text-foreground/85"
                            )}
                          >
                            {item.label}
                          </span>
                          {badge > 0 && (
                            <span className="flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] leading-5 font-bold text-white">
                              {badge > 9 ? "9+" : badge}
                            </span>
                          )}
                          <ChevronRight className="size-4 text-muted-foreground/50" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* Appearance */}
            <div className={cn("space-y-1.5", appearanceAnim.className)} style={appearanceAnim.style}>
              <p className="px-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Appearance
              </p>
              <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                {THEMES.map(({ value, label, icon: Icon }) => {
                  const selected = mounted && theme === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold outline-none transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40",
                        selected ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-5 space-y-3 px-4 pb-4 pb-safe">
            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-700 outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-400/50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
            <p className="text-center text-[10px] tracking-wide text-muted-foreground">
              Architectural Review Board · Club at Ibis
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmingLogout}
        onOpenChange={(open) => {
          if (!isPending) setConfirmingLogout(open);
        }}
        title="Log out?"
        description="You'll need to sign in again to access your requests."
        confirmLabel={isPending ? "Logging out..." : "Log Out"}
        loading={isPending}
        destructive
        onConfirm={async () => {
          await logout();
        }}
      />
    </>
  );
}
