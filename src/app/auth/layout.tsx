import Image from "next/image";
import { Suspense } from "react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-svh max-h-svh flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/ibis-clubhouse.jpg"
          alt="The Club at Ibis"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter brightness-90 animate-in fade-in duration-700"
        />
        {/* Luxury Vignette & Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-950/75 backdrop-blur-[1px]" />
      </div>

      {/* Large Decorative Watermark Emblem in Background */}
      <div className="pointer-events-none absolute -right-16 -bottom-12 select-none opacity-15 lg:opacity-25 z-0 transition-opacity">
        <Image
          src="/brand/ibis-mark-gold.png"
          alt=""
          width={640}
          height={421}
          className="h-auto w-[320px] sm:w-[460px] lg:w-[580px] object-contain filter drop-shadow-2xl"
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-3.5 lg:px-10">
        <Logo variant="ivory" size={30} />
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-white/80 hover:text-white hover:bg-white/10" />
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Resident Portal
          </span>
        </div>
      </header>

      {/* Main Center Auth Card with Fixed Height & Scrollable Body */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-2 sm:px-6 min-h-0 overflow-hidden">
        <div className="relative w-full max-w-[460px] h-[580px] max-h-[calc(100svh-80px)] flex flex-col rounded-2xl border border-white/30 dark:border-white/10 bg-white/95 dark:bg-[#121c2d]/95 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Subtle Watermark Inside Auth Card Corner */}
          <div className="pointer-events-none absolute -right-10 -top-10 select-none opacity-[0.05] dark:opacity-[0.06] z-0">
            <Image
              src="/brand/ibis-mark-navy.png"
              alt=""
              width={240}
              height={158}
              className="h-auto w-[200px] object-contain dark:hidden"
            />
            <Image
              src="/brand/ibis-mark-gold.png"
              alt=""
              width={240}
              height={158}
              className="h-auto w-[200px] object-contain hidden dark:block"
            />
          </div>

          {/* Fixed Card Header */}
          <div className="relative z-10 shrink-0 pt-4 pb-2.5 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-0.5">
            <Logo variant="navy" size={26} />
            <p className="text-[10px] font-semibold tracking-widest text-brand-gold uppercase">
              Architectural Review Board
            </p>
          </div>

          {/* Card Body Area */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Suspense>{children}</Suspense>
          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 shrink-0 py-2.5 px-6 text-center text-[11px] text-white/60">
        <p>
          &copy; {new Date().getFullYear()} The Club at Ibis Architectural Review Board. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
