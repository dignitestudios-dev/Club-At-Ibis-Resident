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

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

interface DropzoneFile {
  id: string;
  name: string;
  size: number;
  file?: File;
  url?: string;
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
  /** The submission round this event applies to. */
  submissionNumber?: number;
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
  hoaApproved?: boolean;
  hoaConfirmed?: boolean;
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
}

interface ResidentRequestsResult {
  requests: RequestRecord[];
  pagination?: ApiPagination;
}
