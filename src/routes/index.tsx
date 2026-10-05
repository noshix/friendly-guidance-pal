import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Cable,
  Check,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { PublicProductCard } from "@/components/PublicProductCard";
import { CableAnimation3D } from "@/components/CableAnimation3D";
import { StorefrontSearch } from "@/components/StorefrontSearch";
import { categoryPresentation } from "@/lib/category-presentation";
import { PIZZATTO_WHATSAPP } from "@/lib/config";
import {
  buildHomeProductsParams,
  fetchPublicProducts,
  getCategories,
  getManufacturers,
  HOME_PRODUCT_LIMIT,
  PUBLIC_PRODUCTS_STALE_TIME,
  PUBLIC_TAXONOMY_STALE_TIME,
  selectHomeCategories,
} from "@/lib/api/public-catalog";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pizzatto Materiais Elétricos | A energia do seu projeto" },
      {
        name: "description",
        content:
          "Fios, cabos, proteção e materiais elétricos para sua obra. Explore o catálogo Pizzatto e solicite seu orçamento em Cuiabá, MT.",
      },
      { property: "og:title", content: "Pizzatto | A energia do seu projeto" },
      {
        property: "og:description",
        content:
          "Mais de 40 anos conectando pessoas, obras e projetos. Conheça nosso catálogo de materiais elétricos.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Index() {
  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => getCategories(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });
  const productsQuery = useQuery({
    queryKey: ["public-products", "home", HOME_PRODUCT_LIMIT],
    queryFn: () => fetchPublicProducts(buildHomeProductsParams()),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_PRODUCTS_STALE_TIME,
    retry: 1,
  });
  const manufacturersQuery = useQuery({
    queryKey: ["public-manufacturers"],
    queryFn: () => getManufacturers(),
    enabled: typeof window !== "undefined",
    staleTime: PUBLIC_TAXONOMY_STALE_TIME,
    retry: 1,
  });
  const categories = useMemo(
    () => selectHomeCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  return (
    <div className="storefront">
      <Header />
      <main>
        <section className="store-hero store-container">
          <div className="store-hero__copy">
            <span className="store-eyebrow">
              <span className="store-status-dot" /> A energia de quem constrói
            </span>
            <h1>
              Seu projeto.
              <br />
              Nossa energia.
              <br />
              <span>Infinitas possibilidades.</span>
            </h1>
            <p>
              Da primeira ideia ao último acabamento. Encontre os materiais elétricos certos com
              quem entende do assunto.
            </p>
            <div className="store-hero__actions">
              <Link to="/produtos" className="store-button store-button--blue">
                Explorar o catálogo <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
              <a
                href={PIZZATTO_WHATSAPP.getLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="store-hero__contact"
              >
                <MessageCircle size={20} aria-hidden="true" /> Falar com um especialista
              </a>
            </div>
            <div className="store-hero__proof">
              <span className="store-hero__proof-icon">
                <ShieldCheck size={23} aria-hidden="true" />
              </span>
              <div>
                <strong>Mais de 40 anos de parceria.</strong>
                <span>Uma loja de verdade, ao lado do seu projeto.</span>
              </div>
            </div>
          </div>
          <div className="store-hero__visual">
            <div className="store-energy-scene" aria-hidden="true">
              <div className="store-energy-scene__grid" />
              <span className="store-energy-scene__spark">
                <Zap size={30} fill="currentColor" />
              </span>
            </div>
            <CableAnimation3D />
            <div className="store-hero__visual-top">
              <span>
                <Zap size={15} aria-hidden="true" /> PIZZATTO SELECIONA
              </span>
              <span>Desde Cuiabá. Para o seu projeto.</span>
            </div>
            <div className="store-hero__visual-bottom">
              <span>
                Conexões que
                <br />
                <strong>fazem acontecer.</strong>
              </span>
              <Link to="/categorias" aria-label="Explorar departamentos">
                <ArrowUpRight size={26} aria-hidden="true" />
              </Link>
            </div>
            <div className="store-hero__floating">
              <Cable size={22} aria-hidden="true" />
              <div>
                <strong>Qualidade em cada conexão</strong>
                <span>Materiais para todas as etapas</span>
              </div>
              <Check size={17} aria-hidden="true" />
            </div>
          </div>
        </section>

        <section
          className="store-container store-benefits"
          aria-label="Por que escolher a Pizzatto"
        >
          <div>
            <ShieldCheck size={25} aria-hidden="true" />
            <span>
              <strong>Escolha com confiança</strong>
              <small>Materiais e marcas do nosso catálogo</small>
            </span>
          </div>
          <div>
            <MessageCircle size={25} aria-hidden="true" />
            <span>
              <strong>Atendimento de verdade</strong>
              <small>Conte com nossa equipe especializada</small>
            </span>
          </div>
          <div>
            <Cable size={25} aria-hidden="true" />
            <span>
              <strong>Do básico ao profissional</strong>
              <small>Para sua reforma, obra ou empresa</small>
            </span>
          </div>
          <div>
            <MapPin size={25} aria-hidden="true" />
            <span>
              <strong>Perto de você</strong>
              <small>Visite nossa loja em Cuiabá</small>
            </span>
          </div>
        </section>

        <section className="store-section store-container">
          <div className="store-section-heading">
            <div>
              <span className="store-eyebrow">Encontre o que precisa</span>
              <h2>Cada projeto, um caminho.</h2>
            </div>
            <Link to="/categorias" className="store-text-link">
              Todos os departamentos <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="store-category-grid">
            {categoriesQuery.isPending &&
              Array.from({ length: 8 }, (_, index) => (
                <div className="store-category-skeleton" key={index} aria-hidden="true" />
              ))}
            {categories.map((category) => {
              const presentation = categoryPresentation(
                category.erpName,
                category.name,
                category.imageUrl,
              );
              return (
                <Link
                  to="/categorias/$slug"
                  params={{ slug: category.slug }}
                  key={category.slug}
                  className="store-category-card"
                >
                  <div className="store-category-card__image">
                    <ImageWithFallback
                      src={presentation.image}
                      alt={presentation.name}
                      loading="lazy"
                      type="category"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3>{presentation.name}</h3>
                    <span>
                      {category.productCount.toLocaleString("pt-BR")} produtos{" "}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {categoriesQuery.isError && (
            <div className="store-feedback">
              <p>
                Estamos buscando os departamentos. Você também pode explorar o catálogo completo.
              </p>
              <Link to="/produtos" className="store-text-link">
                Abrir catálogo <ArrowRight size={17} />
              </Link>
            </div>
          )}
          {categoriesQuery.isSuccess && categories.length === 0 && (
            <p className="store-feedback">
              Novos departamentos aparecerão à medida que os produtos forem publicados.
            </p>
          )}
        </section>

        <section className="store-container store-project-banner">
          <div>
            <span className="store-eyebrow">Seu próximo projeto começa aqui</span>
            <h2>
              A peça certa.
              <br />A um clique de distância.
            </h2>
            <p>Busque por produto, código, referência ou fabricante.</p>
          </div>
          <StorefrontSearch />
        </section>

        <section className="store-section store-container">
          <div className="store-section-heading">
            <div>
              <span className="store-eyebrow">
                <Sparkles size={14} aria-hidden="true" /> Explore nossa vitrine
              </span>
              <h2>Encontre sua próxima solução.</h2>
            </div>
            <Link to="/produtos" className="store-text-link">
              Ver catálogo completo <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="store-products-grid">
            {productsQuery.isPending &&
              Array.from({ length: 4 }, (_, index) => (
                <div className="store-product-skeleton" key={index} aria-hidden="true">
                  <div />
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            {(productsQuery.data?.items ?? []).map((product) => (
              <PublicProductCard key={product.erpId} product={product} />
            ))}
          </div>
          {productsQuery.isError && (
            <div className="store-feedback">
              <p>O catálogo está demorando a responder. Tente novamente em alguns instantes.</p>
              <button
                type="button"
                onClick={() => void productsQuery.refetch()}
                className="store-text-link"
              >
                Tentar novamente <ArrowRight size={17} />
              </button>
            </div>
          )}
          {productsQuery.isSuccess && productsQuery.data.items.length === 0 && (
            <p className="store-feedback">
              Nossa vitrine está sendo preparada. Fale com a equipe para encontrar o que precisa.
            </p>
          )}
        </section>

        {(manufacturersQuery.data?.length ?? 0) > 0 && (
          <section className="store-container store-brands">
            <div>
              <span className="store-eyebrow">Quem faz parte do seu projeto</span>
              <h2>Marcas que você encontra aqui.</h2>
            </div>
            <div className="store-brands__list">
              {(manufacturersQuery.data ?? []).slice(0, 6).map((manufacturer) => (
                <Link
                  key={manufacturer.slug}
                  to="/marcas/$slug"
                  params={{ slug: manufacturer.slug }}
                >
                  {manufacturer.name}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="store-section store-container store-story">
          <div className="store-story__photo">
            <img
              src="/assets/fachada.jpg"
              alt="Fachada da loja Pizzatto em Cuiabá"
              loading="lazy"
              width={573}
              height={349}
            />
            <span>
              <MapPin size={16} aria-hidden="true" /> Cuiabá, Mato Grosso
            </span>
          </div>
          <div>
            <span className="store-eyebrow">Nossa história continua com você</span>
            <h2>
              Mais que materiais.
              <br />
              <span>Uma parceria para construir.</span>
            </h2>
            <p>
              Há mais de 40 anos, a Pizzatto faz parte das obras, reformas e ideias de quem constrói
              em Cuiabá. Nossa experiência está aqui para ajudar você a ir mais longe.
            </p>
            <Link to="/empresa" className="store-text-link">
              Conheça a nossa história <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <div className="store-story__signature">
              <strong>
                40<span>+</span>
              </strong>
              <span>
                Anos de experiência.
                <br />O mesmo compromisso com você.
              </span>
            </div>
          </div>
        </section>

        <section className="store-container store-consultation">
          <div>
            <span className="store-eyebrow">Pode chamar. A gente ajuda.</span>
            <h2>
              Vamos tirar seu
              <br />
              projeto do papel?
            </h2>
            <p>
              Monte sua lista de materiais ou converse com nossa equipe. A próxima conexão começa
              aqui.
            </p>
            <a
              href={PIZZATTO_WHATSAPP.getLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="store-button store-button--yellow"
            >
              <MessageCircle size={20} aria-hidden="true" /> Solicitar meu orçamento{" "}
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </div>
          <div className="store-consultation__mascot">
            <div aria-hidden="true" />
            <img
              src="/assets/bobininha.png"
              alt="Bobininha, o mascote da Pizzatto"
              loading="lazy"
              width={450}
              height={422}
            />
            <span>
              Seu projeto tem
              <br />
              <strong>boa companhia.</strong>
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
