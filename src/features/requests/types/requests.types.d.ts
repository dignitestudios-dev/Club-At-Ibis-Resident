type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date"
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
  options?: FieldOption[];
  accept?: string;
  multiple?: boolean;
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
  | "withdrawn";

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

interface RequestRecord {
  id: string;
  code: string;
  requestTypeId: string;
  residentId: string;
  status: RequestStatus;
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
  activity: ActivityEntry[];
  comments: CommentEntry[];
  flags?: FieldFlag[];
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
