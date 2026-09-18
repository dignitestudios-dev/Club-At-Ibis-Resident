"use client";

import { useState } from "react";
import { useRequestQuery } from "@/features/requests/api/requests.queries";
import { getRequestTypeById } from "@/lib/mock/request-types";

export function useRequestDetail(id: string) {
  const { data: request, isLoading } = useRequestQuery(id);
  const [revising, setRevising] = useState(false);

  const requestType = request ? getRequestTypeById(request.requestTypeId) : undefined;

  return {
    request,
    requestType,
    isLoading,
    revising,
    startRevising: () => setRevising(true),
    stopRevising: () => setRevising(false),
  };
}
