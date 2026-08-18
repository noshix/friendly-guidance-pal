import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export const Route = createFileRoute("/categorias/")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categorias | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Explore o catálogo da Pizzatto organizado por categoria." },
    ],
  }),
});

const CATEGORIES = [
  {
    slug: 'cabos-e-condutores',
    name: 'Cabos e Condutores',
    description: 'Fios, cabos e materiais para instalações elétricas.',
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=600'
  },
  {
    slug: 'iluminacao',
    name: 'Iluminação',
    description: 'Lâmpadas, luminárias e soluções em iluminação elétrica.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=600'
  },
  {
    slug: 'protecao-eletrica',
    name: 'Proteção Elétrica',
    description: 'Produtos para proteção de instalações elétricas.',
    image: 'https://images.unsplash.com/photo-1626242300249-1730edcdfd76?auto=format&fit=crop&q=80&w=600' // Better breakers image
  },
  {
    slug: 'conectores',
    name: 'Conectores',
    description: 'Conectores, terminais e acessórios para conexões.',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e93?auto=format&fit=crop&q=80&w=600'
  },
  {
    slug: 'ferramentas',
    name: 'Ferramentas',
    description: 'Ferramentas profissionais para instalações elétricas.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'
  },
  {
    slug: 'aterramento',
    name: 'Aterramento',
    description: 'Hastes, cabos e materiais para sistemas de aterramento.',
    image: '' // Placeholder requested (removing disjuntor photo)
  },
  {
    slug: 'transformadores',
    name: 'Transformadores',
    description: 'Transformadores e componentes relacionados.',
    image: '' // Placeholder requested (removing worker with drill)
  },
  {
    slug: 'tubos-e-conduites',
    name: 'Tubos e Conduítes',
    description: 'Eletrodutos, conduítes e acessórios para infraestrutura.',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=600' // Industrial pipes/conduits
  },
  {
    slug: 'comandos',
    name: 'Comandos',
    description: 'Componentes para comandos e painéis elétricos.',
    image: '' // Placeholder requested (removing plant image)
  }
];

function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Categorias" />

      <main>
        {/* Breadcrumb & Title */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <nav className="flex items-center gap-2 text-[12px] text-[#252A2E]/50 mb-4 font-medium uppercase tracking-wider">
              <Link to="/" className="hover:text-[#174F8C]">Início</Link>
              <ChevronRight size={12} />
              <span className="text-[#252A2E]">Categorias</span>
            </nav>
            <h1 className="text-4xl font-black text-[#252A2E] tracking-tight mb-2 uppercase">Categorias</h1>
            <p className="text-[#252A2E]/60 max-w-2xl font-medium">
              Encontre materiais elétricos organizados por categoria.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.slug} 
                to="/categorias/$slug" 
                params={{ slug: cat.slug }}
                className="bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden hover:border-[#174F8C] hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F4F5F6]">
                  <ImageWithFallback 
                    src={cat.image} 
                    alt={cat.name} 
                    type="category"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-[#252A2E] uppercase tracking-tight mb-2 group-hover:text-[#174F8C] transition">
                    {cat.name}
                  </h3>
                  <p className="text-[13px] text-[#252A2E]/60 font-medium mb-6 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F4F5F6]">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#174F8C]">
                      Explorar
                    </span>
                    <ChevronRight size={16} className="text-[#174F8C] group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
