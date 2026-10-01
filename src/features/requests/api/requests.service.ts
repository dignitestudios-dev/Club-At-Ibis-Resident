import axiosInstance from "@/lib/axios";

function toRequestRecord(raw: any): RequestRecord {
  const code = raw.reference || raw.code || "ARB-PENDING";
  const catId = raw.categoryId || raw.requestTypeId || raw.category?.id || raw.category?._id || "";
  const catName = raw.category?.name || raw.categoryName || "";
  const propAddress = raw.property?.address || raw.propertyAddress || raw.fieldValues?.propertyAddress || "";
  const propLotNo = raw.property?.lotNo || raw.lotNo || raw.fieldValues?.lotNo || "";

  const fieldValues = {
    ...(raw.fieldValues || {}),
  };
  if (propAddress && !fieldValues.propertyAddress) {
    fieldValues.propertyAddress = propAddress;
  }
  if (propLotNo && !fieldValues.lotNo) {
    fieldValues.lotNo = propLotNo;
  }

  const uploads = raw.uploads || raw.files || {};
  const formSnapshot = raw.form?.fields || raw.formSnapshot || [];

  let activity: ActivityEntry[] = [];
  if (Array.isArray(raw.history) && raw.history.length > 0) {
    activity = raw.history.map((h: any) => {
      let actType: ActivityEntry["type"] = "updated";
      const t = String(h.type || "").toLowerCase();
      if (t.includes("submitted")) actType = "submitted";
      else if (t.includes("assigned")) actType = "assigned";
      else if (t.includes("comment")) actType = "comment";
      else if (t.includes("changes_required") || t.includes("change")) actType = "changes_required";
      else if (t.includes("resubmitted")) actType = "resubmitted";
      else if (t.includes("approved")) actType = "approved";
      else if (t.includes("rejected")) actType = "rejected";
      else if (t.includes("completed")) actType = "completed";
      else if (t.includes("withdrawn")) actType = "withdrawn";

      const actorName =
        h.actor?.displayName ||
        (h.actor?.firstName ? `${h.actor.firstName} ${h.actor.lastName || ""}`.trim() : null) ||
        h.actor?.role ||
        "System";

      return {
        id: h.id || h._id || String(Math.random()),
        type: actType,
        actor: actorName,
        message: h.message || "",
        createdAt: h.occurredAt || h.createdAt || new Date().toISOString(),
      };
    });
  } else if (Array.isArray(raw.activity)) {
    activity = raw.activity;
  }

  const history: HistoryEvent[] = Array.isArray(raw.history)
    ? raw.history.map((h: any) => ({
        id: h.id || h._id || crypto.randomUUID(),
        // The backend's event slugs are hyphenated (e.g. "request.review-started"),
        // but HistoryEventType uses underscores ("review_started").
        type: (h.type?.replace(/^request\./, "").replace(/-/g, "_") || "submitted") as HistoryEventType,
        actor: {
          name: h.actor?.displayName || h.actor?.name || "User",
          role: h.actor?.role || "system",
        },
        message: h.message || "",
        createdAt: h.occurredAt || h.createdAt || new Date().toISOString(),
        flaggedItems: Array.isArray(h.details?.flaggedItems) ? h.details.flaggedItems : undefined,
        submissionNumber: typeof h.details?.submissionNumber === "number" ? h.details.submissionNumber : undefined,
      }))
    : [];

  // The decision (approve/reject) lives under `raw.decision`, not at the
  // top level — `raw.rejectionReason`/`raw.decidedAt` don't exist on the
  // real response, so reading them directly always came back undefined.
  const decision: RequestDecisionInfo | null = raw.decision
    ? {
        rejectionReason: raw.decision.rejectionReason ?? null,
        decidedAt: raw.decision.decidedAt ?? null,
        decidedBy: raw.decision.decidedBy
          ? {
              actorId: raw.decision.decidedBy.actorId,
              role: raw.decision.decidedBy.role,
              displayName: raw.decision.decidedBy.displayName || "ARB Reviewer",
            }
          : null,
      }
    : null;

  const submissions: SubmissionVersionRecord[] = Array.isArray(raw.submissions)
    ? raw.submissions.map((s: any) => ({
        id: s.id || s._id || crypto.randomUUID(),
        number: s.number ?? 1,
        submittedAt: s.submittedAt || new Date().toISOString(),
        changedFieldIds: Array.isArray(s.changedFieldIds) ? s.changedFieldIds : [],
        fieldValues: s.fieldValues || {},
        files: s.files || {},
      }))
    : [];

  return {
    id: raw.id || raw._id,
    code,
    reference: code,
    title: catName || raw.title || "Architectural Request",
    requestTypeId: catId,
    categoryId: catId,
    categoryName: catName,
    residentId: raw.residentId || raw.resident?.id || raw.resident?._id || "",
    propertyAddress: propAddress,
    lotNo: propLotNo,
    status: raw.status || "draft",
    draftRevision: raw.draftRevision ?? 0,
    mediaRevision: raw.mediaRevision ?? 0,
    workflowVersion: raw.workflowVersion ?? 0,
    revision: raw.revision
      ? {
          revisionVersion: raw.revision.revisionVersion ?? 0,
          items: Array.isArray(raw.revision.items) ? raw.revision.items : [],
        }
      : null,
    currentStep: raw.currentStep ?? 1,
    commonFormVersion: raw.commonFormVersion ?? 1,
    categoryFormVersion: raw.categoryFormVersion ?? 1,
    formSnapshot,
    form: raw.form ? { fields: raw.form.fields || [] } : undefined,
    fieldValues,
    uploads,
    activity,
    history,
    submissions,
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    submissionReadiness: raw.submissionReadiness,
    hoaApproved: !!(raw.hoaConfirmed ?? raw.hoaApproved),
    hoaConfirmedAt: raw.hoaConfirmedAt || raw.hoaApprovedAt,
    depositRequired: raw.depositRequired,
    depositAmount: raw.depositAmount,
    depositReceived: raw.depositReceived,
    rejectionReason: decision?.rejectionReason ?? raw.rejectionReason,
    feedback: raw.feedback || undefined,
    decision,
    approvalLetterAvailable: raw.approvalLetterAvailable,
    approvalLetter: raw.approvalLetter,
    refundStatus: raw.refundStatus,
    refundDate: raw.refundDate,
    withdrawnAt: raw.withdrawnAt,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    submittedAt: raw.submittedAt,
    decidedAt: decision?.decidedAt ?? raw.decidedAt,
    completedAt: raw.completedAt,
  };
}

/**
 * Create a new draft request on category selection.
 */
export async function createDraftRequest(
  payload: CreateDraftPayload,
  idempotencyKey: string
): Promise<RequestRecord> {
  const cleanBody: Record<string, any> = {
    categoryId: payload.categoryId,
    commonFormVersion: payload.commonFormVersion,
    categoryFormVersion: payload.categoryFormVersion,
  };
  if (payload.title && payload.title.trim()) {
    cleanBody.title = payload.title.trim();
  }

  const { data } = await axiosInstance.post("/requests", cleanBody, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
  return toRequestRecord(data.data.request);
}

/**
 * Autosave an existing draft with optimistic revision lock.
 * Backend PATCH /requests/:id strictly allows only:
 * - expectedDraftRevision (number)
 * - currentStep (number 1-4, optional)
 * - fieldValues (Record<string, string | string[] | null>, optional)
 * - title (string, optional)
 */
export async function autosaveDraft(
  id: string,
  payload: AutosaveDraftPayload
): Promise<RequestRecord> {
  const cleanBody: Record<string, any> = {
    expectedDraftRevision: payload.expectedDraftRevision,
  };

  if (typeof payload.currentStep === "number") {
    cleanBody.currentStep = Math.min(4, Math.max(1, payload.currentStep));
  }

  if (payload.title && payload.title.trim()) {
    cleanBody.title = payload.title.trim();
  }

  if (payload.fieldValues && Object.keys(payload.fieldValues).length > 0) {
    const cleanValues: Record<string, string | string[] | null> = {};
    for (const [k, v] of Object.entries(payload.fieldValues)) {
      if (v === undefined) continue;
      if (v === null) {
        cleanValues[k] = null;
      } else if (Array.isArray(v)) {
        cleanValues[k] = v.map((item) => String(item).trim());
      } else if (typeof v === "object") {
        // Skip file objects or unknown objects in fieldValues
        continue;
      } else {
        cleanValues[k] = String(v);
      }
    }
    if (Object.keys(cleanValues).length > 0) {
      cleanBody.fieldValues = cleanValues;
    }
  }

  const { data } = await axiosInstance.patch(`/requests/${id}`, cleanBody);
  return toRequestRecord(data.data.request);
}

/**
 * Migrate a draft when form versions become stale.
 */
export async function migrateDraftForm(
  id: string,
  expectedDraftRevision: number
): Promise<RequestRecord> {
  const { data } = await axiosInstance.post(`/requests/${id}/migrate-form`, {
    expectedDraftRevision,
  });
  return toRequestRecord(data.data.request);
}

/**
 * Submit a completed draft with HOA approval confirmation.
 * Backend POST /requests/:id/submit strictly requires:
 * - expectedDraftRevision (number)
 * - hoaConfirmed (boolean)
 */
export async function submitRequest(
  id: string,
  payload: SubmitRequestPayload,
  idempotencyKey: string
): Promise<RequestRecord> {
  const cleanBody: Record<string, any> = {
    expectedDraftRevision: payload.expectedDraftRevision,
    hoaConfirmed: payload.hoaConfirmed ?? payload.hoaApproved ?? true,
  };
  if (typeof payload.expectedMediaRevision === "number") {
    cleanBody.expectedMediaRevision = payload.expectedMediaRevision;
  }

  const { data } = await axiosInstance.post(`/requests/${id}/submit`, cleanBody, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
  return toRequestRecord(data.data.request);
}

/**
 * Request permission to upload one file: creates pending file metadata and
 * returns a short-lived write SAS URL for a direct browser -> Azure PUT.
 * Retry with the same clientUploadId while the intent is still pending to
 * get a fresh SAS URL without creating duplicate metadata.
 */
export async function createUploadIntent(
  requestId: string,
  payload: CreateUploadIntentPayload
): Promise<UploadIntentResult> {
  const { data } = await axiosInstance.post(`/requests/${requestId}/files/upload-intents`, payload);
  return data.data;
}

/**
 * Ask the backend to verify the uploaded blob (size/signature/content-type)
 * and mark the file ready. Safe to retry after a successful call.
 */
export async function completeUpload(requestId: string, fileId: string): Promise<CompleteUploadResult> {
  const { data } = await axiosInstance.post(`/requests/${requestId}/files/${fileId}/complete`, {});
  return data.data;
}

/**
 * Remove an unsubmitted (pending/failed/ready) file. Submitted files return
 * SUBMITTED_FILE_IMMUTABLE and must go through the replacesFileId flow instead.
 */
export async function deleteRequestFile(
  requestId: string,
  fileId: string,
  expectedMediaRevision: number
): Promise<{ mediaRevision: number }> {
  const { data } = await axiosInstance.delete(`/requests/${requestId}/files/${fileId}`, {
    data: { expectedMediaRevision },
  });
  return data.data;
}

/** Get a fresh short-lived (10 minute) read-only SAS URL for one file. Never persist it. */
export async function getFileDownloadUrl(requestId: string, fileId: string): Promise<DownloadUrlResult> {
  const { data } = await axiosInstance.get(`/requests/${requestId}/files/${fileId}/download`);
  return data.data.download;
}

/**
 * Get all requests for the resident (drafts, submitted, active, etc.)
 */
export async function getResidentRequests(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ResidentRequestsResult> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status) queryParams.status = params.status;
  if (params?.search && params.search.trim()) queryParams.search = params.search.trim();

  const { data } = await axiosInstance.get("/requests", { params: queryParams });
  const rawList = data?.data?.requests ?? [];
  return {
    requests: rawList.map(toRequestRecord),
    pagination: data?.pagination,
  };
}

/**
 * Fetch a single request or draft by its ID.
 */
export async function getRequestById(id: string): Promise<RequestRecord> {
  const { data } = await axiosInstance.get(`/requests/${id}`);
  return toRequestRecord(data.data.request);
}

/**
 * Compatibility wrapper for legacy requests list callers.
 */
export async function getRequestsForResident(
  _residentId?: string,
  params?: { status?: string; search?: string; page?: number; limit?: number }
): Promise<RequestRecord[]> {
  const res = await getResidentRequests(params);
  return res.requests;
}

/**
 * Legacy compatibility create method.
 */
export async function createRequest(payload: CreateRequestPayload): Promise<RequestRecord> {
  const key = `create-${payload.requestTypeId}-${Date.now()}`;
  return createDraftRequest(
    {
      categoryId: payload.requestTypeId,
      commonFormVersion: 1,
      categoryFormVersion: 1,
    },
    key
  );
}

/**
 * Save edits to reviewer-flagged fields while a request is `changes_required`.
 * Only fields present in `revision.items` may be included — the backend
 * rejects anything else with FIELD_NOT_EDITABLE.
 */
export async function updateRequestRevision(
  id: string,
  payload: UpdateRevisionPayload
): Promise<RequestRecord> {
  const { data } = await axiosInstance.patch(`/requests/${id}/revision`, payload);
  return toRequestRecord(data.data.request);
}

/**
 * Finalize a revision and send it back to the assigned reviewer. Every
 * flagged field must already have a value different from the original
 * submission (enforced server-side as FLAGGED_FIELD_UNCHANGED) — call
 * updateRequestRevision with the corrected values first.
 */
export async function resubmitRequestRevision(
  id: string,
  payload: ResubmitRevisionPayload,
  idempotencyKey: string
): Promise<RequestRecord> {
  const { data } = await axiosInstance.post(`/requests/${id}/resubmit`, payload, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
  return toRequestRecord(data.data.request);
}

export async function withdrawRequest(id: string): Promise<RequestRecord> {
  return getRequestById(id);
}
