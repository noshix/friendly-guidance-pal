import logoAsset from "@/assets/logo.asset.json";
import { Phone, MapPin, ChevronRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#252A2E] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <img src={logoAsset.url} alt="Pizzatto" className="h-12 w-auto brightness-0 invert" />
          <p className="text-[14px] text-white/60 leading-relaxed">
            Loja especializada em materiais elétricos em Cuiabá. Mais de 40 anos de tradição, qualidade e confiança para sua casa, obra ou empresa.
          </p>
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
  );
}
