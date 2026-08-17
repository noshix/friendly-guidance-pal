# Plan: Pizzatto Materiais Elétricos - Visual Prototype Refinement

Focusing exclusively on a high-fidelity frontend commercial prototype for the home page, emphasizing professional density, technical clarity, and the traditional brand identity.

## Visual & Brand Identity
- **Colors**: White/Light Gray base (65%), Pizzatto Blue (#174F8C) (20%), Yellow (#F5C400) (10%), Green (#2E8B57) (7%), Red (#D9272E) (3%).
- **Typography**: Professional sans-serif (Inter/Outfit) with clean editorial spacing.
- **Layout**: Industrial/Technical commerce feel (Obramax/CCR style) with sharp corners (radius 0-6px), fine borders, and high density.

## Component Structure (src/routes/index.tsx)
1. **Topbar**: Ultra-slim, professional message + contact info.
2. **Header**: Clean white background, logo, primary navigation, and "Talk to Pizzatto" green CTA.
3. **Global Search**: High-prominence bar for searching 11k+ products.
4. **Hero Section**: 50/50 layout with editorial copy and a technical product composition image. 40+ years experience badge.
5. **Trust Bar**: Compact horizontal row of core value propositions.
6. **Technical Categories**: Grid of 9+ categories with photographic placeholders and technical labels.
7. **Featured Products**: Commercial grid showing Siemens/SIL/Alumbra mocks with "In Stock" status.
8. **Brand Carousel**: Clean, spaced-out logos of major electrical manufacturers.
9. **Professional Solutions**: Section for Professionals, Companies, and Construction sites.
10. **Budget CTA**: Call-to-action for material list quotes.
11. **Institutional/History**: Real facade image with 40-year legacy story.
12. **Support/Bobininha**: Customer service section with the mascot.
13. **Location/Map**: Detailed address, "How to get there", and WhatsApp.
14. **Footer**: Institutional blue footer with yellow accent line and multi-column navigation.

## Technical Details
- **No Backend**: All data will be mocked in-component or local constants.
- **Responsive**: Targeted breakpoints (1440, 1280, 1024, 768, 390, 360).
- **Styling**: Tailwind CSS v4 using semantic tokens.
- **Assets**: Using placeholder images for products/categories; including descriptive labels for user-provided assets (Logo, Mascot, Facade) to be swapped later.

## Constraints Check
- No Supabase, no Auth, no Database, no API.
- No E-commerce functionality (Cart/Checkout).
- No new logo or invented history.
