"use client";

import { useAppDispatch } from "@/store";
import { clearUser } from "@/store/slices/auth.slice";

export function useLogout() {
  const dispatch = useAppDispatch();

  return function logout() {
    localStorage.setItem("cai.logged-out", "true");
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
    dispatch(clearUser());
    window.location.href = "/auth/login";
  };
}
