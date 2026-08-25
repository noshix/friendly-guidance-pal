import type { AdminCsrfResponse } from "@/lib/api/admin-auth";

export const ADMIN_IMPORT_DEFAULT_PREVIEW_SIZE = 50;
export const ADMIN_IMPORT_MAX_HISTORY_SIZE = 100;
export const ADMIN_IMPORT_MAX_FILE_BYTES = 20 * 1024 * 1024;

export interface AdminImportSummary {
  totalRows: number;
  newCount: number;
  changedCount: number;
  unchangedCount: number;
  errorCount: number;
}

export interface AdminImportPreviewItem {
  erpId: string;
  description: string;
}

export interface AdminImportNewProduct extends AdminImportPreviewItem {
  manufacturer: string;
  group: string;
  price: string;
  availableStock: string;
}

export interface AdminImportFieldChange {
  field: string;
  previousValue: string;
  newValue: string;
}

export interface AdminImportChangedProduct extends AdminImportPreviewItem {
  changes: AdminImportFieldChange[];
}

export interface AdminImportValidationError {
  row: string;
  code: string;
  message: string;
}

export interface AdminImportPreviewPage {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  firstItem: number;
  lastItem: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AdminImportPreview {
  token: string | null;
  sourceFilename: string | null;
  canConfirm: boolean;
  summary: AdminImportSummary;
  errors: AdminImportValidationError[];
  newProducts: AdminImportNewProduct[];
  changedProducts: AdminImportChangedProduct[];
  newPage: AdminImportPreviewPage;
  changedPage: AdminImportPreviewPage;
}

export interface AdminImportConfirmResult {
  status: "APPLIED";
  importId: number;
  appliedAt: string;
  totalRows: number;
  newCount: number;
  changedCount: number;
  unchangedCount: number;
}

export interface AdminImportHistoryItem {
  id: number;
  appliedAt: string;
  status: string;
  totalRows: number;
  newCount: number;
  changedCount: number;
  unchangedCount: number;
  sourceFilename: string;
}

export interface AdminImportHistoryPage {
  items: AdminImportHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type AdminImportDetail = AdminImportHistoryItem;

export interface AdminImportErrorDetail {
  field: string;
  code: string;
  message: string;
}

export class AdminImportApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: AdminImportErrorDetail[];

  constructor(status: number, code: string, details: AdminImportErrorDetail[] = []) {
    super("Não foi possível concluir a operação de importação ERP");
    this.name = "AdminImportApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type AdminImportFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const ADMIN_IMPORTS_PATH = "/api/admin/imports";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidResponse(field: string): AdminImportApiError {
  return new AdminImportApiError(502, `INVALID_${field.toUpperCase()}_RESPONSE`);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) throw invalidResponse(field);
  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw invalidResponse(field);
  return value;
}

function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw invalidResponse(field);
  return value;
}

function nonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw invalidResponse(field);
  }
  return value;
}

function positiveInteger(value: unknown, field: string): number {
  const result = nonNegativeInteger(value, field);
  if (result === 0) throw invalidResponse(field);
  return result;
}

function mapSummary(value: unknown): AdminImportSummary {
  if (!isRecord(value)) throw invalidResponse("summary");
  return {
    totalRows: nonNegativeInteger(value["totalRows"], "totalRows"),
    newCount: nonNegativeInteger(value["newCount"], "newCount"),
    changedCount: nonNegativeInteger(value["changedCount"], "changedCount"),
    unchangedCount: nonNegativeInteger(value["unchangedCount"], "unchangedCount"),
    errorCount: nonNegativeInteger(value["errorCount"], "errorCount"),
  };
}

function mapValidationError(value: unknown): AdminImportValidationError {
  if (!isRecord(value)) throw invalidResponse("validation_error");
  return {
    row: requiredString(value["row"], "error_row"),
    code: requiredString(value["code"], "error_code"),
    message: requiredString(value["message"], "error_message"),
  };
}

function mapNewProduct(value: unknown): AdminImportNewProduct {
  if (!isRecord(value)) throw invalidResponse("new_product");
  return {
    erpId: requiredString(value["erpId"], "erpId"),
    description: requiredString(value["description"], "description"),
    manufacturer: requiredString(value["manufacturer"], "manufacturer"),
    group: requiredString(value["group"], "group"),
    price: requiredString(value["price"], "price"),
    availableStock: requiredString(value["availableStock"], "availableStock"),
  };
}

function mapFieldChange(value: unknown): AdminImportFieldChange {
  if (!isRecord(value)) throw invalidResponse("field_change");
  return {
    field: requiredString(value["field"], "field"),
    previousValue: requiredString(value["previousValue"], "previousValue"),
    newValue: requiredString(value["newValue"], "newValue"),
  };
}

function mapChangedProduct(value: unknown): AdminImportChangedProduct {
  if (!isRecord(value) || !Array.isArray(value["changes"])) {
    throw invalidResponse("changed_product");
  }
  return {
    erpId: requiredString(value["erpId"], "erpId"),
    description: requiredString(value["description"], "description"),
    changes: value["changes"].map(mapFieldChange),
  };
}

function mapPreviewPage(value: unknown): AdminImportPreviewPage {
  if (!isRecord(value)) throw invalidResponse("preview_page");
  return {
    page: nonNegativeInteger(value["page"], "page"),
    size: nonNegativeInteger(value["size"], "size"),
    totalElements: nonNegativeInteger(value["totalElements"], "totalElements"),
    totalPages: nonNegativeInteger(value["totalPages"], "totalPages"),
    firstItem: nonNegativeInteger(value["firstItem"], "firstItem"),
    lastItem: nonNegativeInteger(value["lastItem"], "lastItem"),
    hasPrevious: requiredBoolean(value["hasPrevious"], "hasPrevious"),
    hasNext: requiredBoolean(value["hasNext"], "hasNext"),
  };
}

export function mapAdminImportPreview(value: unknown): AdminImportPreview {
  if (
    !isRecord(value) ||
    !Array.isArray(value["errors"]) ||
    !Array.isArray(value["newProducts"]) ||
    !Array.isArray(value["changedProducts"])
  ) {
    throw invalidResponse("preview");
  }
  return {
    token: nullableString(value["token"], "token"),
    sourceFilename: nullableString(value["sourceFilename"], "sourceFilename"),
    canConfirm: requiredBoolean(value["canConfirm"], "canConfirm"),
    summary: mapSummary(value["summary"]),
    errors: value["errors"].map(mapValidationError),
    newProducts: value["newProducts"].map(mapNewProduct),
    changedProducts: value["changedProducts"].map(mapChangedProduct),
    newPage: mapPreviewPage(value["newPage"]),
    changedPage: mapPreviewPage(value["changedPage"]),
  };
}

function mapConfirmResult(value: unknown): AdminImportConfirmResult {
  if (!isRecord(value) || value["status"] !== "APPLIED") throw invalidResponse("confirm");
  return {
    status: "APPLIED",
    importId: positiveInteger(value["importId"], "importId"),
    appliedAt: requiredString(value["appliedAt"], "appliedAt"),
    totalRows: nonNegativeInteger(value["totalRows"], "totalRows"),
    newCount: nonNegativeInteger(value["newCount"], "newCount"),
    changedCount: nonNegativeInteger(value["changedCount"], "changedCount"),
    unchangedCount: nonNegativeInteger(value["unchangedCount"], "unchangedCount"),
  };
}

function mapHistoryItem(value: unknown): AdminImportHistoryItem {
  if (!isRecord(value)) throw invalidResponse("history_item");
  return {
    id: positiveInteger(value["id"], "id"),
    appliedAt: requiredString(value["appliedAt"], "appliedAt"),
    status: requiredString(value["status"], "status"),
    totalRows: nonNegativeInteger(value["totalRows"], "totalRows"),
    newCount: nonNegativeInteger(value["newCount"], "newCount"),
    changedCount: nonNegativeInteger(value["changedCount"], "changedCount"),
    unchangedCount: nonNegativeInteger(value["unchangedCount"], "unchangedCount"),
    sourceFilename: requiredString(value["sourceFilename"], "sourceFilename"),
  };
}

function mapHistoryPage(value: unknown): AdminImportHistoryPage {
  if (!isRecord(value) || !Array.isArray(value["items"])) throw invalidResponse("history_page");
  return {
    items: value["items"].map(mapHistoryItem),
    page: nonNegativeInteger(value["page"], "page"),
    size: nonNegativeInteger(value["size"], "size"),
    totalElements: nonNegativeInteger(value["totalElements"], "totalElements"),
    totalPages: nonNegativeInteger(value["totalPages"], "totalPages"),
    hasPrevious: requiredBoolean(value["hasPrevious"], "hasPrevious"),
    hasNext: requiredBoolean(value["hasNext"], "hasNext"),
  };
}

function mapErrorDetails(value: unknown): AdminImportErrorDetail[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((detail) => {
    if (!isRecord(detail)) return [];
    const field = detail["field"];
    const code = detail["code"];
    const message = detail["message"];
    if (typeof field !== "string" || typeof code !== "string" || typeof message !== "string") {
      return [];
    }
    return [{ field, code, message }];
  });
}

async function readError(response: Response): Promise<AdminImportApiError> {
  try {
    const value: unknown = await response.json();
    if (isRecord(value) && typeof value["code"] === "string") {
      return new AdminImportApiError(
        response.status,
        value["code"],
        mapErrorDetails(value["details"]),
      );
    }
  } catch {
    // Technical response bodies are deliberately not exposed to the UI.
  }
  return new AdminImportApiError(response.status, "ADMIN_IMPORT_ERROR");
}

async function execute(
  path: string,
  init: RequestInit,
  fetchImplementation: AdminImportFetch,
): Promise<Response> {
  try {
    return await fetchImplementation(path, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new AdminImportApiError(0, "NETWORK_ERROR");
  }
}

async function responseJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new AdminImportApiError(502, "INVALID_JSON_RESPONSE");
  }
}

async function requestJson(
  path: string,
  init: RequestInit,
  fetchImplementation: AdminImportFetch,
): Promise<unknown> {
  const response = await execute(path, init, fetchImplementation);
  if (!response.ok) throw await readError(response);
  return responseJson(response);
}

function mutationHeaders(csrf: AdminCsrfResponse): HeadersInit {
  return { [csrf.headerName]: csrf.token };
}

function normalizePage(page: number | undefined): number {
  return Number.isInteger(page) && (page ?? -1) >= 0 ? (page as number) : 0;
}

function normalizePreviewSize(size: number | undefined): 50 | 100 {
  return size === 100 ? 100 : 50;
}

function normalizeHistorySize(size: number | undefined): number {
  if (!Number.isInteger(size)) return 20;
  return Math.min(ADMIN_IMPORT_MAX_HISTORY_SIZE, Math.max(1, size as number));
}

function encodedToken(token: string): string {
  const normalized = token.trim();
  if (!normalized) throw new AdminImportApiError(410, "IMPORT_TOKEN_GONE");
  return encodeURIComponent(normalized);
}

export function buildAdminImportPreviewUrl(
  token: string,
  newPage = 0,
  changedPage = 0,
  size = ADMIN_IMPORT_DEFAULT_PREVIEW_SIZE,
): string {
  const query = new URLSearchParams({
    newPage: String(normalizePage(newPage)),
    changedPage: String(normalizePage(changedPage)),
    size: String(normalizePreviewSize(size)),
  });
  return `${ADMIN_IMPORTS_PATH}/preview/${encodedToken(token)}?${query.toString()}`;
}

export function buildAdminImportHistoryUrl(page = 0, size = 20): string {
  const query = new URLSearchParams({
    page: String(normalizePage(page)),
    size: String(normalizeHistorySize(size)),
  });
  return `${ADMIN_IMPORTS_PATH}?${query.toString()}`;
}

export async function createImportPreview(
  file: File,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminImportFetch = fetch,
): Promise<AdminImportPreview> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await execute(
    `${ADMIN_IMPORTS_PATH}/preview`,
    { method: "POST", headers: mutationHeaders(csrf), body: formData },
    fetchImplementation,
  );
  if (response.status === 422) return mapAdminImportPreview(await responseJson(response));
  if (!response.ok) throw await readError(response);
  return mapAdminImportPreview(await responseJson(response));
}

export async function getImportPreview(
  token: string,
  newPage = 0,
  changedPage = 0,
  size = ADMIN_IMPORT_DEFAULT_PREVIEW_SIZE,
  fetchImplementation: AdminImportFetch = fetch,
): Promise<AdminImportPreview> {
  return mapAdminImportPreview(
    await requestJson(
      buildAdminImportPreviewUrl(token, newPage, changedPage, size),
      { method: "GET" },
      fetchImplementation,
    ),
  );
}

export async function confirmImport(
  token: string,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminImportFetch = fetch,
): Promise<AdminImportConfirmResult> {
  return mapConfirmResult(
    await requestJson(
      `${ADMIN_IMPORTS_PATH}/${encodedToken(token)}/confirm`,
      { method: "POST", headers: mutationHeaders(csrf) },
      fetchImplementation,
    ),
  );
}

export async function cancelImport(
  token: string,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminImportFetch = fetch,
): Promise<void> {
  const response = await execute(
    `${ADMIN_IMPORTS_PATH}/${encodedToken(token)}`,
    { method: "DELETE", headers: mutationHeaders(csrf) },
    fetchImplementation,
  );
  if (!response.ok) throw await readError(response);
}

export async function getImportHistory(
  page = 0,
  size = 20,
  fetchImplementation: AdminImportFetch = fetch,
): Promise<AdminImportHistoryPage> {
  return mapHistoryPage(
    await requestJson(
      buildAdminImportHistoryUrl(page, size),
      { method: "GET" },
      fetchImplementation,
    ),
  );
}

export async function getImportDetail(
  id: number,
  fetchImplementation: AdminImportFetch = fetch,
): Promise<AdminImportDetail> {
  if (!Number.isInteger(id) || id <= 0) throw new AdminImportApiError(404, "IMPORT_NOT_FOUND");
  return mapHistoryItem(
    await requestJson(`${ADMIN_IMPORTS_PATH}/${id}`, { method: "GET" }, fetchImplementation),
  );
}

export function isAdminImportUnauthorizedError(error: unknown): boolean {
  return error instanceof AdminImportApiError && error.status === 401;
}
