import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MessageSquare, CheckCircle2 } from "lucide-react";
import fachadaAsset from "@/assets/fachada.asset.json";
import bobininhaAsset from "@/assets/bobininha.asset.json";
import videoAsset from "@/assets/pizzatto-video01.mp4.asset.json";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/empresa")({
  component: EmpresaPage,
  head: () => ({
    meta: [
      { title: "Empresa | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Mais de 40 anos de experiência em materiais elétricos em Cuiabá." },
    ],
  }),
});

function EmpresaPage() {
  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header activePage="Empresa" />

      {/* Breadcrumb */}
      <nav className="bg-[#F4F5F6] py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40">
          <Link to="/" className="hover:text-[#174F8C] transition">Início</Link>
          <ChevronRight size={14} />
          <span className="text-[#174F8C]">Empresa</span>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#174F8C]/10 -z-10 rounded-[4px]"></div>
            <img 
              src={fachadaAsset.url} 
              alt="Fachada Pizzatto Materiais Elétricos" 
              className="w-full h-auto rounded-[4px] shadow-xl border border-[#E5E7EB]"
            />
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <div>
              <div className="w-16 h-1 bg-[#174F8C] mb-6"></div>
              <h1 className="text-[40px] md:text-[52px] font-extrabold text-[#252A2E] leading-tight tracking-tighter">
                Pizzatto Materiais Elétricos
              </h1>
              <p className="text-[20px] text-[#174F8C] font-bold mt-4">
                “Mais de 40 anos de experiência em materiais elétricos.”
              </p>
            </div>
            
            <div className="space-y-6 text-[18px] text-[#252A2E]/70 leading-relaxed">
              <p>
                A Pizzatto reúne mais de 40 anos de experiência no segmento de materiais elétricos em Cuiabá, atendendo consumidores, profissionais e empresas.
              </p>
              <p>
                Nosso catálogo reúne materiais para diferentes necessidades, desde instalações residenciais até obras e projetos empresariais.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-6">
              <div className="bg-[#2E8B57] text-white p-6 rounded-[2px] shadow-lg">
                <div className="text-[48px] font-black italic leading-none">40+</div>
                <div className="text-[10px] font-bold tracking-widest uppercase mt-2">Anos de Experiência</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F5F6]/30 py-24 border-t border-[#F4F5F6]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-1 bg-[#174F8C] mb-8 mx-auto"></div>
          <h2 className="text-[32px] md:text-[40px] font-black text-[#252A2E] leading-tight tracking-tighter uppercase">
            Conheça a Pizzatto em Vídeo
          </h2>
          <p className="mt-4 text-[18px] text-[#252A2E]/60 max-w-2xl mx-auto">
            “Uma trajetória construída ao lado de clientes, profissionais e empresas que confiam na Pizzatto para seus projetos e instalações.”
          </p>
          
          <div className="mt-12 max-w-[800px] mx-auto aspect-video bg-black rounded-[4px] shadow-2xl overflow-hidden border border-[#174F8C]/10 relative group">
            <video 
              src={videoAsset.url}
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            >
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 border-t border-[#F4F5F6]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
            <div className="max-w-md">
              <div className="w-16 h-1 bg-[#F5C400] mb-8"></div>
              <h2 className="text-[36px] md:text-[48px] font-black text-[#252A2E] leading-[1.1] tracking-tighter">
                Economia vai muito <br className="hidden md:block" /> além do preço.
              </h2>
              <div className="mt-8 text-[#174F8C] font-bold text-[18px] italic border-l-4 border-[#174F8C] pl-6 py-1">
                “Encontrar o material certo também é economia.”
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-[20px] text-[#252A2E]/80 leading-relaxed font-medium">
                Para a Pizzatto, economizar também é ajudar cada cliente a encontrar o material que realmente precisa.
              </p>
              <div className="space-y-4 text-[18px] text-[#252A2E]/70 leading-relaxed">
                <p>
                  É escolher soluções adequadas, evitar compras desnecessárias e planejar cada etapa para reduzir desperdícios, gastos e dores de cabeça.
                </p>
                <p>
                  Também significa valorizar materiais e escolhas que contribuam para reduzir impactos no meio ambiente.
                </p>
                <p className="font-bold text-[#252A2E]">
                  Porque uma boa compra não é apenas aquela que cabe no bolso — é aquela que faz sentido para o projeto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F5F6]/50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-[28px] font-bold text-[#252A2E] mb-12">Materiais para diferentes necessidades</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Consumidores",
              "Profissionais",
              "Empresas",
              "Obras e projetos"
            ].map((item) => (
              <div key={item} className="bg-white p-8 rounded-[2px] shadow-sm border border-[#E5E7EB] flex flex-col items-center gap-4 transition hover:border-[#174F8C]">
                <CheckCircle2 size={32} className="text-[#2E8B57]" />
                <span className="font-bold text-[16px] text-[#252A2E]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-[#174F8C] rounded-[4px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-full bg-[#123E70]/30 skew-x-12 translate-x-10"></div>
          <img src={bobininhaAsset.url} alt="Bobininha" className="w-32 h-32 object-contain relative z-10" />
          <div className="flex-1 text-center md:text-left text-white relative z-10">
            <h3 className="text-[24px] font-black mb-2 uppercase">Precisa encontrar um material?</h3>
            <p className="text-white/80 text-[18px] mb-6">Fale com nossa equipe pelo WhatsApp.</p>
            <button className="bg-[#2E8B57] text-white px-8 py-4 rounded-[2px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#257548] transition w-full md:w-auto justify-center">
              <MessageSquare size={20}/> Falar no WhatsApp
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
