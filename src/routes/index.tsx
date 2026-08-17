import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Search, ChevronRight, MessageSquare, Building2, User, HardHat, FileText } from "lucide-react";
import logoAsset from "@/assets/logo.asset.json";
import bobininhaAsset from "@/assets/bobininha.asset.json";
import fachadaAsset from "@/assets/fachada.asset.json";

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
      <div className="bg-[#174F8C] text-white text-[11px] py-1.5 px-4 flex justify-between items-center">
        <p className="tracking-wide uppercase font-medium opacity-90">Mais de 40 anos de experiência em soluções elétricas</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><MapPin size={12}/> Cuiabá - MT</span>
          <span className="font-bold flex items-center gap-1"><Phone size={12}/> (65) 3052-4200</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-[#F4F5F6] py-3 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <img src={logoAsset.url} alt="Pizzatto Materiais Elétricos" className="h-10 w-auto" />
          <nav className="flex gap-6 text-[13px] font-medium text-[#252A2E]">
            {['Departamentos', 'Produtos', 'Marcas', 'Empresa', 'Contato'].map(item => (
              <a href="#" key={item} className="hover:text-[#174F8C] transition">{item}</a>
            ))}
          </nav>
          <button className="bg-[#2E8B57] text-white px-4 py-2 rounded-[4px] font-semibold text-[13px] hover:bg-[#257548] flex items-center gap-2">
            <MessageSquare size={14}/> Falar com especialista
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-12 flex items-center gap-12">
        <div className="flex-1 space-y-5">
          <div className="inline-flex items-center bg-[#F4F5F6] text-[#174F8C] px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border border-[#E5E7EB]">
            Distribuidora Técnica
          </div>
          <h1 className="text-[44px] font-bold text-[#252A2E] leading-[1.05] tracking-tight">
            Materiais elétricos para <br />
            <span className="text-[#174F8C]">sua obra, empresa e projeto.</span>
          </h1>
          <p className="text-[16px] text-[#252A2E]/70 leading-relaxed max-w-[500px]">
            Mais de 40 anos de credibilidade oferecendo o mais completo mix de componentes elétricos em Cuiabá e Mato Grosso.
          </p>
          <div className="flex gap-3 pt-2">
            <button className="bg-[#174F8C] text-white px-8 py-3 rounded-[4px] font-semibold hover:bg-[#123E70]">Explorar catálogo</button>
            <button className="border-2 border-[#F5C400] text-[#174F8C] px-8 py-3 rounded-[4px] font-semibold hover:bg-[#F5C400]/10">Solicitar orçamento</button>
          </div>
        </div>
        <div className="flex-1 bg-[#F4F5F6] rounded-[4px] h-[400px] overflow-hidden border border-[#E5E7EB]">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center"></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#174F8C] mb-8">Encontre o que precisa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Cabos e Condutores', img: 'https://images.unsplash.com/photo-1544627880-97593c6b245e?auto=format&fit=crop&q=80&w=300' },
            { name: 'Iluminação', img: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=300' },
            { name: 'Proteção Elétrica', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=300' },
            { name: 'Conectores', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=300' },
            { name: 'Ferramentas', img: 'https://images.unsplash.com/photo-1504148455338-348509c647b0?auto=format&fit=crop&q=80&w=300' },
            { name: 'Aterramento', img: 'https://images.unsplash.com/photo-1581092334672-005118c7c250?auto=format&fit=crop&q=80&w=300' },
            { name: 'Transformadores', img: 'https://images.unsplash.com/photo-1587399839919-3d1b82455856?auto=format&fit=crop&q=80&w=300' },
            { name: 'Tubos e Conduítes', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=300' },
          ].map((cat) => (
            <div key={cat.name} className="group border border-[#E5E7EB] rounded-[4px] p-2 hover:border-[#174F8C] transition flex flex-col cursor-pointer">
              <div className="w-full h-32 mb-2 rounded-[2px] overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
              </div>
              <h3 className="font-semibold text-[14px] text-[#174F8C] px-2 pb-2">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F5F6]/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#174F8C] mb-8">Produtos em destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: 'https://images.unsplash.com/photo-1581092334672-005118c7c250?auto=format&fit=crop&q=80&w=400' },
              { brand: 'SIL', name: 'Cabo Flexível 2,5 mm² - 100m', ref: 'Azul 750V', price: '349,00', img: 'https://images.unsplash.com/photo-1544627880-97593c6b245e?auto=format&fit=crop&q=80&w=400' },
              { brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: 'Bivolt 6500K', price: '49,90', img: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=400' },
            ].map((prod) => (
              <div key={prod.name} className="bg-white border border-[#E5E7EB] rounded-[4px] p-5 hover:shadow-sm transition group">
                <div className="w-full h-40 mb-4 rounded-[2px] overflow-hidden bg-[#F4F5F6]">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover"/>
                </div>
                <div className="text-[10px] font-bold text-[#174F8C]/60 tracking-wider mb-1">{prod.brand}</div>
                <h3 className="font-bold text-[15px] mb-1 leading-tight">{prod.name}</h3>
                <div className="text-[11px] text-[#252A2E]/50 mb-4">Ref: {prod.ref}</div>
                <div className="flex justify-between items-center pt-3 border-t border-[#F4F5F6]">
                  <div className="text-[11px] text-[#2E8B57] font-bold mb-1">● Em estoque</div>
                  <div className="text-xl font-black text-[#252A2E]">R$ {prod.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 flex items-center gap-12">
        <div className="flex-1 h-[400px] rounded-[4px] border border-[#E5E7EB] overflow-hidden">
          <img src={fachadaAsset.url} alt="Fachada Pizzatto" className="w-full h-full object-cover"/>
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-[#174F8C]">Há mais de 40 anos ao lado de quem constrói.</h2>
          <p className="text-[#252A2E]/80 leading-relaxed">
            A Pizzatto reúne tradição e conhecimento técnico no segmento de materiais elétricos em Cuiabá. 
            Nosso compromisso é com a qualidade de cada peça e com a agilidade que sua obra exige.
          </p>
        </div>
      </section>

      <section className="bg-[#F4F5F6]/50 py-12 border-y border-[#F4F5F6]">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-12">
          <img src={bobininhaAsset.url} alt="Bobininha" className="w-24 h-24 object-contain" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#174F8C] mb-1">Precisa de ajuda com seu material?</h2>
            <p className="text-[#252A2E]/70 mb-4 text-sm">Nossa equipe especializada está pronta para atender.</p>
            <button className="bg-[#2E8B57] text-white px-6 py-2 rounded-[4px] font-bold flex items-center gap-2 text-sm">
              <MessageSquare size={16}/> Falar no WhatsApp
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#174F8C] text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-8">
          <div>
            <img src={logoAsset.url} alt="Pizzatto" className="h-8 mb-4 brightness-0 invert" />
            <p className="text-[12px] opacity-80">Tradição em Cuiabá.</p>
          </div>
          <div><h4 className="font-bold mb-4 text-xs tracking-widest">CATÁLOGO</h4></div>
          <div><h4 className="font-bold mb-4 text-xs tracking-widest">EMPRESA</h4></div>
          <div><h4 className="font-bold mb-4 text-xs tracking-widest">CONTATO</h4></div>
        </div>
      </footer>
    </div>
  );
}
