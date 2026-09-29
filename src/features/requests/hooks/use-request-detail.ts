"use client";

import { useRequestQuery } from "@/features/requests/api/requests.queries";

export function useRequestDetail(id: string) {
  const { data: request, isLoading } = useRequestQuery(id);

  return {
    request,
    isLoading,
  };
}
