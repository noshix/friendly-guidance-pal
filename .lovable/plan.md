# Plano: Protótipo Pizzatto Materiais Elétricos

Criação de um protótipo visual premium e extremamente bem acabado para a Pizzatto Materiais Elétricos, focado em direção de arte, UX e fidelidade à marca, pronto para posterior reprodução em Spring Boot + Thymeleaf.

## Design e UX

- **Identidade Visual**: Uso estrito da paleta oficial (Branco, Cinza Claro, Grafite, Azul Pizzatto, Amarelo Pizzatto, Vermelho e Verde para estados positivos/Bobininha).
- **Tipografia**: Foco em solidez e clareza técnica. Títulos em Azul Pizzatto, corpo em Grafite.
- **Layout**: Predominantemente claro, com densidade comercial (sensação de catálogo rico) sem sobrecarga. Border-radius reduzido (4-6px) e sombras quase inexistentes, priorizando bordas e contrastes.
- **Protagonismo de Produto**: Cards de produtos técnicos inspirados na CCR e Obramax, com imagens de alta qualidade (placeholder realista quando ausente).
- **Mascote Bobininha**: Integrado de forma carismática no atendimento/ajuda, sem infantilizar o site.

## Estrutura da Home

1.  **Topbar**: Mensagem de 40 anos + Contato (Cuiabá).
2.  **Header**: Logo oficial, Navegação (Produtos, Categorias, Marcas, Empresa, Contato) + CTA verde "Falar com a Pizzatto".
3.  **Busca**: Campo de busca técnico e destacado.
4.  **Hero**: Dividido, predominante branco. Texto institucional à esquerda, composição profissional de materiais elétricos à direita. Badge "40+" discreto.
5.  **Benefícios**: Faixa horizontal compacta com ícones discretos.
6.  **Categorias**: Grid de cards com fotos reais dos segmentos (Cabos, Iluminação, Proteção, etc.).
7.  **Destaques**: Grid de produtos com preços e status de estoque.
8.  **Marcas**: Carrossel ou grid discreto com logotipos (Siemens, WEG, etc.).
9.  **Soluções**: Seção comercial para Profissionais, Empresas, Obras e Varejo.
10. **Orçamento**: Bloco visual para envio de listas de materiais.
11. **História**: Foto real da fachada com narrativa de tradição.
12. **Atendimento**: Seção do Bobininha com CTA para WhatsApp.
13. **Localização**: Mapa visual + Endereço em Cuiabá.
14. **Footer**: Azul institucional com colunas de links e informações.

## Detalhes Técnicos

- **Tecnologias**: React 19, TanStack Start (v1), Tailwind CSS v4, Lucide React (ícones técnicos).
- **Sem Backend**: Todo o catálogo será baseado em mocks realistas. Sem Supabase, Auth ou banco de dados.
- **Responsividade**: Otimizado especificamente para breakpoints de 1440px até 360px (mobile pensado separadamente).
- **Páginas**: Home (Prioridade 1), Catálogo (Listagem com filtros laterais), Detalhe de Produto.

## Ações imediatas

- Configurar o tema global no `src/styles.css` com as cores e tipografia solicitadas.
- Criar os componentes base (Header, Topbar, Footer, Button, Card).
- Implementar a Home completa seguindo a ordem de seções.
- Desenvolver a estrutura do Catálogo e a Página de Produto.
