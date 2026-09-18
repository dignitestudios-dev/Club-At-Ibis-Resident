"use client";

import { useCurrentUserQuery } from "@/features/auth/api/auth.queries";
import { useAppSelector } from "@/store";

export function useCurrentUser() {
  const { data: user } = useCurrentUserQuery();
  const reduxUser = useAppSelector((state) => state.auth.user);

  return user !== undefined ? user : reduxUser;
}
