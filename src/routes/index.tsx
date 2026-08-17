import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Search, ChevronRight, MessageSquare, Mail, Building2, User, HardHat, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pizzatto Materiais Elétricos | Cuiabá - MT" },
      { name: "description", content: "Mais de 40 anos de experiência em materiais elétricos. Distribuidora em Cuiabá, Mato Grosso." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      {/* Topbar */}
      <div className="bg-[#174F8C] text-white text-[11px] py-1.5 px-4 flex justify-between items-center">
        <p className="tracking-wide">Mais de 40 anos de experiência em soluções elétricas</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><MapPin size={12}/> Cuiabá - MT</span>
          <span className="font-bold flex items-center gap-1"><Phone size={12}/> (65) 3052-4200</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#F4F5F6] py-3 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-black text-[#174F8C]">PIZZATTO</div>
          <nav className="flex gap-6 text-[13px] font-semibold text-[#252A2E]">
            {['Departamentos', 'Produtos', 'Categorias', 'Marcas', 'Empresa', 'Contato'].map(item => (
              <a href="#" key={item} className="hover:text-[#174F8C] transition">{item}</a>
            ))}
          </nav>
          <button className="bg-[#2E8B57] text-white px-4 py-2 rounded-[4px] font-semibold text-[13px] hover:bg-[#257548] flex items-center gap-2">
            <MessageSquare size={14}/> Falar com a Pizzatto
          </button>
        </div>
      </header>

      {/* Global Search */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex border border-[#174F8C] rounded-[4px] overflow-hidden">
          <input 
            type="text" 
            placeholder="Busque por produto, código, referência ou fabricante..."
            className="flex-1 px-4 py-3 text-[14px] outline-none"
          />
          <button className="bg-[#174F8C] text-white px-8 font-semibold text-[14px] flex items-center gap-2">
            <Search size={16}/> Buscar
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12 flex items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center bg-[#F4F5F6] text-[#174F8C] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Pizzatto Materiais Elétricos
          </div>
          <h1 className="text-5xl font-extrabold text-[#174F8C] leading-[1.1]">
            Materiais elétricos para sua obra, empresa e projeto.
          </h1>
          <p className="text-[16px] text-[#252A2E] leading-relaxed max-w-[500px]">
            Mais de 40 anos de experiência oferecendo variedade e atendimento especializado em materiais elétricos em Cuiabá e Mato Grosso.
          </p>
          <div className="flex gap-3 pt-2">
            <button className="bg-[#174F8C] text-white px-6 py-3 rounded-[4px] font-semibold hover:bg-[#123E70]">Explorar catálogo</button>
            <button className="border-2 border-[#174F8C] text-[#174F8C] px-6 py-3 rounded-[4px] font-semibold hover:bg-[#F4F5F6]">Solicitar orçamento</button>
          </div>
        </div>
        <div className="flex-1 bg-[#F4F5F6] rounded-[4px] h-[400px] flex items-center justify-center border border-[#E5E7EB]">
          <span className="text-[#9CA3AF] font-medium text-sm">[Composição técnica: cabos, disjuntores, iluminação]</span>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-y border-[#F4F5F6] bg-[#F4F5F6]/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between text-[13px] font-bold text-[#174F8C]">
          <span>40+ Anos de experiência</span>
          <span>Atacado e varejo</span>
          <span>Amplo mix de materiais elétricos</span>
          <span>Atendimento especializado</span>
        </div>
      </div>

      {/* Categorias */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#174F8C] mb-2">Encontre o que precisa</h2>
          <p className="text-[#252A2E]/70">Materiais para instalações prediais, industriais e infraestrutura.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['Cabos e Condutores', 'Iluminação', 'Proteção Elétrica', 'Ferramentas', 'Infraestrutura'].map((cat) => (
            <div key={cat} className="group border border-[#E5E7EB] p-4 rounded-[4px] hover:border-[#174F8C] transition flex flex-col items-center text-center cursor-pointer">
              <div className="bg-[#F4F5F6] w-full h-32 mb-4 rounded-[2px]" />
              <h3 className="font-bold text-[14px] text-[#252A2E]">{cat}</h3>
              <div className="text-[#2E8B57] mt-2 group-hover:translate-x-1 transition"><ChevronRight size={18}/></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
