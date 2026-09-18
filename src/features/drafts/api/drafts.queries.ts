import { useQuery } from "@tanstack/react-query";
import { getDraftsForResident, getDraftById } from "./drafts.service";

export function useResidentDraftsQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["drafts", residentId],
    queryFn: () => (residentId ? getDraftsForResident(residentId) : []),
    enabled: !!residentId,
  });
}

export function useDraftDetailQuery(draftId: string | undefined) {
  return useQuery({
    queryKey: ["draft", draftId],
    queryFn: () => (draftId ? getDraftById(draftId) : undefined),
    enabled: !!draftId,
  });
}
