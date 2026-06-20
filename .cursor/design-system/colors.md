# Color Tokens

> **Related**: [brand.md](./brand.md) · [typography.md](./typography.md) · [components.md](./components.md) · [anti-patterns.md](./anti-patterns.md)

Color in Teknovo is **semantic** — status, action, and hierarchy. Never decorative. No gradient backgrounds on content areas.

---

## Core Principle

| Do | Don't |
|----|-------|
| Primary for actions and links | Primary as section background |
| Success/warning/danger on badges and alerts | Full-row rainbow backgrounds |
| Neutral scale for text and borders | Random hex per module |
| One accent hue for focus rings | Neon borders or glassmorphism |

---

## ERP Dashboard Tokens

Primary ERP palette — use in authenticated portal (`apps/portal`, `packages/ui`).

| Token | CSS variable | Hex | Usage |
|-------|--------------|-----|-------|
| `color-primary` | `--primary` | `#1D4ED8` | Primary buttons, active nav accent |
| `color-primary-hover` | `--primary-hover` | `#1E40AF` | Button/link hover |
| `color-primary-foreground` | `--primary-foreground` | `#FFFFFF` | Text on primary buttons |
| `color-accent` | `--accent` | `#0EA5E9` | Focus rings, links, highlights |
| `color-success` | `--success` | `#16A34A` | Paid, approved, Lunas |
| `color-success-foreground` | `--success-foreground` | `#FFFFFF` | Text on success badges |
| `color-warning` | `--warning` | `#D97706` | Pending, attention, partial payment |
| `color-warning-foreground` | `--warning-foreground` | `#FFFFFF` | Text on warning badges |
| `color-danger` | `--destructive` | `#DC2626` | Delete, void, errors |
| `color-danger-foreground` | `--destructive-foreground` | `#FFFFFF` | Text on danger buttons |
| `color-info` | `--info` | `#0284C7` | Informational alerts, tips |
| `color-info-foreground` | `--info-foreground` | `#FFFFFF` | Text on info surfaces |

### ERP Surfaces & Text

| Token | CSS variable | Hex | Usage |
|-------|--------------|-----|-------|
| `color-background` | `--background` | `#F8FAFC` | Page background |
| `color-foreground` | `--foreground` | `#0F172A` | Headings, strong text |
| `color-card` | `--card` | `#FFFFFF` | Cards, panels, modals |
| `color-card-foreground` | `--card-foreground` | `#0F172A` | Text on cards |
| `color-muted` | `--muted` | `#F1F5F9` | Subtle backgrounds, zebra rows |
| `color-muted-foreground` | `--muted-foreground` | `#64748B` | Secondary text, placeholders |
| `color-border` | `--border` | `#E2E8F0` | Dividers, table borders, inputs |
| `color-input` | `--input` | `#E2E8F0` | Input borders |
| `color-ring` | `--ring` | `#0EA5E9` | Focus ring (matches accent) |

---

## Landing Page Tokens

Public marketing uses a slightly brighter primary and full Slate scale for editorial rhythm.

| Token | Hex | Usage |
|-------|-----|-------|
| `landing-primary` | `#2563EB` | Primary CTA, PPDB buttons |
| `landing-primary-hover` | `#1D4ED8` | CTA hover |
| `landing-primary-soft` | `#DBEAFE` | Soft highlight backgrounds |
| `landing-secondary` | `#334155` | Subheadings, secondary text |
| `landing-accent` | `#0EA5E9` | Links, icon accents |

### Slate Neutral Scale (Shared)

Use for both ERP neutrals and landing section alternation.

| Token | Hex | Usage |
|-------|-----|-------|
| `slate-50` | `#F8FAFC` | Alternate section bg (landing) |
| `slate-100` | `#F1F5F9` | Muted fills |
| `slate-200` | `#E2E8F0` | Borders |
| `slate-300` | `#CBD5E1` | Disabled borders |
| `slate-400` | `#94A3B8` | Placeholder text |
| `slate-500` | `#64748B` | Secondary body |
| `slate-600` | `#475569` | Strong secondary |
| `slate-700` | `#334155` | Landing secondary |
| `slate-800` | `#1E293B` | Dark UI elements |
| `slate-900` | `#0F172A` | Footer bg, headings |
| `slate-950` | `#020617` | Deepest contrast (sparingly) |

**Landing section rhythm**: White → Slate 50 → White → Slate 50.

---

## Semantic Mapping

| UI element | Token |
|------------|-------|
| Primary button | `color-primary` / hover `color-primary-hover` |
| Secondary button | `color-card` + `color-border` border |
| Destructive button | `color-danger` |
| Link | `color-accent` or `color-primary` |
| Success badge | `color-success` bg at 10% opacity + `color-success` text |
| Warning badge | `color-warning` bg at 10% opacity + `color-warning` text |
| Error badge / alert | `color-danger` |
| Sidebar active item | Left border `color-primary` + `color-muted` bg |
| Table header | `color-muted` bg + `color-foreground` text |

### Finance-Specific

- Amounts: `color-foreground` — never red/green entire rows
- Status only: Lunas → success · Belum bayar → warning · Batal → muted

---

## Tailwind / CSS Implementation

```css
:root {
  --primary: 224 76% 48%;           /* #1D4ED8 */
  --primary-hover: 224 71% 40%;     /* #1E40AF */
  --accent: 199 89% 48%;            /* #0EA5E9 */
  --success: 142 71% 45%;           /* #16A34A */
  --warning: 32 95% 44%;            /* #D97706 */
  --destructive: 0 72% 51%;         /* #DC2626 */
  --info: 199 96% 39%;              /* #0284C7 */
  --background: 210 40% 98%;        /* #F8FAFC */
  --foreground: 222 47% 11%;        /* #0F172A */
  --card: 0 0% 100%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --ring: 199 89% 48%;
}

[data-surface="landing"] {
  --primary: 217 91% 60%;           /* #2563EB */
  --primary-hover: 224 76% 48%;     /* #1D4ED8 */
}
```

---

## Contrast Requirements (WCAG 2.1 AA)

| Pair | Minimum ratio | Notes |
|------|---------------|-------|
| Body text on background | **4.5:1** | `slate-900` on `slate-50` ✓ |
| Large text (≥18px bold / 24px) | **3:1** | Headings on section bg |
| UI components & graphics | **3:1** | Icons, input borders |
| Primary button text | **4.5:1** | White on `#1D4ED8` ✓ |
| Focus indicator | **3:1** | Ring against adjacent colors |

**Verify** custom school co-branding overrides with contrast checker before ship.

---

## Dark Mode Notes

Teknovo ERP **defaults to light mode** — school staff print reports and work in bright offices. Dark mode is **optional future support**, not required for v1.

When implemented:

| Token | Direction |
|-------|-----------|
| `color-background` | `#0F172A` |
| `color-foreground` | `#F8FAFC` |
| `color-card` | `#1E293B` |
| `color-border` | `#334155` |
| Semantic colors | Same hue; adjust lightness for contrast |

**Rules**:
- Reports/PDF preview must match print in light mode
- CBT exam UI may force light or high-contrast regardless of system preference
- Respect `prefers-color-scheme` only where full token set is tested

---

## Forbidden Color Patterns

See [anti-patterns.md](./anti-patterns.md). Summary:

- Gradient heroes or card backgrounds
- Purple + Inter + rounded-2xl "AI SaaS" stack
- Rainbow chart fills
- Glassmorphism (blurred panels, neon borders)
- Module-specific primary colors
