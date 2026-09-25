import { z } from "zod";
import { baseProjectInfoFields } from "@/lib/mock/request-types";

/**
 * Formats a phone string into standard US phone format: (XXX) XXX-XXXX
 */
export function formatUsPhone(value: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Checks if a string is a valid 10-digit US phone number (or 11 digits starting with 1).
 */
export function isValidUsPhone(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

/**
 * Checks if a string is a valid calendar date in YYYY-MM-DD format.
 */
export function isValidDate(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === trimmed;
}

/**
 * Checks if a string is a valid time in HH:MM format (24-hour).
 */
export function isValidTime(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

/**
 * Checks if a value is a valid finite number.
 */
export function isValidNumber(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "number") return !isNaN(value) && isFinite(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    const num = Number(trimmed);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

export function buildStepSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .max(255, `${field.label} cannot exceed 255 characters.`)
              .refine((val) => emailRegex.test(val), {
                message: `${field.label} must be a valid email address.`,
              })
          : z
              .string()
              .trim()
              .max(255, `${field.label} cannot exceed 255 characters.`)
              .refine((val) => !val || emailRegex.test(val), {
                message: `${field.label} must be a valid email address.`,
              })
              .or(z.literal(""))
              .optional()
              .nullable();
        break;
      }

      case "phone": {
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .refine(
                (val) => isValidUsPhone(val) && val.replace(/\D/g, "").length >= 10,
                { message: `${field.label} must be a valid 10-digit phone number (e.g. (555) 123-4567).` }
              )
          : z
              .string()
              .trim()
              .refine(
                (val) => isValidUsPhone(val),
                { message: `${field.label} must be a valid 10-digit phone number (e.g. (555) 123-4567).` }
              )
              .or(z.literal(""))
              .optional()
              .nullable();
        break;
      }

      case "date": {
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .refine(isValidDate, {
                message: `${field.label} must be a valid calendar date (YYYY-MM-DD).`,
              })
          : z
              .string()
              .trim()
              .refine(isValidDate, {
                message: `${field.label} must be a valid calendar date (YYYY-MM-DD).`,
              })
              .or(z.literal(""))
              .optional()
              .nullable();
        break;
      }

      case "time": {
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .refine(isValidTime, {
                message: `${field.label} must be a valid time (HH:MM).`,
              })
          : z
              .string()
              .trim()
              .refine(isValidTime, {
                message: `${field.label} must be a valid time (HH:MM).`,
              })
              .or(z.literal(""))
              .optional()
              .nullable();
        break;
      }

      case "number": {
        schema = field.required
          ? z
              .union([z.number(), z.string().trim()])
              .refine(
                (val) => {
                  if (typeof val === "number") return !isNaN(val) && isFinite(val);
                  return String(val).trim() !== "" && !isNaN(Number(val)) && isFinite(Number(val));
                },
                { message: `${field.label} must be a valid number.` }
              )
          : z
              .union([z.number(), z.string().trim(), z.null(), z.undefined()])
              .refine(
                (val) => isValidNumber(val),
                { message: `${field.label} must be a valid number.` }
              )
              .optional()
              .nullable();
        break;
      }

      case "checkbox": {
        const base = z.array(z.string());
        schema = field.required
          ? base.min(1, `Select at least one option for ${field.label}.`)
          : base.optional().default([]);
        break;
      }

      case "select":
      case "radio": {
        schema = field.required
          ? z.string().trim().min(1, `Please select an option for ${field.label}.`)
          : z.string().optional().nullable();
        break;
      }

      case "file": {
        const base = z.array(z.any());
        schema = field.required
          ? base.min(1, `${field.label} is required. Please upload at least one file.`)
          : base.optional().default([]);
        break;
      }

      case "textarea": {
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .max(5000, `${field.label} cannot exceed 5000 characters.`)
          : z
              .string()
              .max(5000, `${field.label} cannot exceed 5000 characters.`)
              .optional()
              .nullable();
        break;
      }

      default: {
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .max(255, `${field.label} cannot exceed 255 characters.`)
          : z
              .string()
              .max(255, `${field.label} cannot exceed 255 characters.`)
              .optional()
              .nullable();
        break;
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
