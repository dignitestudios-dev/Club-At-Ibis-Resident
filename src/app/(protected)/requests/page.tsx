import { Suspense } from "react";
import RequestsListPage from "@/features/requests/components/requests-list-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-14 w-48 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      }
    >
      <RequestsListPage />
    </Suspense>
  );
}
