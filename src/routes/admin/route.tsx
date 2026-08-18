import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.asset.json";
import { 
  LayoutDashboard, 
  Package, 
  FileUp, 
  History, 
  ExternalLink, 
  LogOut, 
  ChevronRight,
  Menu,
  User,
  Search
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-[260px]' : 'w-[80px]'} bg-[#252A2E] text-white flex flex-col transition-all duration-300 z-50 shrink-0`}>
        <div className="h-[70px] flex items-center px-6 border-b border-white/5">
          {isSidebarOpen ? (
            <img src={logoAsset.url} alt="Pizzatto" className="h-10 invert brightness-0" />
          ) : (
            <div className="w-8 h-8 bg-[#174F8C] rounded-[2px]" />
          )}
        </div>

        <nav className="flex-1 py-6">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Visão geral" 
            to="/admin" 
            isOpen={isSidebarOpen} 
          />
          
          <div className="mt-8 px-6 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && 'hidden'}`}>Catálogo</span>
          </div>
          <SidebarItem 
            icon={<Package size={20} />} 
            label="Produtos" 
            to="/admin/produtos" 
            isOpen={isSidebarOpen} 
          />

          <div className="mt-8 px-6 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && 'hidden'}`}>Importação ERP</span>
          </div>
          <SidebarItem 
            icon={<PlusSquare size={20} />} 
            label="Nova importação" 
            to="/admin/importacoes/nova" 
            isOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Histórico" 
            to="/admin/importacoes" 
            isOpen={isSidebarOpen} 
          />

          <div className="mt-8 px-6 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && 'hidden'}`}>Sistema</span>
          </div>
          <SidebarItem 
            icon={<ExternalLink size={20} />} 
            label="Ver site público" 
            to="/" 
            isOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<LogOut size={20} />} 
            label="Sair" 
            to="/admin/login" 
            isOpen={isSidebarOpen} 
          />
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-[70px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-[#252A2E]/40 hover:text-[#252A2E] hover:bg-[#F4F5F6] rounded-[2px] transition"
            >
              <Menu size={20} />
            </button>
            <div className="h-4 w-[1px] bg-[#E5E7EB]" />
            <h1 className="text-[14px] font-bold text-[#252A2E] uppercase tracking-wider">Dashboard</h1>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-[11px] font-bold text-[#174F8C] uppercase tracking-wider hover:underline">Ver site</Link>
            <div className="h-4 w-[1px] bg-[#E5E7EB]" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-[#252A2E] leading-none">Administrador</p>
                <p className="text-[10px] text-[#252A2E]/40 font-medium mt-1 uppercase tracking-wider">Pizzatto Equipe</p>
              </div>
              <div className="w-9 h-9 bg-[#F4F5F6] border border-[#E5E7EB] rounded-[2px] flex items-center justify-center text-[#252A2E]/30">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, to, isOpen }: { icon: any, label: string, to: string, isOpen: boolean }) {
  return (
    <Link 
      to={to as any} 
      activeProps={{ className: "bg-[#174F8C]/10 text-[#F5C400] border-l-4 border-[#F5C400]" }}
      inactiveProps={{ className: "text-white/60 hover:text-white hover:bg-white/5 border-l-4 border-transparent" }}
      className="flex items-center px-6 py-4 transition-all duration-200"
    >
      <div className="shrink-0">{icon}</div>
      {isOpen && <span className="ml-4 text-[13px] font-bold uppercase tracking-wider">{label}</span>}
    </Link>
  );
}

function PlusSquare({ size }: { size: number }) {
  return (
    <div className="relative">
      <FileUp size={size} />
      <Plus size={10} className="absolute -top-1 -right-1 bg-[#252A2E] text-white rounded-full" />
    </div>
  );
}
