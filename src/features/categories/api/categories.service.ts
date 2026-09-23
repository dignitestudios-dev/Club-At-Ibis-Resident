import axiosInstance from "@/lib/axios";
import type {
  ActiveCategory,
  CategoryFormField,
  CategoryFormResponse,
  ActiveCategoriesResult,
} from "../types/categories.types";

export interface GetActiveCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

function toField(f: any): CategoryFormField {
  return {
    id: f.id,
    label: f.label ?? "",
    type: f.type,
    required: !!f.required,
    helpText: f.helpText ?? undefined,
    placeholder: f.placeholder ?? undefined,
    options: f.options
      ? Array.isArray(f.options)
        ? f.options.map((o: any) =>
            typeof o === "string" ? { label: o, value: o } : o
          )
        : undefined
      : undefined,
    accept: f.accept
      ? Array.isArray(f.accept)
        ? f.accept
            .map((a: string) =>
              a === "images" ? "image/*" : a === "pdf" ? ".pdf" : a
            )
            .join(",")
        : f.accept
      : undefined,
    multiple: f.multiple !== undefined ? !!f.multiple : undefined,
    order: typeof f.order === "number" ? f.order : 0,
    source: f.source === "common" ? "common" : "category",
  };
}

function toCategory(raw: any): ActiveCategory {
  const currentVersion = raw.currentVersion ?? raw.version ?? 1;
  return {
    id: raw.id || raw._id,
    slug: raw.slug,
    name: raw.name ?? "",
    description: raw.description ?? "",
    status: raw.status ?? "active",
    currentVersion,
    fields: raw.fields ? raw.fields.map(toField) : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Fetch list of active categories available for resident submissions.
 */
export async function getActiveCategories(
  params?: GetActiveCategoriesParams
): Promise<ActiveCategoriesResult> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  const { data } = await axiosInstance.get("/categories", {
    params: queryParams,
  });

  const rawList = data?.data?.categories ?? [];
  const categories: ActiveCategory[] = rawList.map(toCategory);

  return {
    categories,
    pagination: data?.pagination,
  };
}

/**
 * Fetch live dynamic form fields for an active category.
 * Returns both common fields (source === 'common') and category fields (source === 'category').
 */
export async function getActiveCategoryForm(
  categoryId: string
): Promise<CategoryFormResponse> {
  const { data } = await axiosInstance.get(`/categories/${categoryId}/form`);
  const rawForm = data?.data?.form;
  if (!rawForm) {
    throw new Error("Category form not found.");
  }

  const category = toCategory(rawForm.category);
  const fields = (rawForm.fields ?? []).map(toField);

  return {
    category,
    commonFormVersion: rawForm.commonFormVersion ?? 1,
    categoryFormVersion: rawForm.categoryFormVersion ?? 1,
    fields,
  };
}
