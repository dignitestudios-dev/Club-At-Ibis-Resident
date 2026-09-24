"use client";

import { useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";
import { useDeleteDraftMutation } from "@/features/drafts/api/drafts.mutations";
import { useToast } from "@/hooks/use-toast";

export function useDrafts(params?: { search?: string; page?: number; limit?: number }) {
  const toast = useToast();
  const { data: drafts = [], isLoading } = useResidentDraftsQuery({
    search: params?.search?.trim() || undefined,
    page: params?.page,
    limit: params?.limit,
  });
  const { mutate: deleteDraftMutate, isPending: isDeleting } = useDeleteDraftMutation();

  const deleteDraft = useCallback(
    (id: string) => {
      deleteDraftMutate(id, {
        onSuccess: () => {
          toast.success("Draft discarded.");
        },
        onError: () => {
          toast.error("Failed to delete draft.");
        },
      });
    },
    [deleteDraftMutate, toast]
  );

  return {
    drafts,
    isLoading,
    isDeleting,
    deleteDraft,
  };
}
