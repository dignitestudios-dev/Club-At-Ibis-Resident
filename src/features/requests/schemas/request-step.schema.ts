import { z } from "zod";
import { baseProjectInfoFields } from "@/features/requests/config/common-form-fields";

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
 * Checks if a value is a valid non-negative finite number within max digit limit (15 digits).
 */
export function isValidNumber(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  let num: number;
  let strVal = "";
  if (typeof value === "number") {
    num = value;
    strVal = String(value);
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    num = Number(trimmed);
    strVal = trimmed;
  } else {
    return false;
  }
  if (isNaN(num) || !isFinite(num)) return false;
  if (num < 0) return false;
  const digitsOnly = strVal.replace(/\D/g, "");
  if (digitsOnly.length > 15) return false;
  return true;
}

export function buildStepSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;
    const optionValues = (field.options || []).map((o) =>
      typeof o === "string" ? o : o.value
    );

    switch (field.type) {
      case "email": {
        // Same rules as the resident sign-up email: trimmed, lower-cased,
        // at most 100 characters, and a valid address (zod .email()).
        const emailBase = z
          .string()
          .trim()
          .toLowerCase()
          .max(100, `${field.label} must not exceed 100 characters.`);
        schema = field.required
          ? emailBase
              .min(1, `${field.label} is required.`)
              .email(`Enter a valid email address.`)
          : emailBase
              .refine((val) => !val || z.string().email().safeParse(val).success, {
                message: "Enter a valid email address.",
              })
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
              .max(255, `${field.label} cannot exceed 255 characters.`)
              .refine(
                (val) => isValidUsPhone(val) && val.replace(/\D/g, "").length >= 10,
                { message: `${field.label} must be a valid 10-digit phone number (e.g. (555) 123-4567).` }
              )
          : z
              .string()
              .trim()
              .max(255, `${field.label} cannot exceed 255 characters.`)
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
                  if (val === "" || val === undefined || val === null) return false;
                  const str = String(val).trim();
                  return str !== "";
                },
                { message: `${field.label} is required.` }
              )
              .refine(
                (val) => {
                  const num = Number(val);
                  return !isNaN(num) && isFinite(num) && num >= 0;
                },
                { message: `${field.label} must be a positive number.` }
              )
              .refine(
                (val) => {
                  const str = String(val).trim();
                  const digitsOnly = str.replace(/\D/g, "");
                  return digitsOnly.length <= 15;
                },
                { message: `${field.label} cannot exceed 15 digits.` }
              )
          : z
              .union([z.number(), z.string().trim(), z.null(), z.undefined()])
              .refine(
                (val) => {
                  if (val === undefined || val === null || val === "") return true;
                  const num = Number(val);
                  return !isNaN(num) && isFinite(num) && num >= 0;
                },
                { message: `${field.label} must be a positive number.` }
              )
              .refine(
                (val) => {
                  if (val === undefined || val === null || val === "") return true;
                  const str = String(val).trim();
                  const digitsOnly = str.replace(/\D/g, "");
                  return digitsOnly.length <= 15;
                },
                { message: `${field.label} cannot exceed 15 digits.` }
              )
              .optional()
              .nullable();
        break;
      }

      case "checkbox": {
        let base = z.array(z.string());
        if (optionValues.length > 0) {
          base = base
            .refine((items) => new Set(items).size === items.length, {
              message: `${field.label} contains duplicate selections.`,
            })
            .refine((items) => items.every((i) => optionValues.includes(i)), {
              message: `${field.label} contains an invalid option.`,
            });
        }
        schema = field.required
          ? base.min(1, `Select at least one option for ${field.label}.`)
          : base.optional().default([]);
        break;
      }

      case "select":
      case "radio": {
        if (field.required) {
          schema = z
            .string()
            .trim()
            .min(1, `Please select an option for ${field.label}.`)
            .refine(
              (val) => optionValues.length === 0 || optionValues.includes(val),
              { message: `${field.label} contains an invalid option.` }
            );
        } else {
          schema = z
            .string()
            .trim()
            .refine(
              (val) => !val || optionValues.length === 0 || optionValues.includes(val),
              { message: `${field.label} contains an invalid option.` }
            )
            .or(z.literal(""))
            .optional()
            .nullable();
        }
        break;
      }

      case "file": {
        let base = z.array(z.any());
        if (!field.multiple) {
          base = base.max(1, `${field.label} allows only one file.`);
        }
        schema = field.required
          ? base.min(1, `${field.label} is required. Please upload at least one file.`)
          : base.optional().default([]);
        break;
      }

      case "textarea": {
        const max = field.maxLength ?? 2000;
        schema = field.required
          ? z
              .string()
              .trim()
              .min(1, `${field.label} is required.`)
              .max(max, `${field.label} cannot exceed ${max.toLocaleString()} characters.`)
          : z
              .string()
              .max(max, `${field.label} cannot exceed ${max.toLocaleString()} characters.`)
              .optional()
              .nullable();
        break;
      }

      default: {
        const max = field.maxLength ?? 255;
        const tooLong = `${field.label} cannot exceed ${max} characters.`;
        const rule =
          field.inputRule === "digits"
            ? { re: /^[0-9]+$/, msg: `${field.label} can contain numbers only.` }
            : field.inputRule === "alphanumeric"
              ? { re: /^[A-Za-z0-9-]+$/, msg: `${field.label} can contain only letters, numbers and hyphens (e.g. 12-A or 45B).` }
              : null;
        let base = z.string().trim().max(max, tooLong);
        const withRule = (b: z.ZodString) => (rule ? b.regex(rule.re, rule.msg) : b);
        schema = field.required
          ? withRule(base.min(1, `${field.label} is required.`))
          : rule
            ? base.refine((v) => !v || rule.re.test(v), { message: rule.msg }).or(z.literal("")).optional().nullable()
            : z.string().max(max, tooLong).optional().nullable();
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
