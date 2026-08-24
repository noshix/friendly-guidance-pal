import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Logo asset replaced by static public path /assets/logo-pizzatto.png
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { resolveAdminLoginState } from "@/lib/admin-auth-flow";
import { ADMIN_SESSION_QUERY_KEY, ADMIN_SESSION_STALE_TIME } from "@/lib/admin-auth-query";
import { AdminAuthApiError, getAdminCsrf, getAdminSession, loginAdmin } from "@/lib/api/admin-auth";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isHydrated = useHydrated();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const sessionQuery = useQuery({
    queryKey: ADMIN_SESSION_QUERY_KEY,
    queryFn: () => getAdminSession(),
    staleTime: ADMIN_SESSION_STALE_TIME,
    retry: false,
    enabled: isHydrated,
  });
  const loginState = resolveAdminLoginState({
    hydrated: isHydrated,
    pending: sessionQuery.isPending,
    failed: sessionQuery.isError,
    session: sessionQuery.data,
  });
  const loginMutation = useMutation({
    mutationFn: async () => {
      const csrf = await getAdminCsrf();
      return loginAdmin({ username, password }, csrf);
    },
    onSuccess: async (session) => {
      queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, session);
      await queryClient.invalidateQueries({ queryKey: ADMIN_SESSION_QUERY_KEY, exact: true });
      await navigate({ to: "/admin", replace: true });
    },
  });

  useEffect(() => {
    if (loginState === "redirect-admin") {
      void navigate({ to: "/admin", replace: true });
    }
  }, [loginState, navigate]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginMutation.isPending) loginMutation.mutate();
  };

  if (loginState === "loading" || loginState === "redirect-admin") {
    return <LoginFrame>Verificando sessão...</LoginFrame>;
  }

  if (loginState === "error") {
    return (
      <LoginFrame>
        <p className="text-[13px] text-[#252A2E]/60">Não foi possível verificar sua sessão.</p>
        <button
          type="button"
          onClick={() => void sessionQuery.refetch()}
          className="mt-5 bg-[#174F8C] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white"
        >
          Tentar novamente
        </button>
      </LoginFrame>
    );
  }

  const loginError =
    loginMutation.error instanceof AdminAuthApiError && loginMutation.error.status === 401
      ? "Usuário ou senha inválidos"
      : "Não foi possível entrar. Verifique sua conexão e tente novamente.";

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2px] shadow-xl border border-[#E5E7EB] w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-8">
          <img src="/assets/logo-pizzatto.png" alt="Pizzatto" className="h-20" />
        </div>
        <h2 className="text-[18px] font-black text-[#252A2E] text-center mb-2 uppercase">
          Área Administrativa
        </h2>
        <p className="text-[13px] text-[#252A2E]/60 text-center mb-8">
          Acesso restrito à equipe administrativa.
        </p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="admin-username"
              className="block text-[11px] font-bold text-[#252A2E]/70 uppercase tracking-wider mb-1"
            >
              Usuário
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full border border-[#E5E7EB] p-3 rounded-[2px] focus:border-[#174F8C] outline-none text-[14px]"
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-bold text-[#252A2E]/70 uppercase tracking-wider mb-1"
            >
              Senha
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-[#E5E7EB] p-3 rounded-[2px] focus:border-[#174F8C] outline-none text-[14px]"
            />
          </div>
          {loginMutation.isError && (
            <p className="text-[12px] font-medium text-[#D9272E]" role="alert">
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-[#174F8C] text-white py-4 rounded-[2px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition shadow-md disabled:cursor-wait disabled:opacity-70"
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2px] shadow-xl border border-[#E5E7EB] w-full max-w-md text-center">
        <img src="/assets/logo-pizzatto.png" alt="Pizzatto" className="mx-auto mb-8 h-20" />
        <div aria-live="polite">{children}</div>
      </div>
    </div>
  );
}
