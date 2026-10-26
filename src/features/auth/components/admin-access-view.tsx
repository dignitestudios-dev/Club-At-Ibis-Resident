"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth.slice";
import { clearAdminAccessMarker, startAdminAccessSession } from "@/lib/admin-access";
import { getCurrentUser } from "@/features/auth/api/auth.service";

type Phase = "starting" | "failed";

/**
 * Landing page for an admin's "Access This Profile" hand-off: /admin-access?token=...
 * Takes the 15-minute resident token from the URL, removes it from the address bar right away,
 * signs the browser in as that resident and opens the dashboard.
 */
export function AdminAccessView() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("starting");
  const [residentName, setResidentName] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const token = searchParams.get("token");
    // Keep the token out of history, screenshots and referrers as soon as it has been read.
    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      setPhase("failed");
      return;
    }

    (async () => {
      try {
        startAdminAccessSession(token);
        const user = await getCurrentUser();
        if (!user) throw new Error("No resident for this token");
        localStorage.setItem("auth-user", JSON.stringify(user));
        dispatch(setUser(user));
        setResidentName(`${user.firstName} ${user.lastName}`.trim());
        // Brief pause so the "Accessing ..." message is readable, then a full load so the new cookie is used.
        setTimeout(() => window.location.replace("/dashboard"), 900);
      } catch {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        clearAdminAccessMarker();
        document.cookie = "auth-token=; path=/; max-age=0";
        setPhase("failed");
      }
    })();
  }, [searchParams, dispatch]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo variant="navy" size={52} />
      {phase === "starting" ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <Spinner className="mx-auto size-7 text-primary" />
          <h1 className="font-heading text-2xl font-medium text-foreground">
            {residentName ? `Accessing ${residentName}'s account` : "Accessing the resident account"}
          </h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            <ShieldCheck className="mr-1 inline size-4 align-text-bottom" aria-hidden="true" />
            Setting up your admin session. Everything you do here is recorded as an admin edit. You will be taken to the
            dashboard in a moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="alert">
          <AlertCircle className="mx-auto size-7 text-destructive" aria-hidden="true" />
          <h1 className="font-heading text-2xl font-medium text-foreground">This access link can&apos;t be used</h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            The link is missing, expired (it only works for 15 minutes) or invalid. Go back to the Admin portal and select
            Access This Profile again.
          </p>
          <Button nativeButton={false} render={<Link href="/auth/login" />}>
            Go to sign in
          </Button>
        </div>
      )}
    </main>
  );
}
