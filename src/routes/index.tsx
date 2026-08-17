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
      <div className="bg-[#252A2E] text-white text-[11px] py-2 px-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center uppercase tracking-widest font-bold">
          <p className="opacity-70">Distribuidora Técnica de Materiais Elétricos em Cuiabá - MT</p>
          <div className="flex gap-8 items-center">
            <span className="flex items-center gap-2 text-white/90 hover:text-[#F5C400] transition cursor-pointer"><MapPin size={12} className="text-[#F5C400]"/> Nossa Loja</span>
            <span className="flex items-center gap-2 text-white/90 hover:text-[#F5C400] transition cursor-pointer"><Phone size={12} className="text-[#F5C400]"/> (65) 3052-4200</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] py-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={logoAsset.url} alt="Pizzatto Materiais Elétricos" className="h-12 w-auto object-contain" />
          </div>
          <nav className="flex gap-8 text-[14px] font-semibold text-[#252A2E]">
            {['Produtos', 'Categorias', 'Marcas', 'Empresa', 'Contato'].map(item => (
              <a href="#" key={item} className="hover:text-[#174F8C] transition uppercase tracking-wider text-[12px]">{item}</a>
            ))}
          </nav>
          <button className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-[2px] font-bold text-[13px] hover:bg-[#257548] flex items-center gap-2 shadow-sm">
            <MessageSquare size={16}/> WhatsApp
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-12 flex items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center bg-[#174F8C]/10 text-[#174F8C] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest">
            Distribuidora Técnica Premium
          </div>
          <h1 className="text-[52px] font-extrabold text-[#252A2E] leading-[1] tracking-tighter">
            Materiais elétricos para <br />
            sua obra, empresa e projeto.
          </h1>
          <p className="text-[18px] text-[#252A2E]/70 leading-relaxed max-w-[550px]">
            Tradição e excelência técnica em Cuiabá. Mais de 40 anos entregando as melhores soluções para profissionais e empresas.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="bg-[#174F8C] text-white px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md">Explorar catálogo</button>
            <button className="bg-[#F5C400] text-[#252A2E] px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#E0B200] transition shadow-md">Solicitar orçamento</button>
          </div>
          <div className="relative pt-6">
            <Search className="absolute left-4 top-10 text-[#252A2E]/30" size={20}/>
            <input type="text" placeholder="Buscar materiais (ex: disjuntores, cabos...)" className="w-full bg-white border border-[#E5E7EB] py-4 pl-12 pr-4 rounded-[2px] shadow-sm focus:ring-2 focus:ring-[#174F8C] outline-none"/>
          </div>
        </div>
        <div className="flex-1 relative">
           <img src="https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=800" className="rounded-[4px] shadow-2xl"/>
           <div className="absolute -bottom-6 -left-6 bg-[#174F8C] text-white p-6 rounded-[2px] shadow-xl">
             <div className="text-[40px] font-black italic">40+</div>
             <div className="text-[14px] font-bold tracking-widest uppercase">Anos de Pizzatto</div>
           </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="w-16 h-1 bg-[#F5C400] mb-4"></div>
            <h2 className="text-3xl font-bold text-[#252A2E]">Encontre o que precisa</h2>
            <p className="text-[#252A2E]/60 text-sm mt-2">Navegue pelas nossas categorias especializadas.</p>
          </div>
          <a href="#" className="text-[#174F8C] font-bold text-sm flex items-center gap-1 hover:underline">Ver todas <ChevronRight size={16}/></a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Cabos e Condutores', img: 'https://images.unsplash.com/photo-1544627880-97593c6b245e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Iluminação', img: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=400' },
            { name: 'Proteção Elétrica', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Conectores', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400' },
            { name: 'Ferramentas', img: 'https://images.unsplash.com/photo-1504148455338-348509c647b0?auto=format&fit=crop&q=80&w=400' },
            { name: 'Aterramento', img: 'https://images.unsplash.com/photo-1581092334672-005118c7c250?auto=format&fit=crop&q=80&w=400' },
            { name: 'Transformadores', img: 'https://images.unsplash.com/photo-1587399839919-3d1b82455856?auto=format&fit=crop&q=80&w=400' },
            { name: 'Tubos e Conduítes', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400' },
          ].map((cat) => (
            <div key={cat.name} className="group relative bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden hover:border-[#174F8C] transition duration-300 shadow-sm cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-95"/>
              </div>
              <div className="p-4 bg-white border-t border-[#F4F5F6]">
                <h3 className="font-bold text-[15px] text-[#252A2E] group-hover:text-[#174F8C] transition">{cat.name}</h3>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm text-[#174F8C]">
                <ChevronRight size={14}/>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F5F6]/30 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="w-16 h-1 bg-[#F5C400] mb-4"></div>
              <h2 className="text-3xl font-bold text-[#252A2E]">Destaques da Semana</h2>
              <p className="text-[#252A2E]/60 text-sm mt-2">Produtos com estoque garantido e preços competitivos.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: 'https://images.unsplash.com/photo-1581092334672-005118c7c250?auto=format&fit=crop&q=80&w=400' },
              { brand: 'SIL', name: 'Cabo Flexível 2,5 mm² Azul 750V', ref: 'Rolo 100m', price: '349,00', img: 'https://images.unsplash.com/photo-1544627880-97593c6b245e?auto=format&fit=crop&q=80&w=400' },
              { brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: '6500K Bivolt', price: '49,90', img: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=400' },
              { brand: 'STECK', name: 'Quadro de Distribuição 24 DIN', ref: 'Sobrepor', price: '124,50', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400' },
            ].map((prod) => (
              <div key={prod.name} className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative">
                <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">{prod.brand}</div>
                <div className="w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50 p-4">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"/>
                </div>
                <h3 className="font-bold text-[15px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition">{prod.name}</h3>
                <div className="text-[11px] text-[#252A2E]/50 mb-auto">Ref: {prod.ref}</div>
                
                <div className="mt-6 pt-4 border-t border-[#F4F5F6]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#2E8B57] font-bold mb-2 uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2E8B57] animate-pulse"></div>
                    Disponível em estoque
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-[#252A2E]/40 block leading-none mb-1">Por apenas</span>
                      <div className="text-xl font-black text-[#252A2E]">R$ {prod.price}</div>
                    </div>
                    <button className="bg-[#174F8C] text-white p-2 rounded-[2px] hover:bg-[#123E70] transition">
                      <ChevronRight size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-24 flex items-center gap-16">
        <div className="flex-1 relative">
          <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#174F8C]/10 -z-10 rounded-[4px]"></div>
          <img src={fachadaAsset.url} alt="Fachada Pizzatto" className="w-full h-auto rounded-[4px] shadow-xl border border-[#E5E7EB]"/>
          <div className="absolute top-8 left-8 bg-[#F5C400] text-[#174F8C] px-4 py-2 font-black italic shadow-lg rounded-[2px] transform -rotate-2">
            UNIDADE CUIABÁ
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="w-16 h-1 bg-[#174F8C] mb-2"></div>
          <h2 className="text-[40px] font-extrabold text-[#252A2E] leading-tight">Tradição que ilumina o futuro de Mato Grosso.</h2>
          <p className="text-[18px] text-[#252A2E]/70 leading-relaxed">
            Fundada há mais de 40 anos, a Pizzatto Materiais Elétricos consolidou-se como referência técnica e comercial em Cuiabá. 
            Nossa trajetória é marcada pela parceria com as maiores marcas mundiais e pelo compromisso inegociável com a segurança da sua instalação.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="border-l-4 border-[#F5C400] pl-4">
              <div className="text-2xl font-black text-[#174F8C]">40.000+</div>
              <div className="text-[12px] font-bold text-[#252A2E]/50 uppercase tracking-widest">Itens em Catálogo</div>
            </div>
            <div className="border-l-4 border-[#F5C400] pl-4">
              <div className="text-2xl font-black text-[#174F8C]">100%</div>
              <div className="text-[12px] font-bold text-[#252A2E]/50 uppercase tracking-widest">Suporte Técnico</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#174F8C] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#123E70]/50 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition duration-500"></div>
            <img src={bobininhaAsset.url} alt="Bobininha" className="w-48 h-48 object-contain relative z-10" />
          </div>
          <div className="flex-1 text-center md:text-left text-white">
            <h2 className="text-[32px] font-black mb-4 leading-tight">Dúvidas técnicas ou orçamentos rápidos?</h2>
            <p className="text-white/80 mb-8 text-[18px] max-w-[600px]">
              Envie sua lista de materiais agora e receba um orçamento personalizado de nossa equipe de especialistas.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="bg-[#2E8B57] text-white px-10 py-4 rounded-[2px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#257548] transition shadow-2xl">
                <MessageSquare size={20}/> Falar no WhatsApp
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-[2px] font-black uppercase tracking-widest hover:bg-white/20 transition">
                Enviar E-mail
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#252A2E] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <img src={logoAsset.url} alt="Pizzatto" className="h-12 w-auto brightness-0 invert" />
            <p className="text-[14px] text-white/60 leading-relaxed">
              Distribuidora de materiais elétricos em Cuiabá. Tradição, qualidade técnica e confiança para sua obra ou indústria desde 1984.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#174F8C] transition cursor-pointer">
                <span className="font-black">f</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#174F8C] transition cursor-pointer">
                <span className="font-black">in</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">Catálogo Técnico</h4>
            <ul className="space-y-4 text-[14px] text-white/70">
              {['Cabos e Fios', 'Iluminação LED', 'Quadros e Proteção', 'Transformadores', 'Eletrodutos'].map(item => (
                <li key={item} className="hover:text-white cursor-pointer transition flex items-center gap-2">
                  <ChevronRight size={12} className="text-[#F5C400]"/> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">A Pizzatto</h4>
            <ul className="space-y-4 text-[14px] text-white/70">
              {['Nossa História', 'Trabalhe Conosco', 'Política de Qualidade', 'Blog Técnico', 'Contato'].map(item => (
                <li key={item} className="hover:text-white cursor-pointer transition">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">Canais de Atendimento</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone size={20} className="text-[#F5C400] mt-1"/>
                <div>
                  <div className="text-[16px] font-black">(65) 3052-4200</div>
                  <div className="text-[12px] text-white/40 uppercase font-bold">Vendas & Suporte</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin size={20} className="text-[#F5C400] mt-1"/>
                <div className="text-[14px] text-white/70 leading-relaxed">
                  Av. Fernando Correa da Costa, 1234<br />
                  Cuiabá - Mato Grosso<br />
                  CEP: 78000-000
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-white/40">
          <div>© {new Date().getFullYear()} Pizzatto Materiais Elétricos. Todos os direitos reservados.</div>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition">Privacidade</span>
            <span className="hover:text-white cursor-pointer transition">Termos de Uso</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
