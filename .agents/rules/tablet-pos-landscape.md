# Tablet Landscape Adaptation Rule (960×280–446 Viewport)

When adapting or styling any web application, admin panel, POS system, or dashboard for a tablet in landscape mode (native 960×446, effective viewport with browser UI and system bars ~960×280–350):

## 1. Zero Impact on Desktop (PC)
- **Strict Media Query**: All tablet adaptations MUST be strictly isolated under:
  ```css
  @media (max-width: 1024px) and (max-height: 550px) { ... }
  ```
- Desktop monitors (width > 1024px OR height > 550px) MUST remain 100% untouched and original.
- Client-facing / visitor pages must never be affected; scope styles to the target route (e.g. `.admin-page`).

## 2. Non-Destructive Proportional Scaling (Zoom 85%)
- **DO NOT** manually rewrite font sizes, paddings, heights, and margins across components — this breaks visual design and layout relationships.
- **DO** use proportional CSS scaling:
  ```css
  @media (max-width: 1024px) and (max-height: 550px) {
    html.admin-page,
    body.admin-page {
      zoom: var(--tablet-zoom, 0.85);
      -webkit-text-size-adjust: 100%;
    }
  }
  ```
- Default zoom is **85% (`0.85`)**, perfectly fitting 960px width into the layout while keeping text, cards, and buttons crisp and touch-friendly.

## 3. Lock Two-Column Layouts Side-by-Side (`md:` instead of `lg:`)
- On a 960px tablet, Tailwind `lg:` (`min-width: 1024px`) will NOT activate, causing columns to stack vertically into 1 column (pushing side panels like order inspectors, receipt summaries, or action sidebars to the bottom of the screen).
- **Always use `md:grid-cols-12`** (`md:col-span-8` left, `md:col-span-4` right), or equivalent flex/grid with 768px breakpoint, so the panels stay side-by-side.

## 4. Card Grid Density (3 Columns)
- For interior grids (e.g., table layouts, product cards): if 4 columns feel too tight, reduce to 3 columns (`grid-cols-2 sm:grid-cols-3 md:grid-cols-3`) to give cards comfortable width and avoid squishing content.

## 5. Interactive Zoom Pill
- Provide a small, unobtrusive zoom controller in the header (visible only under the tablet media query):
  - Step: 5% (from 40% to 100%).
  - Buttons: `[-] 85% [+]`.
  - Save setting in `localStorage` so the user's preferred scale is remembered across sessions.
