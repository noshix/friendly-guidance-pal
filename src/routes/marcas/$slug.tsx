import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronRight, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PublicTaxonomyProductResults } from "@/components/PublicTaxonomyProductResults";
import {
  buildManufacturerProductsParams,
  fetchPublicProducts,
  getCategories,
  getManufacturerBySlug,
  PublicCatalogApiError,
  PUBLIC_TAXONOMY_STALE_TIME,
  shouldRetryPublicTaxonomy,
  toCategoryFilterOption,
} from "@/lib/api/public-catalog";

interface ManufacturerRouteSearch {
  search?: string | undefined;
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

export const Route = createFileRoute("/marcas/$slug")({
  validateSearch: (search): ManufacturerRouteSearch => ({
    search: normalizeSearchValue(search["search"]),
    category: normalizeSearchValue(search["category"]),
    page: normalizeRoutePage(search["page"]),
  }),
  component: BrandDetail,
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} | Pizzatto Materiais Elétricos`,
      },
      {
        name: "description",
        content: `Confira os produtos da marca ${params.slug} no catálogo da Pizzatto.`,
      },
    ],
  }),
});

function BrandDetail() {
  const { slug } = Route.useParams();
  const routeSearch = Route.useSearch();
  const navigate = Route.useNavigate();
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(routeSearch.search ?? "");
  const [draftCategory, setDraftCategory] = useState(routeSearch.category);

  const manufacturerQuery = useQuery({
    queryKey: ["public-manufacturer", slug],
    queryFn: () => getManufacturerBySlug(slug),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: shouldRetryPublicTaxonomy,
  });

  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getCategories(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const categoryOptions = useMemo(
    () => (categoriesQuery.data ?? []).map(toCategoryFilterOption),
    [categoriesQuery.data],
  );
  const productParams = useMemo(
    () =>
      manufacturerQuery.data
        ? buildManufacturerProductsParams(
            manufacturerQuery.data,
            routeSearch.page ?? 1,
            routeSearch.search,
            routeSearch.category,
          )
        : undefined,
    [manufacturerQuery.data, routeSearch],
  );

  const productsQuery = useQuery({
    queryKey: ["public-manufacturer-products", slug, productParams],
    queryFn: () => fetchPublicProducts(productParams ?? {}),
    enabled: typeof window !== "undefined" && productParams !== undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    setSearchInput(routeSearch.search ?? "");
  }, [routeSearch.search]);

  useEffect(() => {
    setDraftCategory(routeSearch.category);
  }, [routeSearch.category]);

  const applySearch = () => {
    void navigate({
      search: (previous) => ({
        ...previous,
        search: searchInput.trim() || undefined,
        page: 1,
      }),
    });
  };

  const selectCategory = (category: string) => {
    const nextCategory = routeSearch.category === category ? undefined : category;
    setDraftCategory(nextCategory);
    void navigate({ search: (previous) => ({ ...previous, category: nextCategory, page: 1 }) });
  };

  const applyFilters = () => {
    void navigate({ search: (previous) => ({ ...previous, category: draftCategory, page: 1 }) });
    setIsFilterMobileOpen(false);
  };

  const goToPage = (page: number) => {
    void navigate({ search: (previous) => ({ ...previous, page }) });
  };

  const manufacturerNotFound =
    manufacturerQuery.error instanceof PublicCatalogApiError &&
    manufacturerQuery.error.status === 404;

  if (manufacturerQuery.isError) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
          {manufacturerNotFound ? "Marca não encontrada." : "Não foi possível carregar as marcas."}
        </h1>
        {!manufacturerNotFound && (
          <button
            type="button"
            onClick={() => void manufacturerQuery.refetch()}
            className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px]"
          >
            Tentar novamente
          </button>
        )}
      </main>
    );
  }

  if (manufacturerQuery.isPending || !manufacturerQuery.data) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-24" aria-label="Carregando marca">
        <div className="h-10 w-64 bg-[#E5E7EB] animate-pulse mb-4" />
        <div className="h-5 w-96 max-w-full bg-[#E5E7EB] animate-pulse" />
      </main>
    );
  }

  const manufacturer = manufacturerQuery.data;

  return (
    <main>
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <Link to="/" className="hover:text-[#174F8C]">
              Início
            </Link>
            <ChevronRight size={12} />
            <Link to="/marcas" className="hover:text-[#174F8C]">
              Marcas
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">{manufacturer.name}</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">
            {manufacturer.name}
          </h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Confira produtos deste fabricante.
          </p>
        </div>
      </div>

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
              placeholder={`Buscar produtos ${manufacturer.name}...`}
              className="w-full bg-white py-4 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium"
            />
          </div>
          <button
            type="button"
            onClick={applySearch}
            className="bg-[#174F8C] text-white px-10 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 mt-4">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryOptions.map((category) => (
            <button
              type="button"
              key={category.slug}
              onClick={() => selectCategory(category.value)}
              className={`whitespace-nowrap bg-white border px-4 py-2 rounded-[2px] text-[11px] font-bold hover:border-[#174F8C] hover:text-[#174F8C] transition uppercase tracking-wider shadow-sm ${routeSearch.category === category.value ? "border-[#174F8C] text-[#174F8C]" : "border-[#E5E7EB] text-[#252A2E]/50"}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-[240px] space-y-8">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 space-y-6 shadow-sm sticky top-28">
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">
                  Categoria
                </h3>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {categoryOptions.map((category) => (
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
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">
                  Disponibilidade
                </h3>
                <div className="space-y-3">
                  {["Em estoque", "Consulte disponibilidade"].map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-[#E5E7EB] rounded-[2px]" />
                      <span className="text-[13px] text-[#252A2E]/70">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={applyFilters}
                className="w-full bg-[#174F8C] text-white py-3 rounded-[2px] text-[12px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition shadow-md"
              >
                Filtrar
              </button>
            </div>
          </aside>

          <section className="flex-1">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-4 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsFilterMobileOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider"
                >
                  <Filter size={14} /> Filtrar
                </button>
                <span className="text-[13px] font-bold text-[#252A2E]/60 uppercase tracking-wider">
                  {productsQuery.data?.totalElements ?? 0} Produtos encontrados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest">
                  Ordenar:
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider min-w-[140px] justify-between"
                >
                  Relevância <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <PublicTaxonomyProductResults
              page={productsQuery.data}
              isPending={productsQuery.isPending}
              isError={productsQuery.isError}
              onRetry={() => void productsQuery.refetch()}
              onPageChange={goToPage}
            />
          </section>
        </div>
      </div>

      {isFilterMobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em]">Filtros</h2>
              <button
                type="button"
                onClick={() => setIsFilterMobileOpen(false)}
                className="p-2 text-[#252A2E]/40 hover:text-[#252A2E]"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[#F4F5F6]">
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
                type="button"
                onClick={applyFilters}
                className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] text-[13px] font-bold uppercase tracking-widest shadow-lg"
              >
                Aplicar Filtros
              </button>
              <button
                type="button"
                onClick={() => setIsFilterMobileOpen(false)}
                className="w-full text-[#252A2E]/40 py-2 text-[11px] font-bold uppercase tracking-widest"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
