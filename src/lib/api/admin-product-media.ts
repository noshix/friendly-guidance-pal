import type { AdminCsrfResponse } from "./admin-auth.ts";

export const ADMIN_PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ADMIN_PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface AdminProductImage {
  id: number;
  url: string;
  altText: string | null;
  position: number;
  primary: boolean;
  contentType: string;
}

export interface AdminProductImageUpdate {
  altText?: string | null;
  position?: number;
  primary?: boolean;
}

export type AdminProductImageUploadResult = AdminProductImage;

export interface AdminProductMediaApiErrorBody {
  code: string;
}

export class AdminProductMediaApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super("Não foi possível concluir a operação de imagens do produto");
    this.name = "AdminProductMediaApiError";
    this.status = status;
    this.code = code;
  }
}

export type AdminProductMediaFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidResponse(field: string): AdminProductMediaApiError {
  return new AdminProductMediaApiError(502, `INVALID_${field.toUpperCase()}_RESPONSE`);
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

function nonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw invalidResponse(field);
  }
  return value;
}

function positiveInteger(value: unknown, field: string): number {
  const parsed = nonNegativeInteger(value, field);
  if (parsed === 0) throw invalidResponse(field);
  return parsed;
}

function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw invalidResponse(field);
  return value;
}

export function mapAdminProductImage(value: unknown): AdminProductImage {
  if (!isRecord(value)) throw invalidResponse("image");
  return {
    id: positiveInteger(value["id"], "image_id"),
    url: requiredString(value["url"], "image_url"),
    altText: nullableString(value["altText"], "alt_text"),
    position: nonNegativeInteger(value["position"], "position"),
    primary: requiredBoolean(value["primary"], "primary"),
    contentType: requiredString(value["contentType"], "content_type"),
  };
}

function normalizedErpId(erpId: string): string {
  const value = erpId.trim();
  if (!value) throw new AdminProductMediaApiError(400, "INVALID_ERP_ID");
  return encodeURIComponent(value);
}

function normalizedImageId(imageId: number): string {
  if (!Number.isSafeInteger(imageId) || imageId <= 0) {
    throw new AdminProductMediaApiError(400, "INVALID_IMAGE_ID");
  }
  return String(imageId);
}

export function buildAdminProductImagesUrl(erpId: string): string {
  return `/api/admin/products/${normalizedErpId(erpId)}/images`;
}

export function buildAdminProductImageUrl(erpId: string, imageId: number): string {
  return `${buildAdminProductImagesUrl(erpId)}/${normalizedImageId(imageId)}`;
}

async function readError(response: Response): Promise<AdminProductMediaApiErrorBody> {
  try {
    const value: unknown = await response.json();
    if (isRecord(value) && typeof value["code"] === "string") {
      return { code: value["code"] };
    }
  } catch {
    // Technical response bodies are deliberately not exposed to the UI.
  }
  return { code: "ADMIN_PRODUCT_MEDIA_ERROR" };
}

async function execute(
  path: string,
  init: RequestInit,
  fetchImplementation: AdminProductMediaFetch,
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
    throw new AdminProductMediaApiError(0, "NETWORK_ERROR");
  }
}

async function requestJson(
  path: string,
  init: RequestInit,
  fetchImplementation: AdminProductMediaFetch,
): Promise<unknown> {
  const response = await execute(path, init, fetchImplementation);
  if (!response.ok) {
    throw new AdminProductMediaApiError(response.status, (await readError(response)).code);
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new AdminProductMediaApiError(502, "INVALID_JSON_RESPONSE");
  }
}

function csrfHeaders(csrf: AdminCsrfResponse): HeadersInit {
  return { [csrf.headerName]: csrf.token };
}

function normalizedUpdate(update: AdminProductImageUpdate): AdminProductImageUpdate {
  const result: AdminProductImageUpdate = {};
  if (Object.prototype.hasOwnProperty.call(update, "altText")) {
    result.altText = update.altText === null ? null : (update.altText?.trim() ?? null);
  }
  if (Object.prototype.hasOwnProperty.call(update, "position")) {
    const position = update.position;
    if (typeof position !== "number" || !Number.isSafeInteger(position) || position < 0) {
      throw new AdminProductMediaApiError(400, "INVALID_POSITION");
    }
    result.position = position;
  }
  if (Object.prototype.hasOwnProperty.call(update, "primary")) {
    if (typeof update.primary !== "boolean") {
      throw new AdminProductMediaApiError(400, "INVALID_PRIMARY");
    }
    result.primary = update.primary;
  }
  if (Object.keys(result).length === 0) {
    throw new AdminProductMediaApiError(400, "EMPTY_IMAGE_UPDATE");
  }
  return result;
}

export function validateProductImageFile(file: File): string | null {
  if (file.size <= 0) return "Selecione um arquivo de imagem válido.";
  if (file.size > ADMIN_PRODUCT_IMAGE_MAX_BYTES) {
    return "A imagem deve ter no máximo 5 MB.";
  }
  if (!SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return "Use uma imagem JPEG, PNG ou WEBP.";
  }
  return null;
}

export async function getProductImages(
  erpId: string,
  fetchImplementation: AdminProductMediaFetch = fetch,
): Promise<AdminProductImage[]> {
  const value = await requestJson(
    buildAdminProductImagesUrl(erpId),
    { method: "GET" },
    fetchImplementation,
  );
  if (!Array.isArray(value)) throw invalidResponse("images");
  return value.map(mapAdminProductImage);
}

export async function uploadProductImage(
  erpId: string,
  file: File,
  csrf: AdminCsrfResponse,
  altText?: string,
  primary = false,
  fetchImplementation: AdminProductMediaFetch = fetch,
): Promise<AdminProductImageUploadResult> {
  const validationError = validateProductImageFile(file);
  if (validationError) throw new AdminProductMediaApiError(400, "INVALID_IMAGE_FILE");

  const form = new FormData();
  form.set("file", file);
  const normalizedAltText = altText?.trim();
  if (normalizedAltText) form.set("altText", normalizedAltText);
  form.set("primary", String(primary));

  return mapAdminProductImage(
    await requestJson(
      buildAdminProductImagesUrl(erpId),
      { method: "POST", headers: csrfHeaders(csrf), body: form },
      fetchImplementation,
    ),
  );
}

export async function updateProductImage(
  erpId: string,
  imageId: number,
  update: AdminProductImageUpdate,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminProductMediaFetch = fetch,
): Promise<AdminProductImage> {
  return mapAdminProductImage(
    await requestJson(
      buildAdminProductImageUrl(erpId, imageId),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders(csrf) },
        body: JSON.stringify(normalizedUpdate(update)),
      },
      fetchImplementation,
    ),
  );
}

export async function deleteProductImage(
  erpId: string,
  imageId: number,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminProductMediaFetch = fetch,
): Promise<void> {
  const response = await execute(
    buildAdminProductImageUrl(erpId, imageId),
    { method: "DELETE", headers: csrfHeaders(csrf) },
    fetchImplementation,
  );
  if (!response.ok) {
    throw new AdminProductMediaApiError(response.status, (await readError(response)).code);
  }
}

export function isAdminProductMediaUnauthorizedError(error: unknown): boolean {
  return error instanceof AdminProductMediaApiError && error.status === 401;
}
