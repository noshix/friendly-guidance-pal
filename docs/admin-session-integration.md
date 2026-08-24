# Integração da sessão administrativa

O painel React usa a sessão servlet do Spring Security. Não existe JWT, bearer token ou flag de autenticação em `localStorage`/`sessionStorage`; `GET /api/admin/auth/session` é a única fonte de verdade.

## Fluxo

1. Após a hidratação, o React consulta `GET /api/admin/auth/session` com `credentials: "include"`.
2. Para entrar, chama `GET /api/admin/auth/csrf` e mantém `token`/`headerName` apenas em memória.
3. Envia `POST /api/admin/auth/login` em JSON com o token no header indicado pelo backend.
4. O navegador recebe e gerencia o `JSESSIONID` HttpOnly sem que o JavaScript o leia.
5. O cache `['admin-session']` é atualizado e revalidado antes de entrar em `/admin`.
6. Para sair, obtém um CSRF válido, chama `POST /api/admin/auth/logout`, remove a query de sessão e redireciona para `/admin/login`.

O login impede duplo submit e diferencia credenciais inválidas (`401`) de falha de rede sem mostrar detalhes técnicos. Uma falha de logout mantém o usuário no painel e informa que a sessão não foi encerrada.

## Guard e SSR

As queries administrativas ficam desabilitadas durante SSR e antes da hidratação. O layout protegido não é renderizado enquanto o estado da sessão é desconhecido, evitando flash de conteúdo administrativo.

- sessão anônima: redireciona para `/admin/login`;
- sessão autenticada: renderiza o layout;
- falha de verificação: apresenta retry sem assumir login ou logout;
- usuário autenticado em `/admin/login`: redireciona para `/admin`.

O dashboard continua com dados mockados nesta fase; apenas autenticação, sessão, guard e logout foram integrados.

## Proxy Cloudflare

O navegador usa URLs relativas `/api/admin/auth/**`. O Worker existente recria o `Request` para o origin Spring e devolve a `Response` sem modificar o contrato, preservando:

- `Cookie` do navegador para o Spring;
- `Set-Cookie` do Spring para o navegador;
- header CSRF dinâmico;
- método, corpo, pathname e query;
- status `401` e `403` em JSON.

O ambiente local mantém o proxy Vite por `SPRING_API_URL`. Não é necessário CORS global porque o navegador chama o mesmo origin do frontend.

## Sessão expirada e APIs administrativas futuras

`AdminAuthApiError` preserva `status` e `code` sem expor o corpo técnico. A função `isAdminUnauthorizedError` permite que futuros clientes de `/api/admin/**` reconheçam `401`, removam a query `['admin-session']` e conduzam o usuário ao login sem criar um interceptor global nesta etapa.
