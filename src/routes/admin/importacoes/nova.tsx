import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ChevronRight, FileSpreadsheet, Loader2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  describeAdminImportError,
  rememberActiveAdminImport,
  validateAdminImportFile,
} from "@/lib/admin-imports-flow";
import { adminImportPreviewQueryKey, expireAdminImportSession } from "@/lib/admin-imports-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import { createImportPreview, type AdminImportPreview } from "@/lib/api/admin-imports";

export const Route = createFileRoute("/admin/importacoes/nova")({
  component: NovaImportacao,
});

function NovaImportacao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [validationPreview, setValidationPreview] = useState<AdminImportPreview | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => createImportPreview(file, await getAdminCsrf()),
    onSuccess: async (preview) => {
      if (!preview.canConfirm || !preview.token) {
        setValidationPreview(preview);
        return;
      }
      const active = rememberActiveAdminImport(preview);
      queryClient.setQueryData(
        adminImportPreviewQueryKey(active.token, 0, 0, preview.newPage.size || 50),
        preview,
      );
      await navigate({ to: "/admin/importacoes/preview" });
    },
  });

  useEffect(() => {
    if (uploadMutation.error) {
      void expireAdminImportSession(uploadMutation.error, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [navigate, queryClient, uploadMutation.error]);

  const selectFile = (file: File | null) => {
    setSelectedFile(file);
    setValidationPreview(null);
    setFileError(validateAdminImportFile(file)?.message ?? null);
    uploadMutation.reset();
  };

  const analyze = () => {
    if (uploadMutation.isPending) return;
    const validation = validateAdminImportFile(selectedFile);
    if (validation || !selectedFile) {
      setFileError(validation?.message ?? "Selecione uma planilha XLSX.");
      return;
    }
    setFileError(null);
    setValidationPreview(null);
    uploadMutation.mutate(selectedFile);
  };

  const dropFile = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!uploadMutation.isPending) selectFile(event.dataTransfer.files.item(0));
  };

  return (
    <div className="mx-auto max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-3">
        <Link
          to="/admin"
          className="text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40 hover:text-[#252A2E]"
        >
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-[#E5E7EB]" />
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#252A2E]">
          Nova Importação ERP
        </span>
      </div>

      <div className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#F4F5F6] p-6 sm:p-8">
          <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-[#252A2E]">
            Importar produtos do ERP
          </h2>
          <p className="text-[14px] text-[#252A2E]/60">
            Envie a planilha XLSX para o Spring analisar sem aplicar alterações ainda.
          </p>
        </div>

        <div className="space-y-7 p-5 sm:p-8 lg:p-12">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={(event) => selectFile(event.target.files?.item(0) ?? null)}
          />
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropFile}
            className="flex min-h-56 flex-col items-center justify-center rounded-[2px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center transition hover:border-[#174F8C] sm:p-12"
          >
            {selectedFile ? (
              <>
                <FileSpreadsheet size={42} className="mb-4 text-[#174F8C]" />
                <p className="max-w-full break-all text-[13px] font-black uppercase tracking-wider text-[#252A2E]">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#252A2E]/45">
                  {(selectedFile.size / 1024 / 1024).toLocaleString("pt-BR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  MB
                </p>
                <button
                  type="button"
                  onClick={() => selectFile(null)}
                  disabled={uploadMutation.isPending}
                  className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D9272E] disabled:opacity-40"
                >
                  <X size={14} /> Remover arquivo
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm">
                  <UploadCloud size={32} className="text-[#174F8C]" />
                </div>
                <p className="mb-1 text-[14px] font-bold uppercase tracking-wider text-[#252A2E]">
                  Selecionar arquivo XLSX
                </p>
                <p className="mb-5 text-[12px] font-medium italic tracking-wide text-[#252A2E]/40">
                  ou arraste e solte o arquivo aqui
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[2px] border border-[#174F8C] bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#174F8C]"
                >
                  Escolher arquivo
                </button>
              </>
            )}
          </div>

          {(fileError || uploadMutation.isError) && (
            <FeedbackBanner
              message={fileError ?? describeAdminImportError(uploadMutation.error)}
              danger
            />
          )}

          {validationPreview && (
            <div className="space-y-3 rounded-[2px] border border-[#D9272E]/30 bg-[#D9272E]/5 p-5">
              <div className="flex gap-3 text-[#D9272E]">
                <AlertCircle className="shrink-0" size={20} />
                <div>
                  <h3 className="text-[12px] font-black uppercase tracking-wider">
                    Planilha não validada
                  </h3>
                  <p className="mt-1 text-[12px] font-medium">
                    {validationPreview.summary.errorCount.toLocaleString("pt-BR")} erro(s)
                    encontrado(s). Corrija o arquivo e envie novamente.
                  </p>
                </div>
              </div>
              {validationPreview.errors.length > 0 && (
                <ul className="max-h-56 space-y-2 overflow-y-auto border-t border-[#D9272E]/15 pt-3 text-[11px] text-[#252A2E]/70">
                  {validationPreview.errors.map((error, index) => (
                    <li key={`${error.row}-${error.code}-${index}`}>
                      <strong>{error.row}</strong> · {error.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-4 rounded-[2px] bg-[#F4F5F6] p-5 sm:p-6">
            <AlertCircle size={18} className="shrink-0 text-[#9A7600]" />
            <div className="space-y-2">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-[#252A2E]">
                Antes de importar
              </h4>
              <ul className="list-inside list-disc space-y-1 text-[12px] font-medium text-[#252A2E]/60 sm:text-[13px]">
                <li>Use somente XLSX de até 20 MB;</li>
                <li>o arquivo não é interpretado pelo navegador;</li>
                <li>nenhuma alteração é aplicada antes da confirmação na próxima tela.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={analyze}
              disabled={uploadMutation.isPending}
              className="flex w-full items-center justify-center gap-3 rounded-[2px] bg-[#174F8C] px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#123E70] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
            >
              {uploadMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : null}
              {uploadMutation.isPending ? "Analisando planilha..." : "Analisar planilha"}
              {!uploadMutation.isPending && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackBanner({ message, danger = false }: { message: string; danger?: boolean }) {
  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-[2px] border p-4 text-[12px] font-bold ${
        danger
          ? "border-[#D9272E]/30 bg-[#D9272E]/10 text-[#D9272E]"
          : "border-[#174F8C]/30 bg-[#174F8C]/10 text-[#174F8C]"
      }`}
    >
      <AlertCircle size={18} className="shrink-0" /> {message}
    </div>
  );
}
