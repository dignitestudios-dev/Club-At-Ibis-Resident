"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import LoginForm from "@/features/auth/components/login-form";
import RegisterForm from "@/features/auth/components/register-form";
import { clearPendingRegistration } from "@/features/auth/hooks/use-register";
import { cn } from "@/utils/cn";

export interface AuthViewProps {
  initialTab?: "login" | "register";
}

export function AuthView({ initialTab = "login" }: AuthViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const tab: "login" | "register" = pathname?.includes("/register")
    ? "register"
    : pathname?.includes("/login")
    ? "login"
    : initialTab;

  const switchTab = (nextTab: "login" | "register") => {
    if (tab === nextTab) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (nextTab === "login") {
      clearPendingRegistration();
      router.push("/auth/login");
    } else {
      router.push("/auth/register");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top Sliding Pill Tab Switcher */}
      <div className="shrink-0 px-6 pt-3.5 pb-1.5 sm:px-8">
        <div
          role="tablist"
          aria-label="Authentication Options"
          className="relative grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800"
        >
          {/* Animated Sliding Pill */}
          <div
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-slate-800 shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            style={{
              transform: tab === "register" ? "translateX(100%)" : "translateX(0%)",
            }}
          />

          <button
            id="auth-login-tab"
            role="tab"
            aria-selected={tab === "login"}
            aria-controls="auth-tabpanel"
            type="button"
            onClick={() => switchTab("login")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 select-none cursor-pointer",
              tab === "login"
                ? "text-primary dark:text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LogIn className="size-3.5" aria-hidden="true" />
            Sign In
          </button>

          <button
            id="auth-register-tab"
            role="tab"
            aria-selected={tab === "register"}
            aria-controls="auth-tabpanel"
            type="button"
            onClick={() => switchTab("register")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 select-none cursor-pointer",
              tab === "register"
                ? "text-primary dark:text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Create Account
          </button>
        </div>
      </div>

      {/* Form Container with Smooth Field Animation (no horizontal sliding) */}
      <div
        id="auth-tabpanel"
        role="tabpanel"
        aria-labelledby={tab === "login" ? "auth-login-tab" : "auth-register-tab"}
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto custom-scrollbar px-6 pt-2 pb-6 sm:px-8 sm:pb-6"
      >
        <div key={tab} className="w-full">
          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
