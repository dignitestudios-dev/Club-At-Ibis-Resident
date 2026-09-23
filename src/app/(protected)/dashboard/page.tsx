import type { Metadata } from "next";
import DashboardOverview from "@/features/requests/components/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard · Club At Ibis Resident Portal",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
