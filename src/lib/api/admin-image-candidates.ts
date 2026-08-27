export type AdminImageCandidateMatch =
  "EXACT_REFERENCE" | "EXACT_PART_NUMBER" | "EXACT_EAN" | "MANUFACTURER_AND_NAME" | "NAME_ONLY";

export type AdminImageCandidateConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AdminImageCandidateProductContext {
  erpId: string;
  erpDescription: string;
  manufacturer: string | null;
  reference: string | null;
  partNumber: string | null;
  ean: string | null;
}

export interface AdminImageCandidate {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  sourcePageUrl: string | null;
  sourceDomain: string | null;
  title: string | null;
  matchedBy: AdminImageCandidateMatch;
  confidence: AdminImageCandidateConfidence;
  width: number | null;
  height: number | null;
}

export interface AdminImageCandidateResponse {
  product: AdminImageCandidateProductContext;
  candidates: AdminImageCandidate[];
}

export interface AdminImageCandidateApiErrorBody {
  code: string;
}

export class AdminImageCandidateApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super("Não foi possível buscar imagens candidatas");
    this.name = "AdminImageCandidateApiError";
    this.status = status;
    this.code = code;
  }
}

export type AdminImageCandidateFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const MATCH_VALUES = new Set<AdminImageCandidateMatch>([
  "EXACT_REFERENCE",
  "EXACT_PART_NUMBER",
  "EXACT_EAN",
  "MANUFACTURER_AND_NAME",
  "NAME_ONLY",
]);
const CONFIDENCE_VALUES = new Set<AdminImageCandidateConfidence>(["HIGH", "MEDIUM", "LOW"]);
const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);
const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".home", ".lan"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidResponse(field: string): AdminImageCandidateApiError {
  return new AdminImageCandidateApiError(502, `INVALID_${field.toUpperCase()}_RESPONSE`);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) throw invalidResponse(field);
  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw invalidResponse(field);
  return value;
}

function nullablePositiveInteger(value: unknown, field: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw invalidResponse(field);
  }
  return value;
}

function enumValue<T extends string>(value: unknown, values: Set<T>, field: string): T {
  if (typeof value !== "string" || !values.has(value as T)) throw invalidResponse(field);
  return value as T;
}

function safePublicHttpUrl(value: unknown, field: string, nullable = false): string | null {
  if ((value === null || value === undefined) && nullable) return null;
  const text = requiredString(value, field);
  try {
    const url = new URL(text);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const numericHost = /^[0-9.]+$/.test(hostname) || hostname.includes(":");
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      !hostname ||
      numericHost ||
      BLOCKED_HOSTS.has(hostname) ||
      BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
    ) {
      throw invalidResponse(field);
    }
    return url.toString();
  } catch (error) {
    if (error instanceof AdminImageCandidateApiError) throw error;
    throw invalidResponse(field);
  }
}

function mapProductContext(value: unknown): AdminImageCandidateProductContext {
  if (!isRecord(value)) throw invalidResponse("product");
  return {
    erpId: requiredString(value["erpId"], "product_erp_id"),
    erpDescription: requiredString(value["erpDescription"], "product_erp_description"),
    manufacturer: nullableString(value["manufacturer"], "product_manufacturer"),
    reference: nullableString(value["reference"], "product_reference"),
    partNumber: nullableString(value["partNumber"], "product_part_number"),
    ean: nullableString(value["ean"], "product_ean"),
  };
}

export function mapAdminImageCandidate(value: unknown): AdminImageCandidate {
  if (!isRecord(value)) throw invalidResponse("candidate");
  return {
    id: requiredString(value["id"], "candidate_id"),
    imageUrl: safePublicHttpUrl(value["imageUrl"], "candidate_image_url") as string,
    thumbnailUrl: safePublicHttpUrl(value["thumbnailUrl"], "candidate_thumbnail_url", true),
    sourcePageUrl: safePublicHttpUrl(value["sourcePageUrl"], "candidate_source_url", true),
    sourceDomain: nullableString(value["sourceDomain"], "candidate_source_domain"),
    title: nullableString(value["title"], "candidate_title"),
    matchedBy: enumValue(value["matchedBy"], MATCH_VALUES, "candidate_matched_by"),
    confidence: enumValue(value["confidence"], CONFIDENCE_VALUES, "candidate_confidence"),
    width: nullablePositiveInteger(value["width"], "candidate_width"),
    height: nullablePositiveInteger(value["height"], "candidate_height"),
  };
}

export function mapAdminImageCandidateResponse(value: unknown): AdminImageCandidateResponse {
  if (!isRecord(value) || !Array.isArray(value["candidates"])) {
    throw invalidResponse("candidates");
  }
  return {
    product: mapProductContext(value["product"]),
    candidates: value["candidates"].map(mapAdminImageCandidate),
  };
}

function normalizedErpId(erpId: string): string {
  const value = erpId.trim();
  if (!value) throw new AdminImageCandidateApiError(400, "INVALID_ERP_ID");
  return encodeURIComponent(value);
}

function normalizedLimit(limit?: number): string {
  if (limit === undefined) return "";
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10) {
    throw new AdminImageCandidateApiError(400, "INVALID_LIMIT");
  }
  return `?limit=${limit}`;
}

export function buildAdminImageCandidatesUrl(erpId: string, limit?: number): string {
  return `/api/admin/products/${normalizedErpId(erpId)}/image-candidates${normalizedLimit(limit)}`;
}

async function readError(response: Response): Promise<AdminImageCandidateApiErrorBody> {
  try {
    const value: unknown = await response.json();
    if (isRecord(value) && typeof value["code"] === "string") return { code: value["code"] };
  } catch {
    // Technical response bodies are deliberately not exposed to the UI.
  }
  return { code: "ADMIN_IMAGE_CANDIDATE_ERROR" };
}

export async function getAdminImageCandidates(
  erpId: string,
  limit?: number,
  fetchImplementation: AdminImageCandidateFetch = fetch,
): Promise<AdminImageCandidateResponse> {
  const path = buildAdminImageCandidatesUrl(erpId, limit);
  let response: Response;
  try {
    response = await fetchImplementation(path, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new AdminImageCandidateApiError(0, "NETWORK_ERROR");
  }
  if (!response.ok) {
    throw new AdminImageCandidateApiError(response.status, (await readError(response)).code);
  }
  try {
    return mapAdminImageCandidateResponse((await response.json()) as unknown);
  } catch (error) {
    if (error instanceof AdminImageCandidateApiError) throw error;
    throw new AdminImageCandidateApiError(502, "INVALID_JSON_RESPONSE");
  }
}

export function isAdminImageCandidatesUnauthorizedError(error: unknown): boolean {
  return error instanceof AdminImageCandidateApiError && error.status === 401;
}
