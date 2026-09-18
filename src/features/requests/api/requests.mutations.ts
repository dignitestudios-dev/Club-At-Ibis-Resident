import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRequest, resubmitRequest, withdrawRequest } from "./requests.service";

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => createRequest(payload),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["requests", record.residentId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useResubmitRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResubmitRequestPayload) => resubmitRequest(payload),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ["requests", record.residentId] });
      queryClient.invalidateQueries({ queryKey: ["requests", "detail", record.id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useWithdrawRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawRequest(id),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ["requests", record.residentId] });
      queryClient.invalidateQueries({ queryKey: ["requests", "detail", record.id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
