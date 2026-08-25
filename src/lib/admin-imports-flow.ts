import {
  ADMIN_IMPORT_MAX_FILE_BYTES,
  AdminImportApiError,
  type AdminImportPreview,
} from "./api/admin-imports.ts";

export interface ActiveAdminImport {
  token: string;
  sourceFilename: string;
  initialPreview: AdminImportPreview;
}

export type AdminImportFileValidationCode =
  "FILE_REQUIRED" | "FILE_EMPTY" | "FILE_TYPE_INVALID" | "FILE_TOO_LARGE";

export interface AdminImportFileValidation {
  code: AdminImportFileValidationCode;
  message: string;
}

let activeImport: ActiveAdminImport | null = null;

export function validateAdminImportFile(file: File | null): AdminImportFileValidation | null {
  if (!file) return { code: "FILE_REQUIRED", message: "Selecione uma planilha XLSX." };
  if (file.size === 0) return { code: "FILE_EMPTY", message: "O arquivo selecionado está vazio." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { code: "FILE_TYPE_INVALID", message: "Selecione um arquivo com extensão .xlsx." };
  }
  if (file.size > ADMIN_IMPORT_MAX_FILE_BYTES) {
    return {
      code: "FILE_TOO_LARGE",
      message: "O arquivo excede o limite de 20 MB da importação.",
    };
  }
  return null;
}

export function rememberActiveAdminImport(preview: AdminImportPreview): ActiveAdminImport {
  if (!preview.canConfirm || !preview.token) {
    throw new AdminImportApiError(422, "IMPORT_PREVIEW_NOT_CONFIRMABLE");
  }
  activeImport = {
    token: preview.token,
    sourceFilename: preview.sourceFilename ?? "planilha ERP",
    initialPreview: preview,
  };
  return activeImport;
}

export function getActiveAdminImport(): ActiveAdminImport | null {
  return activeImport;
}

export function clearActiveAdminImport(): void {
  activeImport = null;
}

export function describeAdminImportError(error: unknown): string {
  if (!(error instanceof AdminImportApiError)) {
    return "Não foi possível concluir a operação. Tente novamente.";
  }
  if (error.status === 0) return "Falha de rede. Verifique sua conexão e tente novamente.";
  if (error.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
  if (error.status === 403) return "Acesso negado. Atualize a sessão e tente novamente.";
  if (error.status === 404) return "O histórico solicitado não foi encontrado.";
  if (error.status === 409) return "Esta importação já está sendo confirmada. Aguarde a conclusão.";
  if (error.status === 410) {
    return "A prévia expirou, foi cancelada ou já foi confirmada. Analise a planilha novamente.";
  }
  if (error.status === 413) return "O arquivo excede o limite permitido de 20 MB.";
  if (error.status === 422)
    return "A planilha possui erros de validação e não pode ser confirmada.";
  return "O servidor não conseguiu concluir a operação. Tente novamente mais tarde.";
}

export function formatAdminImportCount(value: number): string {
  return value.toLocaleString("pt-BR");
}
