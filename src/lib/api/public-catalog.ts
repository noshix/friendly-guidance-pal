import type { CartItem } from "@/lib/cart";

export const PUBLIC_CATALOG_PAGE_SIZE = 24;
export const PUBLIC_CATALOG_MAX_PAGE_SIZE = 100;

export type PublicProductAvailability = "EM_ESTOQUE" | "CONSULTE_DISPONIBILIDADE";

export interface PublicProductSummary {
  erpId: string;
  name: string;
  manufacturer: string | null;
  reference: string | null;
  category: string | null;
  price: number | null;
  availability: PublicProductAvailability;
}

export interface PublicProductDetail extends PublicProductSummary {
  description: string | null;
  partNumber: string | null;
  ncm: string | null;
  unit: string | null;
  subcategory: string | null;
}

export interface PublicProductPage {
  items: PublicProductSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PublicProductListParams {
  search?: string | undefined;
  manufacturer?: string | undefined;
  category?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
}

export class PublicCatalogApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message = "Não foi possível carregar o catálogo") {
    super(message);
    this.name = "PublicCatalogApiError";
    this.status = status;
    this.code = code;
  }
}

type FetchImplementation = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const PRODUCTS_PATH = "/api/public/products";

function normalizeFilter(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizePage(page: number | undefined): number {
  return Number.isInteger(page) && (page ?? -1) >= 0 ? (page as number) : 0;
}

function normalizeSize(size: number | undefined): number {
  if (!Number.isInteger(size)) return PUBLIC_CATALOG_PAGE_SIZE;
  return Math.min(PUBLIC_CATALOG_MAX_PAGE_SIZE, Math.max(1, size as number));
}

export function buildPublicProductsUrl(params: PublicProductListParams = {}): string {
  const query = new URLSearchParams();
  const search = normalizeFilter(params.search);
  const manufacturer = normalizeFilter(params.manufacturer);
  const category = normalizeFilter(params.category);

  if (search) query.set("search", search);
  if (manufacturer) query.set("manufacturer", manufacturer);
  if (category) query.set("category", category);
  query.set("page", String(normalizePage(params.page)));
  query.set("size", String(normalizeSize(params.size)));

  return `${PRODUCTS_PATH}?${query.toString()}`;
}

export function buildPublicProductDetailUrl(erpId: string): string {
  return `${PRODUCTS_PATH}/${encodeURIComponent(erpId)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw invalidResponse(field);
  }
  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw invalidResponse(field);
  return value;
}

function nullablePrice(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw invalidResponse("price");
  }
  return value;
}

function availability(value: unknown): PublicProductAvailability {
  if (value === "EM_ESTOQUE" || value === "CONSULTE_DISPONIBILIDADE") {
    return value;
  }
  throw invalidResponse("availability");
}

function nonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw invalidResponse(field);
  }
  return value;
}

function invalidResponse(field: string): PublicCatalogApiError {
  return new PublicCatalogApiError(
    502,
    "INVALID_RESPONSE",
    `Resposta inválida do catálogo: ${field}`,
  );
}

export function mapPublicProductSummary(value: unknown): PublicProductSummary {
  if (!isRecord(value)) throw invalidResponse("product");
  return {
    erpId: requiredString(value["erpId"], "erpId"),
    name: requiredString(value["name"], "name"),
    manufacturer: nullableString(value["manufacturer"], "manufacturer"),
    reference: nullableString(value["reference"], "reference"),
    category: nullableString(value["category"], "category"),
    price: nullablePrice(value["price"]),
    availability: availability(value["availability"]),
  };
}

export function mapPublicProductDetail(value: unknown): PublicProductDetail {
  if (!isRecord(value)) throw invalidResponse("product");
  return {
    ...mapPublicProductSummary(value),
    description: nullableString(value["description"], "description"),
    partNumber: nullableString(value["partNumber"], "partNumber"),
    ncm: nullableString(value["ncm"], "ncm"),
    unit: nullableString(value["unit"], "unit"),
    subcategory: nullableString(value["subcategory"], "subcategory"),
  };
}

export function mapPublicProductPage(value: unknown): PublicProductPage {
  if (!isRecord(value) || !Array.isArray(value["items"])) {
    throw invalidResponse("page");
  }
  return {
    items: value["items"].map(mapPublicProductSummary),
    page: nonNegativeInteger(value["page"], "page"),
    size: nonNegativeInteger(value["size"], "size"),
    totalElements: nonNegativeInteger(value["totalElements"], "totalElements"),
    totalPages: nonNegativeInteger(value["totalPages"], "totalPages"),
  };
}

async function requestJson(
  url: string,
  fetchImplementation: FetchImplementation,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImplementation(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new PublicCatalogApiError(0, "NETWORK_ERROR");
  }

  if (!response.ok) {
    let code = "API_ERROR";
    try {
      const payload: unknown = await response.json();
      if (isRecord(payload) && typeof payload["code"] === "string") {
        code = payload["code"];
      }
    } catch {
      // The UI deliberately keeps technical response details private.
    }
    throw new PublicCatalogApiError(response.status, code);
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw invalidResponse("json");
  }
}

export async function fetchPublicProducts(
  params: PublicProductListParams = {},
  fetchImplementation: FetchImplementation = fetch,
): Promise<PublicProductPage> {
  const payload = await requestJson(buildPublicProductsUrl(params), fetchImplementation);
  return mapPublicProductPage(payload);
}

export async function fetchPublicProductDetail(
  erpId: string,
  fetchImplementation: FetchImplementation = fetch,
): Promise<PublicProductDetail> {
  const payload = await requestJson(buildPublicProductDetailUrl(erpId), fetchImplementation);
  return mapPublicProductDetail(payload);
}

export function formatPublicPrice(price: number | null): string {
  if (price === null || price <= 0) return "Consulte";
  return `R$ ${formatPriceValue(price)}`;
}

export function formatPriceValue(price: number | null): string | null {
  if (price === null || price <= 0) return null;
  return price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isProductInStock(productAvailability: PublicProductAvailability): boolean {
  return productAvailability === "EM_ESTOQUE";
}

export function formatAvailability(productAvailability: PublicProductAvailability): string {
  return isProductInStock(productAvailability) ? "Em estoque" : "Consulte disponibilidade";
}

export function apiPageToUiPage(page: number): number {
  return Math.max(0, Math.trunc(page)) + 1;
}

export function uiPageToApiPage(page: number): number {
  return Math.max(0, Math.trunc(page) - 1);
}

export function toCartItem(product: PublicProductSummary, quantity = 1): CartItem {
  return {
    id: product.erpId,
    name: product.name,
    brand: product.manufacturer ?? "",
    ref: product.reference ?? "N/A",
    img: "",
    quantity: Math.max(1, Math.trunc(quantity)),
    price: formatPriceValue(product.price),
    inStock: isProductInStock(product.availability),
  };
}
