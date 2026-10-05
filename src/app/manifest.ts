import type { MetadataRoute } from "next";

// Lets residents "Add to Home Screen" and launch the portal full-screen like a native app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Club At Ibis — Resident Portal",
    short_name: "Club At Ibis",
    description: "Architectural Review Board portal for Club At Ibis residents.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#112636",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
  };
}
