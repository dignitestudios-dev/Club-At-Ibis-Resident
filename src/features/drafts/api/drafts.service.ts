import { db, delay } from "@/lib/mock/store";

export async function getDraftsForResident(residentId: string): Promise<RequestDraft[]> {
  const all = db.getDrafts().filter((d) => d.residentId === residentId);
  return delay(
    [...all].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    300
  );
}

export async function getDraftById(id: string): Promise<RequestDraft | undefined> {
  const found = db.getDrafts().find((d) => d.id === id);
  return delay(found, 250);
}

export async function saveDraft(payload: SaveDraftPayload): Promise<RequestDraft> {
  const all = db.getDrafts();
  const now = new Date().toISOString();

  if (payload.id) {
    const idx = all.findIndex((d) => d.id === payload.id);
    if (idx !== -1) {
      const updated: RequestDraft = {
        ...all[idx],
        requestTypeId: payload.requestTypeId,
        fieldValues: payload.fieldValues,
        uploads: payload.uploads,
        stepIndex: payload.stepIndex ?? all[idx].stepIndex,
        hoaApproved: payload.hoaApproved ?? all[idx].hoaApproved,
        updatedAt: now,
      };
      const next = [...all];
      next[idx] = updated;
      db.setDrafts(next);
      return delay(updated, 300);
    }
  }

  // Create new draft
  const record: RequestDraft = {
    id: payload.id || `draft-${Date.now()}`,
    residentId: payload.residentId,
    requestTypeId: payload.requestTypeId,
    fieldValues: payload.fieldValues,
    uploads: payload.uploads,
    stepIndex: payload.stepIndex ?? 0,
    hoaApproved: payload.hoaApproved ?? false,
    createdAt: now,
    updatedAt: now,
  };

  db.setDrafts([record, ...all]);
  return delay(record, 350);
}

export async function deleteDraft(id: string): Promise<void> {
  const all = db.getDrafts();
  const filtered = all.filter((d) => d.id !== id);
  db.setDrafts(filtered);
  return delay(undefined, 300);
}
