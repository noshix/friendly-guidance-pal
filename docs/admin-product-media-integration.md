# V1.8B — React Product Media Admin

O painel React gerencia as imagens do produto exclusivamente pela API administrativa Spring.
O navegador não envia arquivos diretamente ao Cloudflare R2 e não armazena imagens, tokens ou
conteúdo base64 em `localStorage` ou `sessionStorage`.

## Endpoints consumidos

- `GET /api/admin/products/{erpId}/images`
- `POST /api/admin/products/{erpId}/images`
- `PATCH /api/admin/products/{erpId}/images/{imageId}`
- `DELETE /api/admin/products/{erpId}/images/{imageId}`

Todas as requisições usam `credentials: "include"`. As mutações obtêm o token CSRF atual antes
de cada operação. O upload usa `FormData`; o `Content-Type` multipart é definido pelo browser.

## Upload e preview

O frontend faz uma validação de UX para JPEG, PNG e WEBP e bloqueia arquivos vazios ou acima de
5 MB. A validação definitiva continua no backend. O preview local usa `URL.createObjectURL` e a
URL temporária é revogada ao substituir ou fechar o arquivo.

## Atualização e exclusão

Alt text, posição e imagem principal usam `PATCH`. A exclusão exige confirmação em `AlertDialog`.
Após qualquer mutação, são invalidadas as queries da galeria, do detalhe administrativo e das
views públicas afetadas. O resultado retornado pelo backend continua sendo a fonte de verdade.

## Catálogo público

Home, catálogo, detalhe, categorias e fabricantes usam `primaryImageUrl` quando disponível. Um
valor `null` mantém o fallback visual existente. Os cards usam dimensões estáveis e carregamento
lazy; a imagem principal do detalhe é carregada de forma eager.
