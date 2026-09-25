import type { Metadata } from "next";
import { Suspense } from "react";
import RequestWizard from "@/features/requests/components/request-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Edit Request · Club At Ibis Resident Portal",
};

export default async function NewRequestWithIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      <RequestWizard draftIdProp={id} />
    </Suspense>
  );
}
