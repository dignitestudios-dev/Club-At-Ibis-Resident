import { useQuery } from "@tanstack/react-query";
import {
  getActiveCategories,
  getActiveCategoryForm,
  type GetActiveCategoriesParams,
} from "./categories.service";

export const CATEGORIES_QUERY_KEYS = {
  all: ["categories"] as const,
  activeList: (params?: GetActiveCategoriesParams) =>
    [
      "categories",
      "active",
      params?.search?.trim() || "",
      params?.page || 1,
      params?.limit || 50,
    ] as const,
  categoryForm: (categoryId: string) =>
    ["categories", "form", categoryId] as const,
};

/**
 * Hook to query active categories list for resident request creation and filtering.
 */
export function useActiveCategoriesQuery(params?: GetActiveCategoriesParams) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.activeList(params),
    queryFn: () => getActiveCategories(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to query live category form definition (common fields + category-specific fields).
 */
export function useActiveCategoryFormQuery(categoryId?: string | null) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.categoryForm(categoryId || ""),
    queryFn: () => getActiveCategoryForm(categoryId!),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60 * 1000,
  });
}
