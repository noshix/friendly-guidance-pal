import {
  AdminImageCandidateApiError,
  type AdminImageCandidate,
  type AdminImageCandidateConfidence,
  type AdminImageCandidateMatch,
} from "./api/admin-image-candidates.ts";

const MATCH_LABELS: Record<AdminImageCandidateMatch, string> = {
  EXACT_REFERENCE: "Referência exata",
  EXACT_PART_NUMBER: "Part number exato",
  EXACT_EAN: "EAN exato",
  MANUFACTURER_AND_NAME: "Fabricante + descrição",
  NAME_ONLY: "Apenas descrição",
};

const CONFIDENCE_LABELS: Record<AdminImageCandidateConfidence, string> = {
  HIGH: "Alta confiança",
  MEDIUM: "Média confiança",
  LOW: "Baixa confiança",
};

export function adminImageCandidateMatchLabel(value: AdminImageCandidateMatch): string {
  return MATCH_LABELS[value];
}

export function adminImageCandidateConfidenceLabel(value: AdminImageCandidateConfidence): string {
  return CONFIDENCE_LABELS[value];
}

export function adminImageCandidatePreviewSources(candidate: AdminImageCandidate): string[] {
  return [...new Set([candidate.thumbnailUrl, candidate.imageUrl].filter(Boolean) as string[])];
}

export function adminImageCandidateErrorMessage(error: unknown): string {
  if (!(error instanceof AdminImageCandidateApiError)) {
    return "Não foi possível buscar imagens candidatas. Tente novamente.";
  }
  if (error.status === 404 || error.code === "PRODUCT_NOT_FOUND") {
    return "Produto não encontrado.";
  }
  if (error.status === 429) {
    return "O limite temporário da busca foi atingido. Tente novamente mais tarde.";
  }
  if ([500, 502, 503].includes(error.status)) {
    return "A fonte externa de imagens está temporariamente indisponível.";
  }
  if (error.status === 0) {
    return "Não foi possível conectar ao serviço de busca de imagens.";
  }
  return "Não foi possível buscar imagens candidatas. Tente novamente.";
}
