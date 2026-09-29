/** The resident's current submission round number. */
export function currentSubmissionNumber(req: RequestRecord): number {
  if (req.submissions && req.submissions.length > 0) {
    return req.submissions[req.submissions.length - 1].number;
  }
  return Math.max(1, req.history.filter((e) => e.type === "submitted" || e.type === "resubmitted").length);
}

/** Earlier submission rounds the resident has since replaced, newest first. */
export function earlierSubmissions(req: RequestRecord): SubmissionVersionRecord[] {
  const current = currentSubmissionNumber(req);
  return (req.submissions ?? []).filter((s) => s.number < current).sort((a, b) => b.number - a.number);
}

/**
 * What was flagged when a given submission round was reviewed, keyed by
 * fieldId → reason. `submissions[]` never carries per-round item reviews —
 * the "revision-requested" history event is the only place this survives.
 */
export function flaggedItemsForSubmission(req: RequestRecord, submissionNumber: number): Map<string, string> {
  const event = req.history.find(
    (e) => e.type === "revision_requested" && e.submissionNumber === submissionNumber
  );
  return new Map((event?.flaggedItems ?? []).map((item) => [item.fieldId, item.reason]));
}
