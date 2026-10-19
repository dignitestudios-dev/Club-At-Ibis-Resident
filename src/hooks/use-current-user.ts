"use client";

import { useCurrentUserQuery } from "@/features/auth/api/auth.queries";
import { useAppSelector } from "@/store";

let cachedStoredUser: PublicResident | null = null;
let cachedStoredRaw: string | null = null;

export function useCurrentUser(): PublicResident | null {
  const { data: user } = useCurrentUserQuery();
  const reduxUser = useAppSelector((state) => state.auth.user);

  if (user) return user;
  if (reduxUser) return reduxUser;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth-user");
    if (stored) {
      if (stored === cachedStoredRaw && cachedStoredUser) {
        return cachedStoredUser;
      }
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.id) {
          cachedStoredRaw = stored;
          cachedStoredUser = parsed as PublicResident;
          return cachedStoredUser;
        }
      } catch {
        // ignore
      }
    } else {
      cachedStoredRaw = null;
      cachedStoredUser = null;
    }
  }

  return null;
}
