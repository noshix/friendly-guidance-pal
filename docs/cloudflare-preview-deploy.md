# Deploy preview no Cloudflare Workers

O frontend TanStack Start é executado como Worker com SSR e assets gerenciados pelo
Cloudflare Vite plugin. O entrypoint continua sendo `src/server.ts`, preservando o tratamento
existente de erros SSR.

## Proxy same-origin

O navegador sempre chama `/api/**` no mesmo domínio do frontend. O Worker reconstrói a URL
usando o binding `SPRING_API_ORIGIN` e preserva pathname, query string, método, headers e body.
As demais rotas são delegadas ao handler normal do TanStack Start.

O `wrangler.jsonc` configura o Worker de preview com:

```text
SPRING_API_ORIGIN=https://pizzatto-catalogo.onrender.com
```

Essa URL é configuração de infraestrutura e não é importada por componentes React. Valores
sensíveis devem ser configurados como secrets do Wrangler e nunca adicionados ao arquivo.

## Desenvolvimento local

O fluxo existente continua usando o proxy do Vite:

```powershell
$env:SPRING_API_URL = "http://localhost:8080"
npm run dev
```

## Preview local do build

```powershell
npm run build
npm run preview
```

## Primeiro deploy

Os comandos abaixo devem ser executados somente após aprovação desta preparação:

```powershell
npx wrangler login
npx wrangler whoami
npm run deploy
```

O deploy cria ou atualiza o Worker `pizzatto-catalogo-preview` no subdomínio `workers.dev` da
conta autenticada. Nenhuma alteração de DNS ou domínio customizado é necessária para o primeiro
preview.
