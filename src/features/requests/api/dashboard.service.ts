import axiosInstance from "@/lib/axios";

export interface DashboardRequestCard {
  id: string;
  reference: string;
  title: string;
  status: RequestStatus;
  categoryName: string;
  propertyAddress: string | null;
  lotNo: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

function toRequestCard(r: any): DashboardRequestCard {
  return {
    id: r.id,
    reference: r.reference,
    title: r.title,
    status: r.status,
    categoryName: r.category?.name ?? "",
    propertyAddress: r.property?.address ?? null,
    lotNo: r.property?.lotNo ?? null,
    submittedAt: r.submittedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export interface ResidentDashboardResult {
  summary: {
    totalRequests: number;
    pendingReview: number;
    needsYourAction: number;
    approvedActive: number;
  };
  recentRequests: DashboardRequestCard[];
}

/** GET /dashboard — the single source for every Resident dashboard number; no separate fetch-all requests call. */
export async function getResidentDashboard(): Promise<ResidentDashboardResult> {
  const { data } = await axiosInstance.get("/dashboard");
  const d = data.data;
  return {
    summary: {
      totalRequests: d.summary?.totalRequests ?? 0,
      pendingReview: d.summary?.pendingReview ?? 0,
      needsYourAction: d.summary?.needsYourAction ?? 0,
      approvedActive: d.summary?.approvedActive ?? 0,
    },
    recentRequests: (d.recentRequests ?? []).map(toRequestCard),
  };
}
