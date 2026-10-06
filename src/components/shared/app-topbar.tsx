"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { useMobileMenu } from "@/components/shared/mobile-nav";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { useCurrentUser } from "@/hooks/use-current-user";

/** Phone/tablet header action: the avatar opens the side menu (the desktop dropdown is hidden there). */
function MobileAvatarButton() {
  const user = useCurrentUser();
  const { setMenuOpen } = useMobileMenu();
  const initials = ((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "U";

  return (
    <button
      type="button"
      onClick={() => setMenuOpen(true)}
      aria-label="Open menu"
      aria-haspopup="dialog"
      className="flex size-10 items-center justify-center rounded-full outline-none transition-transform active:scale-90 focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Avatar className="size-8 ring-2 ring-brand-gold/50 ring-offset-2 ring-offset-card">
        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card pt-safe transition-colors duration-200 max-lg:bg-card/85 max-lg:backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        {/* Phone / tablet: brand on the left, alerts + avatar on the right. Navigation lives in the bottom bar and side menu. */}
        <div className="lg:hidden">
          <Logo variant="navy" size={22} href="/dashboard" />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:gap-1.5">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <NotificationBell />
          <div className="hidden lg:block">
            <UserMenu />
          </div>
          <div className="lg:hidden">
            <MobileAvatarButton />
          </div>
        </div>
      </div>
    </header>
  );
}
