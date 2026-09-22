"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { setUser, clearUser } from "@/store/slices/auth.slice";
import { authKeys } from "@/features/auth/api/auth.queries";
import { getCurrentUser } from "@/features/auth/api/auth.service";

function isValidResident(value: unknown): value is PublicResident {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<PublicResident>;
  return (
    typeof r.id === "string" &&
    typeof r.email === "string" &&
    typeof r.firstName === "string"
  );
}

export default function AuthRehydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const isExplicitlyLoggedOut = localStorage.getItem("cai.logged-out") === "true";
    const token = localStorage.getItem("auth-token");
    const stored = localStorage.getItem("auth-user");

    if (isExplicitlyLoggedOut || !token) {
      dispatch(clearUser());
      queryClient.setQueryData(authKeys.currentUser, null);
      return;
    }

    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (isValidResident(parsed)) {
          dispatch(setUser(parsed));
          queryClient.setQueryData(authKeys.currentUser, parsed);
          document.cookie = `auth-token=${token}; path=/; max-age=1209600; SameSite=Lax`;
        }
      } catch {
        // Fall through
      }
    }

    queryClient
      .fetchQuery({ queryKey: authKeys.currentUser, queryFn: getCurrentUser, staleTime: 60_000 })
      .then((resident) => {
        if (resident) {
          localStorage.setItem("auth-user", JSON.stringify(resident));
          dispatch(setUser(resident));
        }
      })
      .catch(() => {
        // 401 is handled globally by axios interceptor
      });
  }, [dispatch, queryClient]);

  return <>{children}</>;
}
