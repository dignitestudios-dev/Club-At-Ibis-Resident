"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";
import { useDeleteDraftMutation } from "@/features/drafts/api/drafts.mutations";
import { useToast } from "@/hooks/use-toast";

export function useDrafts() {
  const user = useCurrentUser();
  const toast = useToast();
  const { data: drafts = [], isLoading } = useResidentDraftsQuery(user?.id);
  const { mutate: deleteDraftMutate, isPending: isDeleting } = useDeleteDraftMutation();

  function deleteDraft(id: string) {
    deleteDraftMutate(id, {
      onSuccess: () => {
        toast.success("Draft discarded.");
      },
      onError: () => {
        toast.error("Failed to delete draft.");
      },
    });
  }

  return {
    drafts,
    isLoading,
    isDeleting,
    deleteDraft,
  };
}
