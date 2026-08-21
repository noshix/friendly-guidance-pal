# Integração do catálogo público

As rotas `/produtos`, `/produtos/{erpId}`, `/categorias`, `/categorias/{slug}`,
`/marcas` e `/marcas/{slug}` consomem a API pública Spring por meio do cliente
tipado `src/lib/api/public-catalog.ts`.

## Execução local

As chamadas do navegador usam URLs relativas em `/api/public/**`. Durante
`npm run dev`, o Vite encaminha `/api` para `http://localhost:8080`. Outro endereço
local pode ser informado sem alterar código:

```powershell
$env:SPRING_API_URL = "http://localhost:8080"
npm run dev
```

Em produção, a implantação deve rotear `/api/**` para o Spring no mesmo domínio.
Não há URL do Render hardcoded nem dependência de CORS global.

As consultas ficam desabilitadas durante o SSR. Isso é intencional: uma URL
relativa não possui origem no processo Node e não deve ser resolvida por suposição.
O HTML inicial apresenta o estado de carregamento e o React Query inicia a chamada
same-origin após a hidratação no navegador.

## Taxonomias públicas

Categorias e fabricantes usam React Query com `staleTime` de cinco minutos e os
seguintes endpoints same-origin:

- `GET /api/public/categories`;
- `GET /api/public/categories/{slug}`;
- `GET /api/public/manufacturers`;
- `GET /api/public/manufacturers/{slug}`.

O nome público da categoria é exibido em `name`, enquanto o filtro de produtos
usa o valor exato `erpName`. Fabricantes usam o `name` retornado pelo backend. As
páginas por slug sempre resolvem o slug no Spring antes de buscar produtos; elas
não tentam reconstruir valores ERP no navegador. Contagens e páginas de produto
continuam sendo calculadas no backend.

Os mocks foram removidos das páginas de produtos, categorias e marcas. Home e
áreas administrativas permanecem fora deste escopo e conservam seus dados atuais.

O filtro visual de disponibilidade foi preservado, mas continua apenas visual e
não é enviado à API porque o contrato público atual não possui esse parâmetro.

Produtos ainda não possuem imagem na API. Os cards e o detalhe continuam usando o
fallback aprovado “Imagem em breve”.
