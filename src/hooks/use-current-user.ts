"use client";

import { useCurrentUserQuery } from "@/features/auth/api/auth.queries";
import { useAppSelector } from "@/store";

export function useCurrentUser(): PublicResident | null {
  const { data: user } = useCurrentUserQuery();
  const reduxUser = useAppSelector((state) => state.auth.user);

  if (user) return user;
  if (reduxUser) return reduxUser;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth-user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.id) {
          return parsed as PublicResident;
        }
      } catch {
        // ignore
      }
    }
  }

  return null;
}
