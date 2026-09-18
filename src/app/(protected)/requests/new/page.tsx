import { Suspense } from "react";
import RequestWizard from "@/features/requests/components/request-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
      }
    >
      <RequestWizard />
    </Suspense>
  );
}
