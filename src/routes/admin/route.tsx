import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.asset.json";
import { 
  LayoutDashboard, 
  Package, 
  FileUp, 
  History, 
  ExternalLink, 
  LogOut, 
  Menu,
  User,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isHydrated = useHydrated();

  useEffect(() => {
    if (isHydrated && location.pathname !== "/admin/login") {
      const session = localStorage.getItem('pizzatto_admin_session');
      if (!session) {
        navigate({ to: "/admin/login" });
      }
    }
  }, [isHydrated, location.pathname, navigate]);


  // 1. LOGIN INDEPENDENTE - If we are on /admin/login, don't show the sidebar/topbar layout
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  // 2. TOPBAR CONTEXTUAL - Get Page Title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "VISÃO GERAL";
    
    // Check for products
    if (path.startsWith("/admin/produtos")) {
      if (path === "/admin/produtos" || path === "/admin/produtos/") return "PRODUTOS";
      return "EDITAR PRODUTO";
    }
    
    // Check for imports
    if (path === "/admin/importacoes/nova") return "NOVA IMPORTAÇÃO ERP";
    if (path === "/admin/importacoes/preview") return "PRÉVIA DA IMPORTAÇÃO";
    if (path.startsWith("/admin/importacoes")) return "HISTÓRICO DE IMPORTAÇÕES";
    
    return "PAINEL ADMINISTRATIVO";
  };

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-[260px]' : 'w-[80px]'} bg-[#252A2E] text-white flex flex-col transition-all duration-300 z-50 shrink-0`}>
        {/* 5. SIDEBAR / LOGO - Improved padding and alignment */}
        <div className={`h-[80px] flex items-center ${isSidebarOpen ? 'px-8' : 'justify-center'} border-b border-white/5`}>
          {isSidebarOpen ? (
            <div className="py-2 flex items-center h-full w-full">
              <img src={logoAsset.url} alt="Pizzatto" className="h-10 w-auto object-contain invert brightness-0" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#174F8C] rounded-[2px] flex items-center justify-center font-black text-[14px]">P</div>
          )}
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          {/* 3. ITEM ATIVO DA SIDEBAR - Using logic to highlight only one */}
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Visão geral" 
            to="/admin" 
            isOpen={isSidebarOpen}
            isActive={location.pathname === "/admin" || location.pathname === "/admin/"}
          />
          
          <div className="mt-8 px-6 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && 'hidden'}`}>Catálogo</span>
          </div>
          <SidebarItem 
            icon={<Package size={20} />} 
            label="Produtos" 
            to="/admin/produtos" 
            isOpen={isSidebarOpen}
            isActive={location.pathname.startsWith("/admin/produtos")}
          />

          <div className="mt-8 px-6 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && 'hidden'}`}>Importação ERP</span>
          </div>
          <SidebarItem 
            icon={<PlusSquare size={20} />} 
            label="Nova importação" 
            to="/admin/importacoes/nova" 
            isOpen={isSidebarOpen}
            isActive={location.pathname === "/admin/importacoes/nova"}
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Histórico" 
            to="/admin/importacoes" 
            isOpen={isSidebarOpen}
            isActive={location.pathname === "/admin/importacoes" || location.pathname === "/admin/importacoes/"}
          />

          <div className="mt-8 px-6 mb-2 border-t border-white/5 pt-6">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && 'hidden'}`}>Sistema</span>
          </div>
          <SidebarItem 
            icon={<ExternalLink size={20} />} 
            label="Ver site público" 
            to="/" 
            isOpen={isSidebarOpen}
            isActive={false}
          />
          <button 
            onClick={() => {
              localStorage.removeItem('pizzatto_admin_session');
              navigate({ to: "/admin/login" });
            }}
            className="w-full flex items-center px-6 py-4 transition-all duration-200 border-l-4 text-white/60 hover:text-white hover:bg-white/5 border-transparent"
          >
            <div className="shrink-0"><LogOut size={20} /></div>
            {isSidebarOpen && <span className="ml-4 text-[13px] font-bold uppercase tracking-wider">Sair</span>}
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-[70px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-[60]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-[#252A2E]/40 hover:text-[#252A2E] hover:bg-[#F4F5F6] rounded-[2px] transition"
            >
              <Menu size={20} />
            </button>
            <div className="h-4 w-[1px] bg-[#E5E7EB]" />
            <h1 className="text-[14px] font-bold text-[#252A2E] uppercase tracking-wider">{getPageTitle()}</h1>
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

function SidebarItem({ icon, label, to, isOpen, isActive }: { icon: any, label: string, to: string, isOpen: boolean, isActive: boolean }) {
  return (
    <Link 
      to={to as any} 
      className={`flex items-center px-6 py-4 transition-all duration-200 border-l-4 ${
        isActive 
          ? "bg-[#174F8C]/10 text-[#F5C400] border-[#F5C400]" 
          : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
      }`}
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