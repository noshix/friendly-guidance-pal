import logoAsset from "@/assets/logo.asset.json";
import { MessageSquare, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCartStore } from "@/lib/cart";
import { useHydrated } from "@/hooks/use-hydrated";

export function Header({ activePage }: { activePage?: string }) {
  const items = useCartStore((state) => state.items);
  const isHydrated = useHydrated();
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
             <span className="uppercase font-bold text-[11px] tracking-widest hidden sm:inline">Orçamento</span>
             <div className="relative p-1">
                <ShoppingBag size={20} />
                {isHydrated && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F5C400] text-[#252A2E] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {items.length}
                  </span>
                )}
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
