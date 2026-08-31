# V1.8C.4 — revisão e importação administrativa de candidatos de imagem

O detalhe administrativo do produto pode consultar manualmente candidatos de imagem por meio de:

```http
GET /api/admin/products/{erpId}/image-candidates?limit=6
```

A consulta usa a sessão Spring (`JSESSIONID`) com `credentials: include`. Por ser somente leitura,
não envia CSRF. A query React permanece desabilitada até o administrador clicar em **Buscar
imagens**.

## Revisão humana

O diálogo apresenta o contexto retornado pelo backend (fabricante, referência, part number e EAN),
a origem da imagem, o critério de correspondência e o nível de confiança. Os valores de
`matchedBy` e `confidence` são apenas sinais para revisão; a interface não afirma que uma imagem é
correta.

A seleção de um candidato:

- existe apenas em memória enquanto o diálogo está aberto;
- não escreve em `localStorage` ou `sessionStorage`;
- não acessa o R2 diretamente.

O administrador precisa clicar em **Usar esta imagem** e confirmar uma segunda vez. A confirmação
mostra thumbnail, domínio, confiança e critério de correspondência, além de permitir editar o alt
text sugerido e escolher se a imagem deve ser principal.

```http
POST /api/admin/products/{erpId}/image-candidates/{candidateToken}/import
Content-Type: application/json
X-CSRF-TOKEN: <token dinâmico>

{
  "altText": "Nome editável do produto",
  "primary": true
}
```

O `candidateToken` é o campo opaco `id` retornado pela busca. Ele não é exibido, logado ou
persistido no navegador. O corpo não envia `imageUrl`, `sourcePageUrl` ou provider: o backend
continua sendo a única autoridade para download, validação, fingerprint, R2 e `ProductImage`.

Após sucesso, a seleção e o token são descartados e os caches administrativos e públicos do
produto são invalidados. A galeria e o catálogo são atualizados por refetch, sem reload completo.
Tokens inexistentes, consumidos ou expirados exigem uma nova busca. Erros de tamanho, conteúdo,
duplicidade, sessão e indisponibilidade recebem mensagens próprias sem expor detalhes técnicos.

## Imagens externas

A UI prefere `thumbnailUrl` e usa `imageUrl` como fallback visual. Falhas de hotlink ou imagens
indisponíveis exibem um estado neutro, sem contornar a proteção do site de origem. Links de fonte
abrem em nova aba com `noopener noreferrer`. O cliente aceita somente URLs públicas HTTP(S) já
normalizadas pelo backend.

A thumbnail serve somente para revisão visual. Se ela desaparecer, o frontend não tenta baixar a
imagem nem contornar o servidor; a importação continua sendo uma operação exclusiva do Spring.
