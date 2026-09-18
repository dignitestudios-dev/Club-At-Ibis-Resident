import type { Metadata } from "next";
import { AuthView } from "@/features/auth/components/auth-view";

export const metadata: Metadata = { title: "Create Account · Club At Ibis" };

export default function RegisterPage() {
  return <AuthView initialTab="register" />;
}
