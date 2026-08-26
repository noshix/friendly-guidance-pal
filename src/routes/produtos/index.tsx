import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, ChevronRight, Filter, ChevronDown, Check, X, ShoppingBag } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/lib/cart";
import {
  PUBLIC_CATALOG_PAGE_SIZE,
  PUBLIC_TAXONOMY_STALE_TIME,
  apiPageToUiPage,
  fetchPublicProducts,
  formatAvailability,
  formatPublicPrice,
  getCategories,
  getManufacturers,
  isProductInStock,
  toCategoryFilterOption,
  toCartItem,
  toManufacturerFilterOption,
  uiPageToApiPage,
  type PublicProductSummary,
} from "@/lib/api/public-catalog";
import { toast } from "sonner";

interface ProductsRouteSearch {
  search?: string | undefined;
  manufacturer?: string | undefined;
  category?: string | undefined;
  page?: number | undefined;
}

function normalizeSearchValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeRoutePage(value: unknown): number {
  const page = typeof value === "number" ? value : Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export const Route = createFileRoute("/produtos/")({
  validateSearch: (search): ProductsRouteSearch => ({
    search: normalizeSearchValue(search["search"]),
    manufacturer: normalizeSearchValue(search["manufacturer"]),
    category: normalizeSearchValue(search["category"]),
    page: normalizeRoutePage(search["page"]),
  }),
  component: Products,
  head: () => ({
    meta: [
      { title: "Produtos | Catálogo Pizzatto Materiais Elétricos" },
      {
        name: "description",
        content:
          "Catálogo completo de materiais elétricos da Pizzatto. Encontre cabos, iluminação, proteção e muito mais.",
      },
      { property: "og:title", content: "Produtos | Catálogo Pizzatto Materiais Elétricos" },
      {
        property: "og:description",
        content:
          "Catálogo completo de materiais elétricos da Pizzatto. Encontre cabos, iluminação, proteção e muito mais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function paginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const candidates = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = [...candidates]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

function Products() {
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const routeSearch = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchInput, setSearchInput] = useState(routeSearch.search ?? "");
  const [draftCategory, setDraftCategory] = useState(routeSearch.category);
  const [draftManufacturer, setDraftManufacturer] = useState(routeSearch.manufacturer);
  const addItem = useCartStore((state) => state.addItem);

  const apiParams = useMemo(
    () => ({
      search: routeSearch.search,
      manufacturer: routeSearch.manufacturer,
      category: routeSearch.category,
      page: uiPageToApiPage(routeSearch.page ?? 1),
      size: PUBLIC_CATALOG_PAGE_SIZE,
    }),
    [routeSearch],
  );

  const productsQuery = useQuery({
    queryKey: ["public-products", apiParams],
    queryFn: () => fetchPublicProducts(apiParams),
    enabled: typeof window !== "undefined",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
  });

  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getCategories(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const manufacturersQuery = useQuery({
    queryKey: ["public-manufacturers"],
    queryFn: () => getManufacturers(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const categoryOptions = useMemo(
    () => (categoriesQuery.data ?? []).map(toCategoryFilterOption),
    [categoriesQuery.data],
  );
  const manufacturerOptions = useMemo(
    () => (manufacturersQuery.data ?? []).map(toManufacturerFilterOption),
    [manufacturersQuery.data],
  );

  useEffect(() => {
    setSearchInput(routeSearch.search ?? "");
  }, [routeSearch.search]);

  useEffect(() => {
    setDraftCategory(routeSearch.category);
    setDraftManufacturer(routeSearch.manufacturer);
  }, [routeSearch.category, routeSearch.manufacturer]);

  useEffect(() => {
    const normalizedInput = searchInput.trim();
    if (normalizedInput === (routeSearch.search ?? "")) return;
    const timeout = window.setTimeout(() => {
      void navigate({
        search: (previous) => ({
          ...previous,
          search: normalizedInput || undefined,
          page: 1,
        }),
        replace: true,
      });
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [navigate, routeSearch.search, searchInput]);

  const applySearch = () => {
    void navigate({
      search: (previous) => ({
        ...previous,
        search: searchInput.trim() || undefined,
        page: 1,
      }),
    });
  };

  const applyFilters = () => {
    void navigate({
      search: (previous) => ({
        ...previous,
        category: draftCategory,
        manufacturer: draftManufacturer,
        page: 1,
      }),
    });
    setIsFilterMobileOpen(false);
  };

  const clearFilters = () => {
    setSearchInput("");
    setDraftCategory(undefined);
    setDraftManufacturer(undefined);
    void navigate({ search: { page: 1 } });
    setIsFilterMobileOpen(false);
  };

  const selectFastCategory = (category: string) => {
    const nextCategory = routeSearch.category === category ? undefined : category;
    setDraftCategory(nextCategory);
    void navigate({
      search: (previous) => ({ ...previous, category: nextCategory, page: 1 }),
    });
  };

  const goToPage = (uiPage: number) => {
    void navigate({
      search: (previous) => ({ ...previous, page: uiPage }),
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: PublicProductSummary) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(toCartItem(product));
    toast.success("Produto adicionado ao orçamento");
  };

  const productPage = productsQuery.data;
  const products = productPage?.items ?? [];
  const currentPage = productPage ? apiPageToUiPage(productPage.page) : (routeSearch.page ?? 1);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Produtos" />

      {/* Breadcrumb & Title */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <Link to="/" className="hover:text-[#174F8C]">
              Início
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">Produtos</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">
            Produtos
          </h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Encontre materiais elétricos para sua casa, obra, empresa ou projeto.
          </p>
        </div>
      </div>

      {/* Search Bar - Tool Style */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white p-2 rounded-[2px] shadow-xl border border-[#E5E7EB] flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30"
              size={20}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder="Busque por produto, código, referência ou fabricante..."
              className="w-full bg-white py-4 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium"
            />
          </div>
          <button
            onClick={applySearch}
            className="bg-[#174F8C] text-white px-10 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Fast Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {categoryOptions.map((category) => (
            <button
              key={category.slug}
              onClick={() => selectFastCategory(category.value)}
              className={`whitespace-nowrap bg-white border px-4 py-2 rounded-[2px] text-[12px] font-bold hover:border-[#174F8C] hover:text-[#174F8C] transition uppercase tracking-wider shadow-sm ${routeSearch.category === category.value ? "border-[#174F8C] text-[#174F8C]" : "border-[#E5E7EB] text-[#252A2E]/70"}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-[240px] space-y-8">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 space-y-6 shadow-sm sticky top-28">
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">
                  Categoria
                </h3>
                <div className="space-y-3">
                  {categoryOptions.slice(0, 5).map((category) => (
                    <button
                      type="button"
                      key={category.slug}
                      onClick={() =>
                        setDraftCategory(
                          draftCategory === category.value ? undefined : category.value,
                        )
                      }
                      className="flex items-center gap-2 group cursor-pointer text-left w-full"
                    >
                      <div className="w-4 h-4 border border-[#E5E7EB] group-hover:border-[#174F8C] rounded-[2px] flex items-center justify-center transition">
                        <Check
                          size={10}
                          className={`text-[#174F8C] ${draftCategory === category.value ? "opacity-100" : "opacity-0 group-hover:opacity-20"}`}
                        />
                      </div>
                      <span className="text-[13px] text-[#252A2E]/70 group-hover:text-[#252A2E] transition">
                        {category.label}
                      </span>
                    </button>
                  ))}
                  {categoriesQuery.isError && (
                    <p className="text-[11px] text-[#252A2E]/50">
                      Não foi possível carregar as categorias.
                    </p>
                  )}
                  <Link
                    to="/categorias"
                    className="inline-block text-[11px] font-bold text-[#174F8C] hover:underline uppercase tracking-wider pt-1"
                  >
                    Ver todas
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">
                  Fabricante
                </h3>
                <div className="space-y-3">
                  {manufacturerOptions.map((manufacturer) => (
                    <button
                      type="button"
                      key={manufacturer.slug}
                      onClick={() =>
                        setDraftManufacturer(
                          draftManufacturer === manufacturer.value ? undefined : manufacturer.value,
                        )
                      }
                      className="flex items-center gap-2 group cursor-pointer text-left w-full"
                    >
                      <div className="w-4 h-4 border border-[#E5E7EB] group-hover:border-[#174F8C] rounded-[2px] flex items-center justify-center transition">
                        <Check
                          size={10}
                          className={`text-[#174F8C] ${draftManufacturer === manufacturer.value ? "opacity-100" : "opacity-0 group-hover:opacity-20"}`}
                        />
                      </div>
                      <span className="text-[13px] text-[#252A2E]/70 group-hover:text-[#252A2E] transition">
                        {manufacturer.label}
                      </span>
                    </button>
                  ))}
                  {manufacturersQuery.isError && (
                    <p className="text-[11px] text-[#252A2E]/50">
                      Não foi possível carregar as marcas.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">
                  Disponibilidade
                </h3>
                <div className="space-y-3">
                  {["Em estoque", "Consulte disponibilidade"].map((status) => (
                    <label key={status} className="flex items-center gap-2 group cursor-pointer">
                      <div className="w-4 h-4 border border-[#E5E7EB] group-hover:border-[#174F8C] rounded-[2px] flex items-center justify-center transition">
                        <Check
                          size={10}
                          className="text-[#174F8C] opacity-0 group-hover:opacity-20"
                        />
                      </div>
                      <span className="text-[13px] text-[#252A2E]/70 group-hover:text-[#252A2E] transition">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={applyFilters}
                  className="w-full bg-[#174F8C] text-white py-3 rounded-[2px] text-[12px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition shadow-md"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full bg-white text-[#252A2E]/50 py-3 rounded-[2px] text-[11px] font-bold uppercase tracking-widest hover:text-[#252A2E] transition"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setIsFilterMobileOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider"
                >
                  <Filter size={14} /> Filtrar
                </button>
                <span className="text-[13px] font-bold text-[#252A2E]/60 uppercase tracking-wider leading-snug">
                  <span className="font-normal italic mr-1">Exibindo</span>{" "}
                  {productPage?.totalElements ?? 0} Produtos encontrados
                </span>
              </div>
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="hidden sm:inline text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest">
                    Ordenar por:
                  </span>
                  <div className="relative group w-full sm:w-auto">
                    <button className="w-full sm:min-w-[160px] flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider justify-between">
                      Mais relevantes <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            {productsQuery.isPending ? (
              <div
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                aria-label="Carregando produtos"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 animate-pulse"
                  >
                    <div className="w-full aspect-square mb-6 bg-[#F4F5F6]" />
                    <div className="h-3 w-1/3 bg-[#F4F5F6] mb-3" />
                    <div className="h-4 w-full bg-[#F4F5F6] mb-2" />
                    <div className="h-4 w-2/3 bg-[#F4F5F6]" />
                  </div>
                ))}
              </div>
            ) : productsQuery.isError ? (
              <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
                <h2 className="text-xl font-black uppercase tracking-tight mb-3">
                  Não foi possível carregar os produtos
                </h2>
                <p className="text-[#252A2E]/60 mb-6">Tente novamente em alguns instantes.</p>
                <button
                  onClick={() => void productsQuery.refetch()}
                  className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition"
                >
                  Tentar novamente
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
                <h2 className="text-xl font-black uppercase tracking-tight mb-3">
                  Nenhum produto encontrado
                </h2>
                <p className="text-[#252A2E]/60 mb-6">
                  Revise a busca ou limpe os filtros para tentar novamente.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map((prod) => {
                  const inStock = isProductInStock(prod.availability);
                  return (
                    <div
                      key={prod.erpId}
                      className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative"
                    >
                      <Link
                        to="/produtos/$id"
                        params={{ id: prod.erpId }}
                        className="flex flex-col h-full"
                      >
                        <div className="relative w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50">
                          <ImageWithFallback
                            src={prod.primaryImageUrl ?? ""}
                            alt={prod.name}
                            loading="lazy"
                            width={480}
                            height={480}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                          />
                        </div>

                        <div className="flex-1 flex flex-col">
                          <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">
                            {prod.manufacturer}
                          </div>
                          <h3 className="font-bold text-[14px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase h-[54px] line-clamp-3">
                            {prod.name}
                          </h3>
                          <div className="text-[10px] text-[#252A2E]/40 mb-4 font-medium italic">
                            Ref: {prod.reference ?? "N/A"}
                          </div>

                          <div className="mt-auto pt-4 border-t border-[#F4F5F6]">
                            <div
                              className={`flex items-center gap-1.5 text-[10px] font-bold mb-4 uppercase tracking-tighter ${inStock ? "text-[#2E8B57]" : "text-[#252A2E]/40"}`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-[#2E8B57] animate-pulse" : "bg-[#E5E7EB]"}`}
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
                                  <div className="text-[14px] font-black text-[#174F8C] uppercase tracking-[0.1em]">
                                    Consulte
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-5 gap-2">
                                <span className="col-span-4 bg-[#174F8C] text-white py-2.5 rounded-[2px] hover:bg-[#123E70] transition flex items-center justify-center gap-2 group/btn shadow-sm">
                                  <span className="text-[11px] font-bold uppercase tracking-wider">
                                    Ver produto
                                  </span>
                                  <ChevronRight
                                    size={14}
                                    className="group-hover/btn:translate-x-1 transition"
                                  />
                                </span>
                                <button
                                  onClick={(e) => handleAddToCart(e, prod)}
                                  className="bg-[#F4F5F6] text-[#252A2E]/60 hover:text-[#174F8C] hover:bg-[#E5E7EB] transition flex items-center justify-center rounded-[2px] shadow-sm"
                                  title="Adicionar ao orçamento"
                                >
                                  <ShoppingBag size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {productPage && productPage.totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                    className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40 hover:bg-[#F4F5F6] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {paginationItems(currentPage, productPage.totalPages).map((item, index) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-[#252A2E]/30 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => goToPage(item)}
                        className={`w-10 h-10 rounded-[2px] text-[12px] font-bold transition ${item === currentPage ? "bg-[#174F8C] text-white" : "border border-[#E5E7EB] text-[#252A2E]/60 hover:bg-[#F4F5F6]"}`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    disabled={currentPage >= productPage.totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E] hover:bg-[#F4F5F6] transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próxima <ChevronRight size={14} />
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isFilterMobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em]">Filtros</h2>
              <button
                onClick={() => setIsFilterMobileOpen(false)}
                className="p-2 text-[#252A2E]/40 hover:text-[#252A2E]"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Same filters as desktop */}
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 pb-2 border-b border-[#F4F5F6]">
                  Categoria
                </h3>
                <div className="space-y-4">
                  {categoryOptions.map((category) => (
                    <button
                      type="button"
                      key={category.slug}
                      onClick={() =>
                        setDraftCategory(
                          draftCategory === category.value ? undefined : category.value,
                        )
                      }
                      className="flex items-center gap-3 w-full text-left"
                    >
                      <div className="w-5 h-5 border border-[#E5E7EB] rounded-[2px] flex items-center justify-center">
                        {draftCategory === category.value && (
                          <Check size={12} className="text-[#174F8C]" />
                        )}
                      </div>
                      <span className="text-[14px] text-[#252A2E]/70">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E7EB] space-y-3">
              <button
                onClick={applyFilters}
                className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] text-[13px] font-bold uppercase tracking-widest shadow-lg"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                className="w-full text-[#252A2E]/40 py-2 text-[11px] font-bold uppercase tracking-widest"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
