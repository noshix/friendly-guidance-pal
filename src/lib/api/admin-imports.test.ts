import assert from "node:assert/strict";
import test from "node:test";

import type { AdminCsrfResponse } from "./admin-auth.ts";
import {
  AdminImportApiError,
  buildAdminImportHistoryUrl,
  buildAdminImportPreviewUrl,
  cancelImport,
  confirmImport,
  createImportPreview,
  getImportDetail,
  getImportHistory,
  getImportPreview,
  isAdminImportUnauthorizedError,
} from "./admin-imports.ts";

const CSRF: AdminCsrfResponse = {
  token: "csrf-real",
  headerName: "X-CSRF-TOKEN",
  parameterName: "_csrf",
};

const previewPayload = {
  token: "opaque/token 001",
  sourceFilename: "fixture.xlsx",
  canConfirm: true,
  summary: {
    totalRows: 8,
    newCount: 2,
    changedCount: 1,
    unchangedCount: 5,
    errorCount: 0,
  },
  errors: [],
  newProducts: [
    {
      erpId: "001-A",
      description: "PRODUTO NOVO",
      manufacturer: "PIZZATTO",
      group: "CONDUTORES",
      price: "R$ 39,98",
      availableStock: "5",
    },
  ],
  changedProducts: [
    {
      erpId: "9507",
      description: "PRODUTO ALTERADO",
      changes: [{ field: "Preço", previousValue: "R$ 70,00", newValue: "R$ 77,02" }],
    },
  ],
  newPage: {
    page: 0,
    size: 50,
    totalElements: 2,
    totalPages: 1,
    firstItem: 1,
    lastItem: 2,
    hasPrevious: false,
    hasNext: false,
  },
  changedPage: {
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1,
    firstItem: 1,
    lastItem: 1,
    hasPrevious: false,
    hasNext: false,
  },
};

const historyItem = {
  id: 42,
  appliedAt: "25/08/2026 09:00",
  status: "Concluída",
  totalRows: 8,
  newCount: 2,
  changedCount: 1,
  unchangedCount: 5,
  sourceFilename: "fixture.xlsx",
};

test("multipart upload usa FormData, credentials include e CSRF sem Content-Type manual", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const file = new File(["fixture"], "fixture.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const preview = await createImportPreview(file, CSRF, async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return Response.json(previewPayload);
  });

  const headers = new Headers(requestedInit?.headers);
  assert.equal(requestedUrl, "/api/admin/imports/preview");
  assert.equal(requestedInit?.method, "POST");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(headers.get("X-CSRF-TOKEN"), "csrf-real");
  assert.equal(headers.get("Content-Type"), null);
  assert.ok(requestedInit?.body instanceof FormData);
  assert.equal((requestedInit?.body as FormData).get("file"), file);
  assert.equal(preview.token, "opaque/token 001");
});

test("preview mapeia NEW, CHANGED e UNCHANGED sem recalcular dados", async () => {
  const preview = await getImportPreview("opaque/token 001", 0, 0, 50, async () =>
    Response.json(previewPayload),
  );

  assert.deepEqual(preview.summary, previewPayload.summary);
  assert.equal(preview.newProducts[0]?.erpId, "001-A");
  assert.equal(preview.changedProducts[0]?.changes[0]?.newValue, "R$ 77,02");
  assert.equal(preview.newProducts.length, 1);
  assert.equal(preview.changedProducts.length, 1);
});

test("paginação da prévia preserva token opaco e páginas independentes", () => {
  assert.equal(
    buildAdminImportPreviewUrl("opaque/token 001", 2, 3, 100),
    "/api/admin/imports/preview/opaque%2Ftoken%20001?newPage=2&changedPage=3&size=100",
  );
});

test("confirmação envia somente token na URL e CSRF, sem linhas no payload", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const result = await confirmImport("opaque/token 001", CSRF, async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return Response.json({
      status: "APPLIED",
      importId: 42,
      appliedAt: "2026-08-25T13:00:00Z",
      totalRows: 8,
      newCount: 2,
      changedCount: 1,
      unchangedCount: 5,
    });
  });

  assert.equal(requestedUrl, "/api/admin/imports/opaque%2Ftoken%20001/confirm");
  assert.equal(requestedInit?.method, "POST");
  assert.equal(requestedInit?.body, undefined);
  assert.equal(new Headers(requestedInit?.headers).get("X-CSRF-TOKEN"), "csrf-real");
  assert.equal(result.importId, 42);
});

test("cancelamento usa DELETE real com CSRF e não finge resposta JSON", async () => {
  let requestedInit: RequestInit | undefined;
  await cancelImport("opaque-token", CSRF, async (_input, init) => {
    requestedInit = init;
    return new Response(null, { status: 204 });
  });

  assert.equal(requestedInit?.method, "DELETE");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(new Headers(requestedInit?.headers).get("X-CSRF-TOKEN"), "csrf-real");
});

test("histórico usa paginação real e detalhe retorna somente o resumo persistido", async () => {
  let historyUrl = "";
  const history = await getImportHistory(2, 50, async (input) => {
    historyUrl = String(input);
    return Response.json({
      items: [historyItem],
      page: 2,
      size: 50,
      totalElements: 101,
      totalPages: 3,
      hasPrevious: true,
      hasNext: false,
    });
  });
  const detail = await getImportDetail(42, async (input) => {
    assert.equal(String(input), "/api/admin/imports/42");
    return Response.json(historyItem);
  });

  assert.equal(buildAdminImportHistoryUrl(2, 50), "/api/admin/imports?page=2&size=50");
  assert.equal(historyUrl, "/api/admin/imports?page=2&size=50");
  assert.equal(history.items[0]?.sourceFilename, "fixture.xlsx");
  assert.deepEqual(detail, historyItem);
  assert.equal("items" in detail, false);
  assert.equal("username" in detail, false);
});

test("422 preserva os erros de validação retornados pelo preview", async () => {
  const invalidPayload = {
    ...previewPayload,
    token: null,
    canConfirm: false,
    summary: { ...previewPayload.summary, errorCount: 2 },
    errors: [
      { row: "Linha 2", code: "EMPTY_ID", message: "Id obrigatório" },
      { row: "Linha 3", code: "INVALID_PRICE", message: "Preço inválido" },
    ],
    newProducts: [],
    changedProducts: [],
  };
  const file = new File(["invalid"], "invalid.xlsx");
  const preview = await createImportPreview(file, CSRF, async () =>
    Response.json(invalidPayload, { status: 422 }),
  );

  assert.equal(preview.canConfirm, false);
  assert.equal(preview.token, null);
  assert.equal(preview.errors[0]?.code, "EMPTY_ID");
  assert.equal(preview.summary.errorCount, 2);
});

for (const [status, code] of [
  [401, "UNAUTHORIZED"],
  [410, "IMPORT_TOKEN_GONE"],
  [413, "FILE_TOO_LARGE"],
] as const) {
  test(`${status} é preservado como erro tipado sem expor mensagem técnica`, async () => {
    await assert.rejects(
      () =>
        getImportPreview("token", 0, 0, 50, async () =>
          Response.json({ code, message: "stack trace ou caminho interno" }, { status }),
        ),
      (error: unknown) => {
        assert.ok(error instanceof AdminImportApiError);
        assert.equal(error.status, status);
        assert.equal(error.code, code);
        assert.equal(error.message.includes("stack trace"), false);
        assert.equal(isAdminImportUnauthorizedError(error), status === 401);
        return true;
      },
    );
  });
}

test("resposta inválida falha de forma segura", async () => {
  await assert.rejects(
    () => getImportHistory(0, 20, async () => Response.json({ items: "invalid" })),
    (error: unknown) =>
      error instanceof AdminImportApiError && error.code === "INVALID_HISTORY_PAGE_RESPONSE",
  );
});
