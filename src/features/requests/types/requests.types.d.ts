type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "select"
  | "checkbox"
  | "radio"
  | "file";

interface FieldOption {
  label: string;
  value: string;
}

interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: (FieldOption | string)[];
  accept?: string | string[];
  multiple?: boolean;
  order?: number;
  source?: "common" | "category";
  maxLength?: number;
  /** Extra input restriction on top of the field type: "alphanumeric" allows letters, digits and hyphens (e.g. 12-A); "digits" allows digits only. */
  inputRule?: "alphanumeric" | "digits";
}

interface RequestType {
  id: string;
  name: string;
  description: string;
  icon: string;
  additionalFields: FieldConfig[];
  documentFields: FieldConfig[];
}

type RequestStatus =
  | "draft"
  | "submitted"
  | "assigned"
  | "under_review"
  | "changes_required"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "completed"
  | "withdrawn"
  | "cancelled";

type FieldValue = string | number | boolean | string[] | null;

type RequestFileStatus = "pending" | "ready" | "failed" | "deleted";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url?: string;
  fieldId?: string;
  logicalFileId?: string;
  version?: number;
  mimeType?: string;
  fileGroup?: string;
  status?: RequestFileStatus;
  failureCode?: string | null;
  replacesFileId?: string | null;
  isCurrent?: boolean;
}

/** Client-side upload-pipeline state for one file row in a `FileDropzone`. */
type DropzoneFileStatus = "idle" | "uploading" | "verifying" | "ready" | "failed";

interface DropzoneFile {
  id: string;
  name: string;
  size: number;
  file?: File;
  url?: string;
  /** Upload-pipeline state; absent/"ready" means an already-submitted file loaded from the server. */
  status?: DropzoneFileStatus;
  failureCode?: string;
  /** The real backend fileId, set once the upload intent is created. */
  fileId?: string;
  version?: number;
  logicalFileId?: string;
  /** Set when this row is replacing a specific reviewer-flagged file (revise wizard). */
  replacesFileId?: string;
}

interface ActivityEntry {
  id: string;
  type:
    | "submitted"
    | "updated"
    | "assigned"
    | "comment"
    | "changes_required"
    | "resubmitted"
    | "approved"
    | "rejected"
    | "completed"
    | "withdrawn"
    | "refund_updated";
  actor: string;
  message: string;
  createdAt: string;
}

interface CommentEntry {
  id: string;
  author: string;
  authorRole: "resident" | "arb";
  message: string;
  createdAt: string;
}

/** A single reviewer-flagged item on a `changes_required` request, as returned by GET /requests/:id under `revision.items`. */
interface RevisionItem {
  kind: string;
  fieldId: string;
  label: string;
  reason: string;
  /**
   * Set when kind === "file". `fileId`/`flaggedFileId` identify the historical
   * (originally reviewed) file and must never be sent as `replacesFileId` —
   * only `currentFile.id` is the live, actionable replacement target. Before
   * any correction is uploaded they're the same file; after a correction,
   * `currentFile` moves to the new version while `fileId`/`flaggedFileId`
   * keep pointing at the original flagged version for audit purposes.
   */
  fileId?: string;
  flaggedFileId?: string;
  logicalFileId?: string;
  currentFile?: {
    id: string;
    version: number;
    name: string;
    status: string;
  };
  replacementStatus?: string;
  /** True once a correction has actually been uploaded for this flagged file — the authoritative "already replaced" signal, independent of local upload-pipeline state. */
  replacementSatisfied?: boolean;
}

/** Only present while `status === "changes_required"`. `revisionVersion` guards PATCH .../revision and POST .../resubmit against concurrent edits. */
interface RequestRevisionInfo {
  revisionVersion: number;
  items: RevisionItem[];
}

/** One resubmission round, as returned by GET /requests/:id under `submissions[]`. */
interface SubmissionVersionRecord {
  id: string;
  number: number;
  submittedAt: string;
  changedFieldIds: string[];
  fieldValues: Record<string, FieldValue>;
  files: Record<string, UploadedFile[]>;
}

type HistoryEventType =
  | "submitted"
  | "assigned"
  | "reassigned"
  | "review_started"
  | "item_accepted"
  | "item_flagged"
  | "revision_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "deposit_required"
  | "receipt_recorded"
  | "letter_uploaded"
  | "completed"
  | "letter_email"
  | "withdrawn"
  | "refunded"
  | "no_refund";

interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  actor: { name: string; role: string };
  message: string;
  createdAt: string;
  /** Set on a "revision-requested" event: the exact fields flagged for that review round, with the reviewer's reason. `submissions[]` never carries per-round item reviews, so this is the only place a past round's flagged items are reconstructable from. */
  flaggedItems?: { fieldId: string; label: string; reason: string }[];
  /** Set on a "revision-requested" event once the reviewer's general feedback field exists on the backend — the overall note for that round, separate from each flagged item's own reason. */
  feedback?: string;
  /** The submission round this event applies to. */
  submissionNumber?: number;
}

/** Who decided (approved/rejected) the request, from GET /requests/:id's `decision` object. */
interface RequestDecisionInfo {
  rejectionReason: string | null;
  decidedAt: string | null;
  decidedBy: { actorId?: string; role?: string; displayName: string } | null;
}

type RefundStatus = "awaiting" | "refunded" | "no_refund";

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SubmissionReadiness {
  ready: boolean;
  issues: string[];
}

interface RequestRecord {
  id: string;
  code: string;
  reference?: string;
  title?: string;
  requestTypeId: string;
  categoryId?: string;
  categoryName?: string;
  residentId: string;
  propertyAddress?: string;
  lotNo?: string;
  status: RequestStatus;
  draftRevision?: number;
  /** Optimistic-concurrency guard for creating/completing/deleting request files. */
  mediaRevision?: number;
  /** Optimistic-concurrency guard for reviewer-assignment/review actions; also required by PATCH .../revision and POST .../resubmit. */
  workflowVersion?: number;
  /** Only present while status is "changes_required". */
  revision?: RequestRevisionInfo | null;
  currentStep?: number;
  commonFormVersion?: number;
  categoryFormVersion?: number;
  formSnapshot?: FieldConfig[];
  form?: {
    fields: FieldConfig[];
  };
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
  activity: ActivityEntry[];
  history: HistoryEvent[];
  submissions?: SubmissionVersionRecord[];
  comments: CommentEntry[];
  submissionReadiness?: SubmissionReadiness;
  hoaApproved: boolean;
  hoaConfirmedAt?: string;
  depositRequired?: boolean;
  depositAmount?: number;
  depositReceived?: boolean;
  rejectionReason?: string;
  feedback?: string;
  /** The full `decision` object from GET /requests/:id — who decided and when, beyond just the reason text. */
  decision?: RequestDecisionInfo | null;
  approvalLetterAvailable?: boolean;
  approvalLetter?: UploadedFile;
  refundStatus?: RefundStatus;
  refundDate?: string;
  withdrawnAt?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  decidedAt?: string;
  completedAt?: string;
}

interface CreateDraftPayload {
  categoryId: string;
  title?: string;
  commonFormVersion: number;
  categoryFormVersion: number;
}

interface AutosaveDraftPayload {
  expectedDraftRevision: number;
  fieldValues?: Record<string, FieldValue>;
  uploads?: Record<string, UploadedFile[]>;
  currentStep?: number;
  title?: string;
  hoaApproved?: boolean;
}

interface SubmitRequestPayload {
  expectedDraftRevision: number;
  expectedMediaRevision?: number;
  hoaApproved?: boolean;
  hoaConfirmed?: boolean;
}

interface CreateUploadIntentPayload {
  fieldId: string;
  clientUploadId: string;
  originalName: string;
  size: number;
  declaredMimeType: string;
  expectedMediaRevision: number;
  replacesFileId?: string;
}

interface UploadIntentResult {
  file: UploadedFile;
  mediaRevision: number;
  upload: {
    method: string;
    url: string;
    expiresAt: string;
    requiredHeaders: Record<string, string>;
  };
}

interface CompleteUploadResult {
  file: UploadedFile;
  mediaRevision: number;
}

interface DownloadUrlResult {
  url: string;
  expiresAt: string;
}

interface MigrateDraftPayload {
  expectedDraftRevision: number;
}

interface CreateRequestPayload {
  residentId: string;
  requestTypeId: string;
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
  hoaApproved: boolean;
}

/** PATCH /requests/:id/revision — saves edits to flagged fields only; the request stays in `changes_required`. */
interface UpdateRevisionPayload {
  expectedWorkflowVersion: number;
  expectedRevisionVersion: number;
  fieldValues: Record<string, FieldValue>;
}

/** POST /requests/:id/resubmit — finalizes the revision; every flagged field must already differ from the original submission. */
interface ResubmitRevisionPayload {
  expectedWorkflowVersion: number;
  expectedRevisionVersion: number;
  expectedMediaRevision?: number;
}

interface ResidentRequestsResult {
  requests: RequestRecord[];
  pagination?: ApiPagination;
}
