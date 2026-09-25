import { z } from "zod";
import { baseProjectInfoFields } from "@/lib/mock/request-types";

export function buildStepSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    // Standard base project info field rules
    if (field.id === "propertyAddress") {
      schema = z
        .string()
        .trim()
        .min(1, "Property address is required.")
        .max(200, "Property address must not exceed 200 characters.");
    } else if (field.id === "lotNo") {
      schema = z
        .string()
        .trim()
        .min(1, "Lot number is required.")
        .max(30, "Lot number must not exceed 30 characters.")
        .regex(
          /^[A-Za-z0-9-]+$/,
          "Lot number can only contain letters, numbers, and hyphens (e.g. 12-A, 45B)."
        );
    } else if (field.id === "projectDescription") {
      schema = z
        .string()
        .trim()
        .min(1, "Project description is required.")
        .max(2000, "Project description must not exceed 2,000 characters.");
    } else if (field.id === "contractorName") {
      schema = z
        .string()
        .trim()
        .min(1, "Contractor name is required.")
        .max(100, "Contractor name must not exceed 100 characters.");
    } else if (field.id === "contractorNumber") {
      schema = z
        .string()
        .trim()
        .min(1, "Contractor number is required.")
        .max(11, "Contractor number must not exceed 11 digits.")
        .regex(/^\d+$/, "Contractor number must only contain numbers.");
    } else if (field.id === "additionalDetails") {
      schema = z
        .string()
        .max(2000, "Additional details must not exceed 2,000 characters.")
        .optional()
        .nullable()
        .or(z.literal(""));
    } else {
      switch (field.type) {
        case "number": {
          const base = z.coerce.number({
            message: `${field.label} must be a number.`,
          });
          schema = field.required
            ? base.min(0, `${field.label} is required.`)
            : z.union([base, z.literal(""), z.null(), z.undefined()]).optional();
          break;
        }
        case "checkbox": {
          const base = z.array(z.string());
          schema = field.required
            ? base.min(1, `Select at least one option for ${field.label}.`)
            : base.optional().default([]);
          break;
        }
        case "file": {
          const base = z.array(z.any());
          schema = field.required
            ? base.min(1, `${field.label} is required.`)
            : base.optional().default([]);
          break;
        }
        case "date": {
          schema = field.required
            ? z.string().trim().min(1, `${field.label} is required.`)
            : z.string().optional().nullable();
          break;
        }
        case "textarea": {
          const maxLen = field.maxLength ?? 2000;
          schema = field.required
            ? z
                .string()
                .trim()
                .min(1, `${field.label} is required.`)
                .max(maxLen, `${field.label} cannot exceed ${maxLen} characters.`)
            : z
                .string()
                .max(maxLen, `${field.label} cannot exceed ${maxLen} characters.`)
                .optional()
                .nullable()
                .or(z.literal(""));
          break;
        }
        default: {
          const maxLen = field.maxLength ?? 255;
          schema = field.required
            ? z
                .string()
                .trim()
                .min(1, `${field.label} is required.`)
                .max(maxLen, `${field.label} cannot exceed ${maxLen} characters.`)
            : z
                .string()
                .max(maxLen, `${field.label} cannot exceed ${maxLen} characters.`)
                .optional()
                .nullable()
                .or(z.literal(""));
        }
      }
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}

export function buildCategoryFormSchema(fields: FieldConfig[]) {
  const dataShape = buildStepSchema(fields).shape;
  return z.object({
    ...dataShape,
    hoaApproved: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must confirm HOA approval before submitting.",
      }),
  });
}

export function getAllFieldsForRequestType(requestType: RequestType): FieldConfig[] {
  return [
    ...baseProjectInfoFields,
    ...(requestType.additionalFields ?? []),
    ...(requestType.documentFields ?? []),
  ];
}

export function buildRequestTypeSchema(requestType: RequestType) {
  const allFields = getAllFieldsForRequestType(requestType);
  return buildCategoryFormSchema(allFields);
}

export function defaultValuesForFields(
  fields: FieldConfig[]
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "checkbox" || field.type === "file") {
      defaults[field.id] = [];
    } else {
      defaults[field.id] = "";
    }
  }
  defaults.hoaApproved = false;
  return defaults;
}
