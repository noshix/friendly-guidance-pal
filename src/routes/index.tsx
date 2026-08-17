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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: 'Cabos e Condutores', desc: 'Fios, cabos flexíveis e blindados.' },
            { name: 'Iluminação', desc: 'LED, painéis e soluções decorativas.' },
            { name: 'Proteção Elétrica', desc: 'Disjuntores, IDs e DPS.' },
            { name: 'Conectores', desc: 'Terminais e barramentos.' },
            { name: 'Ferramentas', desc: 'Equipamentos para eletricistas.' },
            { name: 'Aterramento', desc: 'Hastes e malhas de proteção.' },
            { name: 'Transformadores', desc: 'Soluções para alta e baixa tensão.' },
            { name: 'Tubos e Conduítes', desc: 'Eletrodutos e canaletas.' },
          ].map((cat) => (
            <div key={cat.name} className="group border border-[#E5E7EB] p-5 rounded-[4px] hover:border-[#174F8C] hover:shadow-sm transition flex flex-col items-start text-left cursor-pointer relative overflow-hidden">
              <div className="bg-[#F4F5F6] w-full h-32 mb-4 rounded-[2px]" />
              <h3 className="font-bold text-[15px] text-[#174F8C] mb-1">{cat.name}</h3>
              <p className="text-[12px] text-[#252A2E]/60 leading-tight mb-2">{cat.desc}</p>
              <div className="text-[#2E8B57] mt-auto self-end opacity-0 group-hover:opacity-100 transition"><ChevronRight size={18}/></div>
            </div>
          ))}
        </div>

      </section>
      {/* Produtos em Destaque */}
      <section className="bg-[#F4F5F6]/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-[#174F8C] mb-2">Produtos em destaque</h2>
              <p className="text-[#252A2E]/70">As melhores soluções das principais marcas.</p>
            </div>
            <button className="text-[#174F8C] font-bold text-[14px] flex items-center gap-1 hover:underline">
              Ver todos os produtos <ChevronRight size={16}/>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90' },
              { brand: 'SIL', name: 'Cabo Flexível 2,5 mm² - 100m', ref: 'Azul 750V', price: '349,00' },
              { brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: 'Bivolt 6500K', price: '49,90' },
            ].map((prod) => (
              <div key={prod.name} className="bg-white border border-[#E5E7EB] rounded-[4px] p-5 hover:shadow-md transition group">
                <div className="bg-[#F4F5F6] w-full h-48 mb-6 rounded-[2px] flex items-center justify-center text-[#9CA3AF] text-[12px]">
                  [Foto do produto {prod.brand}]
                </div>
                <div className="text-[11px] font-bold text-[#174F8C]/60 mb-1">{prod.brand}</div>
                <h3 className="font-bold text-[16px] mb-1">{prod.name}</h3>
                <div className="text-[12px] text-[#252A2E]/50 mb-4 italic">Ref: {prod.ref}</div>
                <div className="flex justify-between items-center pt-4 border-t border-[#F4F5F6]">
                  <div>
                    <div className="text-[11px] text-[#2E8B57] font-bold mb-1 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#2E8B57] shadow-[0_0_5px_rgba(46,139,87,0.5)]"></div> Em estoque
                    </div>
                    <div className="text-xl font-black text-[#252A2E]">R$ {prod.price}</div>
                  </div>
                  <button className="bg-[#174F8C] text-white px-4 py-2 rounded-[4px] text-[13px] font-bold opacity-0 group-hover:opacity-100 transition">
                    Ver produto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marcas */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-b border-[#F4F5F6]">
        <h2 className="text-[12px] font-black text-[#174F8C]/40 uppercase tracking-[0.2em] text-center mb-10">
          Marcas que fazem parte do nosso catálogo
        </h2>
        <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50 hover:grayscale-0 transition-all duration-500">
          {['SIEMENS', 'WEG', 'SCHNEIDER', 'TRAMONTINA', 'STECK', 'SIL', 'ALUMBRA'].map(brand => (
            <span key={brand} className="text-xl font-black tracking-tighter text-[#252A2E]">{brand}</span>
          ))}
        </div>
      </section>

      {/* Soluções Profissionais */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-[#174F8C] mb-10 text-center">Soluções para quem faz acontecer</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Profissionais', icon: User },
            { label: 'Empresas', icon: Building2 },
            { label: 'Obras', icon: HardHat },
            { label: 'Varejo', icon: FileText },
          ].map(sol => (
            <div key={sol.label} className="border border-[#F4F5F6] p-6 text-center hover:bg-[#174F8C] hover:text-white transition group cursor-pointer">
              <sol.icon className="mx-auto mb-4 text-[#174F8C] group-hover:text-white" size={32}/>
              <h3 className="font-bold">{sol.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Orçamento */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#174F8C] rounded-[4px] p-10 flex justify-between items-center text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-2">Tem uma lista de materiais?</h2>
            <p className="opacity-80">Envie sua necessidade para nossa equipe e solicite uma cotação.</p>
          </div>
          <button className="bg-[#F5C400] text-[#174F8C] px-8 py-4 rounded-[4px] font-black hover:scale-105 transition relative z-10">
            SOLICITAR ORÇAMENTO
          </button>
          <div className="absolute right-0 top-0 w-64 h-full bg-white/5 skew-x-[30deg] translate-x-32"></div>
        </div>
      </section>

      {/* História */}
      <section className="max-w-7xl mx-auto px-4 py-20 flex items-center gap-16">
        <div className="flex-1 bg-[#F4F5F6] h-[450px] rounded-[4px] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] relative">
          <span>[FOTO REAL DA FACHADA]</span>
          <div className="absolute bottom-6 right-6 bg-white p-4 shadow-lg border-l-4 border-[#F5C400]">
            <div className="text-2xl font-black text-[#174F8C]">40+</div>
            <div className="text-[10px] font-bold text-[#252A2E]">ANOS DE EXPERIÊNCIA</div>
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="text-[#174F8C] font-black text-[12px] tracking-widest uppercase">Nossa História</div>
          <h2 className="text-4xl font-extrabold text-[#174F8C]">Há mais de 40 anos ao lado de quem constrói.</h2>
          <p className="text-[#252A2E] leading-relaxed">
            A Pizzatto reúne mais de 40 anos de experiência no segmento de materiais elétricos em Cuiabá. 
            Uma trajetória marcada pelo compromisso com a qualidade técnica e o atendimento que entende a necessidade de cada cliente.
          </p>
          <button className="text-[#174F8C] font-bold flex items-center gap-2 hover:gap-3 transition border-b-2 border-[#174F8C] pb-1">
            Conheça mais sobre nós
          </button>
        </div>
      </section>

      {/* Atendimento Bobininha */}
      <section className="bg-[#F4F5F6]/50 py-16 border-y border-[#F4F5F6]">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-12">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-[#174F8C] shrink-0 text-[10px] text-center p-2 font-bold text-[#174F8C]">
            [MASCOTE BOBININHA]
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-[#174F8C] mb-2">Precisa de ajuda para encontrar um material?</h2>
            <p className="text-[#252A2E]/70 mb-6">Nossa equipe ajuda você a localizar o produto certo para sua obra ou projeto.</p>
            <button className="bg-[#2E8B57] text-white px-8 py-3 rounded-[4px] font-bold flex items-center gap-2 hover:bg-[#257548]">
              <MessageSquare size={18}/> Falar com atendimento especializado
            </button>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-extrabold text-[#174F8C] mb-8">Visite a Pizzatto</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#174F8C]/10 flex items-center justify-center text-[#174F8C]">
                <MapPin size={20}/>
              </div>
              <div>
                <div className="font-bold">Endereço</div>
                <div className="text-[#252A2E]/70 text-[14px]">
                  Av. Manoel José de Arruda, 664<br/>
                  Jardim Shangri-lá, Cuiabá - MT<br/>
                  CEP 78070-305
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#174F8C]/10 flex items-center justify-center text-[#174F8C]">
                <Phone size={20}/>
              </div>
              <div>
                <div className="font-bold">Telefone</div>
                <div className="text-[#252A2E]/70 text-[14px]">(65) 3052-4200</div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="bg-[#174F8C] text-white px-6 py-3 rounded-[4px] font-bold text-[13px]">COMO CHEGAR</button>
              <button className="border-2 border-[#2E8B57] text-[#2E8B57] px-6 py-3 rounded-[4px] font-bold text-[13px]">WHATSAPP</button>
            </div>
          </div>
        </div>
        <div className="bg-[#F4F5F6] rounded-[4px] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
          [MAPA VISUAL DA LOCALIZAÇÃO]
        </div>
      </section>
      {/* Footer */}

      <footer className="bg-[#174F8C] text-white pt-16 pb-8 mt-16 border-t-4 border-[#F5C400]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-black mb-4">PIZZATTO</div>
            <p className="text-[13px] opacity-80">Mais de 40 anos de tradição em materiais elétricos em Cuiabá.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">CATÁLOGO</h4>
            <ul className="text-[13px] space-y-2 opacity-80">
              <li>Produtos</li>
              <li>Categorias</li>
              <li>Marcas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">EMPRESA</h4>
            <ul className="text-[13px] space-y-2 opacity-80">
              <li>Nossa história</li>
              <li>Contato</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">ATENDIMENTO</h4>
            <p className="text-[13px] opacity-80">(65) 3052-4200</p>
            <p className="text-[13px] opacity-80">vendas@pizzatto.com.br</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-[11px] text-center opacity-60">
          © 2026 Pizzatto Materiais Elétricos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

