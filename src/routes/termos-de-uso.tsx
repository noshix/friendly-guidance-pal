import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/termos-de-uso")({
  component: Termos,
});

function Termos() {
  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header />
      <nav className="bg-[#F4F5F6] py-4">
        <div className="max-w-7xl mx-auto px-4 text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40">
          <Link to="/" className="hover:text-[#174F8C]">Início</Link> / Termos de Uso
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black uppercase mb-8">Termos de Uso</h1>
        <div className="prose max-w-none text-[#252A2E]/80 leading-relaxed space-y-4">
          <p>Ao utilizar este site, você concorda com nossos termos de uso.</p>
          <p>O envio de solicitações de orçamento através do WhatsApp ou formulários deste site NÃO representa uma compra concluída nem reserva de produtos.</p>
          <p>Os preços, estoques e disponibilidade dos itens listados neste catálogo devem ser confirmados pela nossa equipe de atendimento antes de qualquer fechamento de negócio.</p>
          <p className="font-bold border-t border-[#E5E7EB] pt-4 mt-8">Nota: Este conteúdo é um modelo provisório para fins de prototipagem e deverá ser revisado por uma consultoria jurídica antes da publicação definitiva do site.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
