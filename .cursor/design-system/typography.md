# Typography

> **Related**: [brand.md](./brand.md) · [colors.md](./colors.md) · [spacing.md](./spacing.md) · [layouts.md](./layouts.md)

Typography establishes hierarchy before color or decoration. Teknovo uses a **dual-font system**: Inter for ERP and body text; Geist for landing display headings.

---

## Font Stack

| Context | Family | Weights | Fallback |
|---------|--------|---------|----------|
| ERP (all) | **Inter** | 400, 500, 600, 700 | `system-ui, -apple-system, sans-serif` |
| Landing headings | **Geist** | 600, 700, 800 | `Inter, system-ui, sans-serif` |
| Landing body | **Inter** | 400, 500, 600 | `system-ui, sans-serif` |
| Monospace (code, IDs) | **Geist Mono** or system mono | 400, 500 | `ui-monospace, monospace` |

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-display: 'Geist', 'Inter', system-ui, sans-serif;
--font-mono: 'Geist Mono', ui-monospace, monospace;
```

**Load**: Self-host or via approved CDN; subset Latin + Indonesian diacritics. Enable `font-feature-settings: "tnum"` for financial tables.

---

## Type Scale

Base size **16px** (`1rem`). Scale uses consistent line heights for editorial readability.

| Token | Size | Line height | Weight | Use |
|-------|------|-------------|--------|-----|
| `text-display` | 64px / 4rem | 1.1 (70px) | 700–800 | Landing hero only |
| `text-h1` | 48px / 3rem | 1.15 (56px) | 700 | Landing page titles |
| `text-h2` | 36px / 2.25rem | 1.2 (44px) | 600–700 | Landing section heads |
| `text-h3` | 30px / 1.875rem | 1.25 (38px) | 600 | Landing subsections |
| `text-h4` | 24px / 1.5rem | 1.3 (31px) | 600 | Card titles, ERP page titles |
| `text-h5` | 20px / 1.25rem | 1.4 (28px) | 600 | ERP section headings |
| `text-h6` | 18px / 1.125rem | 1.4 (25px) | 600 | Form group labels |
| `text-body` | 16px / 1rem | 1.5 (24px) | 400–500 | Default body |
| `text-body-sm` | 14px / 0.875rem | 1.5 (21px) | 400–500 | Secondary body, table cells |
| `text-caption` | 12px / 0.75rem | 1.4 (17px) | 400–500 | Metadata, hints, badges |
| `text-overline` | 12px / 0.75rem | 1.4 | 600 | Uppercase labels (sparingly) |

### ERP Page Title Mapping

| Element | Token | Weight |
|---------|-------|--------|
| PageShell title | `text-h4` | 600 |
| Page description | `text-body-sm` | 400, `color-muted-foreground` |
| Breadcrumb | `text-caption` | 500 |
| Table header | `text-body-sm` | 600 |
| Table cell | `text-body-sm` | 400 |
| Form label | `text-body-sm` | 500 |
| Button | `text-body-sm` | 500–600 |

### Landing Mapping

| Element | Token | Weight |
|---------|-------|--------|
| Hero headline | `text-display` or `text-h1` | 700–800, Geist |
| Section title | `text-h2` | 600–700, Geist |
| Section lead | `text-h5` or `text-body` | 400–500, Inter |
| Body paragraphs | `text-body` | 400, max width 768px |
| Stat numbers | `text-h2`–`text-h3` | 700, Geist |

---

## Weight Rules

| Weight | Use |
|--------|-----|
| **400** | Body text, descriptions, table data |
| **500** | Labels, buttons, nav items, breadcrumbs |
| **600** | Headings, table headers, emphasis |
| **700** | Page titles, landing display, stat numbers |
| **800** | Landing hero only — never ERP interior |

**Never** use 300 (Light) — fails contrast on muted text. **Never** use 900 in UI.

---

## Usage Rules

### Headings

- One `h1` per page (landing hero or ERP PageShell title)
- Don't skip levels (`h2` → `h4`) — breaks screen reader outline
- ERP: max `text-h4` for page title — not display sizes
- Sentence case for headings; title case for proper nouns (PPDB, NISN)

### Body & Data

- **Reading width**: max **768px** for long prose (landing, help text)
- **Financial data**: `font-variant-numeric: tabular-nums`; right-align amounts
- **Currency**: `Rp 1.234.567` — consistent grouping, no mixed formats
- **Dates**: `20 Jun 2026` or `20/06/2026` per locale — one format per surface

### Links

- Default: `color-accent` or `color-primary`, underline on hover
- Don't rely on color alone — underline or icon for inline links in body

---

## Responsive Type

| Breakpoint | Adjustment |
|------------|------------|
| `< 768px` | `text-display` → `text-h1`; `text-h1` → `text-h2` |
| `< 768px` | Landing hero: stack text first; reduce display to 36–48px |
| All | ERP page title stays `text-h4` — may wrap, don't shrink below `text-h5` |

```css
/* Example: landing hero clamp */
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 4rem);
  line-height: 1.1;
  font-weight: 700;
}
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Minimum body size | 16px — don't go below 14px except captions |
| Contrast | See [colors.md](./colors.md) — muted text uses `slate-500` minimum on white |
| Zoom | Layout survives 200% browser zoom |
| Headings | Semantic `h1`–`h6`; not styled `<div>` |
| Abbreviations | `NISN`, `NPSN` — expand on first use with tooltip |
| `prefers-reduced-motion` | No kinetic type animations ([motion.md](./motion.md)) |

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| `text-2xl` ad-hoc on every module | Token scale only |
| Geist inside ERP tables | Inter everywhere in portal |
| All-bold paragraphs | Weight 600 on headings only |
| Center-aligned body walls | Left-align prose; center hero/CTA only |
| ALL CAPS body text | Overline token sparingly for labels |

See [anti-patterns.md](./anti-patterns.md) for AI-ish typography signals (Inter + purple + rounded-2xl stack).
