import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Package, 
  FileUp, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-[#252A2E] uppercase tracking-tight">Visão Geral</h2>
        <p className="text-[13px] text-[#252A2E]/60 font-medium italic">Dados simulados para prototipagem visual do painel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Package className="text-[#174F8C]" size={20} />}
          label="Total de Produtos"
          value="11.170"
          sub="No catálogo completo"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-[#2E8B57]" size={20} />}
          label="Publicados"
          value="8"
          sub="Visíveis no site público"
        />
        <StatCard 
          icon={<AlertCircle className="text-[#F5C400]" size={20} />}
          label="Não Publicados"
          value="11.162"
          sub="Aguardando publicação"
        />
        <StatCard 
          icon={<Activity className="text-[#174F8C]" size={20} />}
          label="Importações"
          value="5"
          sub="Realizadas com sucesso"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 shadow-sm">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E] mb-6 border-b border-[#F4F5F6] pb-2">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link 
                to="/admin/importacoes/nova" 
                className="w-full bg-[#174F8C] text-white py-4 px-4 rounded-[2px] font-bold text-[12px] uppercase tracking-wider hover:bg-[#123E70] transition flex items-center justify-between group"
              >
                Importar Planilha ERP
                <FileUp size={16} className="group-hover:-translate-y-0.5 transition" />
              </Link>
              <Link 
                to="/admin/produtos" 
                className="w-full bg-white border border-[#E5E7EB] text-[#252A2E] py-4 px-4 rounded-[2px] font-bold text-[12px] uppercase tracking-wider hover:border-[#174F8C] transition flex items-center justify-between group"
              >
                Gerenciar Produtos
                <Package size={16} className="text-[#252A2E]/30" />
              </Link>
              <Link 
                to="/" 
                className="w-full bg-white border border-[#E5E7EB] text-[#252A2E] py-4 px-4 rounded-[2px] font-bold text-[12px] uppercase tracking-wider hover:border-[#174F8C] transition flex items-center justify-between group"
              >
                Ver Site Público
                <ExternalLink size={16} className="text-[#252A2E]/30" />
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Importations Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#F4F5F6] flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">Últimas Importações</h3>
              <Link to="/admin/importacoes" className="text-[11px] font-bold text-[#174F8C] uppercase tracking-wider hover:underline">Ver Histórico</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Arquivo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F5F6]">
                  {[
                    { date: '18/08/2026 14:10', file: 'produtos_pizzatto_v5.xlsx', total: '11.170', status: 'CONCLUÍDA' },
                    { date: '17/08/2026 09:30', file: 'produtos_pizzatto_v4.xlsx', total: '11.168', status: 'CONCLUÍDA' },
                    { date: '15/08/2026 16:45', file: 'produtos_pizzatto_v3.xlsx', total: '11.165', status: 'FALHOU' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">{row.date}</td>
                      <td className="px-6 py-4 text-[12px] font-bold text-[#174F8C]">{row.file}</td>
                      <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">{row.total}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-[2px] text-[9px] font-black uppercase tracking-widest ${row.status === 'CONCLUÍDA' ? 'bg-[#2E8B57]/10 text-[#2E8B57]' : 'bg-[#D9272E]/10 text-[#D9272E]'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#F4F5F6] rounded-[2px] flex items-center justify-center border border-[#E5E7EB]">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#252A2E]/40">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-[#252A2E] tracking-tight">{value}</span>
        <span className="text-[11px] text-[#252A2E]/40 font-medium mt-1 uppercase tracking-wider">{sub}</span>
      </div>
    </div>
  );
}
