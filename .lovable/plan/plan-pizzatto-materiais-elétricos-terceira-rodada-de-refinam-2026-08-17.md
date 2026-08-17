# Plan: Pizzatto Materiais Elétricos - Terceira Rodada de Refinamento

Terceira iteração de design focada em transformar o protótipo em um site comercial de alta fidelidade, removendo a estética de "template de IA" e reforçando a autoridade técnica da marca de 40 anos.

## 1. Header & Branding
- **Logo:** Aumentar a escala e melhorar a legibilidade.
- **Selo 40 Anos:** Remover do header principal para evitar poluição visual; reintegrar com mais elegância na seção institucional ou como um elemento flutuante discreto.
- **Estrutura:** Topbar com informações de contato (Cuiabá, Telefone) com tipografia mais refinada.
- **Menu:** Revisar para "Produtos / Categorias / Marcas / Empresa / Contato". Adicionar hover states mais sutis.

## 2. Hero Section
- **Composição:** Layout editorial mais forte. Proporção texto/imagem 60/40 ou 50/50 com alinhamento impecável.
- **Busca:** Integrar barra de busca técnica ("O que você procura?") em posição estratégica (dentro do Hero ou imediatamente abaixo).
- **Asset Visual:** Substituir o placeholder genérico por uma composição fotográfica profissional de materiais elétricos reais (cabos, disjuntores, ferramentas).
- **Tipografia H1:** Peso e kerning ajustados para passar autoridade.

## 3. Tipografia & Cores
- **HIerarquia:** Refinar escalas tipográficas. Usar variações de peso da 'Outfit' para distinguir claramente títulos técnicos de descrições.
- **Contraste:** Melhorar o contraste em textos de apoio.
- **Paleta:** Uso cirúrgico do Amarelo Pizzatto para CTAs de orçamento e Verde para WhatsApp, mantendo o Azul como âncora institucional.

## 4. Catálogo & Produtos
- **Categorias:** Padronizar linguagem fotográfica. Garantir que cada categoria tenha uma imagem real e nítida.
- **Cards de Produto:** Layout mais denso e técnico. Incluir: Logo do fabricante (Siemens, Sil, etc), Nome técnico, Referência/SKU, Preço em destaque, Selo "Em Estoque" verde, CTA "Solicitar Orçamento".

## 5. Institucional & Atendimento
- **História:** Valorizar a foto da fachada real. Adicionar o badge de 40 anos com design nobre (dourado/azul).
- **Bobininha:** Integrar o mascote em uma seção de "Suporte Especializado" ou "Orçamento Rápido", garantindo que ele pareça parte do design e não colado.
- **Seção de Atendimento:** Nova área de conversão com foco em "Enviar Lista de Materiais" via WhatsApp.

## 6. Footer
- **Robustez:** Footer institucional completo com Logo, Resumo da Empresa, Links Rápidos, Endereço Completo e Redes Sociais.

## Detalhes Técnicos
- Framework: TanStack Start v1.
- Styling: Tailwind CSS v4.
- Icons: Lucide React.
- Assets: Integrar via `src/assets/*.json`.
- Foco: Home page somente.
