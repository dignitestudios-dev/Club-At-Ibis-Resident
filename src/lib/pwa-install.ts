"use client";

import { useSyncExternalStore } from "react";

/** The (non-standard, Chromium) event that lets us trigger the browser's own install dialog. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALLED_KEY = "club-at-ibis.pwa-installed";

export type InstallStatus =
  | "checking" // before we know anything (SSR / first paint)
  | "running-installed" // this window IS the installed app
  | "installed" // installed on this device, but we're in a normal browser tab
  | "available" // browser can show its install dialog right now
  | "ios" // iPhone / iPad Safari: manual "Add to Home Screen"
  | "unsupported"; // no install prompt offered (yet)

interface State {
  ready: boolean;
  standalone: boolean;
  installedFlag: boolean;
  prompt: BeforeInstallPromptEvent | null;
  ios: boolean;
}

let state: State = { ready: false, standalone: false, installedFlag: false, prompt: null, ios: false };
const listeners = new Set<() => void>();
let started = false;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function readInstalledFlag() {
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Must run as early as possible — `beforeinstallprompt` fires once, soon after load. */
export function startPwaInstallTracking() {
  if (started || typeof window === "undefined") return;
  started = true;

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const ua = navigator.userAgent;
  const ios =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (standalone) {
    try {
      localStorage.setItem(INSTALLED_KEY, "1");
    } catch {}
  }
  set({ ready: true, standalone, ios, installedFlag: standalone || readInstalledFlag() });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    // The browser only offers the prompt when the app is NOT installed, so any stale flag is wrong.
    try {
      localStorage.removeItem(INSTALLED_KEY);
    } catch {}
    set({ prompt: e as BeforeInstallPromptEvent, installedFlag: false });
  });

  window.addEventListener("appinstalled", () => {
    try {
      localStorage.setItem(INSTALLED_KEY, "1");
    } catch {}
    set({ prompt: null, installedFlag: true });
  });

  window.matchMedia("(display-mode: standalone)").addEventListener("change", (e) => {
    if (e.matches) set({ standalone: true, installedFlag: true });
  });

  // Best effort: Chromium on Android can tell us if the PWA is installed even from a browser tab.
  const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
  nav.getInstalledRelatedApps?.()
    .then((apps) => {
      if (apps.length > 0) {
        try {
          localStorage.setItem(INSTALLED_KEY, "1");
        } catch {}
        set({ installedFlag: true });
      }
    })
    .catch(() => {});
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => state;
const serverState: State = { ready: false, standalone: false, installedFlag: false, prompt: null, ios: false };

export function usePwaInstall() {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => serverState);

  let status: InstallStatus;
  if (!s.ready) status = "checking";
  else if (s.standalone) status = "running-installed";
  else if (s.prompt) status = "available";
  else if (s.installedFlag) status = "installed";
  else if (s.ios) status = "ios";
  else status = "unsupported";

  async function install(): Promise<"accepted" | "dismissed" | "unavailable"> {
    const p = state.prompt;
    if (!p) return "unavailable";
    await p.prompt();
    const { outcome } = await p.userChoice;
    // A prompt can only be used once.
    set({ prompt: null });
    return outcome;
  }

  return { status, install };
}
