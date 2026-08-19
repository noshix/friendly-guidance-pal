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
            { label: 'Marcas', to: '/marcas' },
            { label: 'Empresa', to: '/empresa' },
            { label: 'Contato', to: '/contato' }
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
        <div className="flex items-center gap-6">
          <Link to="/orcamento" className="text-white hover:text-[#F5C400] transition flex items-center gap-2 relative">
             <span className="uppercase font-bold text-[13px]">Orçamento</span>
             {/* Simple cart icon visualization */}
             <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {/* Badge component here logic to follow */}
             </div>
          </Link>
          <button className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-[2px] font-bold text-[13px] hover:bg-[#257548] flex items-center gap-2 shadow-sm">
            <MessageSquare size={16}/> WhatsApp
          </button>
        </div>
      </div>
    </header>
  );
}
