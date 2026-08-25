# Integração administrativa de produtos

A V1.7B.2 substitui os mocks de `/admin/produtos` e
`/admin/produtos/{erpId}` pela API administrativa do Spring. O navegador usa o
proxy same-origin `/api/**`, envia `credentials: "include"` e mantém o
`JSESSIONID` como autoridade da autenticação.

## Endpoints consumidos

- `GET /api/admin/products`
- `GET /api/admin/products/{erpId}`
- `PATCH /api/admin/products/{erpId}/editorial`
- `POST /api/admin/products/bulk-visibility`
- `POST /api/admin/products/bulk-visibility/by-filter`

Todas as leituras são paginadas no backend. Busca, visibilidade, fabricante e
categoria são parâmetros da consulta; o frontend nunca carrega o catálogo
completo para filtrar localmente.

## Sessão e CSRF

As escritas reutilizam `getAdminCsrf()` da integração V1.7A.2 e enviam o header
dinâmico devolvido pelo Spring. O token não é persistido em `localStorage` nem
`sessionStorage`. Uma resposta `401` remove a query `admin-session` e
redireciona para `/admin/login` sem manter a interface protegida visível.

## Edição editorial

Somente `displayName` e `visible` são enviados pelo `PATCH`. O nome pode ser
limpo para reativar o fallback para `erpDescription`. Preço, estoque,
fabricante, categoria, NCM, referência e os demais campos ERP são exibidos
somente para leitura. Preço de custo não faz parte dos tipos nem das telas.

## Operações em massa

“Selecionar página” seleciona apenas os itens da página atual. A operação por
seleção envia no máximo 500 ERP IDs opacos. A operação por filtro é separada,
exibe uma confirmação com o escopo e permanece desabilitada sem ao menos um de:
busca, fabricante ou categoria.

## Limitação de taxonomias

O backend ainda não oferece taxonomias administrativas. Os selects reutilizam
as taxonomias públicas reais e, portanto, podem não listar fabricante ou
categoria que exista exclusivamente em produtos ocultos. Esses produtos ainda
podem ser encontrados pela busca administrativa. Um endpoint administrativo de
taxonomias poderá eliminar essa limitação futuramente sem mudar o contrato da
listagem.
