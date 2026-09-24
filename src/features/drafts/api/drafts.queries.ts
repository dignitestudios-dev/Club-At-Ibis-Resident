import { useQuery } from "@tanstack/react-query";
import { getDraftsForResident, getDraftById } from "./drafts.service";

export function useResidentDraftsQuery(
  params?: {
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["drafts", params?.search ?? "", params?.page ?? 1, params?.limit ?? 50],
    queryFn: () => getDraftsForResident(params),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useDraftDetailQuery(draftId: string | undefined) {
  return useQuery({
    queryKey: ["drafts", "detail", draftId],
    queryFn: () => (draftId ? getDraftById(draftId) : undefined),
    enabled: !!draftId,
    staleTime: 30_000,
  });
}
