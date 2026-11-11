"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, WifiOff } from "lucide-react";
import { cn } from "@/utils/cn";

type Status = "online" | "offline" | "restored";

/**
 * A slim strip at the very top of the page, in the normal flow (it pushes the app down rather than
 * covering the header): "You're offline" while disconnected, then "You're back online" for a few seconds.
 */
export function OfflineBanner() {
  const [status, setStatus] = useState<Status>("online");

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const clear = () => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = null;
    };
    const goOffline = () => {
      clear();
      setStatus("offline");
    };
    const goOnline = () => {
      clear();
      setStatus("restored");
      hideTimer = setTimeout(() => setStatus("online"), 3000);
    };

    if (!navigator.onLine) setStatus("offline");
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      clear();
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (status === "online") return null;
  const offline = status === "offline";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pt-safe w-full text-white",
        offline ? "bg-slate-600 dark:bg-slate-700" : "bg-emerald-600"
      )}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium">
        {offline ? <WifiOff className="size-3.5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />}
        <span>{offline ? "You're offline" : "You're back online"}</span>
      </div>
    </div>
  );
}
