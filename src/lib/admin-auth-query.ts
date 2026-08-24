import type { QueryClient } from "@tanstack/react-query";

export const ADMIN_SESSION_QUERY_KEY = ["admin-session"] as const;
export const ADMIN_SESSION_STALE_TIME = 0;

export function clearAdminSessionCache(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: ADMIN_SESSION_QUERY_KEY, exact: true });
}
