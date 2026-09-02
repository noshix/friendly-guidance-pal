import type { QueryClient } from "@tanstack/react-query";

import { clearAdminSessionCache } from "./admin-auth-query.ts";
import { invalidateAdminProductData } from "./admin-products-query.ts";
import { isAdminImageEnrichmentUnauthorized } from "./api/admin-image-enrichment.ts";

export const ADMIN_IMAGE_ENRICHMENT_JOBS_KEY = ["admin-image-enrichment-jobs"] as const;
export const ADMIN_IMAGE_ENRICHMENT_JOB_KEY = ["admin-image-enrichment-job"] as const;
export const ADMIN_IMAGE_ENRICHMENT_ITEMS_KEY = ["admin-image-enrichment-items"] as const;

export function adminImageEnrichmentJobsKey(page: number, size: number) {
  return [...ADMIN_IMAGE_ENRICHMENT_JOBS_KEY, { page, size }] as const;
}

export function adminImageEnrichmentJobKey(jobId: number) {
  return [...ADMIN_IMAGE_ENRICHMENT_JOB_KEY, jobId] as const;
}

export function adminImageEnrichmentItemsKey(
  jobId: number,
  statuses: readonly string[],
  page: number,
  size: number,
) {
  return [...ADMIN_IMAGE_ENRICHMENT_ITEMS_KEY, jobId, { statuses, page, size }] as const;
}

export async function invalidateAdminImageEnrichment(
  queryClient: QueryClient,
  jobId?: number,
  catalogChanged = false,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ADMIN_IMAGE_ENRICHMENT_JOBS_KEY }),
    ...(jobId
      ? [
          queryClient.invalidateQueries({ queryKey: adminImageEnrichmentJobKey(jobId) }),
          queryClient.invalidateQueries({
            queryKey: [...ADMIN_IMAGE_ENRICHMENT_ITEMS_KEY, jobId],
          }),
        ]
      : []),
    ...(catalogChanged ? [invalidateAdminProductData(queryClient)] : []),
  ]);
}

export async function expireAdminImageEnrichmentSession(
  error: unknown,
  queryClient: QueryClient,
  redirectToLogin: () => Promise<unknown> | unknown,
): Promise<boolean> {
  if (!isAdminImageEnrichmentUnauthorized(error)) return false;
  clearAdminSessionCache(queryClient);
  await redirectToLogin();
  return true;
}
