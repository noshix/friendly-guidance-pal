import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pizzatto Materiais Elétricos | Cuiabá - MT" },
      { name: "description", content: "Mais de 40 anos de experiência em soluções elétricas. Distribuidora técnica de materiais elétricos em Cuiabá." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <div className="bg-primary text-white text-xs py-2 px-4 flex justify-between items-center">
        <p>Mais de 40 anos de experiência em soluções elétricas</p>
        <div className="flex gap-4">
          <span>Cuiabá - MT</span>
          <span className="font-bold">(65) 3052-4200</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">PIZZATTO</div>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="#">Produtos</a>
            <a href="#">Categorias</a>
            <a href="#">Marcas</a>
            <a href="#">Empresa</a>
            <a href="#">Contato</a>
          </nav>
          <button className="bg-accent text-white px-4 py-2 rounded-md font-medium text-sm">
            Falar com a Pizzatto
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 flex items-center gap-12">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Materiais elétricos para sua obra, empresa e projeto.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Mais de 40 anos de experiência oferecendo variedade e atendimento especializado em materiais elétricos em Cuiabá e Mato Grosso.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary text-white px-6 py-3 rounded-md font-medium">Explorar catálogo</button>
            <button className="border border-primary text-primary px-6 py-3 rounded-md font-medium">Solicitar orçamento</button>
          </div>
        </div>
        <div className="flex-1 bg-muted rounded-lg h-[400px] flex items-center justify-center">
          [Fotografia profissional de Materiais Elétricos]
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-primary mb-10">Encontre o que precisa</h2>
        <div className="grid grid-cols-4 gap-6">
          {['Cabos', 'Iluminação', 'Proteção', 'Ferramentas'].map((cat) => (
            <div key={cat} className="border p-4 rounded-md hover:shadow-lg transition">
              <div className="bg-muted h-32 mb-4 rounded-sm" />
              <h3 className="font-bold">{cat}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
