import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Menu, MessageCircle, ShoppingBag, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { PIZZATTO_WHATSAPP } from "@/lib/config";
import { StorefrontSearch } from "@/components/StorefrontSearch";

const navigationItems = [
  { label: "Produtos", to: "/produtos" },
  { label: "Categorias", to: "/categorias" },
  { label: "Marcas", to: "/marcas" },
  { label: "Empresa", to: "/empresa" },
  { label: "Contato", to: "/contato" },
] as const;

export function Header({ activePage }: { activePage?: string }) {
  const items = useCartStore((state) => state.items);
  const hydrated = useHydrated();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);
  return (
    <header className="store-header">
      <div className="store-topbar">
        <div className="store-container">
          <span>
            <Zap size={13} aria-hidden="true" /> Mais de 40 anos conectando projetos
          </span>
          <Link to="/contato">
            <MapPin size={13} aria-hidden="true" /> Cuiabá, MT{" "}
            <span className="store-topbar__visit">· Conheça nossa loja</span>
          </Link>
        </div>
      </div>
      <div className="store-container store-header__main">
        <Link to="/" className="store-logo" onClick={() => setIsMenuOpen(false)}>
          <img
            src="/assets/logo-pizzatto.png"
            alt="Pizzatto Materiais Elétricos"
            width={280}
            height={78}
          />
        </Link>
        <div className="store-header__search">
          <StorefrontSearch compact />
        </div>
        <div className="store-header__actions">
          <a
            href={PIZZATTO_WHATSAPP.getLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="store-header__help"
            aria-label="Falar com a Pizzatto no WhatsApp"
          >
            <MessageCircle size={22} aria-hidden="true" />
            <span>
              Precisa de ajuda?<strong>Fale com a gente</strong>
            </span>
          </a>
          <Link
            to="/orcamento"
            className="store-header__bag"
            aria-label="Abrir orçamento"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="store-header__bag-icon">
              <ShoppingBag size={24} aria-hidden="true" />
              {hydrated && items.length > 0 && <b>{items.length}</b>}
            </span>
            <span>
              Meu<strong>orçamento</strong>
            </span>
          </Link>
          <button
            type="button"
            className="store-menu-toggle"
            aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMenuOpen}
            aria-controls="public-navigation-mobile"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      <div className="store-header__nav">
        <div className="store-container">
          <Link to="/categorias" className="store-departments">
            <Menu size={18} aria-hidden="true" /> Todos os departamentos
          </Link>
          <nav aria-label="Navegação principal">
            {navigationItems.map((item) => (
              <Link
                to={item.to}
                key={item.label}
                aria-current={activePage === item.label ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/produtos" className="store-header__explore">
            Encontre seu próximo projeto <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      {isMenuOpen && (
        <nav
          id="public-navigation-mobile"
          className="store-mobile-nav"
          aria-label="Navegação mobile"
        >
          {navigationItems.map((item) => (
            <Link
              to={item.to}
              key={item.label}
              onClick={() => setIsMenuOpen(false)}
              aria-current={activePage === item.label ? "page" : undefined}
            >
              {item.label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          ))}
          <a href={PIZZATTO_WHATSAPP.getLink()} target="_blank" rel="noopener noreferrer">
            Atendimento pelo WhatsApp
            <MessageCircle size={18} aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  );
}
