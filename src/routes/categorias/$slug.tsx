import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronRight, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PublicTaxonomyProductResults } from "@/components/PublicTaxonomyProductResults";
import {
  buildCategoryProductsParams,
  fetchPublicProducts,
  getCategoryBySlug,
  getManufacturers,
  PublicCatalogApiError,
  PUBLIC_TAXONOMY_STALE_TIME,
  shouldRetryPublicTaxonomy,
  toManufacturerFilterOption,
} from "@/lib/api/public-catalog";

interface CategoryRouteSearch {
  search?: string | undefined;
  manufacturer?: string | undefined;
  page?: number | undefined;
}

function normalizeSearchValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeRoutePage(value: unknown): number {
  const page = typeof value === "number" ? value : Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export const Route = createFileRoute("/categorias/$slug")({
  validateSearch: (search): CategoryRouteSearch => ({
    search: normalizeSearchValue(search["search"]),
    manufacturer: normalizeSearchValue(search["manufacturer"]),
    page: normalizeRoutePage(search["page"]),
  }),
  component: CategoryDetail,
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")} | Pizzatto Materiais Elétricos`,
      },
      {
        name: "description",
        content: "Confira produtos desta categoria na Pizzatto Materiais Elétricos.",
      },
    ],
  }),
});

function CategoryDetail() {
  const { slug } = Route.useParams();
  const routeSearch = Route.useSearch();
  const navigate = Route.useNavigate();
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(routeSearch.search ?? "");
  const [draftManufacturer, setDraftManufacturer] = useState(routeSearch.manufacturer);

  const categoryQuery = useQuery({
    queryKey: ["public-category", slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: shouldRetryPublicTaxonomy,
  });

  const manufacturersQuery = useQuery({
    queryKey: ["public-manufacturers"],
    queryFn: () => getManufacturers(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const manufacturerOptions = useMemo(
    () => (manufacturersQuery.data ?? []).map(toManufacturerFilterOption),
    [manufacturersQuery.data],
  );
  const productParams = useMemo(
    () =>
      categoryQuery.data
        ? buildCategoryProductsParams(
            categoryQuery.data,
            routeSearch.page ?? 1,
            routeSearch.search,
            routeSearch.manufacturer,
          )
        : undefined,
    [categoryQuery.data, routeSearch],
  );

  const productsQuery = useQuery({
    queryKey: ["public-category-products", slug, productParams],
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
    setDraftManufacturer(routeSearch.manufacturer);
  }, [routeSearch.manufacturer]);

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
      search: (previous) => ({ ...previous, manufacturer: draftManufacturer, page: 1 }),
    });
    setIsFilterMobileOpen(false);
  };

  const goToPage = (page: number) => {
    void navigate({ search: (previous) => ({ ...previous, page }) });
  };

  const categoryNotFound =
    categoryQuery.error instanceof PublicCatalogApiError && categoryQuery.error.status === 404;

  if (categoryQuery.isError) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
        <Header activePage="Categorias" />
        <main className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            {categoryNotFound
              ? "Categoria não encontrada."
              : "Não foi possível carregar as categorias."}
          </h1>
          {!categoryNotFound && (
            <button
              type="button"
              onClick={() => void categoryQuery.refetch()}
              className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px]"
            >
              Tentar novamente
            </button>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  if (categoryQuery.isPending || !categoryQuery.data) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
        <Header activePage="Categorias" />
        <main className="max-w-7xl mx-auto px-4 py-24" aria-label="Carregando categoria">
          <div className="h-10 w-64 bg-[#E5E7EB] animate-pulse mb-4" />
          <div className="h-5 w-96 max-w-full bg-[#E5E7EB] animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  const category = categoryQuery.data;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Categorias" />

      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <Link to="/" className="hover:text-[#174F8C]">
              Início
            </Link>
            <ChevronRight size={12} />
            <Link to="/categorias" className="hover:text-[#174F8C]">
              Categorias
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">
            {category.name}
          </h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Confira produtos desta categoria.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-2 rounded-[2px] shadow-lg border border-[#E5E7EB] flex flex-col md:flex-row gap-2 max-w-2xl">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30"
              size={18}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder={`Buscar em ${category.name}...`}
              className="w-full bg-white py-3 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium text-sm"
            />
          </div>
          <button
            type="button"
            onClick={applySearch}
            className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition shadow-md"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-[240px] space-y-8">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">
                  Fabricante
                </h3>
                <div className="space-y-3 max-h-52 overflow-y-auto">
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
                Aplicar Filtros
              </button>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-4 mb-6 flex items-center justify-between shadow-sm">
              <button
                type="button"
                onClick={() => setIsFilterMobileOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider"
              >
                <Filter size={14} /> Filtrar
              </button>
              <span className="text-[13px] font-bold text-[#252A2E]/60 uppercase tracking-wider">
                <span className="font-normal italic mr-1">Exibindo</span>{" "}
                {productsQuery.data?.totalElements ?? 0} Produtos
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest">
                  Ordenar:
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider"
                >
                  Relevantes <ChevronDown size={14} />
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
          </main>
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
                  Fabricante
                </h3>
                <div className="space-y-4">
                  {manufacturerOptions.map((manufacturer) => (
                    <button
                      type="button"
                      key={manufacturer.slug}
                      onClick={() =>
                        setDraftManufacturer(
                          draftManufacturer === manufacturer.value ? undefined : manufacturer.value,
                        )
                      }
                      className="flex items-center gap-3 w-full text-left"
                    >
                      <div className="w-5 h-5 border border-[#E5E7EB] rounded-[2px] flex items-center justify-center">
                        {draftManufacturer === manufacturer.value && (
                          <Check size={12} className="text-[#174F8C]" />
                        )}
                      </div>
                      <span className="text-[14px] text-[#252A2E]/70">{manufacturer.label}</span>
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
                Aplicar
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

      <Footer />
    </div>
  );
}
