export const DOCUMENT_ACCEPT = ".png,.jpg,.jpeg,.pdf,.docx";

export const baseProjectInfoFields: FieldConfig[] = [
  {
    id: "propertyAddress",
    label: "Property Address",
    type: "text",
    required: true,
    placeholder: "Enter the property address (e.g. 142 Egret Landing Way)",
    helpText: "Enter the property address (e.g. 142 Egret Landing Way)",
    maxLength: 200,
  },
  {
    id: "lotNo",
    label: "Lot No.",
    type: "text",
    required: true,
    placeholder: "Enter lot or unit number (e.g. 12-A or 45B)",
    helpText: "Enter lot or unit number (e.g. 12-A or 45B)",
    maxLength: 30,
    inputRule: "alphanumeric",
  },
  {
    id: "projectDescription",
    label: "Project Description",
    type: "textarea",
    required: true,
    placeholder: "Briefly describe the proposed project, materials, and scope of work",
    helpText: "Briefly describe the proposed project, materials, and scope of work",
    maxLength: 2000,
  },
  {
    id: "contractorName",
    label: "Contractor Name",
    type: "text",
    required: true,
    placeholder: "Enter contractor or company name (e.g. Acme Construction)",
    helpText: "Enter contractor or company name (e.g. Acme Construction)",
    maxLength: 100,
  },
  {
    id: "contractorNumber",
    label: "Contractor Number",
    type: "text",
    required: true,
    placeholder: "Only numbers allowed, up to 11 digits including country code (e.g. 15551234567)",
    helpText: "Only numbers allowed, up to 11 digits including country code (e.g. 15551234567)",
    maxLength: 11,
    inputRule: "digits",
  },
  {
    id: "additionalDetails",
    label: "Additional Details",
    type: "textarea",
    required: false,
    placeholder: "Any additional details or notes (optional)",
    helpText: "Any additional details or notes (optional)",
    maxLength: 2000,
  },
];


/**
 * Default validation for the common (Project Information) fields. The field
 * list itself comes from GET /categories/{id}/form, but its `required` flags
 * and lack of length/format limits aren't what the resident form must
 * enforce, so these rules are layered on top by field id.
 */
const COMMON_FIELD_RULES: Record<string, Partial<FieldConfig>> = {
  propertyAddress: { required: true, maxLength: 200 },
  lotNo: { required: true, maxLength: 30, inputRule: "alphanumeric" },
  projectDescription: { required: true, maxLength: 2000 },
  contractorName: { required: true, maxLength: 100 },
  contractorNumber: { required: true, maxLength: 11, inputRule: "digits" },
  additionalDetails: { required: false, maxLength: 2000 },
};

export function applyCommonFieldRules<T extends FieldConfig>(field: T): T {
  const rule = COMMON_FIELD_RULES[field.id];
  return rule ? { ...field, ...rule } : field;
}
