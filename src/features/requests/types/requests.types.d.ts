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

interface FieldFlag {
  fieldId: string;
  reason: string;
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
  history?: any[];
  comments: CommentEntry[];
  flags?: FieldFlag[];
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

interface ResubmitRequestPayload {
  id: string;
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
}

interface ResidentRequestsResult {
  requests: RequestRecord[];
  pagination?: ApiPagination;
}
