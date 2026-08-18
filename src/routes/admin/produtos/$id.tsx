import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  ChevronLeft, 
  Database, 
  Globe, 
  Save, 
  X, 
  Info,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/produtos/$id")({
  component: EditProduct,
});

function EditProduct() {
  const [isVisible, setIsVisible] = useState(true);
  const [displayName, setDisplayName] = useState("Disjuntor Tripolar 32A");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate({ to: "/admin/produtos" });
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/produtos" className="p-2 text-[#252A2E]/40 hover:text-[#252A2E] hover:bg-white rounded-[2px] transition">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-[#252A2E] uppercase tracking-tight">Editar Produto</h2>
            <p className="text-[12px] text-[#252A2E]/40 font-bold uppercase tracking-wider">ERP ID: 3481</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate({ to: "/admin/produtos" })}
            className="px-6 py-3 border border-[#E5E7EB] text-[#252A2E]/60 text-[12px] font-bold uppercase tracking-widest hover:text-[#D9272E] hover:border-[#D9272E] transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-[#174F8C] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition shadow-lg flex items-center gap-2"
          >
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-[#2E8B57] text-white p-4 rounded-[2px] flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 shadow-lg">
          <CheckCircle2 size={20} />
          <span className="text-[13px] font-bold uppercase tracking-wider">Produto atualizado com sucesso no catálogo.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Editable */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#F4F5F6] flex items-center gap-3">
              <Globe className="text-[#174F8C]" size={18} />
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">Publicação no Site</h3>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-[11px] font-black text-[#252A2E]/50 uppercase tracking-[0.2em] mb-3">Nome de exibição no catálogo</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-4 rounded-[2px] outline-none focus:border-[#174F8C] text-[14px] font-bold text-[#252A2E]"
                />
                <p className="mt-2 text-[11px] text-[#252A2E]/40 font-medium italic">Este nome será exibido para os clientes no site público.</p>
              </div>

              <div className="flex items-center gap-4 p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[2px]">
                <button 
                  onClick={() => setIsVisible(!isVisible)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVisible ? 'bg-[#2E8B57]' : 'bg-[#E5E7EB]'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-[#252A2E] uppercase tracking-wider">Produto visível no catálogo</span>
                  <span className="text-[11px] text-[#252A2E]/40 font-medium">Define se o produto aparece nas buscas e categorias públicas.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Read Only */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#F4F5F6] border border-[#E5E7EB] rounded-[2px] shadow-sm overflow-hidden opacity-80">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center gap-3 bg-white/50">
              <Database className="text-[#252A2E]/40" size={18} />
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]/60">Dados do ERP</h3>
            </div>
            <div className="p-6 space-y-6">
              <ReadOnlyField label="Código ERP" value="3481" />
              <ReadOnlyField label="Descrição ERP" value="DISJ TRIP 32A 5SX2332-7 SIEMENS" />
              <ReadOnlyField label="Fabricante" value="SIEMENS" />
              <ReadOnlyField label="Referência" value="5SX2332-7" />
              <ReadOnlyField label="Preço ERP" value="R$ 189,90" />
              <ReadOnlyField label="Saldo Disponível" value="6015" />
              <ReadOnlyField label="NCM" value="8536.20.00" />
            </div>
          </div>

          <div className="bg-[#174F8C]/5 border border-[#174F8C]/20 p-6 rounded-[2px] flex gap-4">
            <Info className="text-[#174F8C] shrink-0" size={20} />
            <p className="text-[12px] text-[#174F8C] font-medium leading-relaxed italic">
              Os dados do ERP são atualizados através da importação e não podem ser alterados manualmente nesta tela.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <label className="block text-[9px] font-black text-[#252A2E]/40 uppercase tracking-[0.2em] mb-1">{label}</label>
      <div className="text-[12px] font-bold text-[#252A2E]/70 bg-white/50 px-3 py-2 border border-black/5 rounded-[2px]">{value}</div>
    </div>
  );
}
