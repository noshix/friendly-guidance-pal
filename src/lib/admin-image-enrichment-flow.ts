import {
  ADMIN_IMAGE_ENRICHMENT_MAX_REVIEW_ITEMS,
  ADMIN_IMAGE_ENRICHMENT_MAX_UI_PRODUCTS,
  AdminImageEnrichmentApiError,
  type AdminImageEnrichmentCreateRequest,
  type AdminImageEnrichmentItemStatus,
  type AdminImageEnrichmentJobStatus,
} from "./api/admin-image-enrichment.ts";

export type AdminImageEnrichmentResultFilter =
  "ALL" | "IMPORTED" | "REVIEW" | "NO_CANDIDATE" | "FAILED" | "SKIPPED";

export interface AdminImageEnrichmentFormValues {
  manufacturer: string;
  group: string;
  subgroup: string;
  visibility: "ALL" | "VISIBLE" | "HIDDEN";
  onlyWithoutImage: boolean;
  maxProducts: number;
  erpIdsText: string;
  autoImport: boolean;
}

export const DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM: AdminImageEnrichmentFormValues = {
  manufacturer: "",
  group: "",
  subgroup: "",
  visibility: "ALL",
  onlyWithoutImage: true,
  maxProducts: 100,
  erpIdsText: "",
  autoImport: true,
};

export function parseAdminImageEnrichmentErpIds(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function buildAdminImageEnrichmentRequest(
  values: AdminImageEnrichmentFormValues,
): AdminImageEnrichmentCreateRequest {
  if (
    !Number.isInteger(values.maxProducts) ||
    values.maxProducts < 1 ||
    values.maxProducts > ADMIN_IMAGE_ENRICHMENT_MAX_UI_PRODUCTS
  ) {
    throw new Error("A quantidade deve estar entre 1 e 100 produtos.");
  }
  const erpIds = parseAdminImageEnrichmentErpIds(values.erpIdsText);
  if (erpIds.length > values.maxProducts) {
    throw new Error("A lista de ERP IDs excede a quantidade máxima do lote.");
  }
  const scope: AdminImageEnrichmentCreateRequest["scope"] = {
    onlyWithoutImage: values.onlyWithoutImage,
  };
  if (erpIds.length) scope.erpIds = erpIds;
  if (values.manufacturer.trim()) scope.manufacturer = values.manufacturer.trim();
  if (values.group.trim()) scope.group = values.group.trim();
  if (values.subgroup.trim()) scope.subgroup = values.subgroup.trim();
  if (values.visibility !== "ALL") scope.visible = values.visibility === "VISIBLE";
  if (
    !scope.onlyWithoutImage &&
    !scope.erpIds?.length &&
    !scope.manufacturer &&
    !scope.group &&
    !scope.subgroup &&
    scope.visible === undefined
  ) {
    throw new Error("Informe ao menos um filtro para limitar o lote.");
  }
  return { scope, maxProducts: values.maxProducts, autoImport: values.autoImport };
}

export function adminImageEnrichmentStatusesForFilter(
  filter: AdminImageEnrichmentResultFilter,
): AdminImageEnrichmentItemStatus[] {
  const statuses: Record<AdminImageEnrichmentResultFilter, AdminImageEnrichmentItemStatus[]> = {
    ALL: [],
    IMPORTED: ["AUTO_IMPORTED", "AUTO_IMPORT_READY"],
    REVIEW: ["REVIEW_REQUIRED", "REVIEW_PROCESSING"],
    NO_CANDIDATE: ["NO_CANDIDATE"],
    FAILED: ["FAILED"],
    SKIPPED: ["SKIPPED_ALREADY_HAS_IMAGE", "SKIPPED_DUPLICATE", "REJECTED_BY_ADMIN", "CANCELLED"],
  };
  return statuses[filter];
}

export function adminImageEnrichmentPollingInterval(
  status: AdminImageEnrichmentJobStatus | undefined,
): number | false {
  return status === "PENDING" || status === "RUNNING" ? 3_000 : false;
}

export function adminImageEnrichmentCanPause(status: AdminImageEnrichmentJobStatus): boolean {
  return status === "PENDING" || status === "RUNNING";
}

export function adminImageEnrichmentCanResume(status: AdminImageEnrichmentJobStatus): boolean {
  return status === "PAUSED";
}

export function adminImageEnrichmentCanCancel(status: AdminImageEnrichmentJobStatus): boolean {
  return status === "PENDING" || status === "RUNNING" || status === "PAUSED";
}

export function validateAdminImageEnrichmentReviewSelection(itemIds: number[]): number[] {
  const normalized = [...new Set(itemIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (!normalized.length) throw new Error("Selecione ao menos um item para revisar.");
  if (normalized.length > ADMIN_IMAGE_ENRICHMENT_MAX_REVIEW_ITEMS) {
    throw new Error("Revise no máximo 25 itens por operação.");
  }
  return normalized;
}

export function describeAdminImageEnrichmentError(error: unknown): string {
  if (!(error instanceof AdminImageEnrichmentApiError)) {
    return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
  }
  if (error.status === 0) return "Falha de rede. Verifique sua conexão e tente novamente.";
  if (error.status === 400) return "Revise os filtros e a quantidade informada.";
  if (error.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
  if (error.status === 403) return "Acesso negado. Atualize a sessão e tente novamente.";
  if (error.status === 404) return "O lote ou item solicitado não foi encontrado.";
  if (error.status === 409 || error.status === 410)
    return "O estado do lote mudou. Atualize os dados e tente novamente.";
  if (error.status === 413) return "A solicitação excedeu o limite permitido.";
  if (error.status === 422) return "A solicitação possui dados inválidos.";
  if (error.status === 429)
    return "O provedor de imagens pausou temporariamente este lote. Tente retomá-lo quando a cota estiver disponível.";
  return "O servidor não conseguiu concluir a operação. Tente novamente mais tarde.";
}

export function adminImageEnrichmentJobLabel(status: AdminImageEnrichmentJobStatus): string {
  return {
    PENDING: "Aguardando",
    RUNNING: "Em processamento",
    PAUSED: "Pausado",
    COMPLETED: "Concluído",
    FAILED: "Falhou",
    CANCELLED: "Cancelado",
  }[status];
}

export function adminImageEnrichmentItemLabel(status: AdminImageEnrichmentItemStatus): string {
  return {
    PENDING: "Aguardando",
    SEARCHING: "Buscando",
    AUTO_IMPORTED: "Importado",
    AUTO_IMPORT_READY: "Seguro no dry-run",
    REVIEW_REQUIRED: "Revisão necessária",
    REVIEW_PROCESSING: "Aprovando",
    REJECTED_BY_ADMIN: "Rejeitado",
    NO_CANDIDATE: "Sem candidato",
    FAILED: "Falhou",
    SKIPPED_ALREADY_HAS_IMAGE: "Já possui imagem",
    SKIPPED_DUPLICATE: "Imagem duplicada",
    CANCELLED: "Cancelado",
  }[status];
}
