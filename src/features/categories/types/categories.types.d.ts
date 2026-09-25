export type CategoryFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface CategoryFieldOption {
  label: string;
  value: string;
}

export interface CategoryFormField {
  id: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  options?: (string | CategoryFieldOption)[];
  accept?: string[] | string;
  multiple?: boolean;
  order: number;
  source: "common" | "category";
  maxLength?: number;
}

export interface ActiveCategory {
  id: string;
  slug?: string;
  name: string;
  description: string;
  status: "active" | "archived";
  currentVersion: number;
  fields?: CategoryFormField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormResponse {
  category: ActiveCategory;
  commonFormVersion: number;
  categoryFormVersion: number;
  fields: CategoryFormField[];
}

export interface ActiveCategoriesResult {
  categories: ActiveCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
