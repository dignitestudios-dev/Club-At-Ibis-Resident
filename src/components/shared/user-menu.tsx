"use client";

import { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
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

function initials(firstName?: string, lastName?: string) {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  const combined = (f + l).toUpperCase();
  return combined || "U";
}

export function UserMenu() {
  const user = useCurrentUser();
  const { logout, isPending } = useLogout();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (!user) {
    return (
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground/60"
        aria-label="Loading account profile"
      >
        <UserIcon className="size-4" />
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Resident";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
          aria-label="User account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col gap-0.5 px-2.5 py-2">
            <span className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full" />}>
            <UserIcon className="size-4" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmingLogout(true)}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive w-full"
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
