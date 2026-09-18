"use client";

import { useState } from "react";
import { LogOut, User as UserIcon, Sun, Moon, Laptop } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/utils/cn";

function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function UserMenu() {
  const user = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-58">
          <div className="flex flex-col gap-0.5 px-2 py-1.5">
            <span className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserIcon />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Theme
          </div>
          <div className="grid grid-cols-3 gap-1 px-2 pb-1.5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md p-1.5 text-[11px] font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
                theme === "light"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary font-semibold ring-1 ring-border"
                  : "text-muted-foreground"
              )}
            >
              <Sun className="size-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md p-1.5 text-[11px] font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
                theme === "dark"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary font-semibold ring-1 ring-border"
                  : "text-muted-foreground"
              )}
            >
              <Moon className="size-3.5 text-amber-400" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md p-1.5 text-[11px] font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
                theme === "system"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary font-semibold ring-1 ring-border"
                  : "text-muted-foreground"
              )}
            >
              <Laptop className="size-3.5 text-slate-400" />
              <span>System</span>
            </button>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmingLogout(true)}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmingLogout}
        onOpenChange={setConfirmingLogout}
        title="Log out?"
        description="You'll need to sign in again to access your requests."
        confirmLabel="Log Out"
        destructive
        onConfirm={() => logout()}
      />
    </>
  );
}
