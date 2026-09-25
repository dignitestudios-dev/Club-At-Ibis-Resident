import { useQuery } from "@tanstack/react-query";
import { getRequestById, getResidentRequests, getRequestsForResident } from "./requests.service";

export function useResidentRequestsQuery(
  params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["requests", "list", params?.status ?? "all", params?.search ?? "", params?.page ?? 1, params?.limit ?? 50],
    queryFn: () => getResidentRequests(params),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useRequestsQuery(
  residentId?: string | undefined,
  params?: { status?: string; search?: string; page?: number; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["requests", residentId ?? "me", params?.status ?? "all", params?.search ?? "", params?.page ?? 1, params?.limit ?? 50],
    queryFn: () => getRequestsForResident(residentId, params),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useRequestQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["requests", "detail", id],
    queryFn: () => getRequestById(id as string),
    enabled: !!id,
    staleTime: 30_000,
  });
}
