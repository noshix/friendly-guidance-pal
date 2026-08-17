# Pizzatto Home Refinement - Round 2

Second visual refinement focused on professional finishing, official asset integration, and density.

## Design Changes

### Branding & Assets
- **Logo**: Integrate official logo from `src/assets/logo.asset.json` in header and footer.
- **Mascot**: Integrate "Bobininha" from `src/assets/bobininha.asset.json`.
- **Facade**: Use official facade photo from `src/assets/fachada.asset.json` in the History section.
- **Favicon**: Already updated to match the official brand.

### Typography & Layout
- **H1 Refinement**: Use a more technical and balanced font weight/spacing for "Materiais elétricos para sua obra...".
- **Section Titles**: Sophisticated editorial hierarchy for section headers (less bold weight, better tracking).
- **Commercial Density**: Reduce vertical spacing between sections to create a more compact, distributor-focused feel.
- **Header**: Sticky main header; topbar hides on scroll for a compact view.

### Components
- **Hero**: Replace placeholder with high-quality editorial imagery of electrical materials (cables, breakers, tools).
- **Categories**: 
  - Replace gray boxes with photographic representations.
  - Refine cards: better proportions, subtle hover (no heavy blue border).
- **Products**:
  - Technical e-commerce mocks (Siemens, SIL, Alumbra) with clear white backgrounds.
  - Better hierarchy: prominent product image, subtle brand/ref, clear stock status, bold price.
- **Brands**: Monochromatic/gray layout with blue hover.
- **Solutions**: Editorial layout for "Solutions for Professionals" (away from generic icon boxes).
- **Budget CTA**: Refined spacing and contrast with a subtle "list/quote" visual element.

## Technical Details
- **Frontend Only**: Strict presentation layer using React 19 + TanStack Start.
- **Styling**: Tailwind CSS v4 with semantic tokens.
- **Assets**: Managed via Lovable Assets CDN for performance.
- **Icons**: Lucide React.
