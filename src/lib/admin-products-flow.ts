import type {
  AdminBulkVisibilityByFilterRequest,
  AdminProductListParams,
  AdminProductVisibility,
} from "@/lib/api/admin-products";

export interface AdminProductFilterScope {
  search?: string | undefined;
  manufacturer?: string | undefined;
  category?: string | undefined;
  visibility?: AdminProductVisibility | undefined;
}

function normalized(value: string | undefined): string | undefined {
  const result = value?.trim();
  return result ? result : undefined;
}

export function toggleAdminProductSelection(
  selected: ReadonlySet<string>,
  erpId: string,
): Set<string> {
  const next = new Set(selected);
  if (next.has(erpId)) next.delete(erpId);
  else next.add(erpId);
  return next;
}

export function toggleAdminProductPageSelection(
  selected: ReadonlySet<string>,
  pageErpIds: readonly string[],
): Set<string> {
  const next = new Set(selected);
  const normalizedIds = [...new Set(pageErpIds)];
  const allSelected = normalizedIds.length > 0 && normalizedIds.every((erpId) => next.has(erpId));
  for (const erpId of normalizedIds) {
    if (allSelected) next.delete(erpId);
    else next.add(erpId);
  }
  return next;
}

export function buildAdminBulkFilterRequest(
  filters: AdminProductFilterScope,
  targetVisible: boolean,
): AdminBulkVisibilityByFilterRequest | null {
  const search = normalized(filters.search);
  const manufacturer = normalized(filters.manufacturer);
  const category = normalized(filters.category);
  if (!search && !manufacturer && !category) return null;
  return {
    ...(search ? { search } : {}),
    ...(manufacturer ? { manufacturer } : {}),
    ...(category ? { category } : {}),
    currentVisibility: filters.visibility ?? "ALL",
    targetVisible,
  };
}

export function describeAdminBulkFilter(filters: AdminProductFilterScope): string[] {
  const scope: string[] = [];
  const search = normalized(filters.search);
  const manufacturer = normalized(filters.manufacturer);
  const category = normalized(filters.category);
  if (search) scope.push(`Busca: ${search}`);
  if (manufacturer) scope.push(`Fabricante: ${manufacturer}`);
  if (category) scope.push(`Categoria: ${category}`);
  if (filters.visibility === "VISIBLE") scope.push("Visibilidade atual: Publicados");
  if (filters.visibility === "HIDDEN") scope.push("Visibilidade atual: Ocultos");
  if (!filters.visibility || filters.visibility === "ALL") {
    scope.push("Visibilidade atual: Todos");
  }
  return scope;
}

export function normalizeAdminProductListParams(
  params: AdminProductListParams,
): AdminProductListParams {
  return {
    ...(normalized(params.search) ? { search: normalized(params.search) } : {}),
    visibility: params.visibility ?? "ALL",
    ...(normalized(params.manufacturer) ? { manufacturer: normalized(params.manufacturer) } : {}),
    ...(normalized(params.category) ? { category: normalized(params.category) } : {}),
    page: Math.max(0, Math.trunc(params.page ?? 0)),
    size: Math.max(1, Math.trunc(params.size ?? 20)),
  };
}

export function formatAdminPrice(price: number | null): string {
  if (price === null) return "—";
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAdminQuantity(quantity: number | null): string {
  if (quantity === null) return "—";
  return quantity.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
}
