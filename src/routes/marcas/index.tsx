import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { getManufacturers, PUBLIC_TAXONOMY_STALE_TIME } from "@/lib/api/public-catalog";

export const Route = createFileRoute("/marcas/")({
  component: BrandsIndex,
  head: () => ({
    meta: [
      { title: "Marcas | Pizzatto Materiais Elétricos" },
      {
        name: "description",
        content:
          "Explore o catálogo da Pizzatto por fabricante. Encontre as melhores marcas de materiais elétricos.",
      },
    ],
  }),
});

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BrandsIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const manufacturersQuery = useQuery({
    queryKey: ["public-manufacturers"],
    queryFn: () => getManufacturers(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });

  const filteredManufacturers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
    return (manufacturersQuery.data ?? []).filter((manufacturer) =>
      manufacturer.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [manufacturersQuery.data, searchTerm]);

  return (
    <main>
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <Link to="/" className="hover:text-[#174F8C]">
              Início
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">Marcas</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">
            Marcas
          </h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Explore o catálogo por fabricante.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
          <div className="relative w-full md:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar fabricante..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-white border border-[#E5E7EB] py-3 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium focus:border-[#174F8C] transition"
            />
          </div>

          <div className="flex flex-wrap gap-1 justify-center">
            {ALPHABET.map((letter) => (
              <button
                type="button"
                key={letter}
                onClick={() => setSearchTerm(letter)}
                className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#252A2E]/40 hover:text-[#174F8C] hover:bg-white rounded-[2px] transition border border-transparent hover:border-[#E5E7EB]"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {manufacturersQuery.isPending ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6"
            aria-label="Carregando marcas"
          >
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className="bg-white border border-[#E5E7EB] min-h-[140px] animate-pulse"
              />
            ))}
          </div>
        ) : manufacturersQuery.isError ? (
          <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight mb-3">
              Não foi possível carregar as marcas.
            </h2>
            <button
              type="button"
              onClick={() => void manufacturersQuery.refetch()}
              className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {filteredManufacturers.map((manufacturer) => (
                <Link
                  key={manufacturer.slug}
                  to="/marcas/$slug"
                  params={{ slug: manufacturer.slug }}
                  className="bg-white border border-[#E5E7EB] p-6 rounded-[2px] flex flex-col items-center justify-center text-center group hover:border-[#174F8C] hover:shadow-md transition-all duration-300 min-h-[140px]"
                >
                  <div className="text-lg lg:text-xl font-black text-[#252A2E] group-hover:text-[#174F8C] transition uppercase tracking-tighter mb-2">
                    {manufacturer.name}
                  </div>
                  <div className="text-[11px] font-bold text-[#252A2E]/50 mb-4">
                    {manufacturer.productCount.toLocaleString("pt-BR")} produtos públicos
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#252A2E]/30 group-hover:text-[#174F8C] transition">
                    Ver produtos
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>

            {filteredManufacturers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#252A2E]/40 font-medium">
                  Nenhum fabricante encontrado para "{searchTerm}".
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
