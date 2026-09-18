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
          : base.optional().nullable();
        break;
      }
      case "checkbox": {
        const base = z.array(z.string());
        schema = field.required
          ? base.min(1, `Select at least one option for ${field.label}.`)
          : base.optional();
        break;
      }
      case "file": {
        const base = z.array(z.any());
        schema = field.required
          ? base.min(1, `${field.label} is required.`)
          : base.optional();
        break;
      }
      default: {
        const base = z.string();
        schema = field.required
          ? base.min(1, `${field.label} is required.`)
          : base.optional();
      }
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}

export function getAllFieldsForRequestType(requestType: RequestType): FieldConfig[] {
  return [...baseProjectInfoFields, ...requestType.additionalFields, ...requestType.documentFields];
}

export function buildRequestTypeSchema(requestType: RequestType) {
  const allFields = getAllFieldsForRequestType(requestType);
  const dataShape = buildStepSchema(allFields).shape;
  return z.object({
    ...dataShape,
    hoaApproved: z
      .boolean()
      .refine((v) => v === true, { message: "You must confirm HOA approval before submitting." }),
  });
}

export function defaultValuesForFields(fields: FieldConfig[]): Record<string, unknown> {
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
