import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QueryClient } from "@tanstack/react-query";

import { ADMIN_SESSION_QUERY_KEY } from "./admin-auth-query.ts";
import {
  clearActiveAdminImport,
  describeAdminImportError,
  getActiveAdminImport,
  rememberActiveAdminImport,
  validateAdminImportFile,
} from "./admin-imports-flow.ts";
import { expireAdminImportSession } from "./admin-imports-query.ts";
import { AdminImportApiError, type AdminImportPreview } from "./api/admin-imports.ts";

const preview: AdminImportPreview = {
  token: "opaque-001",
  sourceFilename: "fixture.xlsx",
  canConfirm: true,
  summary: { totalRows: 1, newCount: 1, changedCount: 0, unchangedCount: 0, errorCount: 0 },
  errors: [],
  newProducts: [],
  changedProducts: [],
  newPage: {
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1,
    firstItem: 1,
    lastItem: 1,
    hasPrevious: false,
    hasNext: false,
  },
  changedPage: {
    page: 0,
    size: 50,
    totalElements: 0,
    totalPages: 0,
    firstItem: 0,
    lastItem: 0,
    hasPrevious: false,
    hasNext: false,
  },
};

test("validação UX aceita XLSX e rejeita ausência, vazio, extensão e tamanho", () => {
  assert.equal(validateAdminImportFile(null)?.code, "FILE_REQUIRED");
  assert.equal(validateAdminImportFile(new File([], "empty.xlsx"))?.code, "FILE_EMPTY");
  assert.equal(validateAdminImportFile(new File(["x"], "erp.xls"))?.code, "FILE_TYPE_INVALID");
  assert.equal(
    validateAdminImportFile(new File([new Uint8Array(20 * 1024 * 1024 + 1)], "large.xlsx"))?.code,
    "FILE_TOO_LARGE",
  );
  assert.equal(validateAdminImportFile(new File(["fixture"], "ERP.XLSX")), null);
});

test("token opaco permanece somente na memória do fluxo e pode ser limpo", () => {
  clearActiveAdminImport();
  const active = rememberActiveAdminImport(preview);
  assert.equal(active.token, "opaque-001");
  assert.equal(getActiveAdminImport()?.token, "opaque-001");
  clearActiveAdminImport();
  assert.equal(getActiveAdminImport(), null);
});

test("preview inválido nunca cria estado confirmável", () => {
  clearActiveAdminImport();
  assert.throws(
    () => rememberActiveAdminImport({ ...preview, token: null, canConfirm: false }),
    (error: unknown) =>
      error instanceof AdminImportApiError && error.code === "IMPORT_PREVIEW_NOT_CONFIRMABLE",
  );
  assert.equal(getActiveAdminImport(), null);
});

test("mensagens cobrem 401, 410, 413 e 422 sem detalhes técnicos", () => {
  assert.match(describeAdminImportError(new AdminImportApiError(401, "UNAUTHORIZED")), /sessão/i);
  assert.match(
    describeAdminImportError(new AdminImportApiError(410, "IMPORT_TOKEN_GONE")),
    /prévia/i,
  );
  assert.match(describeAdminImportError(new AdminImportApiError(413, "FILE_TOO_LARGE")), /20 MB/i);
  assert.match(
    describeAdminImportError(new AdminImportApiError(422, "INVALID_FILE")),
    /validação/i,
  );
  assert.doesNotMatch(describeAdminImportError(new Error("stack trace")), /stack trace/i);
});

test("401 limpa sessão administrativa e redireciona para login", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, { authenticated: true, username: "admin" });
  let redirected = false;
  const expired = await expireAdminImportSession(
    new AdminImportApiError(401, "UNAUTHORIZED"),
    queryClient,
    () => {
      redirected = true;
    },
  );
  assert.equal(expired, true);
  assert.equal(redirected, true);
  assert.equal(queryClient.getQueryData(ADMIN_SESSION_QUERY_KEY), undefined);
});

test("rotas de importação usam cliente centralizado e removem mocks antigos", async () => {
  const routePaths = [
    "../routes/admin/importacoes/index.tsx",
    "../routes/admin/importacoes/nova.tsx",
    "../routes/admin/importacoes/preview.tsx",
    "../routes/admin/importacoes/$id.tsx",
  ];
  const sources = await Promise.all(
    routePaths.map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  );
  const source = sources.join("\n");
  assert.doesNotMatch(source, /setTimeout|produtos_pizzatto_v5|Novo Produto Material Elétrico/);
  assert.doesNotMatch(source, /11\.170|11\.162|Disjuntor Tripolar 32A|Lâmpada LED 40W/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.match(source, /createImportPreview/);
  assert.match(source, /getImportPreview/);
  assert.match(source, /confirmImport/);
  assert.match(source, /cancelImport/);
  assert.match(source, /getImportHistory/);
  assert.match(source, /getImportDetail/);
});

test("fluxo não persiste XLSX, token ou autenticação em storage", async () => {
  const sources = await Promise.all([
    readFile(new URL("./admin-imports-flow.ts", import.meta.url), "utf8"),
    readFile(new URL("./api/admin-imports.ts", import.meta.url), "utf8"),
    readFile(new URL("../routes/admin/importacoes/nova.tsx", import.meta.url), "utf8"),
    readFile(new URL("../routes/admin/importacoes/preview.tsx", import.meta.url), "utf8"),
  ]);
  const source = sources.join("\n");
  assert.doesNotMatch(source, /localStorage|sessionStorage|FileReader|XSSFWorkbook|SheetJS/);
  assert.doesNotMatch(source, /from ["']xlsx["']|from ["']exceljs["']/);
  assert.match(source, /FormData/);
  assert.match(source, /credentials: "include"/);
});

test("upload e confirmação bloqueiam duplo submit enquanto pendentes", async () => {
  const uploadSource = await readFile(
    new URL("../routes/admin/importacoes/nova.tsx", import.meta.url),
    "utf8",
  );
  const previewSource = await readFile(
    new URL("../routes/admin/importacoes/preview.tsx", import.meta.url),
    "utf8",
  );
  assert.match(uploadSource, /if \(uploadMutation\.isPending\) return/);
  assert.match(uploadSource, /disabled=\{uploadMutation\.isPending\}/);
  assert.match(previewSource, /disabled=\{mutating \|\| !preview\.canConfirm/);
  assert.match(previewSource, /confirmMutation\.isPending \|\| cancelMutation\.isPending/);
});

test("package não adiciona parser XLSX client-side", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  assert.equal("xlsx" in dependencies, false);
  assert.equal("exceljs" in dependencies, false);
  assert.equal("sheetjs" in dependencies, false);
});
