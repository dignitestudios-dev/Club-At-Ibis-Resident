"use client";

import { useState, useEffect, useRef } from "react";
import { LogIn, UserPlus } from "lucide-react";
import LoginForm from "@/features/auth/components/login-form";
import RegisterForm from "@/features/auth/components/register-form";
import { cn } from "@/utils/cn";

export interface AuthViewProps {
  initialTab?: "login" | "register";
}

export function AuthView({ initialTab = "login" }: AuthViewProps) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const scrollRef = useRef<HTMLDivElement>(null);

  const switchTab = (nextTab: "login" | "register") => {
    if (tab === nextTab) return;
    setTab(nextTab);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        nextTab === "login" ? "/auth/login" : "/auth/register"
      );
      document.title =
        nextTab === "login"
          ? "Sign In · Club At Ibis"
          : "Create Account · Club At Ibis";
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path === "/auth/register") {
          setTab("register");
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } else if (path === "/auth/login") {
          setTab("login");
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top Sliding Pill Tab Switcher */}
      <div className="shrink-0 px-6 pt-3.5 pb-1.5 sm:px-8">
        <div className="relative grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {/* Animated Sliding Pill */}
          <div
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-slate-800 shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            style={{
              transform: tab === "register" ? "translateX(100%)" : "translateX(0%)",
            }}
          />

          <button
            type="button"
            onClick={() => switchTab("login")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 select-none cursor-pointer",
              tab === "login"
                ? "text-primary dark:text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LogIn className="size-3.5" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => switchTab("register")}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 select-none cursor-pointer",
              tab === "register"
                ? "text-primary dark:text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus className="size-3.5" />
            Create Account
          </button>
        </div>
      </div>

      {/* Form Container with Smooth Field Animation (no horizontal sliding) */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto custom-scrollbar px-6 py-2 sm:px-8"
      >
        <div key={tab} className="w-full">
          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
