import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "@tanstack/react-router";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ChevronRight, MessageCircle, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/cart";
import {
  PublicCatalogApiError,
  fetchPublicProductDetail,
  fetchPublicProducts,
  formatAvailability,
  formatPublicPrice,
  isProductInStock,
  toCartItem,
} from "@/lib/api/public-catalog";
import { toast } from "sonner";
import { PIZZATTO_WHATSAPP } from "@/lib/config";

export const Route = createFileRoute("/produtos/$id")({
  component: ProductDetail,
  head: () => ({
    meta: [
      { title: "Produto | Pizzatto Materiais Elétricos" },
      {
        name: "description",
        content: "Informações do produto no catálogo Pizzatto Materiais Elétricos.",
      },
    ],
  }),
});

function ProductDetailFeedback({
  mode,
  onRetry,
}: {
  mode: "loading" | "not-found" | "error";
  onRetry?: () => void;
}) {
  const title =
    mode === "not-found"
      ? "Produto não encontrado"
      : mode === "error"
        ? "Não foi possível carregar o produto"
        : "Carregando produto";
  const description =
    mode === "not-found"
      ? "O produto informado não existe ou não está disponível no catálogo."
      : mode === "error"
        ? "Tente novamente em alguns instantes."
        : "Aguarde enquanto buscamos as informações atualizadas.";

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Produtos" />
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div
          className={`bg-white p-12 rounded-[2px] border border-[#E5E7EB] shadow-sm ${mode === "loading" ? "animate-pulse" : ""}`}
        >
          <h1 className="text-2xl font-black uppercase tracking-tight mb-4">{title}</h1>
          <p className="text-[#252A2E]/60 mb-8">{description}</p>
          {mode === "error" && onRetry ? (
            <button
              onClick={onRetry}
              className="inline-block bg-[#174F8C] text-white px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md"
            >
              Tentar novamente
            </button>
          ) : mode === "not-found" ? (
            <Link
              to="/produtos"
              className="inline-block bg-[#174F8C] text-white px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md"
            >
              Ver produtos
            </Link>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const productQuery = useQuery({
    queryKey: ["public-product", id],
    queryFn: () => fetchPublicProductDetail(id),
    enabled: typeof window !== "undefined" && id.length > 0,
    staleTime: 30_000,
    retry: (failureCount, error) =>
      !(error instanceof PublicCatalogApiError && error.status === 404) && failureCount < 1,
  });
  const PRODUCT = productQuery.data;
  const relatedQuery = useQuery({
    queryKey: ["public-products-related", PRODUCT?.category],
    queryFn: () =>
      fetchPublicProducts({ category: PRODUCT?.category ?? undefined, page: 0, size: 4 }),
    enabled: typeof window !== "undefined" && Boolean(PRODUCT?.category),
    staleTime: 30_000,
  });

  const handleAddToCart = () => {
    if (!PRODUCT) return;
    addItem(toCartItem(PRODUCT, quantity));
    toast.success(`${quantity} item(s) adicionado(s) ao orçamento`);
  };

  const handleWhatsAppDirect = () => {
    if (!PRODUCT) return;
    const message = `Olá! Tenho interesse no produto: ${PRODUCT.name} (Ref: ${PRODUCT.reference ?? "N/A"}, Código: ${PRODUCT.erpId}). Gostaria de mais informações.`;
    window.open(PIZZATTO_WHATSAPP.getLink(message), "_blank");
  };

  const RELATED_PRODUCTS = (relatedQuery.data?.items ?? [])
    .filter((p) => p.erpId !== PRODUCT?.erpId)
    .slice(0, 3);

  if (productQuery.isPending) {
    return <ProductDetailFeedback mode="loading" />;
  }

  if (productQuery.isError || !PRODUCT) {
    const notFound =
      productQuery.error instanceof PublicCatalogApiError && productQuery.error.status === 404;
    return (
      <ProductDetailFeedback
        mode={notFound ? "not-found" : "error"}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const inStock = isProductInStock(PRODUCT.availability);

  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header activePage="Produtos" />

      <main>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-[11px] text-[#252A2E]/50 font-medium uppercase tracking-wider">
            <a href="/" className="hover:text-[#174F8C]">
              Início
            </a>
            <ChevronRight size={10} />
            <a href="/produtos" className="hover:text-[#174F8C]">
              Produtos
            </a>
            <ChevronRight size={10} />
            <span className="hover:text-[#174F8C] cursor-pointer">{PRODUCT.category}</span>
            <ChevronRight size={10} />
            <span className="text-[#252A2E]">{PRODUCT.name}</span>
          </nav>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column: Image */}
            <div className="bg-[#F4F5F6] rounded-[2px] aspect-square flex items-center justify-center p-8 lg:p-16">
              <ImageWithFallback
                src=""
                alt={PRODUCT.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Right Column: Info */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <div className="text-[12px] font-black text-[#174F8C] tracking-[0.2em] mb-3 uppercase">
                  {PRODUCT.manufacturer}
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-[#252A2E] leading-tight mb-4 uppercase tracking-tight">
                  {PRODUCT.name}
                </h1>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#252A2E]/50 font-medium border-b border-[#F4F5F6] pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[#252A2E]/30 uppercase tracking-widest">Ref:</span>
                    <span>{PRODUCT.reference ?? "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#252A2E]/30 uppercase tracking-widest">Código:</span>
                    <span>{PRODUCT.erpId}</span>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div
                  className={`flex items-center gap-2 text-[12px] font-bold mb-6 uppercase tracking-wider ${inStock ? "text-[#2E8B57]" : "text-[#252A2E]/40"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${inStock ? "bg-[#2E8B57] animate-pulse" : "bg-[#E5E7EB]"}`}
                  ></div>
                  {formatAvailability(PRODUCT.availability)}
                </div>

                <div className="mb-10">
                  {PRODUCT.price !== null ? (
                    <div className="text-4xl font-black text-[#252A2E] tracking-tight">
                      {formatPublicPrice(PRODUCT.price)}
                    </div>
                  ) : (
                    <div className="text-3xl font-black text-[#174F8C] uppercase tracking-widest">
                      Consulte
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-6 max-w-md">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#E5E7EB] rounded-[2px] bg-white">
                      <button
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="p-3 hover:bg-[#F4F5F6] transition text-[#252A2E]/60"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-bold text-[16px]">{quantity}</span>
                      <button
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="p-3 hover:bg-[#F4F5F6] transition text-[#252A2E]/60"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#174F8C] text-white py-5 rounded-[2px] font-black uppercase tracking-[0.1em] text-[14px] hover:bg-[#123E70] transition shadow-lg flex items-center justify-center gap-3 group"
                  >
                    <ShoppingBag size={20} />
                    Adicionar ao Orçamento
                  </button>
                  <button
                    onClick={handleWhatsAppDirect}
                    className="w-full bg-[#2E8B57] text-white py-5 rounded-[2px] font-black uppercase tracking-[0.1em] text-[14px] hover:bg-[#256F46] transition shadow-lg flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={20} />
                    Falar sobre este produto no WhatsApp
                  </button>
                </div>

                <p className="mt-4 text-[12px] text-[#252A2E]/50 font-medium">
                  Precisa de informações ou orçamento? Fale com nossa equipe pelo WhatsApp.
                </p>
              </div>

              <div className="mt-auto space-y-4 pt-8 border-t border-[#F4F5F6]">
                {PRODUCT.manufacturer && (
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#252A2E]/60">
                    <span>Ver mais produtos de:</span>
                    <Link
                      to="/marcas/$slug"
                      params={{ slug: PRODUCT.manufacturer.toLowerCase() }}
                      className="text-[#174F8C] hover:underline"
                    >
                      {PRODUCT.manufacturer}
                    </Link>
                  </div>
                )}
                {PRODUCT.category && (
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#252A2E]/60">
                    <span>Ver produtos em:</span>
                    <Link
                      to="/categorias/$slug"
                      params={{ slug: PRODUCT.category.toLowerCase().replace(/\s+/g, "-") }}
                      className="text-[#174F8C] hover:underline"
                    >
                      {PRODUCT.category}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info Section */}
        <div className="bg-[#F9FAFB] py-20 border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2">
                <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#252A2E] mb-8 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-[#174F8C]"></div>
                  Informações do Produto
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                  {[
                    { label: "Código ERP", value: PRODUCT.erpId },
                    { label: "Referência", value: PRODUCT.reference },
                    { label: "Part Number", value: PRODUCT.partNumber },
                    { label: "Fabricante", value: PRODUCT.manufacturer },
                    { label: "Categoria", value: PRODUCT.category },
                    { label: "Subcategoria", value: PRODUCT.subcategory },
                    { label: "Unidade", value: PRODUCT.unit },
                    { label: "NCM", value: PRODUCT.ncm },
                  ]
                    .filter((item) => item.value)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-[#E5E7EB]/50"
                      >
                        <span className="text-[12px] font-bold text-[#252A2E]/40 uppercase tracking-widest mb-1 md:mb-0">
                          {item.label}
                        </span>
                        <span className="text-[13px] font-bold text-[#252A2E] uppercase">
                          {item.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {PRODUCT.description && (
                <div>
                  <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#252A2E] mb-8 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-[#174F8C]"></div>
                    Sobre este produto
                  </h2>
                  <div className="prose prose-sm max-w-none text-[#252A2E]/70 font-medium leading-relaxed">
                    <p>{PRODUCT.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#252A2E] mb-12 text-center">
            Produtos Relacionados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {RELATED_PRODUCTS.map((prod) => {
              const relatedInStock = isProductInStock(prod.availability);
              return (
                <Link
                  key={prod.erpId}
                  to="/produtos/$id"
                  params={{ id: prod.erpId }}
                  className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative"
                >
                  <div className="relative w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50">
                    <ImageWithFallback
                      src=""
                      alt={prod.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">
                      {prod.manufacturer}
                    </div>
                    <h3 className="font-bold text-[14px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase min-h-[40px] line-clamp-2">
                      {prod.name}
                    </h3>
                    <div className="text-[10px] text-[#252A2E]/40 mb-4 font-medium italic">
                      Ref: {prod.reference ?? "N/A"}
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#F4F5F6]">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] font-bold mb-4 uppercase tracking-tighter ${relatedInStock ? "text-[#2E8B57]" : "text-[#252A2E]/40"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${relatedInStock ? "bg-[#2E8B57] animate-pulse" : "bg-[#E5E7EB]"}`}
                        ></div>
                        {formatAvailability(prod.availability)}
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="min-h-[32px] flex flex-col justify-end">
                          {prod.price !== null ? (
                            <div className="text-lg font-black text-[#252A2E]">
                              {formatPublicPrice(prod.price)}
                            </div>
                          ) : (
                            <div className="text-[14px] font-black text-[#252A2E]/30 uppercase tracking-[0.1em]">
                              Consulte
                            </div>
                          )}
                        </div>
                        <span className="w-full bg-[#174F8C] text-white py-2.5 rounded-[2px] hover:bg-[#123E70] transition flex items-center justify-center gap-2 group/btn shadow-sm">
                          <span className="text-[11px] font-bold uppercase tracking-wider">
                            Ver produto
                          </span>
                          <ChevronRight
                            size={14}
                            className="group-hover/btn:translate-x-1 transition"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Compact Support Section */}
        <div className="bg-[#174F8C] py-12 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
            <img
              src="https://pizzatto.com.br/wp-content/uploads/2023/10/bobininha-1.png"
              alt=""
              className="w-80 h-auto grayscale brightness-0 invert"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                Precisa de informações ou orçamento?
              </h3>
              <p className="text-white/70 font-medium">Fale com nossa equipe pelo WhatsApp.</p>
            </div>
            <button className="bg-[#2E8B57] text-white px-10 py-4 rounded-[2px] font-black uppercase tracking-[0.1em] text-[14px] hover:bg-[#256F46] transition shadow-xl flex items-center gap-3 whitespace-nowrap">
              <MessageCircle size={20} />
              FALAR NO WHATSAPP
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
