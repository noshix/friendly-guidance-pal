import type { AdminCsrfResponse } from "./admin-auth.ts";

export const ADMIN_IMAGE_ENRICHMENT_MAX_UI_PRODUCTS = 100;
export const ADMIN_IMAGE_ENRICHMENT_MAX_REVIEW_ITEMS = 25;

export type AdminImageEnrichmentJobStatus =
  "PENDING" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED" | "CANCELLED";

export type AdminImageEnrichmentItemStatus =
  | "PENDING"
  | "SEARCHING"
  | "AUTO_IMPORTED"
  | "AUTO_IMPORT_READY"
  | "REVIEW_REQUIRED"
  | "REVIEW_PROCESSING"
  | "REJECTED_BY_ADMIN"
  | "NO_CANDIDATE"
  | "FAILED"
  | "SKIPPED_ALREADY_HAS_IMAGE"
  | "SKIPPED_DUPLICATE"
  | "CANCELLED";

export type AdminImageEnrichmentDecision = "AUTO_IMPORT" | "REVIEW" | "REJECT";
export type AdminImageEnrichmentConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AdminImageEnrichmentScope {
  erpIds?: string[];
  onlyWithoutImage?: boolean;
  manufacturer?: string;
  group?: string;
  subgroup?: string;
  visible?: boolean;
}

export interface AdminImageEnrichmentCreateRequest {
  scope: AdminImageEnrichmentScope;
  maxProducts: number;
  autoImport: boolean;
}

export interface AdminImageEnrichmentProgress {
  total: number;
  processed: number;
  pending: number;
  autoImported: number;
  readyForAutoImport: number;
  reviewRequired: number;
  noCandidate: number;
  failed: number;
  skipped: number;
  percentage: number;
}

export interface AdminImageEnrichmentJob {
  id: number;
  status: AdminImageEnrichmentJobStatus;
  createdBy: string;
  autoImport: boolean;
  maxProducts: number;
  filterSnapshot: string;
  progress: AdminImageEnrichmentProgress;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  updatedAt: string;
}

export interface AdminImageEnrichmentCandidate {
  imageUrl: string;
  thumbnailUrl: string | null;
  sourcePageUrl: string | null;
  sourceDomain: string | null;
  sourceProvider: string | null;
  title: string | null;
  matchedBy: string;
  confidence: AdminImageEnrichmentConfidence;
}

export interface AdminImageEnrichmentItem {
  id: number;
  erpId: string;
  productName: string;
  manufacturer: string | null;
  reference: string | null;
  partNumber: string | null;
  status: AdminImageEnrichmentItemStatus;
  attemptCount: number;
  automationDecision: AdminImageEnrichmentDecision | null;
  candidate: AdminImageEnrichmentCandidate | null;
  importedImageId: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  updatedAt: string;
}

export interface AdminImageEnrichmentPage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminImageEnrichmentReviewResult {
  itemId: number;
  status: AdminImageEnrichmentItemStatus;
  errorCode: string | null;
  message: string | null;
}

export interface AdminImageEnrichmentReviewBatch {
  requested: number;
  succeeded: number;
  failed: number;
  results: AdminImageEnrichmentReviewResult[];
}

export class AdminImageEnrichmentApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super("Não foi possível concluir a operação de enriquecimento de imagens");
    this.name = "AdminImageEnrichmentApiError";
    this.status = status;
    this.code = code;
  }
}

export type AdminImageEnrichmentFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const BASE_PATH = "/api/admin/image-enrichment/jobs";
const JOB_STATUSES = new Set<AdminImageEnrichmentJobStatus>([
  "PENDING",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);
const ITEM_STATUSES = new Set<AdminImageEnrichmentItemStatus>([
  "PENDING",
  "SEARCHING",
  "AUTO_IMPORTED",
  "AUTO_IMPORT_READY",
  "REVIEW_REQUIRED",
  "REVIEW_PROCESSING",
  "REJECTED_BY_ADMIN",
  "NO_CANDIDATE",
  "FAILED",
  "SKIPPED_ALREADY_HAS_IMAGE",
  "SKIPPED_DUPLICATE",
  "CANCELLED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(field: string): AdminImageEnrichmentApiError {
  return new AdminImageEnrichmentApiError(502, `INVALID_${field.toUpperCase()}_RESPONSE`);
}

function integer(value: unknown, field: string, positive = false): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < (positive ? 1 : 0)) {
    throw invalid(field);
  }
  return value;
}

function decimal(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw invalid(field);
  }
  return value;
}

function string(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) throw invalid(field);
  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw invalid(field);
  return value;
}

function boolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw invalid(field);
  return value;
}

function enumValue<T extends string>(value: unknown, values: Set<T>, field: string): T {
  if (typeof value !== "string" || !values.has(value as T)) throw invalid(field);
  return value as T;
}

function mapProgress(value: unknown): AdminImageEnrichmentProgress {
  if (!isRecord(value)) throw invalid("progress");
  return {
    total: integer(value["total"], "progress_total"),
    processed: integer(value["processed"], "progress_processed"),
    pending: integer(value["pending"], "progress_pending"),
    autoImported: integer(value["autoImported"], "progress_auto_imported"),
    readyForAutoImport: integer(value["readyForAutoImport"], "progress_ready"),
    reviewRequired: integer(value["reviewRequired"], "progress_review"),
    noCandidate: integer(value["noCandidate"], "progress_no_candidate"),
    failed: integer(value["failed"], "progress_failed"),
    skipped: integer(value["skipped"], "progress_skipped"),
    percentage: decimal(value["percentage"], "progress_percentage"),
  };
}

export function mapAdminImageEnrichmentJob(value: unknown): AdminImageEnrichmentJob {
  if (!isRecord(value)) throw invalid("job");
  return {
    id: integer(value["id"], "job_id", true),
    status: enumValue(value["status"], JOB_STATUSES, "job_status"),
    createdBy: string(value["createdBy"], "created_by"),
    autoImport: boolean(value["autoImport"], "auto_import"),
    maxProducts: integer(value["maxProducts"], "max_products", true),
    filterSnapshot: string(value["filterSnapshot"], "filter_snapshot"),
    progress: mapProgress(value["progress"]),
    lastErrorCode: nullableString(value["lastErrorCode"], "last_error_code"),
    lastErrorMessage: nullableString(value["lastErrorMessage"], "last_error_message"),
    createdAt: string(value["createdAt"], "created_at"),
    startedAt: nullableString(value["startedAt"], "started_at"),
    finishedAt: nullableString(value["finishedAt"], "finished_at"),
    updatedAt: string(value["updatedAt"], "updated_at"),
  };
}

function safePublicUrl(value: unknown, field: string, nullable = false): string | null {
  if (nullable && value === null) return null;
  const candidate = string(value, field);
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw invalid(field);
    return url.toString();
  } catch (error) {
    if (error instanceof AdminImageEnrichmentApiError) throw error;
    throw invalid(field);
  }
}

function mapCandidate(value: unknown): AdminImageEnrichmentCandidate | null {
  if (value === null) return null;
  if (!isRecord(value)) throw invalid("candidate");
  return {
    imageUrl: safePublicUrl(value["imageUrl"], "candidate_image_url") as string,
    thumbnailUrl: safePublicUrl(value["thumbnailUrl"], "candidate_thumbnail_url", true),
    sourcePageUrl: safePublicUrl(value["sourcePageUrl"], "candidate_source_page_url", true),
    sourceDomain: nullableString(value["sourceDomain"], "candidate_source_domain"),
    sourceProvider: nullableString(value["sourceProvider"], "candidate_source_provider"),
    title: nullableString(value["title"], "candidate_title"),
    matchedBy: string(value["matchedBy"], "candidate_matched_by"),
    confidence: enumValue(
      value["confidence"],
      new Set<AdminImageEnrichmentConfidence>(["HIGH", "MEDIUM", "LOW"]),
      "candidate_confidence",
    ),
  };
}

export function mapAdminImageEnrichmentItem(value: unknown): AdminImageEnrichmentItem {
  if (!isRecord(value)) throw invalid("item");
  const decision = value["automationDecision"];
  if (decision !== null && !["AUTO_IMPORT", "REVIEW", "REJECT"].includes(String(decision))) {
    throw invalid("automation_decision");
  }
  return {
    id: integer(value["id"], "item_id", true),
    erpId: string(value["erpId"], "erp_id"),
    productName: string(value["productName"], "product_name"),
    manufacturer: nullableString(value["manufacturer"], "manufacturer"),
    reference: nullableString(value["reference"], "reference"),
    partNumber: nullableString(value["partNumber"], "part_number"),
    status: enumValue(value["status"], ITEM_STATUSES, "item_status"),
    attemptCount: integer(value["attemptCount"], "attempt_count"),
    automationDecision: decision as AdminImageEnrichmentDecision | null,
    candidate: mapCandidate(value["candidate"]),
    importedImageId:
      value["importedImageId"] === null
        ? null
        : integer(value["importedImageId"], "imported_image_id", true),
    errorCode: nullableString(value["errorCode"], "error_code"),
    errorMessage: nullableString(value["errorMessage"], "error_message"),
    createdAt: string(value["createdAt"], "item_created_at"),
    startedAt: nullableString(value["startedAt"], "item_started_at"),
    finishedAt: nullableString(value["finishedAt"], "item_finished_at"),
    updatedAt: string(value["updatedAt"], "item_updated_at"),
  };
}

function mapPage<T>(value: unknown, mapper: (item: unknown) => T): AdminImageEnrichmentPage<T> {
  if (!isRecord(value) || !Array.isArray(value["items"])) throw invalid("page");
  return {
    items: value["items"].map(mapper),
    page: integer(value["page"], "page_number"),
    size: integer(value["size"], "page_size"),
    totalElements: integer(value["totalElements"], "total_elements"),
    totalPages: integer(value["totalPages"], "total_pages"),
  };
}

function mapReviewBatch(value: unknown): AdminImageEnrichmentReviewBatch {
  if (!isRecord(value) || !Array.isArray(value["results"])) throw invalid("review_batch");
  return {
    requested: integer(value["requested"], "review_requested"),
    succeeded: integer(value["succeeded"], "review_succeeded"),
    failed: integer(value["failed"], "review_failed"),
    results: value["results"].map((item) => {
      if (!isRecord(item)) throw invalid("review_result");
      return {
        itemId: integer(item["itemId"], "review_item_id", true),
        status: enumValue(item["status"], ITEM_STATUSES, "review_item_status"),
        errorCode: nullableString(item["errorCode"], "review_error_code"),
        message: nullableString(item["message"], "review_message"),
      };
    }),
  };
}

async function readError(response: Response): Promise<AdminImageEnrichmentApiError> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body) && typeof body["code"] === "string") {
      return new AdminImageEnrichmentApiError(response.status, body["code"]);
    }
  } catch {
    // Technical bodies are deliberately hidden from the UI.
  }
  return new AdminImageEnrichmentApiError(response.status, "IMAGE_ENRICHMENT_ERROR");
}

async function request(
  path: string,
  init: RequestInit,
  fetchImplementation: AdminImageEnrichmentFetch,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImplementation(path, {
      ...init,
      credentials: "include",
      headers: { Accept: "application/json", ...init.headers },
    });
  } catch {
    throw new AdminImageEnrichmentApiError(0, "NETWORK_ERROR");
  }
  if (!response.ok) throw await readError(response);
  try {
    return (await response.json()) as unknown;
  } catch {
    throw invalid("json");
  }
}

function csrfHeaders(csrf: AdminCsrfResponse): HeadersInit {
  return { "Content-Type": "application/json", [csrf.headerName]: csrf.token };
}

function pageQuery(page: number, size: number): URLSearchParams {
  return new URLSearchParams({
    page: String(Math.max(0, Number.isInteger(page) ? page : 0)),
    size: String(Math.min(100, Math.max(1, Number.isInteger(size) ? size : 20))),
  });
}

export async function createAdminImageEnrichmentJob(
  payload: AdminImageEnrichmentCreateRequest,
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminImageEnrichmentFetch = fetch,
): Promise<AdminImageEnrichmentJob> {
  return mapAdminImageEnrichmentJob(
    await request(
      BASE_PATH,
      { method: "POST", headers: csrfHeaders(csrf), body: JSON.stringify(payload) },
      fetchImplementation,
    ),
  );
}

export async function getAdminImageEnrichmentJobs(
  page = 0,
  size = 20,
  fetchImplementation: AdminImageEnrichmentFetch = fetch,
): Promise<AdminImageEnrichmentPage<AdminImageEnrichmentJob>> {
  return mapPage(
    await request(`${BASE_PATH}?${pageQuery(page, size)}`, { method: "GET" }, fetchImplementation),
    mapAdminImageEnrichmentJob,
  );
}

export async function getAdminImageEnrichmentJob(
  jobId: number,
  fetchImplementation: AdminImageEnrichmentFetch = fetch,
): Promise<AdminImageEnrichmentJob> {
  return mapAdminImageEnrichmentJob(
    await request(`${BASE_PATH}/${jobId}`, { method: "GET" }, fetchImplementation),
  );
}

export async function getAdminImageEnrichmentItems(
  jobId: number,
  statuses: AdminImageEnrichmentItemStatus[] = [],
  page = 0,
  size = 20,
  fetchImplementation: AdminImageEnrichmentFetch = fetch,
): Promise<AdminImageEnrichmentPage<AdminImageEnrichmentItem>> {
  const query = pageQuery(page, size);
  statuses.forEach((status) => query.append("status", status));
  return mapPage(
    await request(`${BASE_PATH}/${jobId}/items?${query}`, { method: "GET" }, fetchImplementation),
    mapAdminImageEnrichmentItem,
  );
}

export async function mutateAdminImageEnrichmentJob(
  jobId: number,
  action: "pause" | "resume" | "cancel",
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminImageEnrichmentFetch = fetch,
): Promise<AdminImageEnrichmentJob> {
  return mapAdminImageEnrichmentJob(
    await request(
      `${BASE_PATH}/${jobId}/${action}`,
      { method: "POST", headers: csrfHeaders(csrf) },
      fetchImplementation,
    ),
  );
}

export async function reviewAdminImageEnrichmentItems(
  jobId: number,
  action: "approve" | "reject",
  itemIds: number[],
  csrf: AdminCsrfResponse,
  fetchImplementation: AdminImageEnrichmentFetch = fetch,
): Promise<AdminImageEnrichmentReviewBatch> {
  return mapReviewBatch(
    await request(
      `${BASE_PATH}/${jobId}/reviews/${action}`,
      {
        method: "POST",
        headers: csrfHeaders(csrf),
        body: JSON.stringify({ itemIds }),
      },
      fetchImplementation,
    ),
  );
}

export function isAdminImageEnrichmentUnauthorized(error: unknown): boolean {
  return error instanceof AdminImageEnrichmentApiError && error.status === 401;
}
