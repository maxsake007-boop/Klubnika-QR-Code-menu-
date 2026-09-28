---
name: tablet-landscape-adapter
description: Adapts web applications (POS systems, dashboards, admin panels) for a tablet in landscape mode (960x280-446 viewport) using non-destructive proportional zoom and side-by-side layout locking without altering desktop styling.
---

# Tablet Landscape Adapter (960×280–446 Viewport)

This skill provides the exact proven workflow to adapt any web application, admin panel, or POS terminal for a specific landscape tablet viewport (960×446 native, ~960×280–350 effective height with browser chrome and navigation bars).

## The Core Problem

Desktop web applications are designed for 1080p (1920×1080) or 1440×900 monitors. When opened on a 960×446 tablet (or with 40% height removed by browser UI → 960×280–320):
1. **Vertical Collapse**: Elements designed for tall screens stack vertically (e.g. `lg:grid-cols-12` drops columns to 1 column).
2. **Massive Scale**: 64px headers and 150px cards take up 60–80% of the vertical space.
3. **Manual Overrides Fail**: Manually editing individual paddings and font sizes destroys the design and breaks the desktop view.

---

## The Solution: 3 Architectural Rules

### Rule 1: Breakpoint Locking (`md:` instead of `lg:`)
Tablet landscape width is **960px**.
- Tailwind `lg` is `1024px` → 960px is **smaller** than `lg:`, so `lg:grid-cols-12` collapses into a single column.
- Tailwind `md` is `768px` → 960px is **larger** than `md:`.
- **Action**: Always use `md:grid-cols-12`, `md:col-span-8`, `md:col-span-4` (or CSS grid) so the two columns remain side by side on tablet.

### Rule 2: Non-Destructive Proportional Scaling (`zoom: 0.85`)
Instead of rewriting styles, scale down the entire interface proportionally using CSS `zoom`.
- **Target Zoom**: `0.85` (85%) is the sweet spot. It scales the 960px screen to ~1130px virtual width, fitting the full desktop layout while keeping text crisp and touchable.
- **Strict Media Query**:
```css
/* Applies ONLY to tablet landscape; desktop (>1024px or >550px) is 100% UNTOUCHED */
@media (max-width: 1024px) and (max-height: 550px) {
  html.admin-page,
  body.admin-page {
    zoom: var(--tablet-zoom, 0.85);
    -webkit-text-size-adjust: 100%;
  }

  .tab-zoom-pill {
    display: inline-flex !important;
  }
}
```

### Rule 3: Interactive Zoom Controller (`[-] 85% [+]`)
Add an interactive controller in the header that activates only on tablet landscape:
- Lets the user fine-tune between 40% and 100% in 5% steps right with their finger.
- Persists to `localStorage('pos_tablet_zoom_v2')`.

```tsx
const [zoomLevel, setZoomLevel] = useState<number>(() => {
  try {
    const saved = localStorage.getItem('pos_tablet_zoom_v2');
    if (saved) {
      const parsed = Number(saved);
      if (parsed >= 0.4 && parsed <= 1.0) return parsed;
    }
  } catch {}
  return 0.85; // Default: 85%
});

useEffect(() => {
  const applyZoom = () => {
    const isTabletLandscape = window.innerWidth <= 1024 && window.innerHeight <= 550;
    if (isTabletLandscape) {
      document.documentElement.style.setProperty('--tablet-zoom', String(zoomLevel));
      (document.body.style as any).zoom = String(zoomLevel);
      (document.documentElement.style as any).zoom = String(zoomLevel);
    } else {
      document.documentElement.style.removeProperty('--tablet-zoom');
      (document.body.style as any).zoom = '';
      (document.documentElement.style as any).zoom = '';
    }
  };

  applyZoom();
  window.addEventListener('resize', applyZoom);
  return () => window.removeEventListener('resize', applyZoom);
}, [zoomLevel]);
```

### Rule 4: Grid Density Adjustment
If cards inside the main content area (e.g. tables, products) feel too wide or crowded:
- Reduce column count by 1 (e.g. from 4 columns to 3 columns: `grid-cols-2 sm:grid-cols-3 md:grid-cols-3`).
- This gives each card comfortable breathing room without shrinking text.
