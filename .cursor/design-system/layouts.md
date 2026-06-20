# Layouts

> **Related**: [spacing.md](./spacing.md) · [typography.md](./typography.md) · [components.md](./components.md) · [brand.md](./brand.md)

Layout is the primary tool for hierarchy. Teknovo uses **PageShell** for ERP and **editorial sections** for public landing — never interchange them.

---

## App Shell (ERP)

```text
┌─────────────────────────────────────────────────────────┐
│ Top bar (optional): school name, user menu, notifications│
├──────────────┬──────────────────────────────────────────┤
│              │ PageShell                                 │
│   Sidebar    │  ┌─ PageHeader ─────────────────────┐  │
│   (RBAC)     │  │ Breadcrumb · Title · Description   │  │
│              │  │                        [Primary CTA]│  │
│   Domain     │  └───────────────────────────────────┘  │
│   → Module   │  ┌─ PageContent ──────────────────────┐  │
│   → Page     │  │ Table | Form | Dashboard grid      │  │
│              │  └───────────────────────────────────┘  │
│              │  ┌─ PageFooter (optional) ────────────┐  │
│              │  │ Secondary actions · metadata       │  │
│              │  └───────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────┘
```

| Rule | Requirement |
|------|-------------|
| Sidebar | Global domain-driven nav — **no per-module custom sidebars** |
| Max nav depth | 3 levels: Domain → Module → Page |
| Breadcrumb | `Domain > Module > Page` (max 3 segments) |
| Decorative heroes | **Forbidden** on admin pages |
| Second sidebar | **Forbidden** inside modules |

---

## ERP PageShell

Every authenticated page implements:

```tsx
<PageShell>
  <PageHeader
    breadcrumb={['Keuangan', 'Tagihan', 'Daftar Tunggakan']}
    title="Daftar Tunggakan"
    description="Siswa dengan tagihan belum lunas"
    action={<Button>Export PDF</Button>}
  />
  <PageContent>
    {/* table | form | dashboard */}
  </PageContent>
  <PageFooter>{/* optional */}</PageFooter>
</PageShell>
```

### PageHeader Hierarchy

Visual scan order: **breadcrumb → title → description → primary action (right)**.

| Element | Typography | Notes |
|---------|------------|-------|
| Breadcrumb | `text-caption`, muted | Clickable segments except current |
| Title | `text-h4`, weight 600 | One per page |
| Description | `text-body-sm`, muted | Optional, one line preferred |
| Primary action | Right-aligned | RBAC-gated; hide if no permission |

### PageContent Patterns

| Page type | Dominant layout |
|-----------|-----------------|
| List | Full-width data table + toolbar |
| Detail | Metadata grid + tabs |
| Form | Single column mobile; 2-col desktop for short pairs |
| Dashboard (Beranda) | ≤4 stat tiles + activity list + quick links |

**One screen, one visual job** — list pages are table-dominant; don't split with sidebar charts.

---

## Dashboard (Beranda)

Dashboards serve **daily operators**, not demos.

| Element | Rule |
|---------|------|
| Greeting | Plain text line — no banner |
| Stat tiles | **≤4** metrics that drive action |
| Quick actions | Text links or compact buttons — not 8-card grid |
| Recent activity | Single list optional |
| Charts | Max 1 optional; always offer table alternative |

Mandatory sections: Summary cards · Recent activity · Quick actions · Announcements.

Primary KPI top-left; each metric maps to real data source.

---

## Navigation Layout

```text
Domain (L1) → Module (L2) → Page (L3)
```

Approved domains: Dashboard, Academic, Student Affairs, Finance, Administration, Communication, System.

| Rule | Detail |
|------|--------|
| RBAC | Hide inaccessible items — no locked teasing links |
| Icons | Phosphor Regular; Bold for active nav only |
| Active state | Left border + subtle `color-muted` bg |
| Mobile | Drawer or bottom nav; hide desktop sidebar |
| Toolbar | ≤3 primary actions; rest in `⋯` menu |

---

## Landing Editorial Sections

Public school sites use **storytelling scroll** — not ERP dashboard patterns.

### Mandatory Section Sequence

1. **Navbar** — sticky 80px; logo; nav links; Portal dropdown; PPDB CTA; mobile drawer
2. **Hero** — 90vh; desktop 50/50 text/image; CTA above fold; mobile text-first
3. **School Overview** — stats grid (4/2/1 cols)
4. **Programs** — jurusan cards with bottom CTA (4/2/1)
5. **Advantages** — value props (3×2 / 2×3 / vertical)
6. **Facilities** — masonry / 2 col / horizontal scroll
7. **Achievements** — alternating timeline
8. **News** — title max 2 lines, desc max 3 lines
9. **Testimonials** — carousel, quote max 4 lines
10. **PPDB CTA** — ~500px banner; timeline; requirements; Register
11. **FAQ** — accordion, single open
12. **Footer** — 4 cols; Slate 900 bg

**Background rhythm**: White ↔ Slate 50 alternating.

### Storytelling Section Structure

Each marketing section follows editorial hierarchy:

```text
[Overline / eyebrow — optional]
[Section headline — Geist, text-h2]
[Lead paragraph — Inter, max 768px width]
[Content: grid | cards | media]
[Single primary CTA]
```

| Principle | Application |
|-----------|-------------|
| **Scan in 5 seconds** | Headline + one supporting line + CTA visible |
| **One CTA per section** | No competing click targets |
| **Premium whitespace** | `space-20` section padding ([spacing.md](./spacing.md)) |
| **Real content** | School-specific copy, photos, stats — no lorem |

### Hero Layout

| Viewport | Layout |
|----------|--------|
| Desktop (≥1024px) | 50% text / 50% image; CTA above fold |
| Mobile | Stack text first; image below; sticky PPDB banner bottom |

Hero image ≤300KB; WebP/AVIF; no Lottie autoplay.

---

## Grid Systems

### ERP

| Context | Grid |
|---------|------|
| Dashboard cards | 4 col → 2 col (tablet) → 1 col (mobile) |
| Form (desktop) | 12-col; short pairs span 6+6 |
| Detail metadata | 2–3 col label/value grid |
| Table | Full width; horizontal scroll fallback mobile |

### Landing

| Section | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Stats | 4 col | 2 col | 1 col |
| Programs | 4 col | 2 col | 1 col |
| Advantages | 3×2 | 2×3 | 1 col stack |
| News | 3 col | 2 col | 1 col |
| Footer | 4 col | 2 col | 1 col stack |

Gap: `space-6`–`space-8` ([spacing.md](./spacing.md)).

---

## Mobile Rules

| Rule | ERP | Landing |
|------|-----|---------|
| Min tap target | 44×44px | 44×44px; PPDB sticky 56px |
| Navigation | Drawer | Drawer + sticky PPDB CTA |
| Tables | Cards or sticky first column | N/A |
| Modals | Full-screen | Full-screen |
| Horizontal scroll | **Forbidden** at 375px | **Forbidden** |
| Forms | Single column; sticky Simpan footer | Single column; 48px inputs |

Test at **375**, **768**, **1280** px before ship.

---

## Hierarchy Patterns

### ERP List Page

```text
1. Page title (what am I looking at?)
2. Filters + search (how do I narrow?)
3. Primary action (what's the main task?)
4. Table (the data)
5. Pagination (how do I navigate data?)
```

### ERP Detail Page

```text
1. Title + status badge
2. Key metadata (2–3 col grid)
3. Tabs for related data
4. Actions in header or footer — not scattered
```

### Landing Section

```text
1. Headline (why should I care?)
2. Supporting copy (one paragraph max)
3. Evidence (stats, photo, quote)
4. CTA (what do I do next?)
```

---

## Accessibility

- Skip-to-content link on portal (first focusable element)
- Landmark regions: `nav`, `main`, `footer`
- Sticky nav: preserve focus order when opening mobile drawer
- Section headings: semantic `h2` per landing section
- Don't convey structure by color alone — use headings and spacing

See [components.md](./components.md) for five mandatory page states.
