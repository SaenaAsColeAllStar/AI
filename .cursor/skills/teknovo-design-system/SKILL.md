---
name: teknovo-design-system
description: >-
  Teknovo design tokens, typography, spacing, component libraries, icon rules,
  and visual taste constraints. Use when choosing colors, fonts, icons,
  shadows, or components for ERP dashboards or public landing pages; when
  reviewing design system compliance; or when rejecting forbidden UI libraries.
---

# Teknovo Design System

North stars: **Stripe Dashboard, Linear, Notion, Carbon** — not template marketplaces.

## Color Tokens — ERP Dashboard

| Token | Hex | Use |
|-------|-----|-----|
| Primary | `#1D4ED8` | Primary actions; hover `#1E40AF` |
| Accent | `#0EA5E9` | Focus, links |
| Success | `#16A34A` | Paid, approved |
| Warning | `#D97706` | Pending, attention |
| Danger | `#DC2626` | Delete, void, error |
| Neutral | `#0F172A` | Headings, strong text |
| Background | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Surfaces |

**Rules**: Color is semantic (status, action) — never decorative. No gradient backgrounds on content areas.

## Color Tokens — Landing Page

| Token | Hex |
|-------|-----|
| Primary Blue | `#2563EB` (hover `#1D4ED8`, soft `#DBEAFE`) |
| Secondary Slate | `#334155` |
| Accent Sky | `#0EA5E9` |
| Neutrals | Slate 50–900 (`#F8FAFC` … `#0F172A`) |

Section rhythm: **White → Neutral 50 → White → Neutral 50**.

## Typography

| Context | Font | Weights |
|---------|------|---------|
| ERP body/headings | Inter | 400/500 body; 600/700 headings |
| Landing headings | Geist | 600/700/800 |
| Landing body | Inter | 400/500/600 |
| Fallback | system-ui | — |

Landing scale: Display 64 · H1 48 · H2 36 · H3 30 · H4 24 · Body 16 · Small 14 · Caption 12.

## Spacing & Shape

- **Spacing scale**: 4, 8, 12, 16, 24, 32, 48, 64px (landing adds 80, 120).
- **Radius**: sm 8px · md 12px · lg 16px · xl 24px. No fully rounded cards.
- **Shadows**: sm cards · md dropdowns · lg modals. Sidebar: border only, no heavy shadow.
- **Container**: max 1280px; reading content max 768px.

## Component Stack

| Layer | Library | Scope |
|-------|---------|-------|
| Base | Radix UI + shadcn/ui | All ERP UI in `packages/ui` |
| Motion | Magic UI | Subtle only |
| Public marketing | Aceternity UI | Landing pages only |
| Reference | 21st.dev | Inspiration — not copy-paste |

## Icons

- **Primary**: Phosphor (`@phosphor-icons/vue`) — Regular default; Bold for active nav only.
- **Secondary**: Tabler Icons.
- **Forbidden**: Lucide, Font Awesome, Bootstrap Icons, glyphicons, mixed sets.

## Forbidden Libraries

Reject immediately: Bootstrap, AdminLTE, Ant Design, Material UI, Lucide, Font Awesome.

## Visual Taste — Reject

| Anti-pattern | Fix |
|--------------|-----|
| Gradient hero on admin pages | Plain PageShell title |
| 6+ KPI cards above fold | ≤4 metrics on Beranda; rest in lists |
| Glassmorphism / neon borders | Flat surfaces, subtle borders |
| Chart walls without table alt | One chart or table per screen job |
| Icon per table row (no function) | Row actions in `⋯` menu |
| Rainbow row backgrounds | Status badge only |
| Fake metrics / lorem | Real empty states |

## Visual Taste — Prefer

- **Tables over cards** for ERP data (siswa, tagihan, PPDB).
- **Cards** only for Beranda summary (≤4) and landing marketing.
- **Data density**: `[NIS] [Nama] [Kelas] [Status] [⋯]` — not avatar stacks + mini charts.
- **Finance**: tabular nums, right-aligned, `Rp 1.234.567` consistent.

## AI-Ish Detection (Quick)

Block UI if ≥2 true: gradient header · 4+ KPI cards above fold · chart without labels · sparkle/AI branding · purple+Inter+rounded-2xl stack · modal wizard where PageShell form suffices.

Full scoring: load **teknovo-ux-architecture** for AI-ish gate (≤40 to proceed).

## Module Visual Notes

| Module | Priority |
|--------|----------|
| PPDB | Trust — document preview, stepper on detail only |
| Finance | Auditability — no playful money colors |
| CBT | Focus — no sidebar during exam; calm timer |
| Reports | Screen matches print |

## Canonical Documentation

**Full design system spec**: [`.cursor/design-system/`](../../.cursor/design-system/README.md) — authoritative reference for brand, colors, typography, spacing, layouts, motion, components, and anti-patterns. This skill is the agent quick-reference; update docs first when tokens change.

## References

- `.cursor/design-system/` — canonical design system (primary)
- `docs/standards/design-system/design-system-contract.md` (legacy pointer)
- `docs/standards/design-system/navigation-architecture-standard.md`
- `.cursor/gates/taste/design-principles.md`, `.cursor/gates/quality/design-taste.md`
