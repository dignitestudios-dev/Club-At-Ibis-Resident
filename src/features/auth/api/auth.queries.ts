import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, inspectEmailVerification } from "./auth.service";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: ["auth", "currentUser"] as const,
  emailVerification: (token: string) => ["auth", "emailVerification", token] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
    staleTime: 60 * 1000,
  });
}

export function useInspectEmailVerificationQuery(token: string) {
  return useQuery({
    queryKey: authKeys.emailVerification(token),
    queryFn: () => inspectEmailVerification(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
  });
}
