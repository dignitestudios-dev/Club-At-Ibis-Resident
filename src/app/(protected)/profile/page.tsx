import ProfileForm from "@/features/auth/components/profile-form";
import { PageHeader } from "@/components/shared/page-header";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account details." />
      <ProfileForm />
    </div>
  );
}
