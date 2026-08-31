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

export function adminImageCandidateImportErrorMessage(error: unknown): string {
  if (!(error instanceof AdminImageCandidateApiError)) {
    return "Não foi possível adicionar a imagem. Tente novamente.";
  }
  if (error.status === 400) {
    return "Esta sugestão ou os dados informados não são válidos. Busque as imagens novamente.";
  }
  if (error.status === 403) {
    return "Acesso negado. Atualize a página e tente novamente.";
  }
  if (error.status === 404 || error.status === 410) {
    return "Esta sugestão não está mais disponível. Busque as imagens novamente.";
  }
  if (error.status === 409) {
    return "Esta imagem já foi adicionada ao produto.";
  }
  if (error.status === 413) {
    return "A imagem encontrada é grande demais para ser importada.";
  }
  if (error.status === 422) {
    return "A imagem encontrada não pôde ser validada.";
  }
  if (error.status === 0) {
    return "Não foi possível conectar ao servidor para importar a imagem.";
  }
  if (error.status >= 500) {
    return "O serviço de imagens está temporariamente indisponível. Tente novamente.";
  }
  return "Não foi possível adicionar a imagem. Tente novamente.";
}

export function defaultPrimaryForCandidateImport(hasPrimaryImage: boolean): boolean {
  return !hasPrimaryImage;
}
