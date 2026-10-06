"use client";

import { useSyncExternalStore } from "react";

/** Matches Tailwind's `md` breakpoint: anything narrower is treated as a phone-sized viewport. */
export const MOBILE_BREAKPOINT = 768;

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * Subscribes to a media query. The server snapshot is always `false`, so the
 * first paint matches the desktop markup and the real value lands right
 * after hydration — only used to swap *interactive* surfaces (dialog vs
 * bottom sheet), never to gate layout that has a pure-CSS equivalent.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
