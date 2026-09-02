# V1.8D.2 — Enriquecimento administrativo de imagens

O módulo React em `/admin/image-enrichment` cria e acompanha jobs persistentes do Spring. A interface limita cada lote a 100 produtos, usa paginação server-side e consulta o progresso a cada três segundos somente enquanto o job está `PENDING` ou `RUNNING`.

## Contratos consumidos

- `POST /api/admin/image-enrichment/jobs`
- `GET /api/admin/image-enrichment/jobs`
- `GET /api/admin/image-enrichment/jobs/{jobId}`
- `GET /api/admin/image-enrichment/jobs/{jobId}/items`
- `POST /api/admin/image-enrichment/jobs/{jobId}/pause`
- `POST /api/admin/image-enrichment/jobs/{jobId}/resume`
- `POST /api/admin/image-enrichment/jobs/{jobId}/cancel`
- `POST /api/admin/image-enrichment/jobs/{jobId}/reviews/approve`
- `POST /api/admin/image-enrichment/jobs/{jobId}/reviews/reject`

As mutações usam sessão `JSESSIONID` e CSRF dinâmico. O frontend envia somente IDs de itens nas revisões; URL, snapshot de candidato e token de aprovação nunca são autoridade do navegador.

## Modos

`autoImport=false` é o dry-run: busca, pontua e classifica sem baixar conteúdo ou criar mídia. `autoImport=true` deixa o backend importar apenas `AUTO_IMPORT`; itens `REVIEW` aguardam decisão humana e `REJECT`/`NO_CANDIDATE` permanecem sem imagem.

## Revisão segura

O backend reabre a referência persistida, refaz a busca, exige correspondência com o candidato server-side e emite um novo token efêmero. A importação reutiliza o pipeline V1.8C.3, incluindo SSRF, validação de conteúdo, SHA-256, R2 e `ProductImage`. Aprovação e rejeição aceitam no máximo 25 itens por operação.

## Operação

- Não iniciar automaticamente um novo job após reload.
- Não executar lotes acima de 100 pela interface.
- Pausa e cancelamento são cooperativos; um item em busca pode terminar.
- Rate limit ou quota deixa o lote pausado para retomada manual.
- Após importações, React Query invalida produtos administrativos, mídia e catálogo público sem reload total.
