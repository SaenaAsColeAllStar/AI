# Components

> **Related**: [colors.md](./colors.md) · [typography.md](./typography.md) · [spacing.md](./spacing.md) · [layouts.md](./layouts.md) · [motion.md](./motion.md)

Teknovo components live in `packages/ui`, built on **shadcn/ui + Radix UI**. Module apps import from the shared package — no ad-hoc component dumps per module.

---

## Component Stack

| Layer | Library | Scope |
|-------|---------|-------|
| **Base** | Radix UI + shadcn/ui | All ERP UI |
| **Icons** | Phosphor (primary) · Tabler (secondary) | All surfaces |
| **Motion** | Magic UI | Subtle ERP micro-interactions |
| **Marketing** | Aceternity UI | Landing pages only |
| **Reference** | 21st.dev | Inspiration — not copy-paste |

### Forbidden Libraries

Reject immediately: Bootstrap, AdminLTE, Ant Design, Material UI, Lucide, Font Awesome, Bootstrap Icons.

---

## Icons

| Rule | Detail |
|------|--------|
| **Primary** | `@phosphor-icons/vue` — **Regular** weight default |
| **Active nav** | Phosphor **Bold** for active sidebar item only |
| **Secondary** | Tabler Icons where Phosphor lacks glyph |
| **Size** | 16px inline · 20px buttons/nav · 24px empty states · 48px empty state hero icon |
| **Semantic** | Icon + label for actions; `aria-label` on icon-only buttons |
| **Tree-shaking** | Import named icons only |

**Never**: Mix Lucide + Phosphor; decorative icon per table row; emoji as icons in ERP.

---

## Buttons

| Variant | Use | Token |
|---------|-----|-------|
| **Primary** | Main page action (one per PageHeader) | `color-primary` bg |
| **Secondary** | Cancel, back, alternative | `color-card` + border |
| **Destructive** | Delete, void — always with confirm | `color-danger` |
| **Ghost** | Tertiary, toolbar overflow | Transparent hover |
| **Link** | Inline navigation | `color-accent` underline on hover |

| Context | Height | Radius |
|---------|--------|--------|
| ERP | 40px | `radius-md` (12px) |
| Landing | 48px | `radius-md` (12px) |

**Rules**:
- Verb-first labels: **Simpan**, **Tambah siswa**, **Export PDF**
- Hide button when user lacks permission — don't disable with mystery tooltip
- Loading: spinner in button; don't block unrelated UI
- Max **3** primary-weight buttons visible per toolbar

---

## Forms

| Feature | Requirement |
|---------|-------------|
| Validation | Zod at controller; inline errors below field |
| Error summary | Alert at top on submit failure |
| Labels | Always visible — placeholders ≠ labels |
| Hints | One line max under field (`text-caption`) |
| Grouping | Mental model sections — not DB column order |
| Dirty state | Prompt before navigate away |
| Multi-step | Progress indicator; if modal scrolls → use dedicated page |
| Mobile | Single column; sticky **Simpan** footer on long forms |
| Input height | 40px ERP · 48px landing |

```text
[Section heading]
[Label]
[Input                    ]
[Error or hint            ]
```

**Accessibility**: `<label htmlFor>` · `aria-describedby` on errors · `aria-invalid="true"` · focus first error on submit.

---

## Tables (Data Grids)

Prefer **tables over card grids** for ERP data (siswa, tagihan, PPDB).

| Feature | Required |
|---------|----------|
| Search + filters | Combined toolbar |
| Column visibility | Toggle dropdown |
| Row selection | Checkboxes + bulk action bar |
| Pagination | Prev/next, page numbers, per-page selector |
| Export | PDF/CSV in header |
| Sticky header | On scroll |
| Empty state | Icon + message + CTA |
| Mobile | Card list or horizontal scroll + sticky first column |

**Row layout (good)**:

```text
[NIS] [Nama siswa] [Kelas] [Status badge] [⋯]
```

**Row layout (bad)**: Avatar stacks + mini charts + 4 icon buttons per row.

| Element | Style |
|---------|-------|
| Header | `text-body-sm`, weight 600, `color-muted` bg |
| Cell | `text-body-sm`, padding `space-3`/`space-4` |
| Amounts | Tabular nums, right-aligned, `Rp 1.234.567` |
| Status | Badge only — not full row background |
| Row actions | `⋯` menu — not 4 inline icons |

---

## Cards

| Context | Allowed |
|---------|---------|
| Beranda summary | **≤4** stat tiles |
| Landing marketing | Program cards, testimonials, news |
| ERP list pages | **Avoid** — use tables |
| Detail metadata | Compact label/value — not chart cards |

Card spec: `color-card` bg · `color-border` or `shadow-sm` · padding `space-6` · `radius-md`.

**Forbidden**: KPI card walls (6+ above fold); glassmorphism cards; gradient card backgrounds.

---

## Navigation

### Sidebar (ERP)

- Collapsible; school logo top; domain groups; user menu bottom
- RBAC Layer 1 gates visibility
- Active: left border `color-primary` + `color-muted` bg
- Max depth: 3 levels

### Navbar (Landing)

- Sticky 80px height
- Links: Beranda, Profil, Akademik, Kesiswaan, Fasilitas, Berita, PPDB, Kontak
- Portal dropdown + PPDB CTA button
- Mobile: hamburger → drawer

---

## Modals & Drawers

| Use modal | Use page/drawer |
|-----------|-----------------|
| Confirm destructive | Multi-step forms |
| Quick 1–2 field edit | Document preview |
| — | Sortable/paginated tables |

| Requirement | Detail |
|-------------|--------|
| Focus trap | Tab cycles within modal |
| Escape | Closes modal |
| Return focus | To trigger element on close |
| Mobile | Full-screen sheet |
| Scroll | If content scrolls → use page instead |

---

## Feedback Components

| Component | Use |
|-----------|-----|
| **Toast** | Mutation success: "Pembayaran tercatat" |
| **Alert** | Inline errors, form summary, page-level error state |
| **Badge** | Status: Lunas, Menunggu verifikasi, Belum bayar |
| **Skeleton** | Loading — match final layout dimensions |
| **Progress** | Multi-step forms, file upload |

Toast duration: 4–6s; dismissible; pause on hover.

---

## Five Page States (Mandatory)

Every content page implements **all five**. Missing any = Major defect, blocks ship.

| State | Implementation |
|-------|------------------|
| **Loading** | Skeleton matching layout (TanStack Query pending) — not generic full-page spinner |
| **Empty** | Phosphor icon 48px muted + one sentence + CTA if user has create permission |
| **Error** | Non-blocking card + **Coba lagi**; calm copy — no stack traces |
| **Success** | Toast/alert on mutation; clear next step on full-page success |
| **Permission** | Lock screen or restricted view — explain role; not toast-only |

### Empty State Template

```text
[Icon 48px, muted]
[One sentence Bahasa Indonesia]
[Primary CTA if permitted]
```

Example: "Belum ada tagihan bulan ini." → **Buat tagihan**

### Permission State Template

```text
[Lock icon]
[Anda tidak punya akses untuk [action].]
[Hubungi bendahara / admin sekolah.]
```

---

## Module-Specific Components

| Module | Component notes |
|--------|-----------------|
| **PPDB** | Document thumbnail grid; horizontal stepper on detail only |
| **Finance** | Payment form; receipt preview; no playful money UI |
| **CBT** | Full-screen exam shell; numbered question pills; calm timer |
| **Reports** | Print-matched preview; export always available |
| **Communication** | WA template preview before send |

---

## Accessibility Checklist (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| Contrast | ≥4.5:1 text — see [colors.md](./colors.md) |
| Focus | Visible ring on all interactive elements |
| Keyboard | Full tab order; no keyboard traps except modals |
| Forms | Labels, describedby, invalid states |
| Tables | `<th scope="col">`; sort announced |
| Icon buttons | `aria-label` required |
| Skip link | Portal main content |
| Live regions | Toasts `aria-live="polite"` |
| Touch | ≥44×44px targets on mobile |

---

## Implementation Checklist

Before marking UI complete:

- [ ] Components from `packages/ui` only
- [ ] Phosphor/Tabler icons — no Lucide, FA
- [ ] shadcn/ui + Radix — no Ant Design, MUI
- [ ] PageShell → PageHeader → PageContent
- [ ] All 5 page states verified in browser
- [ ] Table: search, filter, pagination, export, bulk, mobile fallback
- [ ] Form: Zod, dirty state, error summary
- [ ] RBAC on route, menu, action buttons
- [ ] Mobile: drawer nav, 44px targets, no horizontal scroll at 375px

---

## Cross-References

- Implementation skill: `.cursor/skills/teknovo-ui-ux/SKILL.md`
- Pre-code planning: `.cursor/skills/teknovo-ux-architecture/SKILL.md`
- Landing components: `.cursor/skills/teknovo-landing-page/SKILL.md`
