"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Download,
  EllipsisVertical,
  Info,
  PlusSquare,
  Rocket,
  Share,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { usePwaInstall } from "@/lib/pwa-install";

const BENEFITS = [
  { icon: Rocket, title: "One-tap access", text: "Opens from your home screen, full screen, like any other app." },
  { icon: BellRing, title: "Stay in the loop", text: "Jump straight to your requests and ARB updates." },
  { icon: ShieldCheck, title: "Same secure portal", text: "Your account and data stay exactly as they are." },
];

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-amber-400/15 dark:text-amber-300">
        {n}
      </span>
      <span className="min-w-0 text-sm leading-relaxed text-foreground/90">{children}</span>
    </li>
  );
}

function InstallPanel() {
  const { status, install } = usePwaInstall();
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);

  async function handleInstall() {
    setBusy(true);
    setDeclined(false);
    try {
      const outcome = await install();
      if (outcome === "dismissed") setDeclined(true);
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground" aria-busy="true">
        <Spinner className="size-4" /> Checking your device…
      </div>
    );
  }

  if (status === "running-installed" || status === "installed") {
    const inApp = status === "running-installed";
    return (
      <div className="space-y-4 text-center" role="status">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="font-heading text-xl font-medium text-foreground">Already installed</p>
          <p className="text-sm text-muted-foreground">
            {inApp
              ? "You're using the installed Club At Ibis app right now."
              : "Club At Ibis is installed on this device. Open it from your home screen or app list."}
          </p>
        </div>
        <Button size="lg" className="h-12 w-full rounded-xl text-base" nativeButton={false} render={<Link href="/dashboard" />}>
          {inApp ? "Go to dashboard" : "Continue in browser"}
        </Button>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="space-y-3">
        <Button size="lg" className="h-12 w-full gap-2 rounded-xl text-base" onClick={handleInstall} disabled={busy}>
          {busy ? <Spinner className="size-4" /> : <Download className="size-5" aria-hidden="true" />}
          Install app
        </Button>
        {declined && (
          <p className="text-center text-xs text-muted-foreground" role="status">
            No problem — you can install it any time from this page.
          </p>
        )}
      </div>
    );
  }

  if (status === "ios") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Install on iPhone or iPad</p>
        <ol className="space-y-3">
          <Step n={1}>
            Open this page in <strong>Safari</strong> (other iOS browsers can&apos;t install apps).
          </Step>
          <Step n={2}>
            Tap the <Share className="mx-0.5 inline size-4 align-text-bottom" aria-label="Share" /> <strong>Share</strong> button in the toolbar.
          </Step>
          <Step n={3}>
            Scroll down and tap <PlusSquare className="mx-0.5 inline size-4 align-text-bottom" aria-hidden="true" /> <strong>Add to Home Screen</strong>.
          </Step>
          <Step n={4}>
            Tap <strong>Add</strong>. Club At Ibis now appears on your home screen.
          </Step>
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Your browser isn&apos;t offering one-tap install right now. Try Chrome or Edge, or install from the browser menu.
        </p>
      </div>
      <ol className="space-y-3">
        <Step n={1}>
          Open this page in <strong>Chrome</strong> or <strong>Edge</strong> on your phone.
        </Step>
        <Step n={2}>
          Open the <EllipsisVertical className="mx-0.5 inline size-4 align-text-bottom" aria-label="Menu" /> menu.
        </Step>
        <Step n={3}>
          Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
        </Step>
      </ol>
    </div>
  );
}

export function InstallView() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to portal
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-[1.4rem] shadow-lg ring-1 ring-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" width={80} height={80} className="size-full object-cover" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-wider text-brand-gold uppercase">Resident Portal</p>
            <h1 className="font-heading text-3xl font-medium text-foreground">Install Club At Ibis</h1>
            <p className="text-sm text-muted-foreground">
              Add the portal to your phone for a faster, app-like experience.
            </p>
          </div>
        </div>

        <section aria-label="Install" className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
          <InstallPanel />
        </section>

        <ul className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-4" aria-label="Why install">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-amber-400/15 dark:text-amber-300">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 text-sm">
                <span className="block font-semibold text-foreground">{title}</span>
                <span className="block text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Smartphone className="size-3.5" aria-hidden="true" />
          Works on Android, iPhone and iPad
        </p>
      </main>
    </div>
  );
}
