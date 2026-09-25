"use client";

import { useCallback, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useResidentDraftsQuery } from "@/features/drafts/api/drafts.queries";
import { useDeleteDraftMutation } from "@/features/drafts/api/drafts.mutations";
import { useToast } from "@/hooks/use-toast";

export function useDrafts(params?: { search?: string; page?: number; limit?: number }) {
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: drafts = [], isLoading } = useResidentDraftsQuery({
    search: params?.search?.trim() || undefined,
    page: params?.page,
    limit: params?.limit,
  });
  const { mutate: deleteDraftMutate, isPending } = useDeleteDraftMutation();

  const deleteDraft = useCallback(
    (id: string, onSettled?: () => void) => {
      setDeletingId(id);
      deleteDraftMutate(id, {
        onSuccess: () => {
          setDeletingId(null);
          toast.success("Draft discarded", "The draft has been permanently deleted.");
          onSettled?.();
        },
        onError: (error: any) => {
          setDeletingId(null);
          toast.error("Failed to discard draft", error?.response?.data?.message || error?.message || "An unexpected error occurred.");
          onSettled?.();
        },
      });
    },
    [deleteDraftMutate, toast]
  );

  const deleteDrafts = useCallback(
    (ids: string[], onSettled?: () => void) => {
      if (!ids.length) return;
      deleteDraftMutate(ids, {
        onSuccess: () => {
          toast.success("Drafts discarded", `${ids.length} draft${ids.length > 1 ? "s have" : " has"} been permanently deleted.`);
          onSettled?.();
        },
        onError: (error: any) => {
          toast.error("Failed to discard drafts", error?.response?.data?.message || error?.message || "An unexpected error occurred.");
          onSettled?.();
        },
      });
    },
    [deleteDraftMutate, toast]
  );

  return {
    drafts,
    isLoading,
    isDeleting: isPending,
    deletingId,
    deleteDraft,
    deleteDrafts,
  };
}
