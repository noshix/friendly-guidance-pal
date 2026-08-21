import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { getCategories, PUBLIC_TAXONOMY_STALE_TIME } from "@/lib/api/public-catalog";

export const Route = createFileRoute("/categorias/")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categorias | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Explore o catálogo da Pizzatto organizado por categoria." },
    ],
  }),
});

function CategoriesPage() {
  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getCategories(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const categories = categoriesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Categorias" />

      <main>
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
              <Link to="/" className="hover:text-[#174F8C]">
                Início
              </Link>
              <ChevronRight size={12} />
              <span className="text-[#252A2E]">Categorias</span>
            </nav>
            <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">
              Categorias
            </h1>
            <p className="text-[#252A2E]/60 max-w-2xl font-medium">
              Encontre materiais elétricos organizados por categoria.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {categoriesQuery.isPending ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
              aria-label="Carregando categorias"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[#F4F5F6]" />
                  <div className="p-6">
                    <div className="h-5 w-2/3 bg-[#F4F5F6] mb-4" />
                    <div className="h-4 w-1/2 bg-[#F4F5F6]" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoriesQuery.isError ? (
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
              <h2 className="text-xl font-black uppercase tracking-tight mb-3">
                Não foi possível carregar as categorias.
              </h2>
              <button
                type="button"
                onClick={() => void categoriesQuery.refetch()}
                className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition"
              >
                Tentar novamente
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
              <p className="text-[#252A2E]/60 font-medium">Nenhuma categoria disponível.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to="/categorias/$slug"
                  params={{ slug: category.slug }}
                  className="bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden hover:border-[#174F8C] hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#F4F5F6]">
                    <ImageWithFallback
                      src=""
                      alt={category.name}
                      type="category"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-[#252A2E] uppercase tracking-tight mb-2 group-hover:text-[#174F8C] transition">
                      {category.name}
                    </h3>
                    <p className="text-[13px] text-[#252A2E]/60 font-medium mb-6 line-clamp-2">
                      {category.productCount.toLocaleString("pt-BR")} produtos públicos
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F4F5F6]">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#174F8C]">
                        Explorar
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-[#174F8C] group-hover:translate-x-1 transition"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
