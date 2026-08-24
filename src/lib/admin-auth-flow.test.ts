import assert from "node:assert/strict";
import test from "node:test";
import { QueryClient } from "@tanstack/react-query";

import { resolveAdminGuardState, resolveAdminLoginState } from "./admin-auth-flow.ts";
import { ADMIN_SESSION_QUERY_KEY, clearAdminSessionCache } from "./admin-auth-query.ts";

test("guard não renderiza conteúdo protegido antes da hidratação ou durante loading", () => {
  assert.equal(
    resolveAdminGuardState({ hydrated: false, pending: true, failed: false, session: undefined }),
    "loading",
  );
  assert.equal(
    resolveAdminGuardState({ hydrated: true, pending: true, failed: false, session: undefined }),
    "loading",
  );
});

test("guard redireciona sessão anônima e libera sessão autenticada", () => {
  assert.equal(
    resolveAdminGuardState({
      hydrated: true,
      pending: false,
      failed: false,
      session: { authenticated: false },
    }),
    "redirect-login",
  );
  assert.equal(
    resolveAdminGuardState({
      hydrated: true,
      pending: false,
      failed: false,
      session: { authenticated: true, username: "admin" },
    }),
    "authenticated",
  );
});

test("login redireciona usuário já autenticado e mostra formulário ao anônimo", () => {
  assert.equal(
    resolveAdminLoginState({
      hydrated: true,
      pending: false,
      failed: false,
      session: { authenticated: true, username: "admin" },
    }),
    "redirect-admin",
  );
  assert.equal(
    resolveAdminLoginState({
      hydrated: true,
      pending: false,
      failed: false,
      session: { authenticated: false },
    }),
    "form",
  );
});

test("logout remove a query de sessão do cache", () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, {
    authenticated: true,
    username: "admin",
  });

  clearAdminSessionCache(queryClient);

  assert.equal(queryClient.getQueryData(ADMIN_SESSION_QUERY_KEY), undefined);
});
