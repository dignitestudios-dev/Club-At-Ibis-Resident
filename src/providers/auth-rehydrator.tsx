"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { setUser, clearUser } from "@/store/slices/auth.slice";
import { seedResidents } from "@/lib/mock/users";

function toPublic(resident: Resident): PublicResident {
  const { password: _p, ...rest } = resident;
  return rest;
}

function isValidResident(value: unknown): value is PublicResident {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<PublicResident>;
  return (
    typeof r.id === "string" &&
    typeof r.email === "string" &&
    typeof r.firstName === "string" &&
    (r.lastName === undefined || typeof r.lastName === "string")
  );
}

export default function AuthRehydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isExplicitlyLoggedOut = localStorage.getItem("cai.logged-out") === "true";

    if (isExplicitlyLoggedOut) {
      dispatch(clearUser());
      return;
    }

    const stored = localStorage.getItem("auth-user");
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (isValidResident(parsed)) {
          dispatch(setUser(parsed));
          document.cookie = `auth-token=demo-token-${parsed.id}; path=/; max-age=1209600; SameSite=Lax`;
          return;
        }
      } catch {
        // Fall through to default seed
      }
    }

    // Default auto-feed demo resident for smooth initial experience
    const defaultDemoUser = toPublic(seedResidents[0]);
    localStorage.setItem("auth-user", JSON.stringify(defaultDemoUser));
    localStorage.setItem("auth-token", `demo-token-${defaultDemoUser.id}`);
    document.cookie = `auth-token=demo-token-${defaultDemoUser.id}; path=/; max-age=1209600; SameSite=Lax`;
    dispatch(setUser(defaultDemoUser));
  }, [dispatch]);

  return <>{children}</>;
}
