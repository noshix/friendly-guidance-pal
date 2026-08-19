# Navegação e Fluxos - Pizzatto Materiais Elétricos

Revisão completa de navegação, fluxos de autenticação mock para o admin e criação de páginas institucionais em falta.

## Ações e Mudanças

### 1. Centralização e Auditoria de Links
- Criar `src/lib/config.ts` com a configuração do WhatsApp (já criado).
- Corrigir `src/components/Footer.tsx`:
    - Trocar `li` por `Link` com rotas corretas.
    - Adicionar rotas para Privacidade e Termos de Uso.
    - Corrigir comportamento do link "Área Restrita" (redirecionar para `/admin/login` se não logado).
- Corrigir `src/components/Header.tsx`:
    - Garantir que o botão de WhatsApp use a config centralizada.
    - Validar links no mobile (se houver menu mobile separado).
- Corrigir `src/routes/index.tsx`:
    - Linkar botões da Hero ("Explorar catálogo" e "Solicitar orçamento").
    - Corrigir CTA final (WhatsApp e Localização).

### 2. Novas Páginas Institucionais
- Criar `src/routes/privacidade.tsx`: Política de Privacidade (layout padrão + texto genérico).
- Criar `src/routes/termos-de-uso.tsx`: Termos de Uso (layout padrão + texto sobre orçamentos/WhatsApp).

### 3. Fluxo de Autenticação Mock (Admin)
- Implementar proteção de rota em `src/routes/admin/route.tsx`:
    - Verificar `localStorage.getItem('pizzatto_admin_session')`.
    - Redirecionar para `/admin/login` se ausente.
- Atualizar `src/routes/admin/login.tsx`:
    - Salvar sessão no `localStorage` ao clicar em "Entrar".
    - Redirecionar para `/admin` se já estiver logado.
- Atualizar a Sidebar e Topbar no Admin:
    - Botão "Sair": Limpar `localStorage` e ir para login.
    - Links "Ver Site": Navegar para `/` sem deslogar.

### 4. Correção de WhatsApp e Localização
- Substituir todos os destinos de WhatsApp pela função `PIZZATTO_WHATSAPP.getLink()` nos arquivos:
    - `src/components/Header.tsx`
    - `src/routes/index.tsx`
    - `src/routes/produtos/$id.tsx`
    - `src/routes/orcamento.tsx`
    - `src/routes/contato.tsx`
    - `src/routes/empresa.tsx`
- Garantir que todos os botões "Localização" ou "Como chegar" levem para `/contato`.

## Detalhes Técnicos
- Utilizar `Link` do `@tanstack/react-router` para navegação interna.
- Usar `window.location.href` para WhatsApp (links externos).
- Manter o layout consistente em todas as novas rotas.
- O conteúdo das páginas de privacidade e termos será marcado como "provisório para revisão jurídica".
