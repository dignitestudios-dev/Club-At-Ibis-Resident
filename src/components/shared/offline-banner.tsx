"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, WifiOff } from "lucide-react";
import { cn } from "@/utils/cn";

type Status = "online" | "offline" | "restored";

/**
 * A slim strip at the top of the screen: "You are offline" while disconnected (the app keeps showing the
 * data it already loaded), then "You're back online" for a few seconds once the connection returns.
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
      hideTimer = setTimeout(() => setStatus("online"), 3500);
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
        "pt-safe fixed inset-x-0 top-0 z-[60] animate-in fade-in slide-in-from-top-2",
        offline ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
      )}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium">
        {offline ? <WifiOff className="size-3.5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />}
        <span>{offline ? "You are offline. Showing the last data loaded; changes can't be saved until you reconnect." : "You're back online."}</span>
      </div>
    </div>
  );
}
