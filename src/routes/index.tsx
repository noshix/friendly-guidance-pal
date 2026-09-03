import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ChevronRight, MessageSquare, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
// Assets replaced by static public paths:
// logo -> /assets/logo-pizzatto.png
// logo-icon -> /assets/simbolo-pizzatto.png
// bobininha -> /assets/bobininha.png
// fachada -> /assets/fachada.jpg
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useCartStore } from "@/lib/cart";
import { toast } from "sonner";
import { PIZZATTO_WHATSAPP } from "@/lib/config";
import {
  buildHomeProductsParams,
  fetchPublicProducts,
  formatAvailability,
  formatPublicPrice,
  getCategories,
  getManufacturers,
  HOME_CATEGORY_LIMIT,
  HOME_PRODUCT_LIMIT,
  isProductInStock,
  PUBLIC_PRODUCTS_STALE_TIME,
  PUBLIC_TAXONOMY_STALE_TIME,
  selectHomeCategories,
  toCartItem,
  type PublicProductSummary,
} from "@/lib/api/public-catalog";

const HOME_CATEGORY_IMAGE_BY_ERP_NAME: Record<string, string> = {
  CONDUTOR: "/assets/categories/condutor.jpg",
  PROTECAO: "/assets/categories/protecao.png",
  FERRAMENT: "/assets/categories/ferramenta.jpg",
  "EQUIPAM.": "/assets/categories/equipamentos.jpg",
  COMANDOS: "/assets/categories/comando.jpg",
  ATERRAMEN: "/assets/categories/aterramento.jpg",
  DIVERSOS: "/assets/categories/diversos.jpg",
  ISOLADORES: "/assets/categories/isoladores.jpg",
};

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pizzatto Materiais Elétricos | Loja Especializada em Cuiabá - MT" },
      {
        name: "description",
        content:
          "Mais de 40 anos de experiência em materiais elétricos. Loja especializada em Cuiabá, Mato Grosso.",
      },
      {
        property: "og:title",
        content: "Pizzatto Materiais Elétricos | Loja Especializada em Cuiabá - MT",
      },
      {
        property: "og:description",
        content:
          "Mais de 40 anos de experiência em materiais elétricos. Loja especializada em Cuiabá, Mato Grosso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const addItem = useCartStore((state) => state.addItem);
  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getCategories(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });
  const productsQuery = useQuery({
    queryKey: ["public-products", "home", HOME_PRODUCT_LIMIT],
    queryFn: () => fetchPublicProducts(buildHomeProductsParams()),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_PRODUCTS_STALE_TIME,
    retry: 1,
  });
  const manufacturersQuery = useQuery({
    queryKey: ["public-manufacturers"],
    queryFn: () => getManufacturers(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });
  const homeCategories = useMemo(
    () => selectHomeCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const manufacturerByName = useMemo(
    () =>
      new Map(
        (manufacturersQuery.data ?? []).map((manufacturer) => [
          manufacturer.name.trim().toLocaleUpperCase("pt-BR"),
          manufacturer,
        ]),
      ),
    [manufacturersQuery.data],
  );

  const handleAddToCart = (event: React.MouseEvent, product: PublicProductSummary) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(toCartItem(product));
    toast.success("Produto adicionado ao orçamento");
  };

  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header />

      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="w-full lg:flex-1 min-w-0 space-y-6">
          <div className="inline-flex items-center bg-[#174F8C]/10 text-[#174F8C] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest">
            Pizzatto Materiais Elétricos
          </div>
          <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] font-extrabold text-[#252A2E] leading-[1] tracking-tighter">
            Materiais elétricos para <br className="hidden sm:block" />
            sua obra, empresa e projeto.
          </h1>
          <p className="text-[18px] text-[#252A2E]/70 leading-relaxed max-w-[550px]">
            Encontre materiais elétricos para sua casa, obra, empresa ou projeto com a experiência
            de quem atua há mais de 40 anos no segmento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/produtos"
              className="w-full sm:w-auto bg-[#2E8B57] text-white px-5 sm:px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#257046] transition shadow-md flex items-center justify-center text-center"
            >
              Explorar catálogo
            </Link>
            <Link
              to="/orcamento"
              className="w-full sm:w-auto bg-[#F5C400] text-[#252A2E] px-5 sm:px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#E0B200] transition shadow-md flex items-center justify-center text-center"
            >
              Solicitar orçamento
            </Link>
          </div>
          <div className="relative pt-6">
            <Search className="absolute left-4 top-10 text-[#252A2E]/30" size={20} />
            <input
              type="text"
              placeholder="Busque por produto, código, referência ou fabricante..."
              className="w-full bg-white border border-[#252A2E]/20 py-4 pl-12 pr-4 rounded-[2px] shadow-sm focus:ring-2 focus:ring-[#174F8C] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium"
            />
          </div>
        </div>
        <div className="lg:flex-1 min-w-0 relative w-full max-w-[500px] lg:max-w-none h-[280px] sm:h-[380px] lg:h-[500px]">
          <div className="absolute inset-0 bg-transparent rounded-[4px] overflow-hidden">
            <ImageWithFallback
              src="/assets/simbolo-pizzatto.png"
              alt="Pizzatto Materiais Elétricos"
              className="w-full h-full object-contain p-8 sm:p-12"
            />
          </div>
          <div className="absolute -bottom-4 right-0 sm:-bottom-6 sm:-right-2 xl:-right-6 bg-[#2E8B57] text-white p-4 sm:p-6 rounded-[2px] shadow-xl z-10">
            <div className="text-[32px] sm:text-[40px] font-black italic leading-none">40+</div>
            <div className="text-[10px] font-bold tracking-widest uppercase mt-1">
              Anos de Experiência
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="w-16 h-1 bg-[#F5C400] mb-4"></div>
            <h2 className="text-3xl font-bold text-[#252A2E]">Encontre o que precisa</h2>
            <p className="text-[#252A2E]/60 text-sm mt-2">
              Variedade e atendimento especializado em materiais elétricos.
            </p>
          </div>
          <Link
            to="/categorias"
            className="text-[#174F8C] font-bold text-sm flex items-center gap-1 hover:underline"
          >
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categoriesQuery.isPending &&
            Array.from({ length: HOME_CATEGORY_LIMIT }, (_, index) => (
              <div
                key={index}
                className="bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden animate-pulse"
                aria-hidden="true"
              >
                <div className="aspect-[4/3] bg-[#F4F5F6]" />
                <div className="p-4 border-t border-[#F4F5F6]">
                  <div className="h-4 w-2/3 bg-[#E5E7EB]" />
                </div>
              </div>
            ))}

          {categoriesQuery.isError && (
            <p className="col-span-2 md:col-span-4 py-8 text-sm text-[#252A2E]/50">
              Consulte todas as categorias disponíveis no catálogo.
            </p>
          )}

          {categoriesQuery.isSuccess && homeCategories.length === 0 && (
            <p className="col-span-2 md:col-span-4 py-8 text-sm text-[#252A2E]/50">
              Novas categorias serão exibidas à medida que os produtos forem publicados.
            </p>
          )}

          {homeCategories.map((category) => (
            <Link
              key={category.slug}
              to="/categorias/$slug"
              params={{ slug: category.slug }}
              className="group relative bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden hover:border-[#174F8C] transition duration-300 shadow-sm cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F4F5F6] relative">
                <ImageWithFallback
                  src={
                    HOME_CATEGORY_IMAGE_BY_ERP_NAME[
                      category.erpName.trim().toLocaleUpperCase("pt-BR")
                    ] ?? ""
                  }
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-95"
                  type="category"
                />
              </div>
              <div className="p-4 bg-white border-t border-[#F4F5F6]">
                <h3 className="font-bold text-[15px] text-[#252A2E] group-hover:text-[#174F8C] transition">
                  {category.name}
                </h3>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm text-[#174F8C]">
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F5F6]/30 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="w-16 h-1 bg-[#F5C400] mb-4"></div>
              <h2 className="text-3xl font-bold text-[#252A2E]">Produtos em destaque</h2>
              <p className="text-[#252A2E]/60 text-sm mt-2">
                Confira alguns produtos disponíveis no catálogo.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {productsQuery.isPending &&
              Array.from({ length: HOME_PRODUCT_LIMIT }, (_, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 min-h-[430px] animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-3 w-20 bg-[#E5E7EB] mb-3" />
                  <div className="w-full aspect-square bg-[#F4F5F6] mb-6" />
                  <div className="h-4 w-full bg-[#E5E7EB] mb-2" />
                  <div className="h-3 w-1/2 bg-[#E5E7EB]" />
                </div>
              ))}

            {productsQuery.isError && (
              <p className="md:col-span-4 py-8 text-sm text-[#252A2E]/50">
                Consulte o catálogo completo para ver os produtos disponíveis.
              </p>
            )}

            {productsQuery.isSuccess && productsQuery.data.items.length === 0 && (
              <p className="md:col-span-4 py-8 text-sm text-[#252A2E]/50">
                Novos produtos serão exibidos à medida que forem publicados.
              </p>
            )}

            {(productsQuery.data?.items ?? []).map((product) => {
              const inStock = isProductInStock(product.availability);
              const formattedPrice = formatPublicPrice(product.price);
              const manufacturer = product.manufacturer
                ? manufacturerByName.get(product.manufacturer.trim().toLocaleUpperCase("pt-BR"))
                : undefined;

              return (
                <div
                  key={product.erpId}
                  className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative"
                >
                  {manufacturer ? (
                    <Link
                      to="/marcas/$slug"
                      params={{ slug: manufacturer.slug }}
                      className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase hover:text-[#174F8C] transition"
                    >
                      {manufacturer.name}
                    </Link>
                  ) : (
                    <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">
                      {product.manufacturer ?? "Fabricante não informado"}
                    </div>
                  )}
                  <Link
                    to="/produtos/$id"
                    params={{ id: product.erpId }}
                    className="flex flex-col h-full"
                  >
                    <div className="w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50 p-4 relative">
                      <ImageWithFallback
                        src={product.primaryImageUrl ?? ""}
                        alt={product.name}
                        loading="lazy"
                        width={480}
                        height={480}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
                      />
                    </div>
                    <h3 className="font-bold text-[15px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase min-h-[40px] line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-[11px] text-[#252A2E]/50 mb-auto">
                      Ref: {product.reference ?? "N/A"}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#F4F5F6]">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] font-bold mb-2 uppercase tracking-tighter ${inStock ? "text-[#2E8B57]" : "text-[#252A2E]/40"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-[#2E8B57] animate-pulse" : "bg-[#E5E7EB]"}`}
                        ></div>
                        {formatAvailability(product.availability)}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-[#252A2E]/40 block leading-none mb-1">
                            Por apenas
                          </span>
                          {formattedPrice !== "Consulte" ? (
                            <div className="text-xl font-black text-[#252A2E]">
                              {formattedPrice}
                            </div>
                          ) : (
                            <div className="text-[16px] font-black text-[#174F8C] uppercase tracking-[0.1em]">
                              Consulte
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(event) => handleAddToCart(event, product)}
                            className="bg-[#F4F5F6] text-[#252A2E]/60 hover:text-[#174F8C] hover:bg-[#E5E7EB] transition flex items-center justify-center p-2 rounded-[2px] shadow-sm"
                            title="Adicionar ao orçamento"
                          >
                            <ShoppingBag size={18} />
                          </button>
                          <div className="bg-[#2E8B57] text-white p-2 rounded-[2px] group-hover:bg-[#257046] transition">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 min-w-0 relative">
          <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#174F8C]/10 -z-10 rounded-[4px]"></div>
          <img
            src="/assets/fachada.jpg"
            alt="Fachada Pizzatto"
            className="w-full h-auto rounded-[4px] shadow-xl border border-[#E5E7EB]"
          />
          <div className="absolute top-8 left-8 bg-[#F5C400] text-[#174F8C] px-4 py-2 font-black italic shadow-lg rounded-[2px] transform -rotate-2">
            CUIABÁ - MT
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-6">
          <div className="w-16 h-1 bg-[#174F8C] mb-2"></div>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold text-[#252A2E] leading-tight">
            Há mais de 40 anos ao lado de quem constrói.
          </h2>
          <p className="text-[18px] text-[#252A2E]/70 leading-relaxed">
            A Pizzatto reúne mais de 40 anos de experiência no segmento de materiais elétricos em
            Cuiabá, atendendo consumidores, profissionais e empresas com variedade e compromisso
            técnico.
          </p>
          <div className="pt-4">
            <div className="inline-block border-l-4 border-[#F5C400] pl-4">
              <div className="text-4xl font-black text-[#2E8B57]">40+</div>
              <div className="text-[14px] font-bold text-[#252A2E]/50 uppercase tracking-widest mt-1">
                Anos de Experiência
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#174F8C] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 sm:w-1/3 h-full bg-[#123E70]/50 skew-x-12 transform translate-x-10 sm:translate-x-20 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition duration-500"></div>
            <img
              src="/assets/bobininha.png"
              alt="Bobininha"
              className="w-48 h-48 object-contain relative z-10"
            />
          </div>
          <div className="flex-1 text-center md:text-left text-white">
            <h2 className="text-[28px] sm:text-[32px] font-black mb-4 leading-tight">
              Dúvidas sobre materiais ou precisa de orçamento?
            </h2>
            <p className="text-white/80 mb-8 text-[18px] max-w-[600px]">
              Fale com nossa equipe e solicite atendimento via WhatsApp para sua lista de materiais.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start gap-4">
              <a
                href={PIZZATTO_WHATSAPP.getLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#2E8B57] text-white px-5 sm:px-10 py-4 rounded-[2px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#257548] transition shadow-2xl text-center"
              >
                <MessageSquare size={20} /> Falar no WhatsApp
              </a>
              <Link
                to="/contato"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 sm:px-10 py-4 rounded-[2px] font-black uppercase tracking-widest hover:bg-white/20 transition flex items-center justify-center text-center"
              >
                Localização
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
