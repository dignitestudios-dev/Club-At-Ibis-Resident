interface RequestDraft {
  id: string;
  residentId: string;
  requestTypeId: string;
  fieldValues: Record<string, FieldValue>;
  uploads: Record<string, UploadedFile[]>;
  stepIndex: number;
  hoaApproved?: boolean;
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
  hoaApproved?: boolean;
}
