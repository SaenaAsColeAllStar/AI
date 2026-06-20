# Teknovo Design System

Official documentation for Teknovo ERP and public school landing surfaces. This directory is the **canonical reference** for tokens, layout, components, motion, and visual taste.

> **Philosophy**: Premium educational institution — editorial layouts, strong hierarchy, premium whitespace. North stars: Apple, Stripe, Linear, Vercel, Framer. Not template marketplaces.

---

## Document Index

| Document | Scope |
|----------|-------|
| [brand.md](./brand.md) | Identity, voice, ERP vs landing tone, visual north stars |
| [colors.md](./colors.md) | Color tokens, semantic usage, contrast, dark mode notes |
| [typography.md](./typography.md) | Font stack, type scale, weights, usage rules |
| [spacing.md](./spacing.md) | 4px grid, section padding, breakpoints |
| [layouts.md](./layouts.md) | PageShell, editorial landing sections, grid systems |
| [motion.md](./motion.md) | Duration/easing tokens, reduced motion, micro-interactions |
| [components.md](./components.md) | shadcn/ui + Radix, buttons, forms, tables, five page states |
| [anti-patterns.md](./anti-patterns.md) | AI-ish detection, forbidden patterns, DO/DON'T examples |

---

## Quick Token Reference

| Category | Key values |
|----------|------------|
| **ERP primary** | `#1D4ED8` (hover `#1E40AF`) |
| **Landing primary** | `#2563EB` (hover `#1D4ED8`, soft `#DBEAFE`) |
| **Fonts** | Inter (ERP + body) · Geist (landing headings) |
| **Spacing base** | 4px grid — `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px |
| **Type scale** | Display 64 → Caption 12 (see [typography.md](./typography.md)) |
| **Radius** | sm 8 · md 12 · lg 16 · xl 24 px |
| **Container** | max 1280px · reading max 768px |

---

## Related Artifacts

| Path | Relationship |
|------|--------------|
| `.cursor/skills/teknovo-design-system/SKILL.md` | Agent skill — points here for full spec |
| `.cursor/skills/teknovo-ui-ux/SKILL.md` | ERP implementation (PageShell, states, tables) |
| `.cursor/skills/teknovo-landing-page/SKILL.md` | Public marketing surfaces |
| `.cursor/gates/taste/design-principles.md` | Visual taste gate (precedes implementation) |
| `.cursor/gates/quality/design-taste.md` | Formal design quality bar |
| `.cursor/docs/memory/ui-ux-rules.md` | Runtime memory index (synced from this docs set) |

---

## Accessibility Baseline

All surfaces meet **WCAG 2.1 AA** minimum: contrast ≥ 4.5:1 for body text, visible focus, keyboard navigation, labeled forms, skip links on portal. See individual docs for context-specific requirements.

---

## Implementation Stack

| Layer | Library | Scope |
|-------|---------|-------|
| Base | Radix UI + shadcn/ui | ERP in `packages/ui` |
| Icons | Phosphor (primary) · Tabler (secondary) | All surfaces |
| Motion | Magic UI | Subtle ERP micro-interactions |
| Marketing | Aceternity UI | Landing pages only |

**Forbidden**: Lucide, Font Awesome, Bootstrap, Ant Design, Material UI, AdminLTE.
