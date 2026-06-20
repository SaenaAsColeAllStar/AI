---
name: teknovo-ui-ux
description: >-
  Implement and review Teknovo ERP UI — PageShell layout, five page states,
  tables, forms, navigation, RBAC-aware UX, and mobile rules. Use when building,
  modifying, or reviewing dashboard pages, forms, data tables, sidebar nav,
  or any authenticated portal UI in apps/portal or packages/ui.
---

# Teknovo UI/UX Implementation

**Scope**: Code and review of authenticated ERP UI. For pre-code IA/planning → **teknovo-ux-architecture**. For tokens/icons → **teknovo-design-system**. For public landing → **teknovo-landing-page**.

## Layout Contract

Every ERP page uses this structure:

```text
PageShell
├── PageHeader — breadcrumb, title, description, optional primary action (RBAC-gated)
├── PageContent — table | form | dashboard grid
└── PageFooter — secondary actions, metadata
```

- **Breadcrumb**: `Domain > Module > Page` (max 3 segments).
- **No** decorative hero bands on admin pages.
- **No** per-module custom sidebars — global domain-driven sidebar only.

## Navigation

```text
Domain (L1) → Module (L2) → Page (L3)   [max depth: 3]
```

Approved domains: Dashboard, Academic, Student Affairs, Finance, Administration, Communication, System.

| Rule | Requirement |
|------|-------------|
| Sidebar | Global; RBAC Layer 1 menu visibility |
| Mobile | Drawer or bottom nav; hide desktop sidebar |
| RBAC UX | Hide inaccessible nav — no locked teasing links |
| Primary tasks | ≤5 clicks from dashboard |
| Toolbar | ≤3 primary actions visible; rest in `⋯` |

## Five Page States (Mandatory)

Every content page implements **all five**. Missing any = Major defect, blocks ship.

| State | Implementation |
|-------|------------------|
| Loading | Skeleton matching layout (TanStack Query pending) |
| Empty | Friendly message + CTA if user has create permission |
| Error | Non-blocking card + Retry |
| Success | Toast/alert on mutation |
| Permission | Lock screen or restricted view — not toast-only |

## Tables (Data Grids)

Required: search + filters · column visibility toggle · row selection · bulk action bar · pagination (prev/next, page nums, per-page) · PDF/CSV export · sticky header · empty state with CTA · mobile card/list fallback.

Prefer **data tables** over card grids for ERP lists.

## Forms

- **Validation**: Zod at controller; inline errors below fields; error summary at top on submit.
- **Grouping**: Mental model — not database column order.
- **Dirty state**: Prompt before navigate away.
- **Multi-step**: Progress indicator; if modal scrolls → use dedicated page.
- **Mobile**: Single column; appropriate input types; sticky **Simpan** footer on long forms.

## Modals vs Pages

| Use modal | Use page/drawer |
|-----------|-----------------|
| Confirm destructive | Multi-step forms |
| Quick 1–2 field edit | Document preview |
| — | Sortable/paginated tables |

## Mobile (Mandatory)

- Tap targets ≥44×44px.
- Test baseline: 375×667 (iPhone SE).
- Tables → cards or horizontal scroll + sticky first column.
- Modals → full-screen on mobile.
- No horizontal overflow at 375px.

## Accessibility (WCAG AA)

Contrast ≥4.5:1 text · visible focus · keyboard tab order · form labels + `aria-describedby` on errors · icon buttons named · skip-to-content on portal · table headers with scope.

## UX Taste (Apply During Build)

- ≤7 visible decisions per screen; collapse advanced into drawers.
- Empty dashboard → one CTA ("Tambah siswa pertama"), not 8 empty widgets.
- Hide action buttons when no permission — not disabled mystery tooltips.
- WIB timezone; DD/MM/YYYY for Indonesia.

## Implementation Checklist

Before marking UI complete:

- [ ] Phosphor/Tabler only — no Lucide, FA, Bootstrap
- [ ] shadcn/ui + Radix — no Ant Design, MUI
- [ ] PageShell → PageHeader → PageContent
- [ ] Breadcrumb `Domain > Module > Page`
- [ ] All 5 page states verified in browser
- [ ] Table: search, filter, pagination, export, bulk, mobile fallback
- [ ] Form: Zod, dirty state, error summary
- [ ] Mobile: drawer nav, 44px targets, no horizontal scroll
- [ ] RBAC on route, menu, action buttons
- [ ] Components in `packages/ui` — not ad-hoc module dumps

## Skill Handoff

| Phase | Skill |
|-------|-------|
| Pre-code planning | teknovo-ux-architecture |
| Strategic product gate | teknovo-ux-architecture (Product Design Analysis) |
| Tokens/visual compliance | teknovo-design-system |
| Public landing | teknovo-landing-page |
| Code implementation | teknovo-feature-implementation |
| Pre-ship UX audit | gstack-qa, gstack-browser-testing |

## References

- `docs/standards/design-system/design-system-contract.md`
- `docs/standards/rbac/rbac-standard.md`
- `apps/portal/`, `packages/ui/`
