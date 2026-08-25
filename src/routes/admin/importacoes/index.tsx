import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { describeAdminImportError, formatAdminImportCount } from "@/lib/admin-imports-flow";
import { adminImportHistoryQueryKey, expireAdminImportSession } from "@/lib/admin-imports-query";
import { getImportHistory, isAdminImportUnauthorizedError } from "@/lib/api/admin-imports";

const HISTORY_PAGE_SIZE = 20;

export const Route = createFileRoute("/admin/importacoes/")({
  component: ImportacoesHistory,
});

function ImportacoesHistory() {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const historyQuery = useQuery({
    queryKey: adminImportHistoryQueryKey(page, HISTORY_PAGE_SIZE),
    queryFn: () => getImportHistory(page, HISTORY_PAGE_SIZE),
    placeholderData: (previous) => previous,
    retry: (failureCount, error) => !isAdminImportUnauthorizedError(error) && failureCount < 1,
  });

  useEffect(() => {
    if (historyQuery.error) {
      void expireAdminImportSession(historyQuery.error, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [historyQuery.error, navigate, queryClient]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E]">
            Histórico de Importações
          </h2>
          <p className="text-[13px] font-medium text-[#252A2E]/60">
            Registro das importações confirmadas no catálogo.
          </p>
        </div>
        <Link
          to="/admin/importacoes/nova"
          className="flex items-center justify-center gap-2 rounded-[2px] bg-[#174F8C] px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#123E70]"
        >
          <FileUp size={16} /> Nova Importação
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
        {historyQuery.isPending ? (
          <HistoryState loading message="Carregando histórico real de importações..." />
        ) : historyQuery.isError ? (
          <HistoryError
            message={describeAdminImportError(historyQuery.error)}
            onRetry={() => void historyQuery.refetch()}
          />
        ) : historyQuery.data.items.length === 0 ? (
          <HistoryState message="Nenhuma importação confirmada foi registrada ainda." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <HeaderCell>Data</HeaderCell>
                    <HeaderCell>Arquivo</HeaderCell>
                    <HeaderCell center>Analisados</HeaderCell>
                    <HeaderCell center>Novos</HeaderCell>
                    <HeaderCell center>Alterados</HeaderCell>
                    <HeaderCell center>Sem alteração</HeaderCell>
                    <HeaderCell center>Status</HeaderCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F5F6]">
                  {historyQuery.data.items.map((item) => (
                    <tr key={item.id} className="group transition hover:bg-[#F9FAFB]">
                      <td className="whitespace-nowrap px-4 py-4 text-[12px] font-bold text-[#252A2E] sm:px-6">
                        {item.appliedAt}
                      </td>
                      <td className="max-w-[280px] px-4 py-4 sm:px-6">
                        <Link
                          to="/admin/importacoes/$id"
                          params={{ id: String(item.id) }}
                          className="block truncate text-[12px] font-bold text-[#174F8C] group-hover:underline"
                        >
                          {item.sourceFilename}
                        </Link>
                      </td>
                      <CountCell value={item.totalRows} />
                      <CountCell value={item.newCount} color="text-[#174F8C]" />
                      <CountCell value={item.changedCount} color="text-[#9A7600]" />
                      <CountCell value={item.unchangedCount} color="text-[#252A2E]/45" />
                      <td className="px-4 py-4 text-center sm:px-6">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/45">
                {formatAdminImportCount(historyQuery.data.totalElements)} registro(s) · Página{" "}
                {historyQuery.data.totalPages === 0 ? 0 : historyQuery.data.page + 1} de{" "}
                {historyQuery.data.totalPages}
              </span>
              <div className="flex gap-2">
                <PageButton
                  label="Anterior"
                  icon={<ChevronLeft size={14} />}
                  disabled={!historyQuery.data.hasPrevious || historyQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                />
                <PageButton
                  label="Próxima"
                  iconAfter={<ChevronRight size={14} />}
                  disabled={!historyQuery.data.hasNext || historyQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HeaderCell({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th
      className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 sm:px-6 ${center ? "text-center" : ""}`}
    >
      {children}
    </th>
  );
}

function CountCell({ value, color = "text-[#252A2E]" }: { value: number; color?: string }) {
  return (
    <td className={`px-4 py-4 text-center text-[12px] font-medium sm:px-6 ${color}`}>
      {formatAdminImportCount(value)}
    </td>
  );
}

function StatusBadge({ status }: { status: string }) {
  const completed = status.toLocaleLowerCase("pt-BR").includes("conclu");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
        completed ? "bg-[#2E8B57]/10 text-[#2E8B57]" : "bg-[#174F8C]/10 text-[#174F8C]"
      }`}
    >
      <CheckCircle2 size={10} /> {status}
    </span>
  );
}

function PageButton({
  label,
  icon,
  iconAfter,
  disabled,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-[2px] border border-[#E5E7EB] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#252A2E] disabled:opacity-35"
    >
      {icon}
      {label}
      {iconAfter}
    </button>
  );
}

function HistoryState({ message, loading = false }: { message: string; loading?: boolean }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
      {loading && <Loader2 className="animate-spin text-[#174F8C]" size={26} />}
      <p className="text-[13px] font-medium text-[#252A2E]/60">{message}</p>
    </div>
  );
}

function HistoryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="text-[#D9272E]" size={28} />
      <p className="text-[13px] font-medium text-[#252A2E]/60">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-[2px] bg-[#174F8C] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
      >
        Tentar novamente
      </button>
    </div>
  );
}
