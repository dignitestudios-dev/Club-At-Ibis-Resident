import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDraftRequest,
  autosaveDraft,
  migrateDraftForm,
  submitRequest,
  createRequest,
  resubmitRequest,
  withdrawRequest,
} from "./requests.service";
import { toDraft } from "@/features/drafts/api/drafts.service";

export function useCreateDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateDraftPayload; idempotencyKey: string }) =>
      createDraftRequest(payload, idempotencyKey),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.setQueryData(["drafts", "detail", record.id], toDraft(record));
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
}

export function useAutosaveDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AutosaveDraftPayload }) =>
      autosaveDraft(id, payload),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.setQueryData(["drafts", "detail", record.id], toDraft(record));
    },
  });
}

export function useMigrateDraftFormMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, expectedDraftRevision }: { id: string; expectedDraftRevision: number }) =>
      migrateDraftForm(id, expectedDraftRevision),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.setQueryData(["drafts", "detail", record.id], toDraft(record));
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useSubmitRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      idempotencyKey,
    }: {
      id: string;
      payload: SubmitRequestPayload;
      idempotencyKey: string;
    }) => submitRequest(id, payload, idempotencyKey),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => createRequest(payload),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useResubmitRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResubmitRequestPayload) => resubmitRequest(payload),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useWithdrawRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawRequest(id),
    onSuccess: (record) => {
      queryClient.setQueryData(["requests", "detail", record.id], record);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
