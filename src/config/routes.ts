export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/requests",
  "/drafts",
  "/notifications",
  "/profile",
];

// Only sign-in / registration pages redirect authenticated users to the dashboard.
// Recovery and verification pages stay reachable even if a session cookie is present.
export const AUTH_PAGES = [
  "/auth/login",
  "/auth/register",
];

export const AUTH_REDIRECT = "/auth/login";
export const DEFAULT_REDIRECT = "/dashboard";
