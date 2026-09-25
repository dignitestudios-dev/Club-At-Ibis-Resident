import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveDraft, deleteDraft, deleteDrafts } from "./drafts.service";

export function useSaveDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDraftPayload) => saveDraft(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["drafts", variables.residentId] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["draft", variables.id] });
      }
    },
  });
}

export function useDeleteDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftIds: string | string[]) => deleteDrafts(draftIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export const useDeleteDraftsMutation = useDeleteDraftMutation;

