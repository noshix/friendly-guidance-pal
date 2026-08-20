# Integração do catálogo público

As rotas `/produtos` e `/produtos/{erpId}` consomem a API pública Spring por meio
do cliente tipado `src/lib/api/public-catalog.ts`.

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

## Escopo dos mocks

Os mocks foram removidos somente das rotas de listagem e detalhe de produtos.
Mocks usados por Home, categorias, marcas e páginas administrativas permanecem
intactos porque essas áreas não fazem parte da V1.6B.

O backend ainda não oferece endpoints públicos para listar todas as categorias e
todos os fabricantes. Por isso, as opções visuais já aprovadas foram preservadas e
seus valores selecionados são enviados como filtros exatos à API. A cobertura
completa dos valores ERP depende da futura fase de taxonomias; o frontend não
deriva uma taxonomia incompleta apenas dos 24 itens da página atual.

O filtro visual de disponibilidade também foi preservado, mas não é enviado à API
porque o contrato público atual não possui esse parâmetro.

Produtos ainda não possuem imagem na API. Os cards e o detalhe continuam usando o
fallback aprovado “Imagem em breve”.
