"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ToastViewport } from "@/components/shared/toast/toast-viewport";

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((variant: ToastVariant, title: string, description?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, title, description }]);
    setTimeout(() => dismiss(id), TOAST_DURATION_MS);
  }, [dismiss]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if session expired flag was set before redirect
    try {
      if (sessionStorage.getItem("cai.session-expired")) {
        sessionStorage.removeItem("cai.session-expired");
        show("error", "Session Expired", "Your session has expired. Please sign in again.");
      }
    } catch {
      // Ignore sessionStorage errors
    }

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ variant?: ToastVariant; title: string; description?: string }>;
      if (customEvent.detail) {
        show(
          customEvent.detail.variant || "info",
          customEvent.detail.title,
          customEvent.detail.description
        );
      }
    };

    window.addEventListener("app:toast", handleToastEvent);
    return () => window.removeEventListener("app:toast", handleToastEvent);
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used inside <ToastProvider>");
  return ctx;
}
