import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/marcas/")({
  component: BrandsIndex,
  head: () => ({
    meta: [
      { title: "Marcas | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Explore o catálogo da Pizzatto por fabricante. Encontre as melhores marcas de materiais elétricos." },
    ],
  }),
});

const BRANDS = [
  { name: "SIEMENS", slug: "siemens" },
  { name: "WEG", slug: "weg" },
  { name: "SCHNEIDER", slug: "schneider" },
  { name: "TRAMONTINA", slug: "tramontina" },
  { name: "STECK", slug: "steck" },
  { name: "SIL", slug: "sil" },
  { name: "ALUMBRA", slug: "alumbra" },
  { name: "PIAL", slug: "pial" },
  { name: "CORFIO", slug: "corfio" },
  { name: "3M", slug: "3m" },
  { name: "TASCHIBRA", slug: "taschibra" },
  { name: "LORENZETTI", slug: "lorenzetti" },
  { name: "ELUMA", slug: "eluma" },
  { name: "TIGRE", slug: "tigre" },
  { name: "INTELBRAS", slug: "intelbras" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BrandsIndex() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBrands = BRANDS.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main>
      {/* Breadcrumb & Title */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <Link to="/" className="hover:text-[#174F8C]">Início</Link>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">Marcas</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">Marcas</h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Explore o catálogo por fabricante.
          </p>
        </div>
      </div>

      {/* Search & Alphabet Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30" size={18}/>
            <input 
              type="text" 
              placeholder="Buscar fabricante..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] py-3 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium focus:border-[#174F8C] transition"
            />
          </div>
          
          <div className="flex flex-wrap gap-1 justify-center">
            {ALPHABET.map(letter => (
              <button 
                key={letter}
                className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#252A2E]/40 hover:text-[#174F8C] hover:bg-white rounded-[2px] transition border border-transparent hover:border-[#E5E7EB]"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {filteredBrands.map((brand) => (
            <Link 
              key={brand.slug} 
              to="/marcas/$slug" 
              params={{ slug: brand.slug }}
              className="bg-white border border-[#E5E7EB] p-6 rounded-[2px] flex flex-col items-center justify-center text-center group hover:border-[#174F8C] hover:shadow-md transition-all duration-300 min-h-[140px]"
            >
              <div className="text-lg lg:text-xl font-black text-[#252A2E] group-hover:text-[#174F8C] transition uppercase tracking-tighter mb-4">
                {brand.name}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#252A2E]/30 group-hover:text-[#174F8C] transition">
                Ver produtos
                <ChevronRight size={12} className="group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#252A2E]/40 font-medium">Nenhum fabricante encontrado para "{searchTerm}".</p>
          </div>
        )}
      </div>
    </main>
  );
}
