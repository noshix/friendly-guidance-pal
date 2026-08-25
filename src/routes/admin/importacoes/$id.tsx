import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, ChevronLeft, FileSpreadsheet, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { describeAdminImportError, formatAdminImportCount } from "@/lib/admin-imports-flow";
import { adminImportDetailQueryKey, expireAdminImportSession } from "@/lib/admin-imports-query";
import { AdminImportApiError, getImportDetail } from "@/lib/api/admin-imports";

export const Route = createFileRoute("/admin/importacoes/$id")({
  component: ImportHistoryDetail,
});

function ImportHistoryDetail() {
  const { id } = Route.useParams();
  const numericId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: adminImportDetailQueryKey(Number.isInteger(numericId) ? numericId : -1),
    queryFn: () => getImportDetail(numericId),
    retry: (failureCount, error) =>
      !(error instanceof AdminImportApiError && [401, 404].includes(error.status)) &&
      failureCount < 1,
  });

  useEffect(() => {
    if (detailQuery.error) {
      void expireAdminImportSession(detailQuery.error, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [detailQuery.error, navigate, queryClient]);

  if (detailQuery.isPending) {
    return <DetailState loading message="Carregando o resumo persistido da importação..." />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    const missing =
      detailQuery.error instanceof AdminImportApiError && detailQuery.error.status === 404;
    return (
      <DetailState
        message={
          missing ? "Importação não encontrada." : describeAdminImportError(detailQuery.error)
        }
      >
        <Link
          to="/admin/importacoes"
          className="rounded-[2px] bg-[#174F8C] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
        >
          Voltar ao histórico
        </Link>
      </DetailState>
    );
  }

  const detail = detailQuery.data;
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-20 animate-in fade-in duration-500">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/admin/importacoes"
          className="shrink-0 rounded-[2px] p-2 text-[#252A2E]/40 transition hover:bg-white hover:text-[#252A2E]"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="min-w-0">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E]">
            Detalhe da Importação
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#252A2E]/45">
            Registro #{detail.id}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#F4F5F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="shrink-0 text-[#174F8C]" size={24} />
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-black text-[#252A2E]">
                {detail.sourceFilename}
              </h3>
              <p className="text-[11px] font-medium text-[#252A2E]/45">{detail.appliedAt}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-[2px] bg-[#2E8B57]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#2E8B57]">
            <CheckCircle2 size={14} /> {detail.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[#E5E7EB] sm:grid-cols-4">
          <DetailCount label="Processados" value={detail.totalRows} />
          <DetailCount label="Novos" value={detail.newCount} />
          <DetailCount label="Alterados" value={detail.changedCount} />
          <DetailCount label="Inalterados" value={detail.unchangedCount} />
        </div>
      </section>

      <div className="flex gap-3 rounded-[2px] border border-[#174F8C]/20 bg-[#174F8C]/5 p-5 text-[12px] font-medium leading-relaxed text-[#174F8C]">
        <AlertCircle className="shrink-0" size={19} />O histórico persiste somente este resumo.
        Linhas individuais e valores anteriores não são armazenados pelo backend e, por isso, não
        são inventados nesta tela.
      </div>
    </div>
  );
}

function DetailCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-5 text-center sm:p-7">
      <p className="text-xl font-black text-[#252A2E]">{formatAdminImportCount(value)}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#252A2E]/45">
        {label}
      </p>
    </div>
  );
}

function DetailState({
  message,
  loading = false,
  children,
}: {
  message: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-[2px] border border-[#E5E7EB] bg-white p-8 text-center">
      {loading ? (
        <Loader2 className="animate-spin text-[#174F8C]" size={28} />
      ) : (
        <AlertCircle className="text-[#D9272E]" size={28} />
      )}
      <p className="text-[13px] font-medium text-[#252A2E]/60">{message}</p>
      {children}
    </div>
  );
}
