import type { AdminCsrfResponse } from "@/lib/api/admin-auth";

export const ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE = 20;
export const ADMIN_PRODUCTS_MAX_PAGE_SIZE = 100;
export const ADMIN_PRODUCTS_MAX_BULK_IDS = 500;

export type AdminProductVisibility = "ALL" | "VISIBLE" | "HIDDEN";

export interface AdminProductSummary {
  erpId: string;
  erpDescription: string;
  displayName: string | null;
  manufacturer: string | null;
  category: string | null;
  reference: string | null;
  price: number | null;
  availableStock: number | null;
  visible: boolean;
}

export interface AdminProductErpControlledFields {
  erpDescription: string;
  manufacturerRaw: string | null;
  erpGroup: string | null;
  erpSubgroup: string | null;
  reference: string | null;
  partNumber: string | null;
  ncm: string | null;
  unit: string | null;
  availableStock: number | null;
  currentStock: number | null;
  retailPrice: number | null;
}

export interface AdminProductEditorialFields {
  displayName: string | null;
  visible: boolean;
}

export interface AdminProductDetail {
  erpId: string;
  erpControlled: AdminProductErpControlledFields;
  editorial: AdminProductEditorialFields;
}

export interface AdminProductPage {
  items: AdminProductSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminProductListParams {
  search?: string | undefined;
  visibility?: AdminProductVisibility | undefined;
  manufacturer?: string | undefined;
  category?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
}

export interface AdminProductEditorialUpdate {
  displayName: string | null;
  visible: boolean;
}

export interface AdminBulkVisibilityRequest {
  erpIds: string[];
  visible: boolean;
}

export interface AdminBulkVisibilityByFilterRequest {
  search?: string | undefined;
  manufacturer?: string | undefined;
  category?: string | undefined;
  currentVisibility: AdminProductVisibility;
  targetVisible: boolean;
}

export interface AdminBulkVisibilityResponse {
  updatedCount: number;
}

export class AdminProductsApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super("Não foi possível concluir a operação administrativa de produtos");
    this.name = "AdminProductsApiError";
    this.status = status;
    this.code = code;
  }
}

export type AdminProductsFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const ADMIN_PRODUCTS_PATH = "/api/admin/products";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidResponse(field: string): AdminProductsApiError {
  return new AdminProductsApiError(502, `INVALID_${field.toUpperCase()}_RESPONSE`);
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

function nullableNumber(value: unknown, field: string): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw invalidResponse(field);
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

function normalizeText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizePage(page: number | undefined): number {
  return Number.isInteger(page) && (page ?? -1) >= 0 ? (page as number) : 0;
}

function normalizeSize(size: number | undefined): number {
  if (!Number.isInteger(size)) return ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE;
  return Math.min(ADMIN_PRODUCTS_MAX_PAGE_SIZE, Math.max(1, size as number));
}

function normalizeVisibility(value: AdminProductVisibility | undefined): AdminProductVisibility {
  return value === "VISIBLE" || value === "HIDDEN" ? value : "ALL";
}

export function buildAdminProductsUrl(params: AdminProductListParams = {}): string {
  const query = new URLSearchParams();
  const search = normalizeText(params.search);
  const manufacturer = normalizeText(params.manufacturer);
  const category = normalizeText(params.category);

  if (search) query.set("search", search);
  query.set("visibility", normalizeVisibility(params.visibility));
  if (manufacturer) query.set("manufacturer", manufacturer);
  if (category) query.set("category", category);
  query.set("page", String(normalizePage(params.page)));
  query.set("size", String(normalizeSize(params.size)));

  return `${ADMIN_PRODUCTS_PATH}?${query.toString()}`;
}

export function buildAdminProductDetailUrl(erpId: string): string {
  return `${ADMIN_PRODUCTS_PATH}/${encodeURIComponent(erpId)}`;
}

export function mapAdminProductSummary(value: unknown): AdminProductSummary {
  if (!isRecord(value)) throw invalidResponse("product");
  return {
    erpId: requiredString(value["erpId"], "erpId"),
    erpDescription: requiredString(value["erpDescription"], "erpDescription"),
    displayName: nullableString(value["displayName"], "displayName"),
    manufacturer: nullableString(value["manufacturer"], "manufacturer"),
    category: nullableString(value["category"], "category"),
    reference: nullableString(value["reference"], "reference"),
    price: nullableNumber(value["price"], "price"),
    availableStock: nullableNumber(value["availableStock"], "availableStock"),
    visible: requiredBoolean(value["visible"], "visible"),
  };
}

export function mapAdminProductPage(value: unknown): AdminProductPage {
  if (!isRecord(value) || !Array.isArray(value["items"])) throw invalidResponse("page");
  return {
    items: value["items"].map(mapAdminProductSummary),
    page: nonNegativeInteger(value["page"], "page"),
    size: nonNegativeInteger(value["size"], "size"),
    totalElements: nonNegativeInteger(value["totalElements"], "totalElements"),
    totalPages: nonNegativeInteger(value["totalPages"], "totalPages"),
  };
}

export function mapAdminProductDetail(value: unknown): AdminProductDetail {
  if (!isRecord(value) || !isRecord(value["erpControlled"]) || !isRecord(value["editorial"])) {
    throw invalidResponse("product_detail");
  }
  const erpControlled = value["erpControlled"];
  const editorial = value["editorial"];
  return {
    erpId: requiredString(value["erpId"], "erpId"),
    erpControlled: {
      erpDescription: requiredString(erpControlled["erpDescription"], "erpDescription"),
      manufacturerRaw: nullableString(erpControlled["manufacturerRaw"], "manufacturerRaw"),
      erpGroup: nullableString(erpControlled["erpGroup"], "erpGroup"),
      erpSubgroup: nullableString(erpControlled["erpSubgroup"], "erpSubgroup"),
      reference: nullableString(erpControlled["reference"], "reference"),
      partNumber: nullableString(erpControlled["partNumber"], "partNumber"),
      ncm: nullableString(erpControlled["ncm"], "ncm"),
      unit: nullableString(erpControlled["unit"], "unit"),
      availableStock: nullableNumber(erpControlled["availableStock"], "availableStock"),
      currentStock: nullableNumber(erpControlled["currentStock"], "currentStock"),
      retailPrice: nullableNumber(erpControlled["retailPrice"], "retailPrice"),
    },
    editorial: {
      displayName: nullableString(editorial["displayName"], "displayName"),
      visible: requiredBoolean(editorial["visible"], "visible"),
    },
  };
}

function mapBulkResponse(value: unknown): AdminBulkVisibilityResponse {
  if (!isRecord(value)) throw invalidResponse("bulk");
  return { updatedCount: nonNegativeInteger(value["updatedCount"], "updatedCount") };
}

async function readErrorCode(response: Response): Promise<string> {
  try {
    const value: unknown = await response.json();
    if (isRecord(value) && typeof value["code"] === "string") return value["code"];
  } catch {
    // Technical response details are deliberately not exposed to the UI.
  }
  return "ADMIN_PRODUCTS_ERROR";
}

async function requestJson(
  path: string,
  init: RequestInit,
  fetchImplementation: AdminProductsFetch,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImplementation(path, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new AdminProductsApiError(0, "NETWORK_ERROR");
  }

  if (!response.ok) {
    throw new AdminProductsApiError(response.status, await readErrorCode(response));
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new AdminProductsApiError(502, "INVALID_JSON_RESPONSE");
  }
}

function writeHeaders(csrf: AdminCsrfResponse): HeadersInit {
  return {
    "Content-Type": "application/json",
    [csrf.headerName]: csrf.token,
  };
}

export async function getAdminProducts(
  params: AdminProductListParams = {},
  fetchImplementation: AdminProductsFetch = fetch,
): Promise<AdminProductPage> {
  return mapAdminProductPage(
    await requestJson(buildAdminProductsUrl(params), { method: "GET" }, fetchImplementation),
  );
}

export async function getAdminProduct(
  erpId: string,
  fetchImplementation: AdminProductsFetch = fetch,
): Promise<AdminProductDetail> {
  return mapAdminProductDetail(
    await requestJson(buildAdminProductDetailUrl(erpId), { method: "GET" }, fetchImplementation),
  );
}

export async function updateAdminProductEditorial(
  erpId: string,
  update: AdminProductEditorialUpdate,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminProductsFetch = fetch,
): Promise<AdminProductDetail> {
  return mapAdminProductDetail(
    await requestJson(
      `${buildAdminProductDetailUrl(erpId)}/editorial`,
      {
        method: "PATCH",
        headers: writeHeaders(csrf),
        body: JSON.stringify({
          displayName: update.displayName?.trim() || null,
          visible: update.visible,
        }),
      },
      fetchImplementation,
    ),
  );
}

function normalizeErpIds(erpIds: readonly string[]): string[] {
  return [...new Set(erpIds.map((erpId) => erpId.trim()).filter(Boolean))];
}

export async function bulkUpdateVisibility(
  request: AdminBulkVisibilityRequest,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminProductsFetch = fetch,
): Promise<AdminBulkVisibilityResponse> {
  const erpIds = normalizeErpIds(request.erpIds);
  if (erpIds.length === 0 || erpIds.length > ADMIN_PRODUCTS_MAX_BULK_IDS) {
    throw new AdminProductsApiError(400, "INVALID_BULK_SELECTION");
  }
  return mapBulkResponse(
    await requestJson(
      `${ADMIN_PRODUCTS_PATH}/bulk-visibility`,
      {
        method: "POST",
        headers: writeHeaders(csrf),
        body: JSON.stringify({ erpIds, visible: request.visible }),
      },
      fetchImplementation,
    ),
  );
}

export function hasAdminBulkFilterScope(
  request: Pick<AdminBulkVisibilityByFilterRequest, "search" | "manufacturer" | "category">,
): boolean {
  return Boolean(
    normalizeText(request.search) ||
    normalizeText(request.manufacturer) ||
    normalizeText(request.category),
  );
}

export async function bulkUpdateVisibilityByFilter(
  request: AdminBulkVisibilityByFilterRequest,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminProductsFetch = fetch,
): Promise<AdminBulkVisibilityResponse> {
  const normalizedRequest: AdminBulkVisibilityByFilterRequest = {
    ...(normalizeText(request.search) ? { search: normalizeText(request.search) } : {}),
    ...(normalizeText(request.manufacturer)
      ? { manufacturer: normalizeText(request.manufacturer) }
      : {}),
    ...(normalizeText(request.category) ? { category: normalizeText(request.category) } : {}),
    currentVisibility: normalizeVisibility(request.currentVisibility),
    targetVisible: request.targetVisible,
  };
  if (!hasAdminBulkFilterScope(normalizedRequest)) {
    throw new AdminProductsApiError(400, "BULK_FILTER_SCOPE_REQUIRED");
  }
  return mapBulkResponse(
    await requestJson(
      `${ADMIN_PRODUCTS_PATH}/bulk-visibility/by-filter`,
      {
        method: "POST",
        headers: writeHeaders(csrf),
        body: JSON.stringify(normalizedRequest),
      },
      fetchImplementation,
    ),
  );
}

export function isAdminProductsUnauthorizedError(error: unknown): boolean {
  return error instanceof AdminProductsApiError && error.status === 401;
}
