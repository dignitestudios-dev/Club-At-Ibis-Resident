/**
 * "Admin access" sessions: a RESIDENT_ADMIN token (master-password login or the Super Admin's
 * "Access This Profile"). It works as the resident but lives only 15 minutes, can't change the
 * password or delete the account, and everything done with it is recorded as an admin edit.
 */
const ACCESS_KEY = "cai.admin-access";
const EXPIRED_NOTICE_KEY = "cai.admin-access-expired";
const DEFAULT_TTL_MS = 15 * 60 * 1000;

export interface AdminAccessSession {
  /** Epoch ms when the token stops working. */
  expiresAt: number;
}

/** "15m" / "900s" / "1h" -> ms (null when it can't be read). */
export function parseExpiresIn(value?: string | null): number | null {
  const match = /^(\d+)\s*([smhd])$/i.exec(value?.trim() ?? "");
  if (!match) return null;
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * units[match[2].toLowerCase() as keyof typeof units];
}

/** The token's own `exp` claim (epoch ms), when it is a readable JWT. */
export function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Stores the token like a normal login, plus the admin-access marker with its expiry. */
export function startAdminAccessSession(token: string, expiresIn?: string | null) {
  const expiresAt = tokenExpiry(token) ?? Date.now() + (parseExpiresIn(expiresIn) ?? DEFAULT_TTL_MS);
  const maxAge = Math.max(1, Math.floor((expiresAt - Date.now()) / 1000));
  localStorage.removeItem("cai.logged-out");
  localStorage.setItem("auth-token", token);
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  localStorage.setItem(ACCESS_KEY, JSON.stringify({ expiresAt } satisfies AdminAccessSession));
  return expiresAt;
}

export function getAdminAccessSession(): AdminAccessSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw || !localStorage.getItem("auth-token")) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.expiresAt === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearAdminAccessMarker() {
  try {
    localStorage.removeItem(ACCESS_KEY);
  } catch {
    // Storage unavailable
  }
}

/** The 15 minutes ran out: drop the session and go to the login page with an explanation. */
export function endExpiredAdminAccess() {
  try {
    sessionStorage.setItem(EXPIRED_NOTICE_KEY, "true");
    localStorage.setItem("cai.logged-out", "true");
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
  } catch {
    // Storage unavailable: the redirect below still works
  }
  clearAdminAccessMarker();
  document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
  window.location.replace("/auth/login");
}

/** True once if the login page was reached because an admin-access session expired. */
export function consumeAdminAccessExpiredNotice(): boolean {
  try {
    if (sessionStorage.getItem(EXPIRED_NOTICE_KEY) !== "true") return false;
    sessionStorage.removeItem(EXPIRED_NOTICE_KEY);
    return true;
  } catch {
    return false;
  }
}
