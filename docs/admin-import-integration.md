# V1.7C.2 — React ERP Import Integration

O painel React usa o workflow de importação do Spring sem interpretar XLSX nem recalcular diferenças
no navegador. Todas as chamadas usam `credentials: include`; `POST` e `DELETE` obtêm o CSRF atual
por `GET /api/admin/auth/csrf` e enviam o nome de header retornado pelo backend.

## Fluxo

1. `/admin/importacoes/nova` valida somente extensão, presença e limite UX de 20 MB.
2. O arquivo segue como `FormData` para `POST /api/admin/imports/preview`, sem `Content-Type` manual.
3. O Spring executa parser SAX, validação, comparação e paginação.
4. O token opaco e a primeira página ficam somente em memória até confirmação ou cancelamento.
5. `/admin/importacoes/preview` obtém páginas adicionais por
   `GET /api/admin/imports/preview/{token}`. NEW e CHANGED são paginados separadamente; UNCHANGED é
   somente uma contagem.
6. A confirmação chama `POST /api/admin/imports/{token}/confirm` sem reenviar linhas ERP.
7. O cancelamento chama `DELETE /api/admin/imports/{token}` e limpa o estado local somente após 204.
8. `/admin/importacoes` e `/admin/importacoes/{id}` mostram o histórico real persistido pelo Spring.

Um refresh na tela de preview elimina o token em memória. Nesse caso a interface informa que a prévia
deve ser criada novamente. Nenhum token, arquivo, cookie ou dado de autenticação é salvo em
`localStorage` ou `sessionStorage`.

## Endpoints consumidos

- `POST /api/admin/imports/preview`
- `GET /api/admin/imports/preview/{token}`
- `POST /api/admin/imports/{token}/confirm`
- `DELETE /api/admin/imports/{token}`
- `GET /api/admin/imports`
- `GET /api/admin/imports/{id}`

## Erros

- `401`: remove a sessão do cache e redireciona ao login;
- `403`: acesso negado/CSRF inválido;
- `404`: registro de histórico inexistente;
- `409`: confirmação já em andamento;
- `410`: token expirado, cancelado ou já confirmado;
- `413`: arquivo acima do limite;
- `422`: erros de validação da planilha exibidos sem stack trace;
- `500`: mensagem genérica, sem corpo técnico.

## Cache e invalidação

Após confirmação, são invalidados o histórico, detalhes, dashboard futuro, produtos administrativos e
consultas públicas afetadas. O browser nunca é autoridade sobre linhas ERP; o backend recompõe a
comparação antes da transação.

## Limites atuais

- O histórico persiste somente resumo, não linhas individuais.
- O token não sobrevive a refresh por decisão de segurança.
- Smoke com Neon deve usar arquivo pequeno e dados controlados; a suíte automatizada não altera dados
  comerciais reais.
