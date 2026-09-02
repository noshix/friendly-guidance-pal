import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Logo asset replaced by static public path /assets/logo-pizzatto.png
import {
  LayoutDashboard,
  Package,
  FileUp,
  History,
  ExternalLink,
  LogOut,
  Menu,
  User,
  Plus,
  Images,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { resolveAdminGuardState } from "@/lib/admin-auth-flow";
import {
  ADMIN_SESSION_QUERY_KEY,
  ADMIN_SESSION_STALE_TIME,
  clearAdminSessionCache,
} from "@/lib/admin-auth-query";
import { getAdminCsrf, getAdminSession, logoutAdmin } from "@/lib/api/admin-auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isHydrated = useHydrated();
  const isMobile = useIsMobile();
  const isLoginRoute = location.pathname === "/admin/login";
  const sessionQuery = useQuery({
    queryKey: ADMIN_SESSION_QUERY_KEY,
    queryFn: () => getAdminSession(),
    staleTime: ADMIN_SESSION_STALE_TIME,
    retry: false,
    enabled: isHydrated && !isLoginRoute,
  });
  const guardState = resolveAdminGuardState({
    hydrated: isHydrated,
    pending: sessionQuery.isPending,
    failed: sessionQuery.isError,
    session: sessionQuery.data,
  });
  const logoutMutation = useMutation({
    mutationFn: async () => logoutAdmin(await getAdminCsrf()),
    onSuccess: async () => {
      clearAdminSessionCache(queryClient);
      await navigate({ to: "/admin/login" });
    },
  });

  useEffect(() => {
    if (!isLoginRoute && guardState === "redirect-login") {
      void navigate({ to: "/admin/login", replace: true });
    }
  }, [guardState, isLoginRoute, navigate]);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  if (isLoginRoute) {
    return <Outlet />;
  }

  if (guardState === "loading" || guardState === "redirect-login") {
    return <AdminSessionLoading />;
  }

  if (guardState === "error") {
    return <AdminSessionError onRetry={() => void sessionQuery.refetch()} />;
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
    if (path.startsWith("/admin/image-enrichment")) return "ENRIQUECIMENTO DE IMAGENS";

    return "PAINEL ADMINISTRATIVO";
  };

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex overflow-x-hidden">
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu administrativo"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
        />
      )}
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-[260px] translate-x-0" : "w-[80px] -translate-x-full md:translate-x-0"} fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-[#252A2E] text-white transition-all duration-300 md:static`}
      >
        {/* 5. SIDEBAR / LOGO - Improved padding and alignment */}
        <div
          className={`h-[80px] flex items-center ${isSidebarOpen ? "px-8" : "justify-center"} border-b border-white/5`}
        >
          {isSidebarOpen ? (
            <div className="py-2 flex items-center h-full w-full">
              <img
                src="/assets/logo-pizzatto.png"
                alt="Pizzatto"
                className="h-10 w-auto object-contain invert brightness-0"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#174F8C] rounded-[2px] flex items-center justify-center font-black text-[14px]">
              P
            </div>
          )}
        </div>

        <nav
          className="flex-1 py-6 overflow-y-auto"
          onClick={(event) => {
            if (isMobile && (event.target as Element).closest("a")) setIsSidebarOpen(false);
          }}
        >
          {/* 3. ITEM ATIVO DA SIDEBAR - Using logic to highlight only one */}
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Visão geral"
            to="/admin"
            isOpen={isSidebarOpen}
            isActive={location.pathname === "/admin" || location.pathname === "/admin/"}
          />

          <div className="mt-8 px-6 mb-2">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && "hidden"}`}
            >
              Catálogo
            </span>
          </div>
          <SidebarItem
            icon={<Package size={20} />}
            label="Produtos"
            to="/admin/produtos"
            isOpen={isSidebarOpen}
            isActive={location.pathname.startsWith("/admin/produtos")}
          />
          <SidebarItem
            icon={<Images size={20} />}
            label="Enriquecimento de imagens"
            to="/admin/image-enrichment"
            isOpen={isSidebarOpen}
            isActive={location.pathname.startsWith("/admin/image-enrichment")}
          />

          <div className="mt-8 px-6 mb-2">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && "hidden"}`}
            >
              Importação ERP
            </span>
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
            isActive={
              location.pathname === "/admin/importacoes" ||
              location.pathname === "/admin/importacoes/"
            }
          />

          <div className="mt-8 px-6 mb-2 border-t border-white/5 pt-6">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ${!isSidebarOpen && "hidden"}`}
            >
              Sistema
            </span>
          </div>
          <SidebarItem
            icon={<ExternalLink size={20} />}
            label="Ver site público"
            to="/"
            isOpen={isSidebarOpen}
            isActive={false}
          />
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center px-6 py-4 transition-all duration-200 border-l-4 text-white/60 hover:text-white hover:bg-white/5 border-transparent"
          >
            <div className="shrink-0">
              <LogOut size={20} />
            </div>
            {isSidebarOpen && (
              <span className="ml-4 text-[13px] font-bold uppercase tracking-wider">
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </span>
            )}
          </button>
          {isSidebarOpen && logoutMutation.isError && (
            <p className="px-6 pb-4 text-[11px] leading-relaxed text-[#F5C400]" role="alert">
              Não foi possível encerrar a sessão. Tente novamente.
            </p>
          )}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-[60] flex h-[70px] items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={
                isSidebarOpen ? "Recolher menu administrativo" : "Abrir menu administrativo"
              }
              className="p-2 text-[#252A2E]/40 hover:text-[#252A2E] hover:bg-[#F4F5F6] rounded-[2px] transition"
            >
              <Menu size={20} />
            </button>
            <div className="h-4 w-[1px] bg-[#E5E7EB]" />
            <h1 className="text-[14px] font-bold text-[#252A2E] uppercase tracking-wider">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="hidden text-[11px] font-bold uppercase tracking-wider text-[#174F8C] hover:underline sm:block"
            >
              Ver site
            </Link>
            <div className="h-4 w-[1px] bg-[#E5E7EB]" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-[#252A2E] leading-none">
                  {sessionQuery.data?.authenticated ? sessionQuery.data.username : "Administrador"}
                </p>
                <p className="text-[10px] text-[#252A2E]/40 font-medium mt-1 uppercase tracking-wider">
                  Pizzatto Equipe
                </p>
              </div>
              <div className="w-9 h-9 bg-[#F4F5F6] border border-[#E5E7EB] rounded-[2px] flex items-center justify-center text-[#252A2E]/30">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type AdminNavigationPath =
  | "/"
  | "/admin"
  | "/admin/produtos"
  | "/admin/image-enrichment"
  | "/admin/importacoes"
  | "/admin/importacoes/nova";

function SidebarItem({
  icon,
  label,
  to,
  isOpen,
  isActive,
}: {
  icon: ReactNode;
  label: string;
  to: AdminNavigationPath;
  isOpen: boolean;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center px-6 py-4 transition-all duration-200 border-l-4 ${
        isActive
          ? "bg-[#174F8C]/10 text-[#F5C400] border-[#F5C400]"
          : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {isOpen && (
        <span className="ml-4 text-[13px] font-bold uppercase tracking-wider">{label}</span>
      )}
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

function AdminSessionLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F6] px-4">
      <p className="text-[12px] font-bold uppercase tracking-widest text-[#252A2E]/50">
        Verificando sessão...
      </p>
    </div>
  );
}

function AdminSessionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F6] px-4">
      <div className="max-w-sm text-center">
        <p className="text-sm text-[#252A2E]/70">Não foi possível verificar sua sessão.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 bg-[#174F8C] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
