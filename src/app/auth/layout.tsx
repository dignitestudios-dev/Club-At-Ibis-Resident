import Image from "next/image";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex">
        <Image
          src="/brand/ibis-mark-blue.png"
          alt=""
          width={640}
          height={421}
          className="pointer-events-none absolute -right-24 -bottom-16 h-auto w-[520px] opacity-20"
        />
        <Logo variant="ivory" size={34} />
        <div className="relative max-w-md space-y-3">
          <h2 className="font-serif text-3xl leading-tight">
            Architectural Review Board Portal
          </h2>
          <p className="text-sm text-white/70">
            Submit and track architectural requests for your property, upload
            documentation, and stay informed every step of the way.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="mb-8 lg:hidden">
          <Logo variant="navy" />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
