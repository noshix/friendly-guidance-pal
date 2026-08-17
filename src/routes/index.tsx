import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Search, ChevronRight, MessageSquare, Building2, User, HardHat, FileText, Zap } from "lucide-react";
import logoAsset from "@/assets/logo.asset.json";
import logoIconAsset from "@/assets/logo-pizzatto-icon-new.png.asset.json";
import bobininhaAsset from "@/assets/bobininha.asset.json";
import fachadaAsset from "@/assets/fachada.asset.json";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pizzatto Materiais Elétricos | Loja Especializada em Cuiabá - MT" },
      { name: "description", content: "Mais de 40 anos de experiência em materiais elétricos. Loja especializada em Cuiabá, Mato Grosso." },
    ],
  }),
});

function ImageWithFallback({ src, alt, className, type = 'product' }: { src: string, alt: string, className?: string, type?: 'product' | 'category' }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23A3A3A3' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/%3E%3C/svg%3E";
        target.className = `${className} bg-[#F4F5F6] p-12 opacity-40`;
        const parent = target.parentElement;
        if (parent && !parent.querySelector('.fallback-text')) {
          const text = document.createElement('div');
          text.className = 'fallback-text absolute inset-0 flex items-end justify-center pb-4 text-[10px] font-bold text-[#252A2E]/40 uppercase tracking-widest';
          text.innerText = 'Imagem em breve';
          parent.style.position = 'relative';
          parent.appendChild(text);
        }
      }}
    />
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-white text-[#252A2E]">

      <header className="sticky top-0 z-50 bg-[#174F8C] backdrop-blur-sm border-b border-white/10 py-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6 py-1">
            <img src={logoAsset.url} alt="Pizzatto Materiais Elétricos" className="h-16 w-auto object-contain py-1" />
          </div>

          <nav className="flex gap-8 text-[14px] font-semibold text-white">
            {['Produtos', 'Categorias', 'Marcas', 'Empresa', 'Contato'].map(item => (
              <a href="#" key={item} className="hover:text-[#F5C400] transition uppercase tracking-wider text-[12px]">{item}</a>

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
            Pizzatto Materiais Elétricos
          </div>
          <h1 className="text-[52px] font-extrabold text-[#252A2E] leading-[1] tracking-tighter">
            Materiais elétricos para <br />
            sua obra, empresa e projeto.
          </h1>
          <p className="text-[18px] text-[#252A2E]/70 leading-relaxed max-w-[550px]">
            Encontre materiais elétricos para sua casa, obra, empresa ou projeto com a experiência de quem atua há mais de 40 anos no segmento.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="bg-[#2E8B57] text-white px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#257046] transition shadow-md">Explorar catálogo</button>
            <button className="bg-[#F5C400] text-[#252A2E] px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#E0B200] transition shadow-md">Solicitar orçamento</button>
          </div>
          <div className="relative pt-6">
            <Search className="absolute left-4 top-10 text-[#252A2E]/30" size={20}/>
            <input type="text" placeholder="Busque por produto, código, referência ou fabricante..." className="w-full bg-white border border-[#252A2E]/20 py-4 pl-12 pr-4 rounded-[2px] shadow-sm focus:ring-2 focus:ring-[#174F8C] outline-none text-[#252A2E] placeholder:text-[#252A2E]/40 font-medium"/>
          </div>
        </div>
        <div className="flex-1 relative h-[500px]">
           <div className="absolute inset-0 bg-[#F4F5F6] rounded-[4px] overflow-hidden shadow-2xl">
             <ImageWithFallback 
               src={logoIconAsset.url} 
               alt="Pizzatto Materiais Elétricos" 
               className="w-full h-full object-contain p-12"
             />

             <div className="absolute inset-0 bg-gradient-to-t from-[#252A2E]/20 to-transparent"></div>
           </div>
           <div className="absolute -bottom-6 -right-6 bg-[#2E8B57] text-white p-6 rounded-[2px] shadow-xl z-10">
             <div className="text-[40px] font-black italic leading-none">40+</div>
             <div className="text-[10px] font-bold tracking-widest uppercase mt-1">Anos de Experiência</div>
           </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="w-16 h-1 bg-[#F5C400] mb-4"></div>
            <h2 className="text-3xl font-bold text-[#252A2E]">Encontre o que precisa</h2>
            <p className="text-[#252A2E]/60 text-sm mt-2">Variedade e atendimento especializado em materiais elétricos.</p>
          </div>
          <a href="#" className="text-[#174F8C] font-bold text-sm flex items-center gap-1 hover:underline">Ver todas <ChevronRight size={16}/></a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Cabos e Condutores', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Iluminação', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400' },
            { name: 'Proteção Elétrica', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400' },
            { name: 'Conectores', img: 'https://images.unsplash.com/photo-1563770660941-20978e870e93?auto=format&fit=crop&q=80&w=400' },
            { name: 'Ferramentas', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400' },
            { name: 'Aterramento', img: 'https://images.unsplash.com/photo-1558484660-5bb49b897435?auto=format&fit=crop&q=80&w=400' },
            { name: 'Transformadores', img: 'https://images.unsplash.com/photo-1618576512915-f5589e47087f?auto=format&fit=crop&q=80&w=400' },
            { name: 'Tubos e Conduítes', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400' },

          ].map((cat) => (
            <div key={cat.name} className="group relative bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden hover:border-[#174F8C] transition duration-300 shadow-sm cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden bg-[#F4F5F6] relative">
                <ImageWithFallback 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-95"
                  type="category"
                />
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
              <h2 className="text-3xl font-bold text-[#252A2E]">Produtos em destaque</h2>
              <p className="text-[#252A2E]/60 text-sm mt-2">Confira alguns produtos disponíveis no catálogo.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400' },
              { brand: 'SIL', name: 'Cabo Flexível 2,5 mm² Azul 750V', ref: 'Rolo 100m', price: '349,00', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400' },
              { brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: '6500K Bivolt', price: '49,90', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400' },
              { brand: 'STECK', name: 'Quadro de Distribuição 24 DIN', ref: 'Sobrepor', price: '124,50', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400' },

            ].map((prod) => (
              <div key={prod.name} className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative">
                <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">{prod.brand}</div>
                <div className="w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50 p-4 relative">
                  <ImageWithFallback 
                    src={prod.img} 
                    alt={prod.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
                  />
                </div>

                <h3 className="font-bold text-[15px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition">{prod.name}</h3>
                <div className="text-[11px] text-[#252A2E]/50 mb-auto">Ref: {prod.ref}</div>
                
                <div className="mt-6 pt-4 border-t border-[#F4F5F6]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#2E8B57] font-bold mb-2 uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2E8B57] animate-pulse"></div>
                    Em estoque
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-[#252A2E]/40 block leading-none mb-1">Por apenas</span>
                      <div className="text-xl font-black text-[#252A2E]">R$ {prod.price}</div>
                    </div>
                    <button className="bg-[#2E8B57] text-white p-2 rounded-[2px] hover:bg-[#257046] transition">
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
            CUIABÁ - MT
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="w-16 h-1 bg-[#174F8C] mb-2"></div>
          <h2 className="text-[40px] font-extrabold text-[#252A2E] leading-tight">Há mais de 40 anos ao lado de quem constrói.</h2>
          <p className="text-[18px] text-[#252A2E]/70 leading-relaxed">
            A Pizzatto reúne mais de 40 anos de experiência no segmento de materiais elétricos em Cuiabá, atendendo consumidores, profissionais e empresas com variedade e compromisso técnico.
          </p>
          <div className="pt-4">
            <div className="inline-block border-l-4 border-[#F5C400] pl-4">
              <div className="text-4xl font-black text-[#2E8B57]">40+</div>
              <div className="text-[14px] font-bold text-[#252A2E]/50 uppercase tracking-widest mt-1">Anos de Experiência</div>
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
            <h2 className="text-[32px] font-black mb-4 leading-tight">Dúvidas sobre materiais ou precisa de orçamento?</h2>
            <p className="text-white/80 mb-8 text-[18px] max-w-[600px]">
              Fale com nossa equipe e solicite atendimento via WhatsApp para sua lista de materiais.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="bg-[#2E8B57] text-white px-10 py-4 rounded-[2px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#257548] transition shadow-2xl">
                <MessageSquare size={20}/> Falar no WhatsApp
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-[2px] font-black uppercase tracking-widest hover:bg-white/20 transition">
                Localização
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
              Loja especializada em materiais elétricos em Cuiabá. Mais de 40 anos de tradição, qualidade e confiança para sua casa, obra ou empresa.
            </p>
            <div className="flex gap-4">
              {/* Redes sociais removidas conforme solicitado para evitar links fictícios */}
            </div>
          </div>
          <div>
            <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">Catálogo</h4>
            <ul className="space-y-4 text-[14px] text-white/70">
              {['Produtos', 'Categorias', 'Marcas'].map(item => (
                <li key={item} className="hover:text-white cursor-pointer transition flex items-center gap-2">
                  <ChevronRight size={12} className="text-[#F5C400]"/> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">A Pizzatto</h4>
            <ul className="space-y-4 text-[14px] text-white/70">
              {['Empresa', 'Localização', 'Contato'].map(item => (
                <li key={item} className="hover:text-white cursor-pointer transition">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">Atendimento</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone size={20} className="text-[#F5C400] mt-1"/>
                <div>
                  <div className="text-[16px] font-black">(65) 3052-4200</div>
                  <div className="text-[12px] text-white/40 uppercase font-bold">Atendimento</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin size={20} className="text-[#F5C400] mt-1"/>
                <div className="text-[14px] text-white/70 leading-relaxed">
                  Av. Manoel José de Arruda, 664<br />
                  Jardim Shangri-lá<br />
                  Cuiabá - MT | CEP 78070-305
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-white/40">
          <div>© {new Date().getFullYear()} Pizzatto Materiais Elétricos. Mais de 40 anos de experiência.</div>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition">Privacidade</span>
            <span className="hover:text-white cursor-pointer transition">Termos de Uso</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
