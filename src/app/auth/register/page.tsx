import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create Account · Club At Ibis" };

export default function RegisterPage() {
  return <RegisterForm />;
}
