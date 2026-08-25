import type { QueryClient } from "@tanstack/react-query";

import { clearAdminSessionCache } from "./admin-auth-query.ts";
import { invalidateAdminProductData } from "./admin-products-query.ts";
import { isAdminUnauthorizedError } from "./api/admin-auth.ts";
import { isAdminImportUnauthorizedError } from "./api/admin-imports.ts";

export const ADMIN_IMPORT_HISTORY_QUERY_KEY = ["admin-import-history"] as const;
export const ADMIN_IMPORT_DETAIL_QUERY_KEY = ["admin-import-detail"] as const;
export const ADMIN_IMPORT_PREVIEW_QUERY_KEY = ["admin-import-preview"] as const;

export function adminImportHistoryQueryKey(page: number, size: number) {
  return [...ADMIN_IMPORT_HISTORY_QUERY_KEY, { page, size }] as const;
}

export function adminImportDetailQueryKey(id: number) {
  return [...ADMIN_IMPORT_DETAIL_QUERY_KEY, id] as const;
}

export function adminImportPreviewQueryKey(
  token: string,
  newPage: number,
  changedPage: number,
  size: number,
) {
  return [...ADMIN_IMPORT_PREVIEW_QUERY_KEY, token, { newPage, changedPage, size }] as const;
}

export async function expireAdminImportSession(
  error: unknown,
  queryClient: QueryClient,
  redirectToLogin: () => Promise<unknown> | unknown,
): Promise<boolean> {
  if (!isAdminImportUnauthorizedError(error) && !isAdminUnauthorizedError(error)) return false;
  clearAdminSessionCache(queryClient);
  await redirectToLogin();
  return true;
}

export async function invalidateAdminImportData(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ADMIN_IMPORT_HISTORY_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ADMIN_IMPORT_DETAIL_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
    invalidateAdminProductData(queryClient),
  ]);
}
