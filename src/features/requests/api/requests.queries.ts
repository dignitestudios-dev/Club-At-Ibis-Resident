import { useQuery } from "@tanstack/react-query";
import { getRequestById, getRequestsForResident } from "./requests.service";

export function useRequestsQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["requests", residentId],
    queryFn: () => getRequestsForResident(residentId as string),
    enabled: !!residentId,
  });
}

export function useRequestQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["requests", "detail", id],
    queryFn: () => getRequestById(id as string),
    enabled: !!id,
  });
}
