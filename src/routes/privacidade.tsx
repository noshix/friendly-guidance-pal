import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacidade")({
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header />
      <nav className="bg-[#F4F5F6] py-4">
        <div className="max-w-7xl mx-auto px-4 text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40">
          <Link to="/" className="hover:text-[#174F8C]">Início</Link> / Política de Privacidade
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black uppercase mb-8">Política de Privacidade</h1>
        <div className="prose max-w-none text-[#252A2E]/80 leading-relaxed space-y-4">
          <p>Esta página descreve, de forma genérica, como tratamos as informações fornecidas através dos canais de contato, formulários de orçamento e WhatsApp deste site.</p>
          <p>Comprometemo-nos a utilizar esses dados exclusivamente para o atendimento às suas solicitações de orçamento e dúvidas.</p>
          <p className="font-bold border-t border-[#E5E7EB] pt-4 mt-8">Nota: Este conteúdo é um modelo provisório para fins de prototipagem e deverá ser revisado por uma consultoria jurídica antes da publicação definitiva do site.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
