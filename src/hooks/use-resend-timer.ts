"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Formats a duration in seconds to MM:SS string (e.g. 120 -> "2:00", 65 -> "1:05").
 */
export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export interface UseResendTimerReturn {
  countdown: number;
  isCoolingDown: boolean;
  formattedTime: string;
  startTimer: (customSeconds?: number) => void;
  resetTimer: () => void;
}

/**
 * Manages a persistent cooldown countdown timer backed by localStorage.
 * Survives page refreshes and accurately tracks elapsed time using Date.now().
 */
export function useResendTimer(
  storageKey: string,
  cooldownSeconds: number = 120
): UseResendTimerReturn {
  const [countdown, setCountdown] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateRemaining = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    try {
      const storedExpiry = localStorage.getItem(storageKey);
      if (!storedExpiry) return 0;

      const expiry = parseInt(storedExpiry, 10);
      if (isNaN(expiry)) {
        localStorage.removeItem(storageKey);
        return 0;
      }

      const diff = Math.ceil((expiry - Date.now()) / 1000);
      if (diff > 0) {
        return diff;
      } else {
        localStorage.removeItem(storageKey);
        return 0;
      }
    } catch {
      return 0;
    }
  }, [storageKey]);

  // Sync on mount and maintain timer interval
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = calculateRemaining();
      setCountdown(remaining);
      return remaining;
    };

    const initial = updateCountdown();
    if (initial > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const remaining = updateCountdown();
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [calculateRemaining]);

  const startTimer = useCallback(
    (customSeconds?: number) => {
      if (typeof window === "undefined") return;
      const duration = customSeconds ?? cooldownSeconds;
      const expiry = Date.now() + duration * 1000;
      try {
        localStorage.setItem(storageKey, String(expiry));
      } catch {
        // Ignore storage write errors (quota/disabled)
      }
      setCountdown(duration);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const remaining = calculateRemaining();
        setCountdown(remaining);
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1000);
    },
    [storageKey, cooldownSeconds, calculateRemaining]
  );

  const resetTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage write errors
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(0);
  }, [storageKey]);

  return {
    countdown,
    isCoolingDown: countdown > 0,
    formattedTime: formatCountdown(countdown),
    startTimer,
    resetTimer,
  };
}
