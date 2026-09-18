import { db, delay } from "@/lib/mock/store";
import { requestTypes } from "@/lib/mock/request-types";

function nextCode(existing: RequestRecord[]): string {
  const year = new Date().getFullYear();
  const seq = existing.length + 1001;
  return `ARB-${year}-${seq}`;
}

function pushNotification(notification: Omit<NotificationRecord, "id" | "createdAt" | "read">) {
  const all = db.getNotifications();
  db.setNotifications([
    {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    },
    ...all,
  ]);
}

export async function getRequestsForResident(residentId: string): Promise<RequestRecord[]> {
  const all = db.getRequests().filter((r) => r.residentId === residentId);
  return delay(
    [...all].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    400
  );
}

export async function getRequestById(id: string): Promise<RequestRecord | undefined> {
  const found = db.getRequests().find((r) => r.id === id);
  return delay(found, 300);
}

export async function createRequest(payload: CreateRequestPayload): Promise<RequestRecord> {
  const all = db.getRequests();
  const requestType = requestTypes.find((t) => t.id === payload.requestTypeId);
  const now = new Date().toISOString();
  const record: RequestRecord = {
    id: crypto.randomUUID(),
    code: nextCode(all),
    requestTypeId: payload.requestTypeId,
    residentId: payload.residentId,
    status: "submitted",
    fieldValues: payload.fieldValues,
    uploads: payload.uploads,
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "You",
        message: `Request submitted for ${requestType?.name ?? "review"}.`,
        createdAt: now,
      },
    ],
    comments: [],
    hoaApproved: payload.hoaApproved,
    hoaConfirmedAt: now,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
  };
  db.setRequests([record, ...all]);
  return delay(record, 700);
}

export async function resubmitRequest(payload: ResubmitRequestPayload): Promise<RequestRecord> {
  const all = db.getRequests();
  const idx = all.findIndex((r) => r.id === payload.id);
  if (idx === -1) throw new Error("Request not found.");
  const now = new Date().toISOString();
  const requestType = requestTypes.find((t) => t.id === all[idx].requestTypeId);
  const updated: RequestRecord = {
    ...all[idx],
    fieldValues: { ...all[idx].fieldValues, ...payload.fieldValues },
    uploads: { ...all[idx].uploads, ...payload.uploads },
    status: "resubmitted",
    flags: undefined,
    updatedAt: now,
    activity: [
      ...all[idx].activity,
      {
        id: crypto.randomUUID(),
        type: "resubmitted",
        actor: "You",
        message: "Revised request resubmitted for ARB review.",
        createdAt: now,
      },
    ],
  };
  const next = [...all];
  next[idx] = updated;
  db.setRequests(next);
  pushNotification({
    residentId: updated.residentId,
    requestId: updated.id,
    type: "resubmitted",
    title: "Request resubmitted",
    message: `Your revised ${requestType?.name ?? "request"} (${updated.code}) was resubmitted successfully.`,
  });
  return delay(updated, 600);
}

export async function withdrawRequest(id: string): Promise<RequestRecord> {
  const all = db.getRequests();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Request not found.");
  const now = new Date().toISOString();
  const requestType = requestTypes.find((t) => t.id === all[idx].requestTypeId);
  const updated: RequestRecord = {
    ...all[idx],
    status: "withdrawn",
    withdrawnAt: now,
    updatedAt: now,
    refundStatus: all[idx].depositReceived ? "awaiting" : all[idx].refundStatus,
    activity: [
      ...all[idx].activity,
      {
        id: crypto.randomUUID(),
        type: "withdrawn",
        actor: "ARB Reviewer",
        message: "Request withdrawn by ARB Reviewer. Further processing has stopped.",
        createdAt: now,
      },
    ],
  };
  const next = [...all];
  next[idx] = updated;
  db.setRequests(next);
  pushNotification({
    residentId: updated.residentId,
    requestId: updated.id,
    type: "withdrawn",
    title: "Request withdrawn",
    message: `Your ${requestType?.name ?? "request"} (${updated.code}) has been withdrawn.`,
  });
  return delay(updated, 500);
}
