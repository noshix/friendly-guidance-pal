import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  History, 
  Search, 
  ChevronRight, 
  FileUp, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

export const Route = createFileRoute("/admin/importacoes/")({
  component: ImportacoesHistory,
});

function ImportacoesHistory() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-[#252A2E] uppercase tracking-tight">Histórico de Importações</h2>
          <p className="text-[13px] text-[#252A2E]/60 font-medium">Registro de todas as sincronizações realizadas com o ERP.</p>
        </div>
        <Link 
          to="/admin/importacoes/nova" 
          className="bg-[#174F8C] text-white px-6 py-3 rounded-[2px] font-bold text-[12px] uppercase tracking-widest hover:bg-[#123E70] transition shadow-lg flex items-center gap-2"
        >
          <FileUp size={16} /> Nova Importação
        </Link>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Data</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Arquivo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Analisados</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Novos</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Alterados</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F6]">
              {[
                { date: '18/08/2026 14:10', file: 'produtos_pizzatto_v5.xlsx', total: '11.170', new: '11.162', alt: '2', status: 'CONCLUÍDA' },
                { date: '17/08/2026 09:30', file: 'produtos_pizzatto_v4.xlsx', total: '11.168', new: '11.160', alt: '8', status: 'CONCLUÍDA' },
                { date: '15/08/2026 16:45', file: 'produtos_pizzatto_v3.xlsx', total: '11.165', new: '-', alt: '-', status: 'FALHOU' },
                { date: '12/08/2026 10:15', file: 'produtos_pizzatto_v2.xlsx', total: '11.160', new: '11.160', alt: '0', status: 'CONCLUÍDA' },
                { date: '10/08/2026 08:00', file: 'produtos_pizzatto_v1.xlsx', total: '11.155', new: '11.155', alt: '0', status: 'CONCLUÍDA' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB] transition group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#252A2E]">{row.date.split(' ')[0]}</span>
                      <span className="text-[10px] text-[#252A2E]/40 font-medium">{row.date.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-bold text-[#174F8C] group-hover:underline cursor-pointer">{row.file}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-[12px] font-medium text-[#252A2E]">{row.total}</td>
                  <td className="px-6 py-4 text-center text-[12px] font-medium text-[#174F8C]">{row.new}</td>
                  <td className="px-6 py-4 text-center text-[12px] font-medium text-[#F5C400]">{row.alt}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-[9px] font-black uppercase tracking-widest ${
                      row.status === 'CONCLUÍDA' ? 'bg-[#2E8B57]/10 text-[#2E8B57]' : 'bg-[#D9272E]/10 text-[#D9272E]'
                    }`}>
                      {row.status === 'CONCLUÍDA' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest italic">Página 1 de 1</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-[#E5E7EB] text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/30 rounded-[2px]" disabled>Anterior</button>
            <button className="px-4 py-2 border border-[#E5E7EB] text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/30 rounded-[2px]" disabled>Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
}
