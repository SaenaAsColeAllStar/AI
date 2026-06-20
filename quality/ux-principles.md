# UX Excellence Principles — Teknovo Impeccable Architect

> **Source of truth**: `AGENTS.md`, `memory/ui-ux-rules.md`, `teknovo-ui-ux`, `teknovo-ui-ux-specialist`, `teknovo-chief-product-designer`  
> **Reject threshold**: Dashboard clutter, excessive nav depth, unnecessary modals, poor information architecture

---

## Purpose

School staff use Teknovo daily under time pressure. UX excellence means **fewer decisions per task**, not more pixels. Every screen must earn its place in the sidebar hierarchy.

---

## Evaluation Dimensions

### 1. Cognitive Load

**Question**: How many concepts must the user hold in memory to complete the task?

| Signal | Good | Bad |
|--------|------|-----|
| Primary action | One obvious CTA per view | Competing buttons same weight |
| Labels | Domain language (Tagihan, Calon Siswa) | Generic (Item, Record, Data) |
| Density | Scannable tables with filters | Wall of cards with duplicate metrics |
| State | Clear status chips (Lunas, Pending) | Ambiguous icons only |

**Teknovo rules**:
- Finance payment flow: list → detail → action — no nested modal chains
- PPDB verification: single-page split view (document + checklist), not 4-step wizard unless legally required
- CBT proctoring: minimal chrome during exam; no sidebar distractions

**Reject when**:
- Dashboard shows 12+ KPI tiles where 3 drive daily decisions
- User must remember context from a modal closed two steps ago
- Same data shown in table, chart, and card simultaneously

---

### 2. Navigation Complexity

**Question**: Can the user reach this page in ≤3 sidebar levels with RBAC clarity?

**Mandatory model** (from `memory/ui-ux-rules.md`):

```text
Domain → Module → Page   (max depth: 3)
```

| Domain | Example module | Example page |
|--------|----------------|--------------|
| PPDB | Pendaftaran | Verifikasi Dokumen |
| Finance | Tagihan | Daftar Tunggakan |
| Academic | Kelas | Absensi Harian |
| CBT | Ujian | Bank Soal |

**Pass criteria**:
- Page registered in nav config with `domain.resource.action` permission
- Breadcrumbs reflect sidebar path — no orphan routes
- No per-module custom sidebars

**Reject when**:
- Fourth-level flyout menus
- Hub dashboard that duplicates sidebar (click Finance tile to reach same list as sidebar)
- Deep links hidden behind "More" menus without search

**Mobile**: Desktop sidebar → drawer; bottom nav for top 4 daily tasks only. Do not invent per-module mobile nav.

---

### 3. Visual Hierarchy

**Question**: Does the eye flow title → context → primary action → supporting data?

| Element | Standard |
|---------|----------|
| Page shell | `PageShell` with title, description, actions slot |
| Typography | Inter; headings 600–700; body 400–500 |
| Color | Tokens from design system — Primary `#1D4ED8`, not random blues |
| Icons | **Phosphor Icons** only — semantic weight (Regular vs Bold for active nav) |
| Spacing | Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px |

**Reject when**:
- Rainbow status colors outside token map
- Mixed icon libraries (Lucide, Font Awesome — forbidden)
- Inconsistent card padding between modules
- Hero metrics larger than page title on operational pages

**References**: Stripe Dashboard, Linear, Notion, Carbon — calm density, not AdminLTE boxes.

---

### 4. Accessibility

**Question**: Can staff with varying ability and device complete the task?

| Requirement | Minimum |
|-------------|---------|
| Keyboard | All actions reachable; focus visible |
| Contrast | WCAG AA on text and controls |
| Forms | Labels associated; errors linked to fields |
| Tables | Sortable headers announced; row actions named |
| Modals | Focus trap; Esc closes; return focus on close |

**Teknovo-specific**:
- PPDB forms: long wizards need progress + save draft
- CBT: timer and submit must not rely on color alone
- Finance: currency formatted consistently (`Rp 1.234.567`)

**Reject when**:
- Icon-only buttons without `aria-label`
- Custom dropdowns without keyboard support
- PDF-only workflows with no on-screen alternative for verification

---

### 5. Mobile Usability

**Question**: Does the critical path work on a phone used by guru or orang tua?

| Context | Mobile priority |
|---------|-----------------|
| Absensi guru | High — often taken in classroom |
| PPDB status orang tua | High |
| Finance bulk import | Low — desktop only acceptable |
| CBT exam | Tablet-first; phone secondary |

**Pass criteria**:
- Touch targets ≥ 44px
- Tables degrade to cards or horizontal scroll with sticky first column
- Filters collapse to sheet — not 15 inline dropdowns

**Reject when**:
- Data tables with 10 columns on 375px width without adaptation
- Hover-only interactions
- Modal forms taller than viewport without scroll

---

## Five Page States (Mandatory)

Every new page must implement all five:

| State | UX requirement |
|-------|----------------|
| Loading | Skeleton matching layout — not generic spinner |
| Empty | Actionable CTA ("Buat tagihan pertama") |
| Error | Retry + support context; no raw stack traces |
| Success | Data + clear next step |
| Permission | Explain missing role; link to admin contact |

Missing any state is a **Major** defect — blocks ship.

---

## Anti-Patterns (Automatic Reject)

| Anti-pattern | Why |
|--------------|-----|
| Generic AI dashboard | Gradient hero, fake charts, "Welcome back" without task |
| Bootstrap / AdminLTE aesthetic | Box shadows, panel headers, glyphicon rows |
| Modal stacking | Confirm inside confirm inside form |
| Orphan settings pages | Not in sidebar IA |
| Lucide / FA icons | Violates design system |
| Custom module sidebar | Breaks RBAC nav consistency |

---

## UX Review Checklist (Quick)

Before UI implementation:

- [ ] IA path documented: Domain → Module → Page
- [ ] RBAC permission mapped to nav node
- [ ] Wireframe or component tree in plan
- [ ] All 5 page states specified
- [ ] Phosphor icon list per action
- [ ] Mobile path defined or explicitly desktop-only with rationale
- [ ] Cognitive load: single primary action identified

---

## Integration

| Artifact | Use |
|----------|-----|
| `memory/ui-ux-rules.md` | Tokens, sidebar, components |
| `quality/design-taste.md` | Visual quality bar |
| `quality/review-checklist.md` | Pre-ship UX section |
| `quality/quality-gates.md` | UX Review gate |
| `.agents/skills/teknovo-ui-ux-specialist/SKILL.md` | Pre-code UX architecture |
