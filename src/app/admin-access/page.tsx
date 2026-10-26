import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAccessView } from "@/features/auth/components/admin-access-view";

// The URL carries a short-lived access token: never send it on as a Referer.
export const metadata: Metadata = { title: "Admin Access · Club At Ibis", referrer: "no-referrer" };

export default function AdminAccessPage() {
  return (
    <Suspense>
      <AdminAccessView />
    </Suspense>
  );
}
