import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight,
  Info,
  XCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/importacoes/preview")({
  component: ImportPreview,
});

function ImportPreview() {
  const [status, setStatus] = useState<'preview' | 'importing' | 'success' | 'error'>('preview');
  const navigate = useNavigate();

  const handleConfirm = () => {
    setStatus('importing');
    setTimeout(() => {
      setStatus('success');
    }, 2500);
  };

  if (status === 'importing') {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        <Loader2 className="w-16 h-16 text-[#174F8C] animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E] mb-2">IMPORTANDO PRODUTOS...</h2>
          <p className="text-[14px] text-[#252A2E]/60 font-medium italic">Os dados estão sendo sincronizados com o catálogo Pizzatto.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-xl overflow-hidden text-center">
          <div className="bg-[#2E8B57] py-12 flex justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} className="text-white" />
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#252A2E] mb-2">Importação concluída</h2>
              <p className="text-[14px] text-[#252A2E]/60">Os produtos foram atualizados com sucesso no sistema.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-[#F9FAFB] p-4 border border-[#E5E7EB] rounded-[2px]">
                <p className="text-[20px] font-black text-[#252A2E]">11.170</p>
                <p className="text-[10px] font-bold text-[#252A2E]/40 uppercase tracking-widest">Processados</p>
              </div>
              <div className="bg-[#F9FAFB] p-4 border border-[#E5E7EB] rounded-[2px]">
                <p className="text-[20px] font-black text-[#174F8C]">11.162</p>
                <p className="text-[10px] font-bold text-[#252A2E]/40 uppercase tracking-widest">Novos</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/admin/produtos" className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] font-bold text-[12px] uppercase tracking-widest hover:bg-[#123E70] transition">Gerenciar Produtos</Link>
              <Link to="/admin/importacoes" className="w-full bg-white border border-[#E5E7EB] text-[#252A2E] py-4 rounded-[2px] font-bold text-[12px] uppercase tracking-widest hover:border-[#174F8C] transition">Ver Histórico</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/importacoes/nova" className="p-2 text-[#252A2E]/40 hover:text-[#252A2E] hover:bg-white rounded-[2px] transition">
            <ChevronLeft size={20} />
          </Link>
          <h2 className="text-2xl font-black text-[#252A2E] uppercase tracking-tight">Prévia da Importação</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate({ to: "/admin/importacoes/nova" })}
            className="px-6 py-3 border border-[#E5E7EB] text-[#252A2E]/60 text-[12px] font-bold uppercase tracking-widest hover:text-[#D9272E] hover:border-[#D9272E] transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            className="px-10 py-3 bg-[#174F8C] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition shadow-lg"
          >
            Confirmar Importação
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryChip label="Analisados" value="11.170" color="bg-white border-[#E5E7EB] text-[#252A2E]" />
        <SummaryChip label="Novos" value="11.162" color="bg-[#174F8C]/5 border-[#174F8C]/20 text-[#174F8C]" />
        <SummaryChip label="Alterados" value="2" color="bg-[#F5C400]/5 border-[#F5C400]/20 text-[#F5C400]" />
        <SummaryChip label="Sem Alteração" value="6" color="bg-[#F4F5F6] border-[#E5E7EB] text-[#252A2E]/40" />
        <SummaryChip label="Erros" value="0" color="bg-white border-[#E5E7EB] text-[#252A2E]/20" />
      </div>

      {/* Changes Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm">
        <div className="p-6 border-b border-[#F4F5F6]">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">Produtos Alterados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Código ERP</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Produto</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Campo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Valor Atual</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Novo Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F6]">
              <tr>
                <td className="px-6 py-4 text-[12px] font-bold text-[#252A2E]">3481</td>
                <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">Disjuntor Tripolar 32A Siemens</td>
                <td className="px-6 py-4 text-[12px] font-bold text-[#174F8C] uppercase tracking-wider">Saldo disponível</td>
                <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">6028</td>
                <td className="px-6 py-4 text-[12px] font-black text-[#2E8B57] flex items-center gap-2">
                  6015 <ArrowRight size={12} className="text-[#252A2E]/20" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-[12px] font-bold text-[#252A2E]">9122</td>
                <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">Lâmpada LED 40W Alumbra</td>
                <td className="px-6 py-4 text-[12px] font-bold text-[#174F8C] uppercase tracking-wider">Preço ERP</td>
                <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">R$ 49,90</td>
                <td className="px-6 py-4 text-[12px] font-black text-[#2E8B57] flex items-center gap-2">
                  R$ 52,90 <ArrowRight size={12} className="text-[#252A2E]/20" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* New Products Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm">
        <div className="p-6 border-b border-[#F4F5F6] flex justify-between items-center">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">Novos Produtos</h3>
          <span className="text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest italic">Mostrando 1–10 de 11.162</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Código ERP</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Fabricante</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Preço</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F6]">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td className="px-6 py-4 text-[12px] font-bold text-[#252A2E]">880{i}</td>
                  <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">Novo Produto Material Elétrico {i}</td>
                  <td className="px-6 py-4 text-[12px] font-bold text-[#174F8C] uppercase">PIZZATTO</td>
                  <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">R$ 0,00</td>
                  <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E] text-center">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex justify-center">
           <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#174F8C] bg-white border border-[#E5E7EB] rounded-[2px]">1</button>
            <button className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#252A2E]/40 hover:bg-white rounded-[2px]">2</button>
            <button className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#252A2E]/40 hover:bg-white rounded-[2px]">3</button>
            <span className="px-2 text-[#252A2E]/20 text-[10px]">...</span>
            <button className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-[#252A2E]/40 hover:bg-white rounded-[2px]">224</button>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#F4F5F6] p-6 rounded-[2px] border border-[#E5E7EB]">
        <Info className="text-[#174F8C]" size={20} />
        <p className="text-[13px] text-[#252A2E]/60 font-medium italic">
          Os produtos serão atualizados somente após a confirmação. Clique em Confirmar Importação para aplicar as alterações.
        </p>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className={`${color} border rounded-[2px] p-4 shadow-sm`}>
      <p className="text-[18px] font-black tracking-tight">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">{label}</p>
    </div>
  );
}
