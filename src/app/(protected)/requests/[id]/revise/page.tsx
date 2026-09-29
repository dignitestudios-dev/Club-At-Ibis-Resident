import type { Metadata } from "next";
import RequestRevisePage from "@/features/requests/components/request-revise-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Revise Request ${id ? `#${id.slice(0, 8)}` : ""} · Club At Ibis Resident Portal`,
  };
}

export default async function RequestRevisePageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestRevisePage id={id} />;
}
