import type { Metadata } from "next";
import ProfileForm from "@/features/auth/components/profile-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "My Profile · Club At Ibis Resident Portal",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account details." />
      <ProfileForm />
    </div>
  );
}
