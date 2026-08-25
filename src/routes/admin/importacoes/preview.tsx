import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  clearActiveAdminImport,
  describeAdminImportError,
  formatAdminImportCount,
  getActiveAdminImport,
} from "@/lib/admin-imports-flow";
import {
  adminImportPreviewQueryKey,
  expireAdminImportSession,
  invalidateAdminImportData,
} from "@/lib/admin-imports-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import {
  AdminImportApiError,
  cancelImport,
  confirmImport,
  getImportPreview,
  isAdminImportUnauthorizedError,
  type AdminImportConfirmResult,
  type AdminImportPreviewPage,
} from "@/lib/api/admin-imports";

export const Route = createFileRoute("/admin/importacoes/preview")({
  component: ImportPreview,
});

function ImportPreview() {
  const [activeImport] = useState(() => getActiveAdminImport());
  const [newPage, setNewPage] = useState(0);
  const [changedPage, setChangedPage] = useState(0);
  const [pageSize, setPageSize] = useState<50 | 100>(50);
  const [result, setResult] = useState<AdminImportConfirmResult | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = activeImport?.token ?? "";

  const previewQuery = useQuery({
    queryKey: adminImportPreviewQueryKey(token, newPage, changedPage, pageSize),
    queryFn: () => getImportPreview(token, newPage, changedPage, pageSize),
    enabled: Boolean(activeImport) && !result,
    initialData:
      activeImport && newPage === 0 && changedPage === 0 && pageSize === 50
        ? activeImport.initialPreview
        : undefined,
    retry: (failureCount, error) =>
      !(error instanceof AdminImportApiError && [401, 410].includes(error.status)) &&
      failureCount < 1,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => confirmImport(token, await getAdminCsrf()),
    onSuccess: async (confirmation) => {
      clearActiveAdminImport();
      setResult(confirmation);
      await invalidateAdminImportData(queryClient);
      queryClient.removeQueries({ queryKey: ["admin-import-preview", token] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => cancelImport(token, await getAdminCsrf()),
    onSuccess: async () => {
      clearActiveAdminImport();
      queryClient.removeQueries({ queryKey: ["admin-import-preview", token] });
      await navigate({ to: "/admin/importacoes/nova", replace: true });
    },
  });

  const operationError = previewQuery.error ?? confirmMutation.error ?? cancelMutation.error;
  useEffect(() => {
    if (!operationError) return;
    if (operationError instanceof AdminImportApiError && operationError.status === 410) {
      clearActiveAdminImport();
    }
    void expireAdminImportSession(operationError, queryClient, () =>
      navigate({ to: "/admin/login", replace: true }),
    );
  }, [navigate, operationError, queryClient]);

  if (result) return <ImportSuccess result={result} />;

  if (!activeImport) {
    return (
      <PreviewState
        title="Prévia indisponível"
        message="O token da prévia fica somente em memória e foi perdido após a atualização da página. Analise a planilha novamente."
      >
        <Link
          to="/admin/importacoes/nova"
          className="rounded-[2px] bg-[#174F8C] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white"
        >
          Nova análise
        </Link>
      </PreviewState>
    );
  }

  if (previewQuery.isPending) {
    return (
      <PreviewState
        loading
        title="Carregando prévia"
        message="Recompondo a página no servidor..."
      />
    );
  }

  if (previewQuery.isError || !previewQuery.data) {
    const gone =
      previewQuery.error instanceof AdminImportApiError && previewQuery.error.status === 410;
    return (
      <PreviewState
        title={gone ? "Prévia expirada" : "Não foi possível carregar a prévia"}
        message={describeAdminImportError(previewQuery.error)}
      >
        {gone ? (
          <Link
            to="/admin/importacoes/nova"
            className="rounded-[2px] bg-[#174F8C] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white"
          >
            Nova análise
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void previewQuery.refetch()}
            className="rounded-[2px] bg-[#174F8C] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white"
          >
            Tentar novamente
          </button>
        )}
      </PreviewState>
    );
  }

  const preview = previewQuery.data;
  const mutating = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <div className="space-y-7 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/admin/importacoes/nova"
            className="shrink-0 rounded-[2px] p-2 text-[#252A2E]/40 transition hover:bg-white hover:text-[#252A2E]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E]">
              Prévia da Importação
            </h2>
            <p className="truncate text-[11px] font-bold text-[#252A2E]/45">
              {preview.sourceFilename ?? activeImport.sourceFilename}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => cancelMutation.mutate()}
            disabled={mutating}
            className="rounded-[2px] border border-[#E5E7EB] bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#252A2E]/65 transition hover:border-[#D9272E] hover:text-[#D9272E] disabled:opacity-45"
          >
            {cancelMutation.isPending ? "Cancelando..." : "Cancelar importação"}
          </button>
          <button
            type="button"
            onClick={() => confirmMutation.mutate()}
            disabled={mutating || !preview.canConfirm || preview.summary.errorCount > 0}
            className="flex items-center justify-center gap-2 rounded-[2px] bg-[#174F8C] px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#123E70] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmMutation.isPending && <Loader2 className="animate-spin" size={16} />}
            {confirmMutation.isPending ? "Importando produtos..." : "Confirmar importação"}
          </button>
        </div>
      </div>

      {(confirmMutation.isError || cancelMutation.isError) && (
        <div
          role="alert"
          className="flex items-center gap-3 border border-[#D9272E]/30 bg-[#D9272E]/10 p-4 text-[12px] font-bold text-[#D9272E]"
        >
          <XCircle size={18} className="shrink-0" />
          {describeAdminImportError(confirmMutation.error ?? cancelMutation.error)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryChip label="Analisados" value={preview.summary.totalRows} />
        <SummaryChip label="Novos" value={preview.summary.newCount} color="blue" />
        <SummaryChip label="Alterados" value={preview.summary.changedCount} color="yellow" />
        <SummaryChip label="Sem alteração" value={preview.summary.unchangedCount} color="muted" />
        <SummaryChip label="Erros" value={preview.summary.errorCount} color="red" />
      </div>

      <div className="flex flex-col gap-3 rounded-[2px] border border-[#E5E7EB] bg-[#F4F5F6] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-[12px] font-medium text-[#252A2E]/60">
          <Info className="shrink-0 text-[#174F8C]" size={18} />
          Os detalhes abaixo vêm do Spring. Nenhuma diferença é recalculada no navegador.
        </div>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">
          Itens por página
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(event.target.value === "100" ? 100 : 50);
              setNewPage(0);
              setChangedPage(0);
            }}
            disabled={previewQuery.isFetching || mutating}
            className="border border-[#E5E7EB] bg-white px-3 py-2 text-[#252A2E]"
          >
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>

      <ChangedProductsSection
        products={preview.changedProducts}
        page={preview.changedPage}
        pending={previewQuery.isFetching || mutating}
        onPageChange={setChangedPage}
      />
      <NewProductsSection
        products={preview.newProducts}
        page={preview.newPage}
        pending={previewQuery.isFetching || mutating}
        onPageChange={setNewPage}
      />
    </div>
  );
}

function ImportSuccess({ result }: { result: AdminImportConfirmResult }) {
  return (
    <div className="mx-auto max-w-2xl py-8 animate-in zoom-in-95 duration-500">
      <div className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white text-center shadow-xl">
        <div className="flex justify-center bg-[#2E8B57] py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 size={48} className="text-white" />
          </div>
        </div>
        <div className="space-y-7 p-6 sm:p-8">
          <div>
            <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-[#252A2E]">
              Importação concluída
            </h2>
            <p className="text-[13px] text-[#252A2E]/60">
              O resumo abaixo foi retornado pela confirmação transacional do Spring.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SuccessCount label="Processados" value={result.totalRows} />
            <SuccessCount label="Novos" value={result.newCount} />
            <SuccessCount label="Alterados" value={result.changedCount} />
            <SuccessCount label="Inalterados" value={result.unchangedCount} />
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/importacoes"
              className="bg-[#174F8C] py-4 text-[11px] font-bold uppercase tracking-widest text-white"
            >
              Ver histórico
            </Link>
            <Link
              to="/admin/produtos"
              className="border border-[#E5E7EB] bg-white py-4 text-[11px] font-bold uppercase tracking-widest text-[#252A2E]"
            >
              Gerenciar produtos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangedProductsSection({
  products,
  page,
  pending,
  onPageChange,
}: {
  products: Awaited<ReturnType<typeof getImportPreview>>["changedProducts"];
  page: AdminImportPreviewPage;
  pending: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
      <SectionHeader title="Produtos alterados" page={page} />
      {products.length === 0 ? (
        <EmptySection message="Nenhum produto alterado nesta página." />
      ) : (
        <div className="divide-y divide-[#F4F5F6]">
          {products.map((product) => (
            <article key={product.erpId} className="space-y-4 p-4 sm:p-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#174F8C]">
                  ERP {product.erpId}
                </span>
                <h4 className="mt-1 text-[13px] font-bold text-[#252A2E]">{product.description}</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead>
                    <tr className="bg-[#F9FAFB]">
                      <HeaderCell>Campo</HeaderCell>
                      <HeaderCell>Valor atual</HeaderCell>
                      <HeaderCell>Novo valor</HeaderCell>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F5F6]">
                    {product.changes.map((change, index) => (
                      <tr key={`${product.erpId}-${change.field}-${index}`}>
                        <td className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-[#174F8C]">
                          {change.field}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#252A2E]/60">
                          {change.previousValue}
                        </td>
                        <td className="px-4 py-3 text-[12px] font-bold text-[#2E8B57]">
                          <span className="inline-flex items-center gap-2">
                            <ArrowRight size={12} /> {change.newValue}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
      <PreviewPagination page={page} pending={pending} onPageChange={onPageChange} />
    </section>
  );
}

function NewProductsSection({
  products,
  page,
  pending,
  onPageChange,
}: {
  products: Awaited<ReturnType<typeof getImportPreview>>["newProducts"];
  page: AdminImportPreviewPage;
  pending: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
      <SectionHeader title="Novos produtos" page={page} />
      {products.length === 0 ? (
        <EmptySection message="Nenhum produto novo nesta página." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <HeaderCell>Código ERP</HeaderCell>
                <HeaderCell>Descrição</HeaderCell>
                <HeaderCell>Fabricante</HeaderCell>
                <HeaderCell>Grupo</HeaderCell>
                <HeaderCell>Preço</HeaderCell>
                <HeaderCell>Saldo disponível</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F6]">
              {products.map((product) => (
                <tr key={product.erpId}>
                  <td className="px-4 py-4 text-[12px] font-bold text-[#252A2E]">
                    {product.erpId}
                  </td>
                  <td className="max-w-[320px] px-4 py-4 text-[12px] font-medium text-[#252A2E]">
                    {product.description}
                  </td>
                  <td className="px-4 py-4 text-[11px] font-bold uppercase text-[#174F8C]">
                    {product.manufacturer}
                  </td>
                  <td className="px-4 py-4 text-[11px] text-[#252A2E]/60">{product.group}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-[12px] font-medium text-[#252A2E]">
                    {product.price}
                  </td>
                  <td className="px-4 py-4 text-center text-[12px] font-medium text-[#252A2E]">
                    {product.availableStock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PreviewPagination page={page} pending={pending} onPageChange={onPageChange} />
    </section>
  );
}

function SummaryChip({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: number;
  color?: "default" | "blue" | "yellow" | "muted" | "red";
}) {
  const colors = {
    default: "border-[#E5E7EB] bg-white text-[#252A2E]",
    blue: "border-[#174F8C]/20 bg-[#174F8C]/5 text-[#174F8C]",
    yellow: "border-[#F5C400]/30 bg-[#F5C400]/10 text-[#9A7600]",
    muted: "border-[#E5E7EB] bg-[#F4F5F6] text-[#252A2E]/55",
    red: "border-[#D9272E]/20 bg-[#D9272E]/5 text-[#D9272E]",
  };
  return (
    <div className={`rounded-[2px] border p-4 shadow-sm ${colors[color]}`}>
      <p className="text-[18px] font-black tracking-tight">{formatAdminImportCount(value)}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-widest opacity-65">{label}</p>
    </div>
  );
}

function SuccessCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <p className="text-[18px] font-black text-[#252A2E]">{formatAdminImportCount(value)}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#252A2E]/45">
        {label}
      </p>
    </div>
  );
}

function SectionHeader({ title, page }: { title: string; page: AdminImportPreviewPage }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[#F4F5F6] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">{title}</h3>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/40">
        {page.totalElements === 0
          ? "0 itens"
          : `${formatAdminImportCount(page.firstItem)}–${formatAdminImportCount(page.lastItem)} de ${formatAdminImportCount(page.totalElements)}`}
      </span>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#252A2E]/50">
      {children}
    </th>
  );
}

function PreviewPagination({
  page,
  pending,
  onPageChange,
}: {
  page: AdminImportPreviewPage;
  pending: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/45">
        Página {page.totalPages === 0 ? 0 : page.page + 1} de {page.totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!page.hasPrevious || pending}
          onClick={() => onPageChange(Math.max(0, page.page - 1))}
          className="inline-flex items-center gap-1 border border-[#E5E7EB] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#252A2E] disabled:opacity-35"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <button
          type="button"
          disabled={!page.hasNext || pending}
          onClick={() => onPageChange(page.page + 1)}
          className="inline-flex items-center gap-1 border border-[#E5E7EB] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#252A2E] disabled:opacity-35"
        >
          Próxima <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptySection({ message }: { message: string }) {
  return <p className="p-8 text-center text-[12px] font-medium text-[#252A2E]/50">{message}</p>;
}

function PreviewState({
  title,
  message,
  loading = false,
  children,
}: {
  title: string;
  message: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-[2px] border border-[#E5E7EB] bg-white p-8 text-center">
      {loading ? (
        <Loader2 className="animate-spin text-[#174F8C]" size={30} />
      ) : (
        <AlertCircle className="text-[#D9272E]" size={30} />
      )}
      <h2 className="text-xl font-black uppercase tracking-tight text-[#252A2E]">{title}</h2>
      <p className="max-w-xl text-[13px] font-medium text-[#252A2E]/60">{message}</p>
      {children}
    </div>
  );
}
