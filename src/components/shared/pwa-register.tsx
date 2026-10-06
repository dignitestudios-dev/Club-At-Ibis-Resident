"use client";

import { useEffect } from "react";
import { startPwaInstallTracking } from "@/lib/pwa-install";

/** Registers the service worker (required for installability) and starts tracking install state. */
export function PwaRegister() {
  useEffect(() => {
    startPwaInstallTracking();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Not fatal: the portal works fine without it, it just can't be installed.
      });
    }
  }, []);
  return null;
}
