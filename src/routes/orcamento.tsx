import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Trash2, Plus, Minus, Send, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/orcamento")({
  component: Orcamento,
  head: () => ({
    meta: [
      { title: "Seu Orçamento | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Revise seus itens e solicite um orçamento via WhatsApp." },
    ],
  }),
});

function Orcamento() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    telefone: "",
    observacoes: ""
  });

  const sendWhatsApp = () => {
    if (!formData.nome) {
      toast.error("Por favor, informe seu nome.");
      return;
    }

    if (items.length === 0) {
      toast.error("Sua lista está vazia.");
      return;
    }

    const itemsText = items.map(item => 
      `• ${item.quantity}x ${item.name}\n  Código: ${item.id}`
    ).join("\n\n");

    const message = `Olá! Gostaria de solicitar um orçamento na Pizzatto Materiais Elétricos.\n\nITENS:\n${itemsText}\n\nDADOS:\nNome: ${formData.nome}\nEmpresa: ${formData.empresa || "Não informada"}\nTelefone: ${formData.telefone || "Não informado"}\nObservações:\n${formData.observacoes || "Nenhuma."}\n\nAguardo o orçamento. Obrigado!`;

    // Using a mock number as requested, or the one from Header if we had it.
    // The instructions said "Usar o MESMO destino/número já configurado".
    // I'll use a placeholder variable as a real number isn't visible in the current components.
    const phone = "556530524200"; 
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const estimatedTotal = items.reduce((acc, item) => {
    if (item.price) {
      const priceVal = parseFloat(item.price.replace(".", "").replace(",", "."));
      return acc + (priceVal * item.quantity);
    }
    return acc;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="bg-white p-12 rounded-[2px] border border-[#E5E7EB] shadow-sm">
            <div className="w-20 h-20 bg-[#F4F5F6] rounded-full flex items-center justify-center mx-auto mb-6 text-[#252A2E]/20">
              <ShoppingBag size={40} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-4">Sua lista está vazia</h1>
            <p className="text-[#252A2E]/60 mb-8">Adicione produtos para solicitar um orçamento.</p>
            <Link to="/produtos" className="inline-block bg-[#174F8C] text-white px-8 py-4 rounded-[2px] font-bold uppercase text-[14px] hover:bg-[#123E70] transition shadow-md">
              Ver Produtos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Seu orçamento</h1>
        <p className="text-[#252A2E]/60 mb-10">Revise os itens antes de enviar sua solicitação para nossa equipe.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-[#E5E7EB] p-4 md:p-6 rounded-[2px] shadow-sm flex flex-col md:flex-row gap-6 relative group">
                <div className="w-full md:w-24 aspect-square bg-[#F4F5F6] rounded-[2px] overflow-hidden flex-shrink-0">
                  <img src={item.img || "/placeholder.svg"} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                
                <div className="flex-1">
                  <div className="text-[10px] font-black text-[#174F8C] tracking-[0.2em] mb-1 uppercase">{item.brand}</div>
                  <h3 className="font-bold text-[16px] uppercase leading-tight mb-1">{item.name}</h3>
                  <div className="text-[11px] text-[#252A2E]/40 font-medium mb-4">Código: {item.id} | Ref: {item.ref}</div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-[#E5E7EB] rounded-[2px]">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-[#F4F5F6] transition text-[#252A2E]/60"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-[14px]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-[#F4F5F6] transition text-[#252A2E]/60"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] font-bold text-[#D9272E]/60 hover:text-[#D9272E] uppercase tracking-wider flex items-center gap-1.5 transition"
                    >
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                </div>

                <div className="md:text-right flex flex-row md:flex-col justify-between items-end md:items-end border-t md:border-t-0 md:border-l border-[#F4F5F6] pt-4 md:pt-0 md:pl-6">
                   <div className="text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest mb-1">Preço Un.</div>
                   <div className="text-[16px] font-black">
                     {item.price ? `R$ ${item.price}` : <span className="text-[#252A2E]/30 uppercase tracking-widest text-[12px]">Consulte</span>}
                   </div>
                   {item.price && (
                     <div className="hidden md:block mt-auto pt-4 border-t border-[#F4F5F6] w-full">
                       <div className="text-[10px] font-bold text-[#252A2E]/30 uppercase mb-1">Subtotal</div>
                       <div className="text-[14px] font-bold text-[#174F8C]">
                         R$ {(parseFloat(item.price.replace(".", "").replace(",", ".")) * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </div>
                     </div>
                   )}
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => clearCart()}
              className="text-[12px] font-bold text-[#252A2E]/40 hover:text-[#252A2E] uppercase tracking-widest py-2 px-4 transition"
            >
              Limpar toda a lista
            </button>
          </div>

          {/* Sidebar: Form & Summary */}
          <aside className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 shadow-sm space-y-6">
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] border-b border-[#F4F5F6] pb-4">Seus dados</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#252A2E]/50 mb-2">Nome Completo *</label>
                  <input 
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Como podemos te chamar?"
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-[2px] text-[14px] outline-none focus:border-[#174F8C] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#252A2E]/50 mb-2">Empresa (Opcional)</label>
                  <input 
                    type="text" 
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    placeholder="Sua empresa"
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-[2px] text-[14px] outline-none focus:border-[#174F8C] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#252A2E]/50 mb-2">Telefone (Opcional)</label>
                  <input 
                    type="text" 
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-[2px] text-[14px] outline-none focus:border-[#174F8C] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#252A2E]/50 mb-2">Observações</label>
                  <textarea 
                    rows={4}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Alguma dúvida ou detalhe técnico?"
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-[2px] text-[14px] outline-none focus:border-[#174F8C] transition resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-[#174F8C] text-white rounded-[2px] p-6 shadow-xl space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-4">Resumo do Orçamento</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[13px] text-white/70">
                  <span>Itens selecionados:</span>
                  <span className="font-bold text-white">{items.length}</span>
                </div>
                
                {estimatedTotal > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Valor estimado dos itens com preço disponível</div>
                    <div className="text-2xl font-black italic">
                      R$ {estimatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                
                <div className="bg-white/5 p-4 rounded-[2px] text-[11px] font-medium leading-relaxed text-white/60 italic">
                  * Valores e disponibilidade serão confirmados pela nossa equipe técnica após o envio da solicitação.
                </div>

                <button 
                  onClick={sendWhatsApp}
                  className="w-full bg-[#2E8B57] hover:bg-[#257548] text-white py-4 rounded-[2px] font-black uppercase tracking-widest text-[14px] flex items-center justify-center gap-3 transition shadow-lg mt-4"
                >
                  <Send size={18} />
                  Enviar via WhatsApp
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
