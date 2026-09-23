import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthView } from "@/features/auth/components/auth-view";

export const metadata: Metadata = { title: "Sign In · Club At Ibis" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthView initialTab="login" />
    </Suspense>
  );
}
