import type { QueryClient } from "@tanstack/react-query";

import { clearAdminSessionCache } from "./admin-auth-query.ts";
import type { AdminProductListParams } from "./api/admin-products.ts";
import { isAdminProductsUnauthorizedError } from "./api/admin-products.ts";

export const ADMIN_PRODUCTS_QUERY_KEY = ["admin-products"] as const;
export const ADMIN_PRODUCT_QUERY_KEY = ["admin-product"] as const;

export function adminProductsQueryKey(params: AdminProductListParams) {
  return [...ADMIN_PRODUCTS_QUERY_KEY, params] as const;
}

export function adminProductQueryKey(erpId: string) {
  return [...ADMIN_PRODUCT_QUERY_KEY, erpId] as const;
}

export async function expireAdminProductSession(
  error: unknown,
  queryClient: QueryClient,
  redirectToLogin: () => Promise<unknown> | unknown,
): Promise<boolean> {
  if (!isAdminProductsUnauthorizedError(error)) return false;
  clearAdminSessionCache(queryClient);
  await redirectToLogin();
  return true;
}

export async function invalidateAdminProductData(
  queryClient: QueryClient,
  erpId?: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY }),
    ...(erpId
      ? [queryClient.invalidateQueries({ queryKey: adminProductQueryKey(erpId), exact: true })]
      : []),
    queryClient.invalidateQueries({ queryKey: ["public-products"] }),
    queryClient.invalidateQueries({ queryKey: ["public-category-products"] }),
    queryClient.invalidateQueries({ queryKey: ["public-manufacturer-products"] }),
    queryClient.invalidateQueries({ queryKey: ["public-products-related"] }),
    queryClient.invalidateQueries({ queryKey: ["public-categories"] }),
    queryClient.invalidateQueries({ queryKey: ["public-manufacturers"] }),
    ...(erpId
      ? [queryClient.invalidateQueries({ queryKey: ["public-product", erpId], exact: true })]
      : []),
  ]);
}
