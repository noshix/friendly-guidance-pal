import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  buildAdminBulkFilterRequest,
  describeAdminBulkFilter,
  formatAdminPrice,
  formatAdminQuantity,
  normalizeAdminProductListParams,
  toggleAdminProductPageSelection,
  toggleAdminProductSelection,
} from "@/lib/admin-products-flow";
import {
  adminProductsQueryKey,
  expireAdminProductSession,
  invalidateAdminProductData,
} from "@/lib/admin-products-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import {
  ADMIN_PRODUCTS_MAX_BULK_IDS,
  bulkUpdateVisibility,
  bulkUpdateVisibilityByFilter,
  getAdminProducts,
  isAdminProductsUnauthorizedError,
  type AdminBulkVisibilityByFilterRequest,
  type AdminProductSummary,
  type AdminProductVisibility,
} from "@/lib/api/admin-products";
import {
  PUBLIC_TAXONOMY_STALE_TIME,
  getCategories,
  getManufacturers,
} from "@/lib/api/public-catalog";

export const Route = createFileRoute("/admin/produtos/")({
  component: AdminProducts,
});

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

type Feedback = { kind: "success" | "error" | "info"; message: string };

function AdminProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<AdminProductVisibility>("ALL");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedErpIds, setSelectedErpIds] = useState<Set<string>>(new Set());
  const [filterBulkTarget, setFilterBulkTarget] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
    setSelectedErpIds(new Set());
  }, [search, visibility, manufacturer, category]);

  const listParams = useMemo(
    () =>
      normalizeAdminProductListParams({
        search,
        visibility,
        manufacturer,
        category,
        page,
        size: PAGE_SIZE,
      }),
    [category, manufacturer, page, search, visibility],
  );

  const productsQuery = useQuery({
    queryKey: adminProductsQueryKey(listParams),
    queryFn: () => getAdminProducts(listParams),
    placeholderData: (previous) => previous,
    retry: (failureCount, error) => !isAdminProductsUnauthorizedError(error) && failureCount < 1,
  });
  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getCategories(),
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });
  const manufacturersQuery = useQuery({
    queryKey: ["public-manufacturers"],
    queryFn: () => getManufacturers(),
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const selectionMutation = useMutation({
    mutationFn: async (targetVisible: boolean) =>
      bulkUpdateVisibility(
        { erpIds: [...selectedErpIds], visible: targetVisible },
        await getAdminCsrf(),
      ),
    onSuccess: async (result) => {
      await invalidateAdminProductData(queryClient);
      setSelectedErpIds(new Set());
      setFeedback({
        kind: "success",
        message: `Operação concluída: ${result.updatedCount} produto(s) alterado(s).`,
      });
    },
    onError: (error) => {
      if (!isAdminProductsUnauthorizedError(error)) {
        setFeedback({ kind: "error", message: "Não foi possível atualizar os selecionados." });
      }
    },
  });

  const filterMutation = useMutation({
    mutationFn: async (request: AdminBulkVisibilityByFilterRequest) =>
      bulkUpdateVisibilityByFilter(request, await getAdminCsrf()),
    onSuccess: async (result) => {
      await invalidateAdminProductData(queryClient);
      setSelectedErpIds(new Set());
      setFeedback({
        kind: "success",
        message: `Filtro processado: ${result.updatedCount} produto(s) alterado(s).`,
      });
    },
    onError: (error) => {
      if (!isAdminProductsUnauthorizedError(error)) {
        setFeedback({
          kind: "error",
          message: "Não foi possível atualizar os produtos do filtro.",
        });
      }
    },
  });

  const expiredError = [productsQuery.error, selectionMutation.error, filterMutation.error].find(
    isAdminProductsUnauthorizedError,
  );
  useEffect(() => {
    if (expiredError) {
      setFeedback({ kind: "info", message: "Sua sessão expirou. Entre novamente." });
      void expireAdminProductSession(expiredError, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [expiredError, navigate, queryClient]);

  useEffect(() => {
    const totalPages = productsQuery.data?.totalPages;
    if (totalPages !== undefined && totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, productsQuery.data?.totalPages]);

  const products = productsQuery.data?.items ?? [];
  const pageErpIds = products.map((product) => product.erpId);
  const allPageSelected =
    pageErpIds.length > 0 && pageErpIds.every((erpId) => selectedErpIds.has(erpId));
  const filterScope = { search, manufacturer, category, visibility };
  const filterRequest =
    filterBulkTarget === null ? null : buildAdminBulkFilterRequest(filterScope, filterBulkTarget);
  const filterScopeDescription = describeAdminBulkFilter(filterScope);
  const hasFilterScope = buildAdminBulkFilterRequest(filterScope, true) !== null;
  const bulkPending = selectionMutation.isPending || filterMutation.isPending;

  const applySelection = (next: Set<string>) => {
    if (next.size > ADMIN_PRODUCTS_MAX_BULK_IDS) {
      setFeedback({
        kind: "error",
        message: `A seleção permite no máximo ${ADMIN_PRODUCTS_MAX_BULK_IDS} produtos por operação.`,
      });
      return;
    }
    setSelectedErpIds(next);
  };

  const confirmFilterBulk = () => {
    if (!filterRequest || filterMutation.isPending) return;
    setFilterBulkTarget(null);
    filterMutation.mutate(filterRequest);
  };

  if (expiredError) {
    return <AdminProductsState message="Sessão expirada. Redirecionando para o login..." loading />;
  }

  return (
    <div className="min-w-0 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E]">Produtos</h2>
        <p className="text-[13px] font-medium italic text-[#252A2E]/60">
          Gerenciamento operacional do catálogo público com dados reais do ERP.
        </p>
      </div>

      {feedback && <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />}

      <section className="space-y-4 rounded-[2px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(150px,220px))]">
          <label className="relative block">
            <span className="sr-only">Buscar produtos</span>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30"
              size={18}
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Descrição, ERP ID, referência, código de barras..."
              className="w-full rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB] py-3 pl-12 pr-4 text-[13px] font-medium outline-none focus:border-[#174F8C]"
            />
          </label>
          <FilterSelect
            label="Visibilidade"
            value={visibility}
            onChange={(value) => setVisibility(value as AdminProductVisibility)}
            options={[
              { label: "Todos", value: "ALL" },
              { label: "Publicados", value: "VISIBLE" },
              { label: "Ocultos", value: "HIDDEN" },
            ]}
          />
          <FilterSelect
            label="Categoria"
            value={category}
            onChange={setCategory}
            options={[
              { label: "Todas", value: "" },
              ...(categoriesQuery.data ?? []).map((item) => ({
                label: item.name,
                value: item.erpName,
              })),
            ]}
          />
          <FilterSelect
            label="Fabricante"
            value={manufacturer}
            onChange={setManufacturer}
            options={[
              { label: "Todos", value: "" },
              ...(manufacturersQuery.data ?? []).map((item) => ({
                label: item.name,
                value: item.name,
              })),
            ]}
          />
        </div>
        <p className="text-[10px] font-medium text-[#252A2E]/45">
          Fabricantes e categorias usam as taxonomias públicas atuais. Valores presentes apenas em
          produtos ocultos podem ser encontrados pela busca, mas ainda não aparecem nesses selects.
        </p>
      </section>

      <section className="space-y-3 rounded-[2px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#252A2E]">
              {selectedErpIds.size}/{ADMIN_PRODUCTS_MAX_BULK_IDS} selecionado(s) nesta navegação
            </p>
            <p className="mt-1 text-[10px] text-[#252A2E]/45">
              “Selecionar página” inclui somente os {pageErpIds.length} itens exibidos agora.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BulkButton
              label="Publicar selecionados"
              disabled={selectedErpIds.size === 0 || bulkPending}
              onClick={() => selectionMutation.mutate(true)}
            />
            <BulkButton
              label="Ocultar selecionados"
              disabled={selectedErpIds.size === 0 || bulkPending}
              onClick={() => selectionMutation.mutate(false)}
              danger
            />
            <BulkButton
              label="Limpar seleção"
              disabled={selectedErpIds.size === 0 || bulkPending}
              onClick={() => setSelectedErpIds(new Set())}
              secondary
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#F4F5F6] pt-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-[10px] font-medium text-[#252A2E]/55">
            Ações por filtro afetam todos os resultados correspondentes e sempre exigem confirmação.
          </p>
          <div className="flex flex-wrap gap-2">
            <BulkButton
              label="Publicar todos deste filtro"
              disabled={!hasFilterScope || bulkPending}
              onClick={() => setFilterBulkTarget(true)}
            />
            <BulkButton
              label="Ocultar todos deste filtro"
              disabled={!hasFilterScope || bulkPending}
              onClick={() => setFilterBulkTarget(false)}
              danger
            />
          </div>
        </div>
        {!hasFilterScope && (
          <p className="text-[10px] font-bold text-[#D9272E]/80">
            Informe busca, fabricante ou categoria para habilitar ações sobre todos do filtro.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
        {productsQuery.isPending ? (
          <AdminProductsState message="Carregando produtos reais..." loading />
        ) : productsQuery.isError ? (
          <AdminProductsError
            message="Não foi possível carregar os produtos."
            onRetry={() => void productsQuery.refetch()}
          />
        ) : products.length === 0 ? (
          <AdminProductsState message="Nenhum produto corresponde aos filtros informados." />
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-[1120px] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-4 py-4">
                      <input
                        type="checkbox"
                        aria-label="Selecionar todos os produtos desta página"
                        checked={allPageSelected}
                        onChange={() =>
                          applySelection(
                            toggleAdminProductPageSelection(selectedErpIds, pageErpIds),
                          )
                        }
                        className="h-4 w-4 accent-[#174F8C]"
                      />
                    </th>
                    {[
                      "Código ERP",
                      "Produto",
                      "Fabricante / Categoria",
                      "Referência",
                      "Preço ERP",
                      "Saldo",
                      "Visibilidade",
                      "Ação",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F5F6]">
                  {products.map((product) => (
                    <ProductRow
                      key={product.erpId}
                      product={product}
                      selected={selectedErpIds.has(product.erpId)}
                      onSelect={() =>
                        applySelection(toggleAdminProductSelection(selectedErpIds, product.erpId))
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={productsQuery.data.page}
              totalPages={productsQuery.data.totalPages}
              totalElements={productsQuery.data.totalElements}
              pending={productsQuery.isFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <AlertDialog
        open={filterBulkTarget !== null}
        onOpenChange={(open) => !open && setFilterBulkTarget(null)}
      >
        <AlertDialogContent className="border-[#E5E7EB] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#252A2E]">
              Confirmar alteração em todos deste filtro
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-[#252A2E]/65">
              <span className="block">
                Você está prestes a {filterBulkTarget ? "publicar" : "ocultar"} todos os produtos
                que correspondem ao filtro:
              </span>
              <span className="block rounded-[2px] bg-[#F4F5F6] p-3 font-medium text-[#252A2E]">
                {filterScopeDescription.map((item) => (
                  <span key={item} className="block">
                    {item}
                  </span>
                ))}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFilterBulk}
              className={filterBulkTarget ? "bg-[#174F8C]" : "bg-[#D9272E]"}
            >
              Confirmar {filterBulkTarget ? "publicação" : "ocultação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductRow({
  product,
  selected,
  onSelect,
}: {
  product: AdminProductSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const productName = product.displayName ?? product.erpDescription;
  return (
    <tr className="group transition hover:bg-[#F9FAFB]">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          aria-label={`Selecionar ${productName}`}
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 accent-[#174F8C]"
        />
      </td>
      <td className="px-4 py-4 text-[12px] font-bold text-[#252A2E]">{product.erpId}</td>
      <td className="max-w-[320px] px-4 py-4">
        <span className="line-clamp-2 text-[12px] font-bold uppercase text-[#252A2E] group-hover:text-[#174F8C]">
          {productName}
        </span>
        {product.displayName && (
          <span className="mt-1 line-clamp-1 text-[10px] text-[#252A2E]/45">
            ERP: {product.erpDescription}
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-[10px] font-bold uppercase text-[#174F8C]">
        <span className="block">{product.manufacturer ?? "—"}</span>
        <span className="mt-1 block text-[#252A2E]/45">{product.category ?? "—"}</span>
      </td>
      <td className="px-4 py-4 text-[11px] text-[#252A2E]">{product.reference ?? "—"}</td>
      <td className="px-4 py-4 text-[12px] font-medium text-[#252A2E]">
        {formatAdminPrice(product.price)}
      </td>
      <td className="px-4 py-4 text-[12px] font-medium text-[#252A2E]">
        {formatAdminQuantity(product.availableStock)}
      </td>
      <td className="px-4 py-4">
        <VisibilityBadge visible={product.visible} />
      </td>
      <td className="px-4 py-4">
        <Link
          to="/admin/produtos/$id"
          params={{ id: product.erpId }}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#174F8C] hover:underline"
        >
          <Edit3 size={14} /> Editar
        </Link>
      </td>
    </tr>
  );
}

function VisibilityBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
        visible ? "bg-[#2E8B57]/10 text-[#2E8B57]" : "bg-[#F4F5F6] text-[#252A2E]/50"
      }`}
    >
      {visible ? <Eye size={10} /> : <EyeOff size={10} />}
      {visible ? "Publicado" : "Oculto"}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  totalElements,
  pending,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  pending: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/50">
        {totalElements.toLocaleString("pt-BR")} produto(s) · Página{" "}
        {totalPages === 0 ? 0 : page + 1} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page <= 0 || pending}
          className="inline-flex items-center gap-1 rounded-[2px] border border-[#E5E7EB] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#252A2E] disabled:opacity-35"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(Math.max(0, totalPages - 1), page + 1))}
          disabled={totalPages === 0 || page + 1 >= totalPages || pending}
          className="inline-flex items-center gap-1 rounded-[2px] border border-[#E5E7EB] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#252A2E] disabled:opacity-35"
        >
          Próxima <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[9px] font-black uppercase tracking-widest text-[#252A2E]/45">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 rounded-[2px] border border-[#E5E7EB] bg-white px-3 py-3 text-[11px] font-bold text-[#252A2E] outline-none focus:border-[#174F8C]"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BulkButton({
  label,
  disabled,
  onClick,
  danger = false,
  secondary = false,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  danger?: boolean;
  secondary?: boolean;
}) {
  const color = secondary
    ? "border-[#E5E7EB] bg-white text-[#252A2E]"
    : danger
      ? "border-[#D9272E] bg-[#D9272E] text-white"
      : "border-[#174F8C] bg-[#174F8C] text-white";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-[2px] border px-3 py-2 text-[9px] font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-35 ${color}`}
    >
      {label}
    </button>
  );
}

function FeedbackBanner({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) {
  const success = feedback.kind === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  const color = success
    ? "border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]"
    : feedback.kind === "error"
      ? "border-[#D9272E]/30 bg-[#D9272E]/10 text-[#D9272E]"
      : "border-[#174F8C]/30 bg-[#174F8C]/10 text-[#174F8C]";
  return (
    <div role="status" className={`flex items-center justify-between gap-3 border p-4 ${color}`}>
      <span className="flex items-center gap-2 text-[12px] font-bold">
        <Icon size={18} /> {feedback.message}
      </span>
      <button type="button" onClick={onClose} className="text-[10px] font-black uppercase">
        Fechar
      </button>
    </div>
  );
}

function AdminProductsState({ message, loading = false }: { message: string; loading?: boolean }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center">
      {loading && <Loader2 className="animate-spin text-[#174F8C]" size={24} />}
      <p className="text-[13px] font-medium text-[#252A2E]/60">{message}</p>
    </div>
  );
}

function AdminProductsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="text-[#D9272E]" size={26} />
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
