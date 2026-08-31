import type { QueryClient } from "@tanstack/react-query";

import { clearAdminSessionCache } from "./admin-auth-query.ts";
import { invalidateAdminProductMedia } from "./admin-product-media-query.ts";
import {
  getAdminImageCandidates,
  isAdminImageCandidatesUnauthorizedError,
} from "./api/admin-image-candidates.ts";

export const ADMIN_IMAGE_CANDIDATES_QUERY_KEY = ["admin-image-candidates"] as const;

export function adminImageCandidatesQueryKey(erpId: string, limit: number) {
  return [...ADMIN_IMAGE_CANDIDATES_QUERY_KEY, erpId, limit] as const;
}

export function adminImageCandidatesQueryOptions(erpId: string, limit: number) {
  return {
    queryKey: adminImageCandidatesQueryKey(erpId, limit),
    queryFn: () => getAdminImageCandidates(erpId, limit),
    enabled: false,
    retry: (failureCount: number, error: unknown) =>
      !(
        error instanceof Error &&
        "status" in error &&
        typeof error.status === "number" &&
        [400, 401, 404, 429].includes(error.status)
      ) && failureCount < 1,
  };
}

export async function completeAdminImageCandidateImport(
  queryClient: QueryClient,
  erpId: string,
  limit: number,
): Promise<void> {
  queryClient.removeQueries({ queryKey: adminImageCandidatesQueryKey(erpId, limit), exact: true });
  await invalidateAdminProductMedia(queryClient, erpId);
}

export async function expireAdminImageCandidatesSession(
  error: unknown,
  queryClient: QueryClient,
  redirectToLogin: () => Promise<unknown> | unknown,
): Promise<boolean> {
  if (!isAdminImageCandidatesUnauthorizedError(error)) return false;
  clearAdminSessionCache(queryClient);
  await redirectToLogin();
  return true;
}
