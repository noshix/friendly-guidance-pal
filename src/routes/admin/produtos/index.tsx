import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Edit3,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/produtos/")({
  component: AdminProducts,
});

const MOCK_ADMIN_PRODUCTS = [
  { id: 3481, erpCode: '3481', name: 'Disjuntor Tripolar 32A', brand: 'SIEMENS', price: '189,90', stock: '6015', visible: true },
  { id: 2, erpCode: '5521', name: 'Cabo Flexível 2,5 mm² Azul 750V', brand: 'SIL', price: '349,00', stock: '120', visible: true },
  { id: 3, erpCode: '9122', name: 'Lâmpada LED High Power 40W', brand: 'ALUMBRA', price: '49,90', stock: '45', visible: true },
  { id: 4, erpCode: '7730', name: 'Quadro de Distribuição 24 DIN', brand: 'STECK', price: '124,50', stock: '12', visible: false },
  { id: 5, erpCode: '1029', name: 'Motor Trifásico 2CV', brand: 'WEG', price: '0,00', stock: '3', visible: true },
];

function AdminProducts() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-[#252A2E] uppercase tracking-tight">Produtos</h2>
        <p className="text-[13px] text-[#252A2E]/60 font-medium italic">Gerenciamento operacional do catálogo público.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-[2px] p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252A2E]/30" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descrição, código ou fabricante..." 
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] py-3 pl-12 pr-4 rounded-[2px] outline-none focus:border-[#174F8C] text-[13px] font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton label="Visibilidade" value="Todos" />
            <FilterButton label="Categoria" value="Todas" />
            <FilterButton label="Fabricante" value="Todos" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Código ERP</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Produto</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Fabricante</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50">Preço ERP</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Saldo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-center">Visibilidade</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/50 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F6]">
              {MOCK_ADMIN_PRODUCTS.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#F9FAFB] transition group">
                  <td className="px-6 py-4 text-[12px] font-bold text-[#252A2E]">{prod.erpCode}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-[#252A2E] group-hover:text-[#174F8C] transition uppercase">{prod.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-[#174F8C] uppercase">{prod.brand}</td>
                  <td className="px-6 py-4 text-[12px] font-medium text-[#252A2E]">R$ {prod.price}</td>
                  <td className="px-6 py-4 text-center text-[12px] font-medium text-[#252A2E]">{prod.stock}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-[9px] font-black uppercase tracking-widest ${
                      prod.visible ? 'bg-[#2E8B57]/10 text-[#2E8B57]' : 'bg-[#F4F5F6] text-[#252A2E]/40'
                    }`}>
                      {prod.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                      {prod.visible ? 'Publicado' : 'Não Publicado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to="/admin/produtos/$id" 
                      params={{ id: prod.id.toString() }}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-[#174F8C] hover:underline uppercase tracking-wider"
                    >
                      <Edit3 size={14} /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#252A2E]/40 uppercase tracking-widest italic">Página 1 de 224</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-[#E5E7EB] text-[10px] font-bold uppercase tracking-widest text-[#252A2E]/30 rounded-[2px]" disabled>Anterior</button>
            <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[10px] font-bold uppercase tracking-widest text-[#252A2E] rounded-[2px] hover:bg-[#F4F5F6] transition flex items-center gap-2">Próxima <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, value }: { label: string, value: string }) {
  return (
    <button className="bg-white border border-[#E5E7EB] px-4 py-3 rounded-[2px] flex items-center gap-3 hover:border-[#174F8C] transition group">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#252A2E]/40">{label}:</span>
      <span className="text-[11px] font-bold text-[#252A2E]">{value}</span>
      <ChevronDown size={14} className="text-[#252A2E]/20 group-hover:text-[#174F8C]" />
    </button>
  );
}
