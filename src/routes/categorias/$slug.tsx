import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, ChevronRight, Filter, ChevronDown, Check, X } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useState } from "react";

export const Route = createFileRoute("/categorias/$slug")({
  component: CategoryDetail,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | Pizzatto Materiais Elétricos` },
      { name: "description", content: "Confira produtos desta categoria na Pizzatto Materiais Elétricos." },
    ],
  }),
});

// Mock Products (Same source as /produtos)
const MOCK_PRODUCTS = [
  { id: "3481", brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: '', inStock: true, category: 'Proteção Elétrica' },
  { id: "2", brand: 'SIL', name: 'Cabo Flexível 2,5 mm² Azul 750V', ref: 'Rolo 100m', price: '349,00', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400', inStock: true, category: 'Cabos e Condutores' },
  { id: "3", brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: '6500K Bivolt', price: '49,90', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400', inStock: true, category: 'Iluminação' },
  { id: "4", brand: 'STECK', name: 'Quadro de Distribuição 24 DIN', ref: 'Sobrepor', price: '124,50', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400', inStock: false, category: 'Proteção Elétrica' },
  { id: "9", brand: 'SIEMENS', name: 'Contator Trifásico 25A', ref: '3RT2026-1AK60', price: '245,00', img: '', inStock: true, category: 'Proteção Elétrica' },
];

const CATEGORY_MAP: Record<string, string> = {
  'cabos-e-condutores': 'Cabos e Condutores',
  'iluminacao': 'Iluminação',
  'protecao-eletrica': 'Proteção Elétrica',
  'conectores': 'Conectores',
  'ferramentas': 'Ferramentas',
  'aterramento': 'Aterramento',
  'transformadores': 'Transformadores',
  'tubos-e-conduites': 'Tubos e Conduítes',
  'comandos': 'Comandos',
};

const SUB_GROUPS: Record<string, string[]> = {
  'protecao-eletrica': ['Disjuntores', 'DR', 'DPS', 'Fusíveis'],
  'iluminacao': ['Lâmpadas LED', 'Painéis', 'Luminárias', 'Refletores'],
};

function CategoryDetail() {
  const { slug } = Route.useParams();
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  
  const categoryName = CATEGORY_MAP[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subCategories = SUB_GROUPS[slug] || [];
  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.category.toLowerCase().replace(/\s+/g, '-') === slug || slug === 'protecao-eletrica' // Multi-fallback for demo
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Categorias" />

      {/* Breadcrumb & Title */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
            <Link to="/" className="hover:text-[#174F8C]">Início</Link>
            <ChevronRight size={12} />
            <Link to="/categorias" className="hover:text-[#174F8C]">Categorias</Link>
            <ChevronRight size={12} />
            <span className="text-[#252A2E]">{categoryName}</span>
          </nav>
          <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">{categoryName}</h1>
          <p className="text-[#252A2E]/60 max-w-2xl font-medium">
            Confira produtos desta categoria.
          </p>
        </div>
      </div>

      {/* Subcategories Chips */}
      {subCategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 pb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#252A2E]/30 flex items-center mr-2">Subcategorias (Mock):</span>
            {subCategories.map(sub => (
              <button key={sub} className="bg-white border border-[#E5E7EB] px-4 py-1.5 rounded-full text-[12px] font-bold text-[#252A2E]/70 hover:border-[#174F8C] hover:text-[#174F8C] transition uppercase tracking-wider shadow-sm">
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-2 rounded-[2px] shadow-lg border border-[#E5E7EB] flex flex-col md:flex-row gap-2 max-w-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30" size={18}/>
            <input 
              type="text" 
              placeholder={`Buscar em ${categoryName}...`} 
              className="w-full bg-white py-3 pl-12 pr-4 rounded-[2px] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium text-sm"
            />
          </div>
          <button className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition shadow-md">
            Buscar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-[240px] space-y-8">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 space-y-6 shadow-sm">
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
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-4 mb-6 flex items-center justify-between shadow-sm">
              <button 
                onClick={() => setIsFilterMobileOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider"
              >
                <Filter size={14} /> Filtrar
              </button>
              <span className="text-[13px] font-bold text-[#252A2E]/60 uppercase tracking-wider">
                <span className="font-normal italic mr-1">Exibindo</span> {filteredProducts.length} Produtos
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest">Ordenar:</span>
                <button className="flex items-center gap-2 bg-[#F4F5F6] px-4 py-2 rounded-[2px] text-[12px] font-bold uppercase tracking-wider">
                  Relevantes <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((prod) => (
                <Link key={prod.id} to={`/produtos/${prod.id}`} className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative">
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
                        <span className="w-full bg-[#174F8C] text-white py-2.5 rounded-[2px] hover:bg-[#123E70] transition flex items-center justify-center gap-2 group/btn shadow-sm">
                          <span className="text-[11px] font-bold uppercase tracking-wider">Ver produto</span>
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition"/>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Reused */}
            <div className="mt-16 flex justify-center">
              <nav className="flex items-center gap-1">
                <button className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40 hover:bg-[#F4F5F6] transition">Anterior</button>
                <button className="w-10 h-10 bg-[#174F8C] text-white rounded-[2px] text-[12px] font-bold">1</button>
                <button className="w-10 h-10 border border-[#E5E7EB] text-[#252A2E]/60 rounded-[2px] text-[12px] font-bold hover:bg-[#F4F5F6] transition">2</button>
                <span className="px-2 text-[#252A2E]/30 font-bold">...</span>
                <button className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E] hover:bg-[#F4F5F6] transition flex items-center gap-2">Próxima <ChevronRight size={14}/></button>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer Reused */}
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
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-4 pb-2 border-b border-[#F4F5F6]">Fabricante</h3>
                <div className="space-y-4">
                  {['Siemens', 'Sil', 'Alumbra', 'Steck', 'Weg'].map(brand => (
                    <label key={brand} className="flex items-center gap-3">
                      <div className="w-5 h-5 border border-[#E5E7EB] rounded-[2px]"></div>
                      <span className="text-[14px] text-[#252A2E]/70">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E7EB] space-y-3">
              <button className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] text-[13px] font-bold uppercase tracking-widest shadow-lg">Aplicar</button>
              <button onClick={() => setIsFilterMobileOpen(false)} className="w-full text-[#252A2E]/40 py-2 text-[11px] font-bold uppercase tracking-widest">Fechar</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
