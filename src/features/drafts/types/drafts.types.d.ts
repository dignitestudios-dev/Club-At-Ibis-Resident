interface RequestDraft {
  id: string;
  residentId: string;
  requestTypeId: string;
  categoryId?: string;
  categoryName?: string;
  title?: string;
  reference?: string;
  code?: string;
  status?: RequestStatus;
  propertyAddress?: string;
  lotNo?: string;
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
  stepIndex: number;
  draftRevision?: number;
  hoaApproved?: boolean;
  commonFormVersion?: number;
  categoryFormVersion?: number;
  form?: {
    fields: FieldConfig[];
  };
  formSnapshot?: FieldConfig[];
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SaveDraftPayload {
  id?: string;
  residentId: string;
  requestTypeId: string;
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
  stepIndex?: number;
  expectedDraftRevision?: number;
  hoaApproved?: boolean;
}
