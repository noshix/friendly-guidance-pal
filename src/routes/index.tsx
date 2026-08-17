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
      <div className="bg-[#174F8C] text-white text-xs py-2 px-4 flex justify-between items-center">
        <p>Mais de 40 anos de experiência em soluções elétricas</p>
        <div className="flex gap-4">
          <span>Cuiabá - MT</span>
          <span className="font-bold">(65) 3052-4200</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-[#174F8C]">PIZZATTO</div>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-[#174F8C]">Produtos</a>
            <a href="#" className="hover:text-[#174F8C]">Categorias</a>
            <a href="#" className="hover:text-[#174F8C]">Marcas</a>
            <a href="#" className="hover:text-[#174F8C]">Empresa</a>
            <a href="#" className="hover:text-[#174F8C]">Contato</a>
          </nav>
          <button className="bg-[#2E8B57] text-white px-4 py-2 rounded font-medium text-sm hover:bg-[#257548]">
            Falar com a Pizzatto
          </button>
        </div>
      </header>

      {/* Busca */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <input 
          type="text" 
          placeholder="Busque por produto, código, referência ou fabricante..."
          className="w-full border-2 border-[#174F8C] rounded p-4 text-lg"
        />
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 flex items-center gap-12">
        <div className="flex-1">
          <div className="text-sm font-bold text-[#F5C400] mb-2 uppercase tracking-wide">Pizzatto Materiais Elétricos</div>
          <h1 className="text-5xl font-bold text-[#174F8C] mb-6 leading-tight">
            Materiais elétricos para sua obra, empresa e projeto.
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Mais de 40 anos de experiência oferecendo variedade e atendimento especializado em materiais elétricos em Cuiabá e Mato Grosso.
          </p>
          <div className="flex gap-4">
            <button className="bg-[#174F8C] text-white px-8 py-3 rounded font-medium hover:bg-[#123E70]">Explorar catálogo</button>
            <button className="border-2 border-[#174F8C] text-[#174F8C] px-8 py-3 rounded font-medium hover:bg-blue-50">Solicitar orçamento</button>
          </div>
        </div>
        <div className="flex-1 bg-gray-100 rounded h-[400px] flex items-center justify-center border-2 border-gray-200">
          <span className="text-gray-400 font-medium">[Composição profissional de materiais elétricos]</span>
        </div>
      </section>

      {/* Categorias */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t">
        <h2 className="text-3xl font-bold text-[#174F8C] mb-10">Encontre o que precisa</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {['Cabos e Condutores', 'Iluminação', 'Proteção Elétrica', 'Ferramentas', 'Infraestrutura'].map((cat) => (
            <div key={cat} className="border border-gray-200 p-4 rounded hover:border-[#174F8C] transition flex flex-col items-center text-center">
              <div className="bg-gray-100 w-full h-32 mb-4 rounded-sm" />
              <h3 className="font-bold text-[#252A2E]">{cat}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
