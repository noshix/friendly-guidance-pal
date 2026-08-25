import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QueryClient } from "@tanstack/react-query";

import {
  buildAdminBulkFilterRequest,
  describeAdminBulkFilter,
  formatAdminPrice,
  toggleAdminProductPageSelection,
  toggleAdminProductSelection,
} from "./admin-products-flow.ts";
import { ADMIN_SESSION_QUERY_KEY } from "./admin-auth-query.ts";
import { expireAdminProductSession } from "./admin-products-query.ts";
import { AdminProductsApiError } from "./api/admin-products.ts";

test("seleção individual e seleção de todos ficam limitadas à página", () => {
  const selected = toggleAdminProductSelection(new Set<string>(), "00118");
  assert.deepEqual([...selected], ["00118"]);

  const withPage = toggleAdminProductPageSelection(selected, ["00118", "A-2", "B-3"]);
  assert.deepEqual([...withPage], ["00118", "A-2", "B-3"]);

  const clearedPage = toggleAdminProductPageSelection(withPage, ["00118", "A-2", "B-3"]);
  assert.deepEqual([...clearedPage], []);
});

test("bulk por filtro exige search, fabricante ou categoria", () => {
  assert.equal(buildAdminBulkFilterRequest({ visibility: "HIDDEN" }, true), null);
  assert.deepEqual(
    buildAdminBulkFilterRequest(
      { search: " disjuntor ", manufacturer: " Schneider ", visibility: "HIDDEN" },
      true,
    ),
    {
      search: "disjuntor",
      manufacturer: "Schneider",
      currentVisibility: "HIDDEN",
      targetVisible: true,
    },
  );
});

test("confirmação descreve o escopo administrativo de forma legível", () => {
  assert.deepEqual(
    describeAdminBulkFilter({
      search: "disjuntor",
      manufacturer: "Schneider",
      category: "PROTEÇÃO",
      visibility: "HIDDEN",
    }),
    [
      "Busca: disjuntor",
      "Fabricante: Schneider",
      "Categoria: PROTEÇÃO",
      "Visibilidade atual: Ocultos",
    ],
  );
});

test("401 limpa a sessão e redireciona para login", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, { authenticated: true, username: "admin" });
  let redirected = false;

  const expired = await expireAdminProductSession(
    new AdminProductsApiError(401, "UNAUTHORIZED"),
    queryClient,
    () => {
      redirected = true;
    },
  );

  assert.equal(expired, true);
  assert.equal(redirected, true);
  assert.equal(queryClient.getQueryData(ADMIN_SESSION_QUERY_KEY), undefined);
});

test("erro comum não encerra sessão administrativa", async () => {
  const queryClient = new QueryClient();
  let redirected = false;
  const expired = await expireAdminProductSession(
    new AdminProductsApiError(500, "API_ERROR"),
    queryClient,
    () => {
      redirected = true;
    },
  );
  assert.equal(expired, false);
  assert.equal(redirected, false);
});

test("preço administrativo preserva zero real do ERP", () => {
  assert.equal(formatAdminPrice(39.98), "R$ 39,98");
  assert.equal(formatAdminPrice(0), "R$ 0,00");
  assert.equal(formatAdminPrice(null), "—");
});

test("rotas administrativas usam cliente centralizado e removem mocks", async () => {
  const sources = await Promise.all([
    readFile(new URL("../routes/admin/produtos/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/admin/produtos/$id.tsx", import.meta.url), "utf8"),
  ]);
  const source = sources.join("\n");
  assert.doesNotMatch(source, /MOCK_ADMIN_PRODUCTS|Disjuntor Tripolar 32A/);
  assert.doesNotMatch(source, /costPrice/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.match(source, /getAdminProducts/);
  assert.match(source, /getAdminProduct/);
  assert.match(source, /updateAdminProductEditorial/);
  assert.match(source, /bulkUpdateVisibilityByFilter/);
});
