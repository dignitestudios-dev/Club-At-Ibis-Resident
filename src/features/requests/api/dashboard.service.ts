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
  /** Flat deposit / refund fields, used to flag withdrawn requests with a refund outcome. */
  depositRequired?: boolean | null;
  depositStatus?: string | null;
  refundOutcome?: string | null;
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
    depositRequired: r.depositRequired ?? null,
    depositStatus: r.depositStatus ?? null,
    refundOutcome: r.refundOutcome ?? null,
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

/** How many requests the dashboard's "Recent Requests" section shows. */
export const RECENT_REQUESTS_LIMIT = 6;

/**
 * GET /dashboard gives every dashboard number (and its own, shorter recent list). The recent list is topped up from
 * GET /requests, which sorts the same way (latest update first), so the section always shows the latest six.
 */
export async function getResidentDashboard(): Promise<ResidentDashboardResult> {
  const { data } = await axiosInstance.get("/dashboard");
  const d = data.data;
  let recent: any[] = d.recentRequests ?? [];
  if (recent.length < RECENT_REQUESTS_LIMIT) {
    try {
      const list = await axiosInstance.get("/requests", { params: { page: 1, limit: RECENT_REQUESTS_LIMIT } });
      const rows = list.data?.data?.requests;
      if (Array.isArray(rows) && rows.length > recent.length) recent = rows;
    } catch {
      // Keep the dashboard's own list if the top-up fails.
    }
  }
  return {
    summary: {
      totalRequests: d.summary?.totalRequests ?? 0,
      pendingReview: d.summary?.pendingReview ?? 0,
      needsYourAction: d.summary?.needsYourAction ?? 0,
      approvedActive: d.summary?.approvedActive ?? 0,
    },
    recentRequests: recent.slice(0, RECENT_REQUESTS_LIMIT).map(toRequestCard),
  };
}
