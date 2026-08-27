# V1.8C.2 — revisão administrativa de candidatos de imagem

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
- não faz upload, `POST`, `PATCH` ou `DELETE`;
- não cria `ProductImage`;
- não altera `primaryImageUrl`;
- não escreve em `localStorage` ou `sessionStorage`;
- não acessa o R2 diretamente.

Persistência de um candidato aprovado fica reservada para uma etapa futura.

## Imagens externas

A UI prefere `thumbnailUrl` e usa `imageUrl` como fallback visual. Falhas de hotlink ou imagens
indisponíveis exibem um estado neutro, sem contornar a proteção do site de origem. Links de fonte
abrem em nova aba com `noopener noreferrer`. O cliente aceita somente URLs públicas HTTP(S) já
normalizadas pelo backend.
