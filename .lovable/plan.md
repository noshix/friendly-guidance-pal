# Site de Material de Construção

## Objetivo
Criar um site institucional com catálogo de produtos para um comércio de materiais de construção. Foco em apresentar categorias, produtos em destaque, história da empresa, localização e formulário de contato.

## Escopo escolhido (padrões definidos)
- **Tipo:** site de apresentação com catálogo (sem loja virtual por enquanto).
- **Identidade:** paleta terrosa e robusta (Burnt Sienna), tipografia geométrica industrial (Urbanist + Epilogue), layout com destaque principal e grid de categorias.

## Páginas
1. **Home** (`/`): hero, categorias de produtos, destaques, chamada para contato, localização e rodapé.
2. **Produtos** (`/produtos`): grid de categorias e lista de produtos com filtros.
3. **Sobre** (`/sobre`): história, valores, diferenciais e equipe.
4. **Contato** (`/contato`): formulário, telefone, WhatsApp, endereço e mapa/horário.

## Design system
- Tokens semânticos em `src/styles.css`: tons terrosos, marrom, cobre, bege claro, branco off-white.
- Fontes: Urbanist (títulos) e Epilogue (corpo) via `<link>` no `__root.tsx`.
- Bordas levemente arredondadas, sombras sutis, cards com hover.

## Componentes principais
- Header com navegação e CTA para WhatsApp/contato.
- Hero com imagem de obra/depósito e texto de destaque.
- Cards de categoria (alvenaria, hidráulica, elétrica, tintas, ferramentas, etc.).
- Grid de produtos em destaque.
- Seção "Sobre" com imagem e texto.
- Formulário de contato.
- Footer com endereço, links e redes sociais.

## Dados
- Catálogo inicial em arquivo estático (`src/data/products.ts`) com categorias e produtos de exemplo.
- Imagens geradas via `imagegen` para hero, categoria e produtos.

## Tecnologia
- TanStack Start + React + Tailwind CSS v4 (já configurado).
- Rotas em `src/routes/index.tsx`, `src/routes/produtos.tsx`, `src/routes/sobre.tsx`, `src/routes/contato.tsx`.
- SEO: título e meta descrição únicos por rota.

## Implementação
1. Definir tokens de design e fontes em `src/styles.css` e `src/routes/__root.tsx`.
2. Criar dados do catálogo (`src/data/products.ts`).
3. Gerar imagens de hero e produtos.
4. Construir componentes compartilhados (Header, Footer, CategoryCard, ProductCard).
5. Implementar as 4 rotas.
6. Verificar build e responsividade.
