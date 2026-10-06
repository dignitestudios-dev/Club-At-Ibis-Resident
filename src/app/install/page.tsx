import type { Metadata } from "next";
import { InstallView } from "@/features/install/install-view";

export const metadata: Metadata = {
  title: "Install the app · Club At Ibis",
  description: "Install the Club At Ibis resident portal on your phone for one-tap access.",
};

export default function InstallPage() {
  return <InstallView />;
}
