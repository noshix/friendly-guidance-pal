// Logo asset replaced by static public path /assets/logo-pizzatto.png
import { Phone, MapPin, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PIZZATTO_WHATSAPP } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-[#252A2E] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <img
            src="/assets/logo-pizzatto.png"
            alt="Pizzatto"
            className="h-12 w-auto brightness-0 invert"
          />
          <p className="text-[14px] text-white/60 leading-relaxed">
            Loja especializada em materiais elétricos em Cuiabá. Mais de 40 anos de tradição,
            qualidade e confiança para sua casa, obra ou empresa.
          </p>
        </div>
        <div>
          <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">
            Catálogo
          </h4>
          <ul className="space-y-4 text-[14px] text-white/70">
            {(
              [
                { label: "Produtos", to: "/produtos" },
                { label: "Categorias", to: "/categorias" },
                { label: "Marcas", to: "/marcas" },
              ] as const
            ).map((item) => (
              <li key={item.label} className="hover:text-white transition flex items-center gap-2">
                <ChevronRight size={12} className="text-[#F5C400]" />
                <Link to={item.to} className="hover:text-white transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">
            A Pizzatto
          </h4>
          <ul className="space-y-4 text-[14px] text-white/70">
            <li>
              <Link to="/empresa" className="hover:text-white cursor-pointer transition">
                Empresa
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-white cursor-pointer transition">
                Localização / Contato
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[12px] font-black tracking-[0.2em] text-[#F5C400] mb-8 uppercase">
            Atendimento
          </h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-[#F5C400] mt-1" />
              <div>
                <div className="text-[16px] font-black">(65) 3052-4200</div>
                <div className="text-[12px] text-white/40 uppercase font-bold">Atendimento</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-[#F5C400] mt-1" />
              <div className="text-[14px] text-white/70 leading-relaxed">
                Av. Manoel José de Arruda, 664
                <br />
                Jardim Shangri-lá
                <br />
                Cuiabá - MT | CEP 78070-305
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-white/40">
        <div>
          © {new Date().getFullYear()} Pizzatto Materiais Elétricos. Mais de 40 anos de experiência.
        </div>
        <div className="flex gap-8 items-center">
          <Link to="/privacidade" className="hover:text-white cursor-pointer transition">
            Privacidade
          </Link>
          <Link to="/termos-de-uso" className="hover:text-white cursor-pointer transition">
            Termos de Uso
          </Link>
          <Link
            to="/admin"
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded transition text-[10px] uppercase font-bold tracking-wider"
          >
            Área Restrita
          </Link>
        </div>
      </div>
    </footer>
  );
}
