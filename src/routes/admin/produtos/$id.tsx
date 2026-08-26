import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Database,
  Globe,
  Info,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminProductMediaSection } from "@/components/admin/AdminProductMediaSection";
import { formatAdminPrice, formatAdminQuantity } from "@/lib/admin-products-flow";
import {
  adminProductQueryKey,
  expireAdminProductSession,
  invalidateAdminProductData,
} from "@/lib/admin-products-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import {
  AdminProductsApiError,
  getAdminProduct,
  isAdminProductsUnauthorizedError,
  updateAdminProductEditorial,
  type AdminProductDetail,
} from "@/lib/api/admin-products";

export const Route = createFileRoute("/admin/produtos/$id")({
  component: EditProduct,
});

type SaveFeedback = { kind: "success" | "error"; message: string } | null;

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback>(null);
  const productQuery = useQuery({
    queryKey: adminProductQueryKey(id),
    queryFn: () => getAdminProduct(id),
    retry: (failureCount, error) =>
      !(error instanceof AdminProductsApiError && [401, 404].includes(error.status)) &&
      failureCount < 1,
  });

  useEffect(() => {
    if (productQuery.data) {
      setDisplayName(productQuery.data.editorial.displayName ?? "");
      setVisible(productQuery.data.editorial.visible);
    }
  }, [productQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      updateAdminProductEditorial(
        id,
        { displayName: displayName.trim() || null, visible },
        await getAdminCsrf(),
      ),
    onSuccess: async (product) => {
      queryClient.setQueryData(adminProductQueryKey(id), product);
      await invalidateAdminProductData(queryClient, id);
      setDisplayName(product.editorial.displayName ?? "");
      setVisible(product.editorial.visible);
      setFeedback({ kind: "success", message: "Produto salvo com sucesso." });
    },
    onError: (error) => {
      if (!isAdminProductsUnauthorizedError(error)) {
        setFeedback({ kind: "error", message: "Não foi possível salvar o produto." });
      }
    },
  });

  const expiredError = [productQuery.error, saveMutation.error].find(
    isAdminProductsUnauthorizedError,
  );
  useEffect(() => {
    if (expiredError) {
      void expireAdminProductSession(expiredError, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [expiredError, navigate, queryClient]);

  if (expiredError) {
    return <ProductDetailState message="Sessão expirada. Redirecionando para o login..." loading />;
  }

  if (productQuery.isPending) {
    return <ProductDetailState message="Carregando dados reais do produto..." loading />;
  }

  if (productQuery.error instanceof AdminProductsApiError && productQuery.error.status === 404) {
    return (
      <ProductDetailState message="Produto não encontrado.">
        <Link
          to="/admin/produtos"
          className="rounded-[2px] bg-[#174F8C] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
        >
          Voltar aos produtos
        </Link>
      </ProductDetailState>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ProductDetailState message="Não foi possível carregar este produto.">
        <button
          type="button"
          onClick={() => void productQuery.refetch()}
          className="rounded-[2px] bg-[#174F8C] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
        >
          Tentar novamente
        </button>
      </ProductDetailState>
    );
  }

  const product = productQuery.data;
  const fallbackName = product.erpControlled.erpDescription;
  const dirty =
    displayName !== (product.editorial.displayName ?? "") || visible !== product.editorial.visible;

  const resetForm = () => {
    setDisplayName(product.editorial.displayName ?? "");
    setVisible(product.editorial.visible);
    setFeedback(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/admin/produtos"
            className="shrink-0 rounded-[2px] p-2 text-[#252A2E]/40 transition hover:bg-white hover:text-[#252A2E]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E]">
              Editar Produto
            </h2>
            <p className="break-all text-[11px] font-bold uppercase tracking-wider text-[#252A2E]/45">
              ERP ID: {product.erpId}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetForm}
            disabled={!dirty || saveMutation.isPending}
            className="inline-flex items-center gap-2 border border-[#E5E7EB] bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/65 disabled:opacity-35"
          >
            <RotateCcw size={14} /> Desfazer
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!dirty || saveMutation.isPending}
            className="inline-flex items-center gap-2 bg-[#174F8C] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Save size={15} />
            )}
            {saveMutation.isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-3 border p-4 text-[12px] font-bold ${
            feedback.kind === "success"
              ? "border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]"
              : "border-[#D9272E]/30 bg-[#D9272E]/10 text-[#D9272E]"
          }`}
        >
          {feedback.kind === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F4F5F6] p-6">
              <Globe className="text-[#174F8C]" size={18} />
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">
                Publicação no site
              </h3>
            </div>
            <div className="space-y-7 p-5 sm:p-8">
              <div>
                <label
                  htmlFor="admin-display-name"
                  className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-[#252A2E]/50"
                >
                  Nome de exibição
                </label>
                <input
                  id="admin-display-name"
                  type="text"
                  maxLength={500}
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setFeedback(null);
                  }}
                  className="w-full rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-[14px] font-bold text-[#252A2E] outline-none focus:border-[#174F8C]"
                />
                <p className="mt-2 text-[11px] font-medium text-[#252A2E]/45">
                  Pode ser limpo. Nesse caso, o catálogo usa a descrição original do ERP:
                  <span className="mt-1 block font-bold text-[#252A2E]/65">{fallbackName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:p-6">
                <button
                  type="button"
                  role="switch"
                  aria-checked={visible}
                  aria-label="Produto publicado no catálogo"
                  onClick={() => {
                    setVisible((current) => !current);
                    setFeedback(null);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    visible ? "bg-[#2E8B57]" : "bg-[#C9CDD1]"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      visible ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div>
                  <span className="block text-[12px] font-black uppercase tracking-wider text-[#252A2E]">
                    {visible ? "Publicado" : "Oculto"}
                  </span>
                  <span className="text-[10px] font-medium text-[#252A2E]/45">
                    Produtos ocultos não aparecem nas buscas, categorias ou páginas públicas.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <AdminProductMediaSection
            erpId={product.erpId}
            productName={product.editorial.displayName || product.erpControlled.erpDescription}
          />

          <div className="flex gap-4 rounded-[2px] border border-[#174F8C]/20 bg-[#174F8C]/5 p-5">
            <Info className="shrink-0 text-[#174F8C]" size={20} />
            <p className="text-[11px] font-medium leading-relaxed text-[#174F8C]">
              Somente nome de exibição e visibilidade são editáveis. Preço, estoque, fabricante,
              categoria e os demais campos abaixo continuam sob autoridade exclusiva do ERP.
            </p>
          </div>
        </div>

        <ErpFields product={product} />
      </div>
    </div>
  );
}

function ErpFields({ product }: { product: AdminProductDetail }) {
  const erp = product.erpControlled;
  return (
    <section className="h-fit overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-[#F4F5F6] shadow-sm lg:col-span-1">
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] bg-white/60 p-5">
        <Database className="text-[#252A2E]/45" size={18} />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#252A2E]/65">
          Dados do ERP · somente leitura
        </h3>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-1">
        <ReadOnlyField label="Código ERP" value={product.erpId} />
        <ReadOnlyField label="Descrição original do ERP" value={erp.erpDescription} />
        <ReadOnlyField label="Fabricante" value={erp.manufacturerRaw} />
        <ReadOnlyField label="Categoria" value={erp.erpGroup} />
        <ReadOnlyField label="Subcategoria" value={erp.erpSubgroup} />
        <ReadOnlyField label="Referência" value={erp.reference} />
        <ReadOnlyField label="Part number" value={erp.partNumber} />
        <ReadOnlyField label="NCM" value={erp.ncm} />
        <ReadOnlyField label="Unidade" value={erp.unit} />
        <ReadOnlyField label="Preço de venda ERP" value={formatAdminPrice(erp.retailPrice)} />
        <ReadOnlyField label="Saldo disponível" value={formatAdminQuantity(erp.availableStock)} />
        <ReadOnlyField label="Saldo atual" value={formatAdminQuantity(erp.currentStock)} />
      </div>
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.2em] text-[#252A2E]/40">
        {label}
      </span>
      <span className="block break-words rounded-[2px] border border-black/5 bg-white/60 px-3 py-2 text-[11px] font-bold text-[#252A2E]/70">
        {value || "—"}
      </span>
    </div>
  );
}

function ProductDetailState({
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
        <Loader2 className="animate-spin text-[#174F8C]" size={26} />
      ) : (
        <AlertCircle className="text-[#D9272E]" size={26} />
      )}
      <p className="text-[13px] font-medium text-[#252A2E]/60">{message}</p>
      {children}
    </div>
  );
}
