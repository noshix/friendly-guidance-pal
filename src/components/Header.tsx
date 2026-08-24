// Logo asset replaced by static public path /assets/logo-pizzatto.png
import { Menu, MessageSquare, ShoppingBag, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCartStore } from "@/lib/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { PIZZATTO_WHATSAPP } from "@/lib/config";

const navigationItems = [
  { label: "Produtos", to: "/produtos" },
  { label: "Categorias", to: "/categorias" },
  { label: "Marcas", to: "/marcas" },
  { label: "Empresa", to: "/empresa" },
  { label: "Contato", to: "/contato" },
] as const;

export function Header({ activePage }: { activePage?: string }) {
  const items = useCartStore((state) => state.items);
  const isHydrated = useHydrated();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-[#174F8C] backdrop-blur-sm border-b border-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
        <div className="flex items-center py-1 shrink-0">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <img
              src="/assets/logo-pizzatto.png"
              alt="Pizzatto Materiais Elétricos"
              className="h-11 sm:h-14 xl:h-16 w-auto object-contain py-1"
            />
          </Link>
        </div>

        <nav className="hidden xl:flex gap-8 text-[14px] font-semibold text-white">
          {navigationItems.map((item) => (
            <Link
              to={item.to}
              key={item.label}
              className={`hover:text-[#F5C400] transition uppercase tracking-wider text-[12px] ${activePage === item.label ? "text-[#F5C400] border-b-2 border-[#F5C400]" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 xl:gap-6 shrink-0">
          <Link
            to="/orcamento"
            className="text-white hover:text-[#F5C400] transition flex items-center gap-2 relative"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Abrir orçamento"
          >
            <span className="uppercase font-bold text-[11px] tracking-widest hidden lg:inline">
              Orçamento
            </span>
            <div className="relative p-2 xl:p-1">
              <ShoppingBag size={20} />
              {isHydrated && items.length > 0 && (
                <span className="absolute top-0 right-0 xl:-top-1 xl:-right-1 bg-[#F5C400] text-[#252A2E] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {items.length}
                </span>
              )}
            </div>
          </Link>
          <a
            href={PIZZATTO_WHATSAPP.getLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2E8B57] text-white p-2.5 md:px-4 xl:px-5 rounded-[2px] font-bold text-[13px] hover:bg-[#257548] flex items-center gap-2 shadow-sm"
            aria-label="Falar com a Pizzatto no WhatsApp"
          >
            <MessageSquare size={16} />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            className="xl:hidden text-white hover:text-[#F5C400] transition p-2 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C400]"
            aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMenuOpen}
            aria-controls="public-navigation-mobile"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="public-navigation-mobile"
          className="xl:hidden border-t border-white/10 bg-[#174F8C] px-4 py-3"
          aria-label="Navegação principal"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
            {navigationItems.map((item) => (
              <Link
                to={item.to}
                key={item.label}
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-3 hover:bg-white/10 hover:text-[#F5C400] focus-visible:bg-white/10 focus-visible:text-[#F5C400] focus-visible:outline-none transition uppercase tracking-wider text-[12px] font-semibold text-white ${activePage === item.label ? "text-[#F5C400] border-l-2 border-[#F5C400]" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
