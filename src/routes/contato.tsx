import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Phone, MapPin, MessageSquare, Navigation } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PIZZATTO_WHATSAPP } from "@/lib/config";


export const Route = createFileRoute("/contato")({
  component: ContatoPage,
  head: () => ({
    meta: [
      { title: "Contato | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Entre em contato ou visite nossa loja em Cuiabá. Av. Manoel José de Arruda, 664." },
    ],
  }),
});

function ContatoPage() {
  const address = "Av. Manoel José de Arruda, 664, Jardim Shangri-lá, Cuiabá - MT, 78070-305";
  const phone = "(65) 3052-4200";

  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header activePage="Contato" />

      {/* Breadcrumb */}
      <nav className="bg-[#F4F5F6] py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40">
          <Link to="/" className="hover:text-[#174F8C] transition">Início</Link>
          <ChevronRight size={14} />
          <span className="text-[#174F8C]">Contato</span>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="w-16 h-1 bg-[#174F8C] mx-auto mb-6"></div>
          <h1 className="text-[40px] md:text-[52px] font-extrabold text-[#252A2E] leading-tight tracking-tighter">
            Fale com a Pizzatto
          </h1>
          <p className="text-[18px] text-[#252A2E]/60 mt-4 font-medium">
            Entre em contato ou visite nossa loja em Cuiabá.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* WhatsApp CTA Card */}
          <div className="bg-[#F4F5F6] p-8 rounded-[2px] flex flex-col items-center text-center group border border-transparent hover:border-[#2E8B57] transition shadow-sm">
            <div className="w-16 h-16 bg-[#2E8B57] rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition">
              <MessageSquare size={32} />
            </div>
            <h3 className="font-black text-[18px] mb-2 uppercase tracking-tight">WhatsApp</h3>
            <p className="text-[#252A2E]/60 text-[14px] mb-8">Atendimento rápido para dúvidas e orçamentos.</p>
            <a 
              href={PIZZATTO_WHATSAPP.getLink()} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#2E8B57] text-white py-4 rounded-[2px] font-black uppercase tracking-widest hover:bg-[#257548] transition shadow-md flex items-center justify-center"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Phone Card */}
          <div className="bg-[#F4F5F6] p-8 rounded-[2px] flex flex-col items-center text-center group border border-transparent hover:border-[#174F8C] transition shadow-sm">
            <div className="w-16 h-16 bg-[#174F8C] rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition">
              <Phone size={32} />
            </div>
            <h3 className="font-black text-[18px] mb-2 uppercase tracking-tight">Telefone</h3>
            <p className="text-[#252A2E]/60 text-[14px] mb-2">Central de atendimento:</p>
            <div className="text-[24px] font-black text-[#174F8C] mb-8">{phone}</div>
            <a 
              href={`tel:${PIZZATTO_WHATSAPP.NUMBER}`}
              className="w-full bg-white text-[#174F8C] border border-[#174F8C] py-4 rounded-[2px] font-black uppercase tracking-widest hover:bg-[#174F8C] hover:text-white transition flex items-center justify-center"
            >
              Ligar
            </a>
          </div>

          {/* Location Card */}
          <div className="bg-[#F4F5F6] p-8 rounded-[2px] flex flex-col items-center text-center group border border-transparent hover:border-[#F5C400] transition shadow-sm">
            <div className="w-16 h-16 bg-[#F5C400] rounded-full flex items-center justify-center text-[#174F8C] mb-6 group-hover:scale-110 transition">
              <MapPin size={32} />
            </div>
            <h3 className="font-black text-[18px] mb-2 uppercase tracking-tight">Endereço</h3>
            <p className="text-[#252A2E]/60 text-[14px] mb-8 leading-relaxed">
              {address}
            </p>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] font-black uppercase tracking-widest hover:bg-[#123E70] transition flex items-center justify-center gap-2 shadow-md"
            >
              <Navigation size={18} /> Como chegar
            </a>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="w-full h-[450px] bg-[#E5E7EB] relative overflow-hidden grayscale contrast-125 border-y border-[#E5E7EB]">
        <div className="absolute inset-0 bg-[#174F8C]/5 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-[2px] shadow-2xl border border-[#E5E7EB] max-w-sm text-center relative z-10">
            <MapPin size={32} className="text-[#D9272E] mx-auto mb-4" />
            <h4 className="font-black text-[16px] mb-2 uppercase tracking-tight">Nossa Loja</h4>
            <p className="text-[#252A2E]/60 text-[13px] leading-relaxed">
              {address}
            </p>
          </div>
        </div>
        {/* Visual grid pattern to look like a map */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-20">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-[#174F8C]/20"></div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
