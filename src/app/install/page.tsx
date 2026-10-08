import { notFound } from "next/navigation";

// The /install page is switched off for now: this route shows the 404 page.
// The original page is kept below — to bring it back, delete the notFound() page
// and restore this block (also restore the links in nav-items.ts, auth/layout.tsx and config/routes.ts).
//
// import type { Metadata } from "next";
// import { InstallView } from "@/features/install/install-view";
//
// export const metadata: Metadata = {
//   title: "Install the app · Club At Ibis",
//   description: "Install the Club At Ibis resident portal on your phone for one-tap access.",
// };
//
// export default function InstallPage() {
//   return <InstallView />;
// }

export default function InstallPage() {
  notFound();
}
