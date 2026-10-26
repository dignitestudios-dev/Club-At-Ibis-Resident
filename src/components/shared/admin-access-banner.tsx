"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { endExpiredAdminAccess, getAdminAccessSession } from "@/lib/admin-access";

const WARN_AT_MS = 2 * 60 * 1000;

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Shown for the whole length of an admin-access (master password / "Access This Profile") session.
 * The token cannot be refreshed, so it warns two minutes before it ends and signs out when it does.
 */
export function AdminAccessBanner() {
  const toast = useToast();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [warned, setWarned] = useState(false);

  useEffect(() => {
    setExpiresAt(getAdminAccessSession()?.expiresAt ?? null);
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const remaining = expiresAt ? expiresAt - now : null;

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      endExpiredAdminAccess();
    } else if (remaining <= WARN_AT_MS && !warned) {
      setWarned(true);
      toast.warning("Admin access ends soon", "Finish and save your changes. The session closes in under 2 minutes.");
    }
  }, [remaining, warned, toast]);

  if (!expiresAt || remaining === null) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-300/80 bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <span className="inline-flex items-center gap-1.5">
        <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
        Admin access: you are acting on this resident&apos;s behalf. Changes are recorded as admin edits.
      </span>
      <span className="tabular-nums">Session ends in {formatRemaining(remaining)}</span>
    </div>
  );
}
