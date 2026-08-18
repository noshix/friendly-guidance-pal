import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, ChevronRight, Filter, Grid, List, ChevronDown, Check, X } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useState } from "react";

export const Route = createFileRoute("/produtos")({
  component: Products,
  head: () => ({
    meta: [
      { title: "Produtos | Catálogo Pizzatto Materiais Elétricos" },
      { name: "description", content: "Catálogo completo de materiais elétricos da Pizzatto. Encontre cabos, iluminação, proteção e muito mais." },
      { property: "og:title", content: "Produtos | Catálogo Pizzatto Materiais Elétricos" },
      { property: "og:description", content: "Catálogo completo de materiais elétricos da Pizzatto. Encontre cabos, iluminação, proteção e muito mais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

// Mock Data
const MOCK_PRODUCTS = [
  { id: 1, brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: '', inStock: true },
  { id: 2, brand: 'SIL', name: 'Cabo Flexível 2,5 mm² Azul 750V', ref: 'Rolo 100m', price: '349,00', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400', inStock: true },
  { id: 3, brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: '6500K Bivolt', price: '49,90', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400', inStock: true },
  { id: 4, brand: 'STECK', name: 'Quadro de Distribuição 24 DIN', ref: 'Sobrepor', price: '124,50', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400', inStock: false },
  { id: 5, brand: 'WEG', name: 'Motor Trifásico 2CV', ref: 'W22 Premium', price: null, img: '', inStock: true },
  { id: 6, brand: 'TRAMONTINA', name: 'Alicate Universal 8"', ref: 'Isolado 1000V', price: '85,90', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400', inStock: true },
  { id: 7, brand: 'CORFIO', name: 'Cabo PP 3x2,5mm²', ref: 'Metro', price: '12,50', img: '', inStock: false },
  { id: 8, brand: 'PIAL', name: 'Interruptor Simples 4x2', ref: 'Pial Plus', price: '22,90', img: 'https://images.unsplash.com/photo-1563770660941-20978e870e93?auto=format&fit=crop&q=80&w=400', inStock: true },
  { id: 9, brand: 'SIEMENS', name: 'Contator Trifásico 25A', ref: '3RT2026-1AK60', price: '245,00', img: '', inStock: true },
  { id: 10, brand: 'SIL', name: 'Cabo Flexível 6,0 mm² Preto', ref: 'Metro', price: '8,90', img: '', inStock: true },
  { id: 11, brand: 'ALUMBRA', name: 'Plafon LED 18W Quadrado', ref: 'Embutir', price: '32,90', img: '', inStock: true },
  { id: 12, brand: 'STECK', name: 'Tomada Industrial 2P+T 16A', ref: 'Azul', price: '45,00', img: '', inStock: true },
];

const CATEGORIES = [
  'Cabos e Condutores', 'Iluminação', 'Proteção Elétrica', 'Conectores', 
  'Ferramentas', 'Aterramento', 'Transformadores', 'Tubos e Conduítes'
];

function Products() {
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [viewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Produtos" />

      {/* Breadcrumb & Title */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <a href="/" className="hover:text-[#174F8C]">Início</a>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">Produtos</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">Produtos</h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Encontre materiais elétricos para sua casa, obra, empresa ou projeto.
          </p>
        </div>
      </div>

      {/* Search Bar - Tool Style */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white p-2 rounded-[2px] shadow-xl border border-[#E5E7EB] flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30" size={20}/>
            <input 
              type="text" 
              placeholder="Busque por produto, código, referência ou fabricante..." 
              className="w-full bg-white py-4 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium"
            />
          </div>
          <button className="bg-[#174F8C] text-white px-10 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md">
            Buscar
          </button>
        </div>
      </div>

      {/* Fast Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} className="whitespace-nowrap bg-white border border-[#E5E7EB] px-4 py-2 rounded-[2px] text-[12px] font-bold text-[#252A2E]/70 hover:border-[#174F8C] hover:text-[#174F8C] transition uppercase tracking-wider shadow-sm">
              {cat}
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
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">Categoria</h3>
                <div className="space-y-3">
                  {CATEGORIES.slice(0, 5).map(cat => (
                    <label key={cat} className="flex items-center gap-2 group cursor-pointer">
                      <div className="w-4 h-4 border border-[#E5E7EB] group-hover:border-[#174F8C] rounded-[2px] flex items-center justify-center transition">
                        <Check size={10} className="text-[#174F8C] opacity-0 group-hover:opacity-20" />
                      </div>
                      <span className="text-[13px] text-[#252A2E]/70 group-hover:text-[#252A2E] transition">{cat}</span>
                    </label>
                  ))}
                  <button className="text-[11px] font-bold text-[#174F8C] hover:underline uppercase tracking-wider pt-1">Ver todas</button>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">Fabricante</h3>
                <div className="space-y-3">
                  {['Siemens', 'Sil', 'Alumbra', 'Steck', 'Weg'].map(brand => (
                    <label key={brand} className="flex items-center gap-2 group cursor-pointer">
                      <div className="w-4 h-4 border border-[#E5E7EB] group-hover:border-[#174F8C] rounded-[2px] flex items-center justify-center transition">
                        <Check size={10} className="text-[#174F8C] opacity-0 group-hover:opacity-20" />
                      </div>
                      <span className="text-[13px] text-[#252A2E]/70 group-hover:text-[#252A2E] transition">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 border-b border-[#F4F5F6] pb-2">Disponibilidade</h3>
                <div className="space-y-3">
                  {['Em estoque', 'Consulte disponibilidade'].map(status => (
                    <label key={status} className="flex items-center gap-2 group cursor-pointer">
                      <div className="w-4 h-4 border border-[#E5E7EB] group-hover:border-[#174F8C] rounded-[2px] flex items-center justify-center transition">
                        <Check size={10} className="text-[#174F8C] opacity-0 group-hover:opacity-20" />
                      </div>
                      <span className="text-[13px] text-[#252A2E]/70 group-hover:text-[#252A2E] transition">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button className="w-full bg-[#174F8C] text-white py-3 rounded-[2px] text-[12px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition shadow-md">Aplicar Filtros</button>
                <button className="w-full bg-white text-[#252A2E]/50 py-3 rounded-[2px] text-[11px] font-bold uppercase tracking-widest hover:text-[#252A2E] transition">Limpar Filtros</button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-4 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsFilterMobileOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider"
                >
                  <Filter size={14} /> Filtrar
                </button>
                <span className="text-[13px] font-bold text-[#252A2E]/60 uppercase tracking-wider">
                  <span className="font-normal italic mr-1">Exibindo</span> {MOCK_PRODUCTS.length} Produtos encontrados
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest">Ordenar por:</span>
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider min-w-[160px] justify-between">
                      Mais relevantes <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {MOCK_PRODUCTS.map((prod) => (
                <div key={prod.id} className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative">
                  
                  <div className="relative w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50">
                    <ImageWithFallback 
                      src={prod.img} 
                      alt={prod.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">{prod.brand}</div>
                    <h3 className="font-bold text-[14px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase min-h-[40px] line-clamp-2">{prod.name}</h3>
                    <div className="text-[10px] text-[#252A2E]/40 mb-4 font-medium italic">Ref: {prod.ref}</div>
                    
                    <div className="mt-auto pt-4 border-t border-[#F4F5F6]">
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-4 uppercase tracking-tighter ${prod.inStock ? 'text-[#2E8B57]' : 'text-[#252A2E]/40'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${prod.inStock ? 'bg-[#2E8B57] animate-pulse' : 'bg-[#E5E7EB]'}`}></div>
                        {prod.inStock ? 'Em estoque' : 'Consulte disponibilidade'}
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="min-h-[32px] flex flex-col justify-end">
                          {prod.price ? (
                            <div className="text-lg font-black text-[#252A2E]">R$ {prod.price}</div>
                          ) : (
                            <div className="text-[14px] font-black text-[#252A2E]/30 uppercase tracking-[0.1em]">Consulte</div>
                          )}
                        </div>
                        <button className="w-full bg-[#174F8C] text-white py-2.5 rounded-[2px] hover:bg-[#123E70] transition flex items-center justify-center gap-2 group/btn shadow-sm">
                          <span className="text-[11px] font-bold uppercase tracking-wider">Ver produto</span>
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center">
              <nav className="flex items-center gap-1">
                <button className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40 hover:bg-[#F4F5F6] transition cursor-not-allowed">Anterior</button>
                <button className="w-10 h-10 bg-[#174F8C] text-white rounded-[2px] text-[12px] font-bold">1</button>
                <button className="w-10 h-10 border border-[#E5E7EB] text-[#252A2E]/60 rounded-[2px] text-[12px] font-bold hover:bg-[#F4F5F6] transition">2</button>
                <button className="w-10 h-10 border border-[#E5E7EB] text-[#252A2E]/60 rounded-[2px] text-[12px] font-bold hover:bg-[#F4F5F6] transition">3</button>
                <span className="px-2 text-[#252A2E]/30 font-bold">...</span>
                <button className="w-10 h-10 border border-[#E5E7EB] text-[#252A2E]/60 rounded-[2px] text-[12px] font-bold hover:bg-[#F4F5F6] transition">42</button>
                <button className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E] hover:bg-[#F4F5F6] transition flex items-center gap-2">Próxima <ChevronRight size={14}/></button>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isFilterMobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em]">Filtros</h2>
              <button onClick={() => setIsFilterMobileOpen(false)} className="p-2 text-[#252A2E]/40 hover:text-[#252A2E]">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Same filters as desktop */}
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 pb-2 border-b border-[#F4F5F6]">Categoria</h3>
                <div className="space-y-4">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-3">
                      <div className="w-5 h-5 border border-[#E5E7EB] rounded-[2px]"></div>
                      <span className="text-[14px] text-[#252A2E]/70">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E7EB] space-y-3">
              <button className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] text-[13px] font-bold uppercase tracking-widest shadow-lg">Aplicar Filtros</button>
              <button onClick={() => setIsFilterMobileOpen(false)} className="w-full text-[#252A2E]/40 py-2 text-[11px] font-bold uppercase tracking-widest">Limpar</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
