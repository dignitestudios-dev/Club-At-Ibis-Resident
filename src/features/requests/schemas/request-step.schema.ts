import { z } from "zod";
import { baseProjectInfoFields } from "@/lib/mock/request-types";

export function buildStepSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

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
        schema = field.required
          ? z.string().trim().min(1, `${field.label} is required.`).max(2000, `${field.label} cannot exceed 2000 characters.`)
          : z.string().max(2000, `${field.label} cannot exceed 2000 characters.`).optional().nullable();
        break;
      }
      default: {
        schema = field.required
          ? z.string().trim().min(1, `${field.label} is required.`).max(255, `${field.label} cannot exceed 255 characters.`)
          : z.string().max(255, `${field.label} cannot exceed 255 characters.`).optional().nullable();
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
