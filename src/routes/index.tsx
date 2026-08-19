import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ChevronRight, MessageSquare, ShoppingBag } from "lucide-react";
import logoAsset from "@/assets/logo.asset.json";
import logoIconAsset from "@/assets/logo-pizzatto-icon-new.png.asset.json";
import bobininhaAsset from "@/assets/bobininha.asset.json";
import fachadaAsset from "@/assets/fachada.asset.json";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useCartStore } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pizzatto Materiais Elétricos | Loja Especializada em Cuiabá - MT" },
      { name: "description", content: "Mais de 40 anos de experiência em materiais elétricos. Loja especializada em Cuiabá, Mato Grosso." },
      { property: "og:title", content: "Pizzatto Materiais Elétricos | Loja Especializada em Cuiabá - MT" },
      { property: "og:description", content: "Mais de 40 anos de experiência em materiais elétricos. Loja especializada em Cuiabá, Mato Grosso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent, prod: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: prod.id.toString(),
      name: prod.name,
      brand: prod.brand,
      ref: prod.ref,
      img: prod.img,
      quantity: 1,
      price: prod.price,
      inStock: prod.inStock
    });
    toast.success("Produto adicionado ao orçamento");
  };

  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header />

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
           <div className="absolute inset-0 bg-transparent rounded-[4px] overflow-hidden">
             <ImageWithFallback 
               src={logoIconAsset.url} 
               alt="Pizzatto Materiais Elétricos" 
               className="w-full h-full object-contain p-12"
             />
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
          <Link to="/categorias" className="text-[#174F8C] font-bold text-sm flex items-center gap-1 hover:underline">Ver todas <ChevronRight size={16}/></Link>
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
            <Link 
              key={cat.name} 
              to="/categorias/$slug"
              params={{ slug: cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') }}
              className="group relative bg-white border border-[#E5E7EB] rounded-[2px] overflow-hidden hover:border-[#174F8C] transition duration-300 shadow-sm cursor-pointer"
            >
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
            </Link>
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
              { id: "1", brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400', inStock: true },
              { id: "2", brand: 'SIL', name: 'Cabo Flexível 2,5 mm² Azul 750V', ref: 'Rolo 100m', price: '349,00', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400', inStock: true },
              { id: "3", brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: '6500K Bivolt', price: '49,90', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400', inStock: true },
              { id: "4", brand: 'STECK', name: 'Quadro de Distribuição 24 DIN', ref: 'Sobrepor', price: '124,50', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400', inStock: false },
            ].map((prod) => (
              <div key={prod.id} className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative">
                <Link 
                  to="/produtos/$id"
                  params={{ id: prod.id }}
                  className="flex flex-col h-full"
                >
                  <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">{prod.brand}</div>
                  <div className="w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50 p-4 relative">
                    <ImageWithFallback 
                      src={prod.img} 
                      alt={prod.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-[15px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase min-h-[40px] line-clamp-2">{prod.name}</h3>
                  <div className="text-[11px] text-[#252A2E]/50 mb-auto">Ref: {prod.ref}</div>
                  <div className="mt-6 pt-4 border-t border-[#F4F5F6]">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-2 uppercase tracking-tighter ${prod.inStock ? 'text-[#2E8B57]' : 'text-[#252A2E]/40'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${prod.inStock ? 'bg-[#2E8B57] animate-pulse' : 'bg-[#E5E7EB]'}`}></div>
                      {prod.inStock ? 'Em estoque' : 'Consulte disponibilidade'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-[#252A2E]/40 block leading-none mb-1">Por apenas</span>
                        {prod.price && parseFloat(prod.price.replace(".", "").replace(",", ".")) > 0 ? (
                          <div className="text-xl font-black text-[#252A2E]">R$ {prod.price}</div>
                        ) : (
                          <div className="text-[16px] font-black text-[#174F8C] uppercase tracking-[0.1em]">Consulte</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleAddToCart(e, prod)}
                          className="bg-[#F4F5F6] text-[#252A2E]/60 hover:text-[#174F8C] hover:bg-[#E5E7EB] transition flex items-center justify-center p-2 rounded-[2px] shadow-sm"
                          title="Adicionar ao orçamento"
                        >
                          <ShoppingBag size={18} />
                        </button>
                        <div className="bg-[#2E8B57] text-white p-2 rounded-[2px] group-hover:bg-[#257046] transition">
                          <ChevronRight size={18}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
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

      <Footer />
    </div>
  );
}
