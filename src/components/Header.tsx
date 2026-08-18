import logoAsset from "@/assets/logo.asset.json";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Header({ activePage }: { activePage?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-[#174F8C] backdrop-blur-sm border-b border-white/10 py-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6 py-1">
          <Link to="/">
            <img src={logoAsset.url} alt="Pizzatto Materiais Elétricos" className="h-16 w-auto object-contain py-1" />
          </Link>
        </div>

        <nav className="flex gap-8 text-[14px] font-semibold text-white">
          {[
            { label: 'Produtos', to: '/produtos' },
            { label: 'Categorias', to: '/categorias' },
            { label: 'Marcas', to: '#' },
            { label: 'Empresa', to: '#' },
            { label: 'Contato', to: '#' }
          ].map(item => (
            <Link 
              to={item.to as any} 
              key={item.label} 
              className={`hover:text-[#F5C400] transition uppercase tracking-wider text-[12px] ${activePage === item.label ? 'text-[#F5C400] border-b-2 border-[#F5C400]' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-[2px] font-bold text-[13px] hover:bg-[#257548] flex items-center gap-2 shadow-sm">
          <MessageSquare size={16}/> WhatsApp
        </button>
      </div>
    </header>
  );
}
