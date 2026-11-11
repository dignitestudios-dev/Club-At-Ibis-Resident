"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import { startQueryPersistence } from "@/lib/query-persist";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  // Restore data loaded earlier (shown offline) and keep saving it. Done in an effect so the first
  // client render matches the server render.
  useEffect(() => startQueryPersistence(queryClient), [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
