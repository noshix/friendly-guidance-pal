import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, MessageCircle, Phone, Zap } from "lucide-react";
import { PIZZATTO_WHATSAPP } from "@/lib/config";

export function Footer() {
  return (
    <footer className="store-footer">
      <div className="store-container store-footer__intro">
        <div>
          <span className="store-eyebrow">A energia do seu próximo projeto</span>
          <h2>Conte com quem entende.</h2>
        </div>
        <a
          href={PIZZATTO_WHATSAPP.getLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="store-button store-button--yellow"
        >
          <MessageCircle size={19} aria-hidden="true" /> Conversar com a Pizzatto{" "}
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
      <div className="store-container store-footer__grid">
        <div className="store-footer__brand">
          <Link to="/" className="store-footer__logo">
            <img
              src="/assets/logo-pizzatto.png"
              alt="Pizzatto Materiais Elétricos"
              width={260}
              height={74}
              loading="lazy"
            />
          </Link>
          <p>
            Materiais elétricos, conhecimento e parceria. Há mais de 40 anos fazendo parte de quem
            constrói em Cuiabá.
          </p>
          <span>
            <Zap size={14} aria-hidden="true" /> Tradição que conecta.
          </span>
        </div>
        <div>
          <h3>Explore o catálogo</h3>
          <Link to="/produtos">Todos os produtos</Link>
          <Link to="/categorias">Departamentos</Link>
          <Link to="/marcas">Nossas marcas</Link>
          <Link to="/orcamento">Meu orçamento</Link>
        </div>
        <div>
          <h3>Conheça a Pizzatto</h3>
          <Link to="/empresa">Nossa história</Link>
          <Link to="/contato">Visite nossa loja</Link>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/termos-de-uso">Termos de uso</Link>
        </div>
        <div>
          <h3>Vamos conversar</h3>
          <a href="tel:+556530524200" className="store-footer__contact">
            <Phone size={18} aria-hidden="true" />
            <span>
              (65) 3052-4200<small>Telefone da loja</small>
            </span>
          </a>
          <a
            href={PIZZATTO_WHATSAPP.getLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="store-footer__contact"
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>
              Atendimento WhatsApp<small>Solicite seu orçamento</small>
            </span>
          </a>
          <Link to="/contato" className="store-footer__contact">
            <MapPin size={19} aria-hidden="true" />
            <span>
              Av. Manoel José de Arruda, 664<small>Jardim Shangri-lá · Cuiabá, MT</small>
            </span>
          </Link>
        </div>
      </div>
      <div className="store-container store-footer__bottom">
        <span>© {new Date().getFullYear()} Pizzatto Materiais Elétricos.</span>
        <span>Feito para conectar você ao que precisa.</span>
        <Link
          to="/dia-do-eletricista"
          className="rounded-full border border-white/20 px-3 py-2 text-[#f5c400] transition hover:border-[#f5c400] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5c400]"
        >
          <Zap size={13} aria-hidden="true" /> Dia do Eletricista
        </Link>
        <Link to="/admin">
          Área restrita <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </footer>
  );
}
