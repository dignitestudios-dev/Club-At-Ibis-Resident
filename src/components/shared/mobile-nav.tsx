"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, House, ListChecks, Plus, User } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/utils/cn";

/**
 * Full-screen flows (the create / revise wizards) own the bottom of the
 * screen with their own sticky Back / Next bar, so — like a native app
 * pushing a modal screen — the tab bar steps aside there.
 */
const FOCUS_ROUTES = [/^\/requests\/new(\/|$)/, /^\/requests\/[^/]+\/revise(\/|$)/];

export function isFocusRoute(pathname: string) {
  return FOCUS_ROUTES.some((re) => re.test(pathname));
}

interface MobileNavContextValue {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const value = useMemo(() => ({ menuOpen, setMenuOpen }), [menuOpen]);
  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export function useMobileMenu() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileMenu must be used inside <MobileNavProvider>");
  return ctx;
}

function tabIsActive(key: "home" | "requests" | "alerts", pathname: string) {
  switch (key) {
    case "home":
      return pathname === "/dashboard";
    case "requests":
      return (
        (pathname.startsWith("/requests") && !/^\/requests\/new(\/|$)/.test(pathname)) ||
        pathname.startsWith("/drafts")
      );
    case "alerts":
      return pathname.startsWith("/notifications");
  }
}

function tap() {
  // Light haptic tick where the platform supports it (Android Chrome); a silent no-op elsewhere.
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(8);
}

const tabClass =
  "group flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl outline-none transition-transform duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-primary/40";

function TabLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "text-[10px] leading-none font-semibold tracking-wide transition-colors",
        active ? "text-primary dark:text-brand-gold" : "text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

function TabIcon({
  active,
  badge,
  children,
}: {
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "relative flex h-7 w-14 items-center justify-center rounded-full transition-all duration-200",
        active
          ? "bg-primary/10 text-primary dark:bg-brand-gold/15 dark:text-brand-gold"
          : "text-muted-foreground group-hover:text-foreground"
      )}
    >
      {children}
      {!!badge && badge > 0 && (
        <span className="absolute top-0 right-3 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] leading-4 font-bold text-white shadow-xs ring-2 ring-card">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  if (isFocusRoute(pathname)) return null;

  const home = tabIsActive("home", pathname);
  const requests = tabIsActive("requests", pathname);
  const alerts = tabIsActive("alerts", pathname);
  const profile = pathname.startsWith("/profile");

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="border-t border-border/70 bg-card/92 pb-safe shadow-[0_-10px_30px_-14px_rgba(15,23,42,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
        <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-stretch px-2">
          <li>
            <Link
              href="/dashboard"
              onClick={tap}
              aria-current={home ? "page" : undefined}
              className={tabClass}
            >
              <TabIcon active={home}>
                <House className="size-[22px]" strokeWidth={home ? 2.4 : 2} aria-hidden="true" />
              </TabIcon>
              <TabLabel active={home}>Home</TabLabel>
            </Link>
          </li>

          <li>
            <Link
              href="/requests"
              onClick={tap}
              aria-current={requests ? "page" : undefined}
              className={tabClass}
            >
              <TabIcon active={requests}>
                <ListChecks className="size-[22px]" strokeWidth={requests ? 2.4 : 2} aria-hidden="true" />
              </TabIcon>
              <TabLabel active={requests}>Requests</TabLabel>
            </Link>
          </li>

          {/* Raised primary action: start a new request. */}
          <li className="relative">
            <Link
              href="/requests/new"
              onClick={tap}
              aria-label="New request"
              className="absolute left-1/2 -top-6 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-linear-to-br from-brand-gold via-[#b59a58] to-[#8a7339] text-white shadow-lg shadow-brand-gold/40 ring-[5px] ring-background outline-none transition-transform duration-150 active:scale-90 focus-visible:ring-primary/50"
            >
              <Plus className="size-7" strokeWidth={2.6} aria-hidden="true" />
            </Link>
            <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px] leading-none font-semibold tracking-wide text-muted-foreground">
              New
            </span>
          </li>

          <li>
            <Link
              href="/notifications"
              onClick={tap}
              aria-current={alerts ? "page" : undefined}
              aria-label={unreadCount > 0 ? `Alerts (${unreadCount} unread)` : "Alerts"}
              className={tabClass}
            >
              <TabIcon active={alerts} badge={unreadCount}>
                <Bell className="size-[22px]" strokeWidth={alerts ? 2.4 : 2} aria-hidden="true" />
              </TabIcon>
              <TabLabel active={alerts}>Alerts</TabLabel>
            </Link>
          </li>

          <li>
            <Link
              href="/profile"
              onClick={tap}
              aria-current={profile ? "page" : undefined}
              className={tabClass}
            >
              <TabIcon active={profile}>
                <User className="size-[22px]" strokeWidth={profile ? 2.4 : 2} aria-hidden="true" />
              </TabIcon>
              <TabLabel active={profile}>Profile</TabLabel>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
