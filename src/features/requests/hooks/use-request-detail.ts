"use client";

import { useState } from "react";
import { useRequestQuery } from "@/features/requests/api/requests.queries";

export function useRequestDetail(id: string) {
  const { data: request, isLoading } = useRequestQuery(id);
  const [revising, setRevising] = useState(false);

  return {
    request,
    isLoading,
    revising,
    startRevising: () => setRevising(true),
    stopRevising: () => setRevising(false),
  };
}
