import assert from "node:assert/strict";
import test from "node:test";

import type { AdminCsrfResponse } from "./admin-auth.ts";
import {
  ADMIN_PRODUCTS_MAX_BULK_IDS,
  AdminProductsApiError,
  buildAdminProductDetailUrl,
  buildAdminProductsUrl,
  bulkUpdateVisibility,
  bulkUpdateVisibilityByFilter,
  getAdminProduct,
  getAdminProducts,
  isAdminProductsUnauthorizedError,
  updateAdminProductEditorial,
} from "./admin-products.ts";

const CSRF: AdminCsrfResponse = {
  token: "csrf-real",
  headerName: "X-CSRF-TOKEN",
  parameterName: "_csrf",
};

const summaryPayload = {
  erpId: "00118-A",
  erpDescription: "DISJUNTOR ERP",
  displayName: "Disjuntor editorial",
  manufacturer: "Schneider Electric",
  category: "PROTEÇÃO",
  reference: "REF-01",
  price: 39.98,
  availableStock: 12.5,
  visible: true,
  costPrice: 9.99,
};

const detailPayload = {
  erpId: "00118-A",
  erpControlled: {
    erpDescription: "DISJUNTOR ERP",
    manufacturerRaw: "Schneider Electric",
    erpGroup: "PROTEÇÃO",
    erpSubgroup: "DISJUNTORES",
    reference: "REF-01",
    partNumber: "PN-01",
    ncm: "00123456",
    unit: "UN",
    availableStock: 12.5,
    currentStock: 13,
    retailPrice: 39.98,
  },
  editorial: { displayName: "Disjuntor editorial", visible: true },
  costPrice: 9.99,
};

test("listagem administrativa envia filtros e paginação zero-based", () => {
  assert.equal(
    buildAdminProductsUrl({
      search: " disjuntor ",
      visibility: "HIDDEN",
      manufacturer: " Schneider ",
      category: " Proteção ",
      page: 2,
      size: 50,
    }),
    "/api/admin/products?search=disjuntor&visibility=HIDDEN&manufacturer=Schneider&category=Prote%C3%A7%C3%A3o&page=2&size=50",
  );
});

test("getAdminProducts usa credentials include e não expõe costPrice", async () => {
  let requestedInit: RequestInit | undefined;
  const page = await getAdminProducts({}, async (_input, init) => {
    requestedInit = init;
    return Response.json({
      items: [summaryPayload],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
  });

  assert.equal(requestedInit?.credentials, "include");
  assert.equal(requestedInit?.method, "GET");
  assert.equal(page.items[0]?.erpId, "00118-A");
  assert.equal("costPrice" in (page.items[0] ?? {}), false);
});

test("detalhe preserva ERP ID opaco, zeros e URL encoding", async () => {
  let requestedUrl = "";
  const product = await getAdminProduct("00118/A", async (input) => {
    requestedUrl = String(input);
    return Response.json({ ...detailPayload, erpId: "00118/A" });
  });

  assert.equal(buildAdminProductDetailUrl("00118/A"), "/api/admin/products/00118%2FA");
  assert.equal(requestedUrl, "/api/admin/products/00118%2FA");
  assert.equal(product.erpId, "00118/A");
  assert.equal("costPrice" in product, false);
  assert.equal("costPrice" in product.erpControlled, false);
});

test("PATCH editorial envia somente displayName e visible com CSRF", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const product = await updateAdminProductEditorial(
    "00118-A",
    { displayName: " Nome amigável ", visible: false },
    CSRF,
    async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return Response.json({
        ...detailPayload,
        editorial: { displayName: "Nome amigável", visible: false },
      });
    },
  );

  const headers = new Headers(requestedInit?.headers);
  assert.equal(requestedUrl, "/api/admin/products/00118-A/editorial");
  assert.equal(requestedInit?.method, "PATCH");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(headers.get("X-CSRF-TOKEN"), "csrf-real");
  assert.deepEqual(JSON.parse(String(requestedInit?.body)), {
    displayName: "Nome amigável",
    visible: false,
  });
  assert.equal(product.editorial.visible, false);
});

test("PATCH permite limpar displayName sem enviar campos ERP", async () => {
  let body: Record<string, unknown> = {};
  await updateAdminProductEditorial(
    "00118-A",
    { displayName: "   ", visible: true },
    CSRF,
    async (_input, init) => {
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return Response.json({ ...detailPayload, editorial: { displayName: null, visible: true } });
    },
  );

  assert.deepEqual(body, { displayName: null, visible: true });
  assert.equal("retailPrice" in body, false);
  assert.equal("availableStock" in body, false);
});

test("bulk por seleção normaliza IDs, preserva opacidade e usa CSRF", async () => {
  let requestedInit: RequestInit | undefined;
  const result = await bulkUpdateVisibility(
    { erpIds: [" 00118 ", "A-2", "00118"], visible: false },
    CSRF,
    async (_input, init) => {
      requestedInit = init;
      return Response.json({ updatedCount: 2 });
    },
  );

  const headers = new Headers(requestedInit?.headers);
  assert.equal(requestedInit?.method, "POST");
  assert.equal(headers.get("X-CSRF-TOKEN"), "csrf-real");
  assert.deepEqual(JSON.parse(String(requestedInit?.body)), {
    erpIds: ["00118", "A-2"],
    visible: false,
  });
  assert.equal(result.updatedCount, 2);
});

test("bulk por seleção bloqueia vazio e mais de 500 IDs antes do fetch", async () => {
  let calls = 0;
  const fetchMock = async () => {
    calls += 1;
    return Response.json({ updatedCount: 0 });
  };

  await assert.rejects(
    () => bulkUpdateVisibility({ erpIds: [], visible: true }, CSRF, fetchMock),
    (error: unknown) => error instanceof AdminProductsApiError && error.status === 400,
  );
  await assert.rejects(
    () =>
      bulkUpdateVisibility(
        {
          erpIds: Array.from({ length: ADMIN_PRODUCTS_MAX_BULK_IDS + 1 }, (_, index) =>
            String(index),
          ),
          visible: true,
        },
        CSRF,
        fetchMock,
      ),
    (error: unknown) => error instanceof AdminProductsApiError && error.status === 400,
  );
  assert.equal(calls, 0);
});

test("bulk por filtro envia escopo explícito e CSRF", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  await bulkUpdateVisibilityByFilter(
    {
      manufacturer: " Schneider ",
      category: " PROTEÇÃO ",
      currentVisibility: "HIDDEN",
      targetVisible: true,
    },
    CSRF,
    async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return Response.json({ updatedCount: 18 });
    },
  );

  assert.equal(requestedUrl, "/api/admin/products/bulk-visibility/by-filter");
  assert.equal(new Headers(requestedInit?.headers).get("X-CSRF-TOKEN"), "csrf-real");
  assert.deepEqual(JSON.parse(String(requestedInit?.body)), {
    manufacturer: "Schneider",
    category: "PROTEÇÃO",
    currentVisibility: "HIDDEN",
    targetVisible: true,
  });
});

test("bulk sem search/fabricante/categoria é bloqueado no cliente", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      bulkUpdateVisibilityByFilter(
        { currentVisibility: "HIDDEN", targetVisible: true },
        CSRF,
        async () => {
          calls += 1;
          return Response.json({ updatedCount: 0 });
        },
      ),
    (error: unknown) =>
      error instanceof AdminProductsApiError && error.code === "BULK_FILTER_SCOPE_REQUIRED",
  );
  assert.equal(calls, 0);
});

test("401 é tipado como sessão expirada sem expor corpo técnico", async () => {
  await assert.rejects(
    () =>
      getAdminProducts({}, async () =>
        Response.json({ code: "UNAUTHORIZED", message: "internal detail" }, { status: 401 }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof AdminProductsApiError);
      assert.equal(error.status, 401);
      assert.equal(error.code, "UNAUTHORIZED");
      assert.equal(error.message.includes("internal detail"), false);
      assert.equal(isAdminProductsUnauthorizedError(error), true);
      return true;
    },
  );
});

test("produto inexistente preserva 404 tipado", async () => {
  await assert.rejects(
    () =>
      getAdminProduct("inexistente", async () =>
        Response.json({ code: "PRODUCT_NOT_FOUND" }, { status: 404 }),
      ),
    (error: unknown) =>
      error instanceof AdminProductsApiError &&
      error.status === 404 &&
      error.code === "PRODUCT_NOT_FOUND",
  );
});
