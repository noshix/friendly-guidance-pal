import type { QueryClient } from "@tanstack/react-query";

import { clearAdminSessionCache } from "./admin-auth-query.ts";
import { invalidateAdminProductData } from "./admin-products-query.ts";
import { isAdminProductMediaUnauthorizedError } from "./api/admin-product-media.ts";

export const ADMIN_PRODUCT_IMAGES_QUERY_KEY = ["admin-product-images"] as const;

export function adminProductImagesQueryKey(erpId: string) {
  return [...ADMIN_PRODUCT_IMAGES_QUERY_KEY, erpId] as const;
}

export async function invalidateAdminProductMedia(
  queryClient: QueryClient,
  erpId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminProductImagesQueryKey(erpId), exact: true }),
    invalidateAdminProductData(queryClient, erpId),
  ]);
}

export async function expireAdminProductMediaSession(
  error: unknown,
  queryClient: QueryClient,
  redirectToLogin: () => Promise<unknown> | unknown,
): Promise<boolean> {
  if (!isAdminProductMediaUnauthorizedError(error)) return false;
  clearAdminSessionCache(queryClient);
  await redirectToLogin();
  return true;
}
