# UI/UX Rules — Teknovo Design System

> **Source**: `teknovo-ui-ux`, `teknovo-ui-ux-specialist`, `teknovo-chief-product-designer` skills; Teknovo-V2 `docs/standards/design-system/**`  
> **Last updated**: 2026-06-20

---

## Why Sidebar Navigation Is Mandatory

Sidebar navigation is **not optional** in Teknovo ERP. Rationale from navigation architecture standards:

1. **Domain-driven IA** — ERP spans Academic, Finance, PPDB, CBT, WA; sidebar encodes Domain → Module → Page hierarchy consistently
2. **RBAC alignment** — Each nav node maps to `domain.resource.action`; a global sidebar ensures permission-gated menus are uniform
3. **Cross-module consistency** — Individual modules must **not** render ad-hoc custom sidebars; users learn one navigation model
4. **Enterprise scanability** — School staff operate daily tasks; fixed sidebar + breadcrumbs reduce cognitive load vs. hub-and-spoke dashboards
5. **Mobile adaptation** — Desktop sidebar transitions to drawer/bottom nav; custom per-module nav breaks responsive patterns

**Depth limit**: Max 3 levels — Domain → Module → Page.

---

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1D4ED8` | Primary actions, links |
| Primary Hover | `#1E40AF` | Hover states |
| Accent | `#0EA5E9` | Focus details, highlights |
| Success | `#16A34A` | Confirmations, paid status |
| Warning | `#D97706` | Alerts, pending states |
| Danger | `#DC2626` | Errors, destructive actions |
| Neutral | `#0F172A` | Text, dark elements |
| Background | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Card surfaces |

**Visual references**: Stripe Dashboard, Linear, Notion, Carbon Design.

---

## Typography

| Aspect | Standard |
|--------|----------|
| Primary font | Inter |
| Fallback | System UI stack |
| Title/Heading weights | 600, 700 |
| Body weights | 400, 500 |

---

## Spacing Scale

`4` · `8` · `12` · `16` · `24` · `32` · `48` · `64` px

---

## Approved Component Libraries

| Category | Library |
|----------|---------|
| Base components | Radix UI, shadcn/ui |
| Animations | Magic UI |
| Landing/public pages | Aceternity UI |
| Component references | 21st.dev |

---

## Icon Libraries

| Priority | Library | Status |
|----------|---------|--------|
| **Primary** | **Phosphor Icons** | ✅ Approved |
| Secondary | Tabler Icons | ✅ Approved |

### Strictly Forbidden

- Lucide Icons
- Font Awesome
- Bootstrap / Bootstrap Icons
- Ant Design / Material UI
- AdminLTE

---

## Page Layout Structure

Every ERP page must use:

```text
PageShell → PageHeader → PageContent → PageFooter
```

### PageHeader (Mandatory)

- Breadcrumb: `Domain > Module > Page`
- Page title
- Page description
- Optional: Primary action button (e.g., "Add Student", "Export Report")

### PageContent

Primary area for tables, forms, or dashboard grid.

### PageFooter

Secondary actions or page metadata.

---

## Sidebar Rules

| Rule | Requirement |
|------|-------------|
| Structure | Level 1 Domain → Level 2 Module → Level 3 Page |
| Max depth | 3 levels |
| Consistency | Globally identical across ERP — no module-specific sidebars |
| RBAC | Each leaf maps to permission |
| Mobile | Drawer or bottom navigation; desktop sidebar hidden on mobile |
| Breakpoints | Mobile <768px, Tablet 768–1024px, Desktop >1024px |

---

## Mandatory Page States (All Five Required)

| # | State | Implementation |
|---|-------|----------------|
| 1 | **Loading** | Skeleton or spinner while TanStack Query fetches |
| 2 | **Empty** | Friendly illustration + CTA if user can create |
| 3 | **Error** | Non-blocking error card with Retry button |
| 4 | **Success** | Toasts/alerts for mutations |
| 5 | **Permission** | Restricted access if RBAC role insufficient |

---

## Table Standards (Data Grids)

| Feature | Required |
|---------|----------|
| Header controls | Combined search + filter |
| Column visibility | Toggle dropdown |
| Row selection | Multi-select checkboxes |
| Bulk actions | Contextual bar when selection > 0 |
| Pagination | Prev/Next, page numbers, records-per-page |
| Export | PDF/CSV in header |
| Sticky headers | Freeze on scroll |

---

## Form Standards

| Feature | Required |
|---------|----------|
| Validation | Zod schema; inline errors below fields |
| Error summary | Alert at top for validation failures |
| Dirty state | Confirm before navigate away |
| Autosave | Debounced sync for settings fields |
| Multi-step | Progress indicator + clean state transfer |

---

## Dashboard Standards

Mandatory dashboard sections (per navigation standard):
- Summary cards
- Recent activity
- Quick actions
- Announcements

Card hierarchy: primary metrics top-left, secondary below.

---

## Accessibility Requirements

- Contrast ratios per WCAG
- Keyboard navigation and visible focus
- Screen reader labels
- Skip links
- Tap targets ≥ 44px on mobile
- Tables → card fallback on mobile

---

## UI Implementation Checklist

- [ ] Phosphor/Tabler icons only — no Lucide/Font Awesome
- [ ] All five page states implemented
- [ ] Breadcrumb `Domain > Module > Page`
- [ ] PageShell → PageHeader → PageContent layout
- [ ] Zod validation + dirty state on forms
- [ ] Tables: pagination, filter, column visibility, export
- [ ] Mobile: sidebar hidden, drawer/bottom nav shown
- [ ] UI components in `packages/ui/` only

---

## Design Gate Workflow

Before UI code:
1. **teknovo-chief-product-designer** — Product Design Analysis
2. **teknovo-ui-ux-specialist** — Pre-code architecture (route tree, permission matrix)
3. **teknovo-ui-ux** — Implementation with token compliance

**Prohibited**: UI code before mandatory artifacts from steps 1–2.
