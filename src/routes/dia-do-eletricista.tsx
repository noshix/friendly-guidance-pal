import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Download,
  Gift,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Tv,
  Zap,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ElectricianCoffeeScene } from "@/components/ElectricianCoffeeScene";
import { PIZZATTO_WHATSAPP } from "@/lib/config";
import {
  ELECTRICIAN_DAY,
  ELECTRICIAN_MAP_URL,
  electricianBreakfastCalendar,
} from "@/lib/electrician-day";
import "@/styles/electrician-day.css";

export const Route = createFileRoute("/dia-do-eletricista")({
  component: ElectricianDayPage,
  head: () => ({
    meta: [
      { title: "Dia do Eletricista 2026 | Café da manhã na Pizzatto" },
      {
        name: "description",
        content:
          "Uma homenagem a quem conecta o mundo. Café da manhã na Pizzatto: sexta-feira, 16 de outubro de 2026, às 07h30, em Cuiabá. Brindes para os primeiros 500 clientes.",
      },
      { property: "og:title", content: "A energia é sua. O café é por nossa conta. | Pizzatto" },
      {
        property: "og:description",
        content:
          "Dia do Eletricista: venha comemorar com a gente em 16/10/2026, sexta-feira, a partir das 07h30.",
      },
    ],
  }),
});

function saveInvitation() {
  const url = URL.createObjectURL(
    new Blob([electricianBreakfastCalendar()], { type: "text/calendar;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "pizzatto-dia-do-eletricista-2026.ics";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ElectricianDayPage() {
  const whatsapp = PIZZATTO_WHATSAPP.getLink(
    "Olá! Gostaria de informações sobre o café da manhã do Dia do Eletricista, em 16 de outubro, às 07h30.",
  );
  return (
    <div className="electric-day">
      <Header />
      <main>
        <section className="electric-hero" aria-labelledby="electric-title">
          <div className="electric-hero__grid" aria-hidden="true" />
          <div className="store-container electric-hero__inner">
            <div className="electric-hero__copy">
              <span className="electric-kicker">
                <Zap size={14} aria-hidden="true" /> OUTUBRO É DE QUEM FAZ ACONTECER
              </span>
              <p className="electric-hero__occasion">17 de outubro · Dia do Eletricista</p>
              <h1 id="electric-title">
                A energia é sua.
                <br />O <em>café</em> é por
                <br className="electric-desktop-break" /> nossa conta.
              </h1>
              <p className="electric-hero__lead">
                Antes de iluminar mais um projeto, faça uma pausa com a gente. Preparamos uma manhã
                especial para celebrar quem conecta o mundo.
              </p>
              <a href="#nosso-encontro" className="electric-button electric-button--yellow">
                Você é nosso convidado <ArrowDown size={18} aria-hidden="true" />
              </a>
              <span className="electric-hero__signature">
                Uma homenagem da Pizzatto a você, eletricista.
              </span>
            </div>
            <ElectricianCoffeeScene />
          </div>
          <div className="electric-hero__baseline" aria-hidden="true">
            <span>CONHECIMENTO.</span>
            <Zap size={17} />
            <span>PARCERIA.</span>
            <Zap size={17} />
            <span>ENERGIA.</span>
            <Zap size={17} />
            <span>PIZZATTO.</span>
          </div>
        </section>

        <section id="nosso-encontro" className="electric-meeting" aria-labelledby="meeting-title">
          <div className="store-container">
            <div className="electric-invitation">
              <div className="electric-invitation__date">
                <span>OUTUBRO / {ELECTRICIAN_DAY.year}</span>
                <strong>16</strong>
                <small>SEXTA-FEIRA</small>
              </div>
              <div className="electric-invitation__body">
                <span className="electric-kicker electric-kicker--blue">
                  <Coffee size={17} aria-hidden="true" /> NOSSO ENCONTRO
                </span>
                <h2 id="meeting-title">Seu dia começa aqui.</h2>
                <div className="electric-invitation__details">
                  <div>
                    <Clock3 size={20} aria-hidden="true" />
                    <span>
                      A partir das
                      <strong>
                        <time dateTime={ELECTRICIAN_DAY.startsAt}>07h30</time>
                      </strong>
                    </span>
                  </div>
                  <div>
                    <MapPin size={20} aria-hidden="true" />
                    <span>
                      Na nossa loja<strong>Pizzatto · Cuiabá</strong>
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="electric-button electric-button--outline"
                onClick={saveInvitation}
              >
                <Download size={17} aria-hidden="true" /> Salvar convite
              </button>
            </div>
            <p className="electric-date-note">
              <CalendarDays size={18} aria-hidden="true" />
              <span>
                <strong>O Dia do Eletricista é 17 de outubro, sábado.</strong> Como não abrimos aos
                sábados, nossa comemoração será antecipada para{" "}
                <strong>sexta-feira, dia 16, às 07h30.</strong> Horário de Cuiabá.
              </span>
            </p>
          </div>
        </section>

        <section className="electric-tribute store-container" aria-labelledby="tribute-title">
          <div>
            <span className="electric-kicker electric-kicker--blue">MUITO ALÉM DOS FIOS</span>
            <h2 id="tribute-title">
              Você não conecta
              <br />
              só energia.
              <br />
              <em>Conecta possibilidades.</em>
            </h2>
          </div>
          <div className="electric-tribute__text">
            <p>
              Uma casa que ganha luz. Um negócio que abre as portas. Uma ideia que finalmente sai do
              papel. Em cada projeto, existe o cuidado de um eletricista.
            </p>
            <p>
              O dia 17 de outubro é uma oportunidade de reconhecer esse trabalho. E, na Pizzatto,
              queremos fazer isso do nosso jeito: de portas abertas, com café e uma boa conversa.
            </p>
            <div>
              <img
                src="/assets/simbolo-pizzatto.png"
                alt="Símbolo do raio da Pizzatto"
                width={60}
                height={60}
                className="electric-tribute__symbol"
                loading="lazy"
              />
              <span>
                Uma manhã para trocar experiências,
                <br />
                <strong>fortalecer parcerias e celebrar você.</strong>
              </span>
            </div>
          </div>
        </section>

        <section className="electric-perks" aria-labelledby="perks-title">
          <div className="store-container">
            <div className="electric-section-heading">
              <div>
                <span className="electric-kicker electric-kicker--blue">
                  TEM MAIS ENERGIA NESSA COMEMORAÇÃO
                </span>
                <h2 id="perks-title">
                  Uma manhã especial.
                  <br />
                  Um outubro inteiro para celebrar.
                </h2>
              </div>
              <Sparkles size={35} aria-hidden="true" />
            </div>
            <div className="electric-perks__grid">
              <article className="electric-gift">
                <div className="electric-gift__visual" aria-hidden="true">
                  <span className="electric-gift__ring" />
                  <div className="electric-gift__bag">
                    <i />
                    <Zap size={52} />
                    <strong>PIZZATTO</strong>
                  </div>
                  <span className="electric-gift__badge">
                    <strong>500</strong> PRIMEIROS CLIENTES
                  </span>
                </div>
                <div className="electric-gift__copy">
                  <span className="electric-kicker electric-kicker--blue">
                    <Gift size={16} aria-hidden="true" /> UM PRESENTE PARA O SEU DIA
                  </span>
                  <h3>
                    Chegue cedo.
                    <br />
                    Leve uma bolsa de brindes.
                  </h3>
                  <p>
                    Vamos entregar uma bolsa com vários materiais para os{" "}
                    <strong>primeiros 500 clientes</strong> da nossa comemoração.
                  </p>
                  <span className="electric-perk-note">
                    <Check size={16} aria-hidden="true" /> Café da manhã · 16 de outubro · 07h30
                  </span>
                  <small>
                    Ilustração da bolsa meramente ilustrativa. Consulte a equipe sobre a entrega e
                    os materiais.
                  </small>
                </div>
              </article>
              <article className="electric-prize">
                <div className="electric-prize__copy">
                  <span className="electric-kicker">
                    <Tv size={16} aria-hidden="true" /> OUTUBRO EM TELA GRANDE
                  </span>
                  <h3>
                    Seu próximo projeto
                    <br />
                    pode render uma
                    <br />
                    <em>TV de 65″.</em>
                  </h3>
                  <p>
                    Toda compra feita na loja em outubro vai concorrer a uma{" "}
                    <strong>TV de 65 polegadas</strong>, com sorteio no final do mês.
                  </p>
                  <a
                    href={PIZZATTO_WHATSAPP.getLink(
                      "Olá! Quero informações sobre o regulamento da campanha de outubro da TV de 65 polegadas.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consulte as condições com a equipe <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <div className="electric-tv" aria-hidden="true">
                  <div className="electric-tv__screen">
                    <span>
                      OUTUBRO
                      <br />
                      <strong>65″</strong>
                      <small>PIZZATTO</small>
                    </span>
                  </div>
                  <i />
                  <b />
                </div>
                <p className="electric-prize__note">
                  Imagem ilustrativa. Regulamento, critérios de participação, data exata da apuração
                  e informações de autorização devem ser confirmados antes da divulgação oficial da
                  campanha.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="electric-visit store-container" aria-labelledby="visit-title">
          <div className="electric-visit__photo">
            <img
              src="/assets/fachada.jpg"
              alt="Fachada da Pizzatto Materiais Elétricos em Cuiabá"
              loading="lazy"
              width={573}
              height={349}
            />
            <span>
              <MapPin size={16} aria-hidden="true" /> A gente se encontra na Pizzatto.
            </span>
          </div>
          <div className="electric-visit__copy">
            <span className="electric-kicker electric-kicker--blue">RESERVE ESSA MANHÃ</span>
            <h2 id="visit-title">
              O café está marcado.
              <br />
              <em>Só falta você.</em>
            </h2>
            <p>
              Sexta-feira, <strong>16 de outubro de 2026</strong>, a partir das{" "}
              <strong>07h30</strong>. Venha começar o dia com quem faz parte dos seus projetos.
            </p>
            <address>
              <MapPin size={21} aria-hidden="true" />
              <span>
                Av. Manoel José de Arruda, 664
                <br />
                Jardim Shangri-lá · Cuiabá, MT
              </span>
            </address>
            <div className="electric-visit__actions">
              <a
                href={ELECTRICIAN_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="electric-button electric-button--blue"
              >
                Ver como chegar <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="electric-button electric-button--outline"
              >
                <MessageCircle size={18} aria-hidden="true" /> Tirar uma dúvida
              </a>
            </div>
            <span className="electric-visit__assurance">
              <ShieldCheck size={16} aria-hidden="true" /> Mais de 40 anos de parceria com quem faz
              acontecer.
            </span>
          </div>
        </section>
        <section className="electric-signoff">
          <div className="store-container">
            <Zap size={30} aria-hidden="true" />
            <p>
              A luz que você leva faz a diferença.
              <br />
              <strong>Feliz Dia do Eletricista.</strong>
            </p>
            <Link to="/">
              Pizzatto Materiais Elétricos <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
