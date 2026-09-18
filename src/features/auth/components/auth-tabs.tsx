"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

export function AuthTabs() {
  const pathname = usePathname();

  // Only display tabs for login and register routes
  if (pathname !== "/auth/login" && pathname !== "/auth/register") {
    return null;
  }

  const isLogin = pathname === "/auth/login";
  const isRegister = pathname === "/auth/register";

  return (
    <div className="shrink-0 px-6 pt-3.5 pb-1 sm:px-8">
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <Link
          href="/auth/login"
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            isLogin
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LogIn className="size-3.5" />
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            isRegister
              ? "bg-white dark:bg-slate-800 text-primary dark:text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="size-3.5" />
          Create Account
        </Link>
      </div>
    </div>
  );
}
