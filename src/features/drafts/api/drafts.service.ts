import {
  getResidentRequests,
  getRequestById,
  autosaveDraft,
  createDraftRequest,
} from "@/features/requests/api/requests.service";
import axiosInstance from "@/lib/axios";

function toDraft(r: RequestRecord): RequestDraft {
  return {
    id: r.id,
    residentId: r.residentId,
    requestTypeId: r.categoryId || r.requestTypeId,
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    title: r.categoryName || r.title || "Architectural Request",
    reference: r.reference || r.code,
    code: r.code || r.reference,
    status: r.status,
    propertyAddress: r.propertyAddress || (r.fieldValues?.propertyAddress as string),
    lotNo: r.lotNo || (r.fieldValues?.lotNo as string),
    fieldValues: r.fieldValues,
    uploads: r.uploads,
    stepIndex: r.currentStep ? Math.max(0, r.currentStep - 1) : 0,
    draftRevision: r.draftRevision ?? 0,
    hoaApproved: r.hoaApproved,
    submittedAt: r.submittedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function getDraftsForResident(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RequestDraft[]> {
  const res = await getResidentRequests({
    status: "draft",
    search: params?.search,
    page: params?.page,
    limit: params?.limit,
  });
  return res.requests.map(toDraft);
}

export async function getDraftById(id: string): Promise<RequestDraft | undefined> {
  try {
    const r = await getRequestById(id);
    return toDraft(r);
  } catch {
    return undefined;
  }
}

export async function saveDraft(payload: SaveDraftPayload): Promise<RequestDraft> {
  if (payload.id) {
    const updated = await autosaveDraft(payload.id, {
      expectedDraftRevision: payload.expectedDraftRevision ?? 0,
      currentStep: (payload.stepIndex ?? 0) + 1,
      fieldValues: payload.fieldValues,
    });
    return toDraft(updated);
  }

  const created = await createDraftRequest(
    {
      categoryId: payload.requestTypeId,
      commonFormVersion: 1,
      categoryFormVersion: 1,
    },
    `draft-create-${payload.requestTypeId}-${Date.now()}`
  );
  return toDraft(created);
}

export async function deleteDraft(id: string): Promise<void> {
  await axiosInstance.delete(`/requests/${id}`);
}
