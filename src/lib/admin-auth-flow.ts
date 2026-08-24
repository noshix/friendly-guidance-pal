import type { AdminSessionResponse } from "@/lib/api/admin-auth";

export type AdminGuardState = "loading" | "error" | "redirect-login" | "authenticated";
export type AdminLoginState = "loading" | "error" | "redirect-admin" | "form";

interface SessionQueryState {
  hydrated: boolean;
  pending: boolean;
  failed: boolean;
  session: AdminSessionResponse | undefined;
}

export function resolveAdminGuardState(state: SessionQueryState): AdminGuardState {
  if (!state.hydrated || state.pending) return "loading";
  if (state.failed) return "error";
  return state.session?.authenticated ? "authenticated" : "redirect-login";
}

export function resolveAdminLoginState(state: SessionQueryState): AdminLoginState {
  if (!state.hydrated || state.pending) return "loading";
  if (state.failed) return "error";
  return state.session?.authenticated ? "redirect-admin" : "form";
}
