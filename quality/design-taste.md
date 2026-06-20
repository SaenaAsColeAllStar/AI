# Design Taste System — Teknovo Impeccable Architect

> **Purpose**: Elevate Teknovo above generic admin templates and AI-generated dashboards  
> **North stars**: Stripe Dashboard · Linear · Notion · Carbon Design System

---

## Taste Definition

Design taste is the consistent judgment that makes Teknovo feel **purpose-built for schools**, not assembled from a template marketplace. Taste is not decoration — it is ** restraint**, **hierarchy**, and **domain-appropriate density**.

---

## Avoid (Automatic Fail)

### Generic AI Dashboard Aesthetic

| Symptom | Example |
|---------|---------|
| Gradient hero banners | Purple-blue "Welcome back, Admin!" |
| Meaningless KPI grid | 8 stat cards with no daily action |
| Fake charts | Placeholder graphs with lorem data |
| Glassmorphism overload | Blurred panels, neon borders |
| Robotic copy | "Leverage insights to optimize workflows" |

**Teknovo ERP is operational software.** The home view should surface **tasks** (12 PPDB pending verification, 3 tunggakan > 30 hari), not vanity metrics.

### Bootstrap / AdminLTE Heritage

- Heavy box shadows on every panel
- `#337ab7` primary buttons
- Glyphicon / mixed icon sets
- Collapsed "boxes" with colored headers
- Table striped rainbow without semantic meaning

### Random Visual Decisions

| Violation | Correct approach |
|-----------|------------------|
| Random hex colors per module | Design tokens only (`memory/ui-ux-rules.md`) |
| Inconsistent border-radius (4px vs 12px vs 24px) | shadcn/ui defaults + token scale |
| Ad-hoc spacing (13px, 27px) | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 |
| Mixed icon weights/styles | Phosphor Regular default; Bold for active nav |

---

## Prefer (Teknovo Standard)

### Stripe — Financial Clarity

Apply to **Finance** module:

- Clear monetary formatting (`Rp 1.234.567`)
- Status pills: Lunas (success), Pending (warning), Batal (neutral)
- Table-first layouts for tagihan and kuitansi
- Detail panels slide or route — not modal maze

### Linear — Speed and Density

Apply to **daily admin tasks**:

- Keyboard-friendly tables
- Inline filters with instant feedback
- Subtle borders, minimal chrome
- Fast empty states with single CTA

### Notion — Content Hierarchy

Apply to **PPDB forms and documentation**:

- Clear heading levels
- Grouped fields with section descriptions
- Progressive disclosure for optional fields
- Readable line length on long forms

### Carbon — Enterprise Accessibility

Apply to **accessibility and data-heavy views**:

- Predictable components (DataTable, Modal, Notification)
- High contrast modes respected
- Consistent action placement (primary top-right in PageShell)

---

## Module-Specific Taste Notes

| Module | Taste priority |
|--------|----------------|
| PPDB | Trust and clarity — document preview, verification checklist |
| Finance | Auditability — no playful colors on money |
| CBT | Focus — minimal UI during exam; high contrast timer |
| Academic | Calendar and schedule readability |
| Communication | Template preview before WA blast |
| Reporting | Chart only when trend matters; table export always available |

---

## Component Selection

| Use | Library |
|-----|---------|
| ERP dashboard components | shadcn/ui + Radix |
| Landing / marketing | Aceternity UI (public only) |
| Motion | Magic UI — subtle, not distracting |
| Icons | **Phosphor** — never Lucide, FA, Bootstrap Icons |

---

## Layout Contract

```text
┌──────────────────────────────────────────┐
│ App shell: sidebar (domains) + top bar   │
├──────────┬───────────────────────────────┤
│ Sidebar  │ PageShell                     │
│ (RBAC)   │  Title + description + actions│
│          │  Content (cards, tables)      │
└──────────┴───────────────────────────────┘
```

- **No** full-width gradient headers inside PageShell
- **No** second sidebar inside module
- Breadcrumbs: Home → Domain → Module → Page

---

## AI-ish Design Detection Score

Rate 0–3 per row; **total ≥ 6 requires UX rework**:

| Criterion | 0 = good | 3 = AI slop |
|-----------|----------|-------------|
| KPI/card overload | Task-focused | Vanity metrics |
| Color discipline | Tokens only | Rainbow |
| Copy | Bahasa operasional sekolah | Generic English buzzwords |
| Icon consistency | Phosphor only | Mixed sets |
| Navigation | Sidebar IA | Mystery meat menus |
| Data honesty | Real empty states | Fake chart placeholders |

Invoke `teknovo-chief-product-designer` when score ≥ 6.

---

## Review Questions

Before approving UI:

1. Would this screen belong in Stripe/Linear — or in a ThemeForest admin bundle?
2. Can a bendahara complete the task in one glance?
3. Is every color semantic (status, action) not decorative?
4. Does removing one element improve clarity? Remove it.
5. Is Phosphor used consistently with Regular/Bold rules?

---

## Related Artifacts

- `quality/ux-principles.md` — cognitive load, IA, a11y
- `memory/ui-ux-rules.md` — tokens, spacing, forbidden libraries
- `quality/review-checklist.md` — UX section
- `.agents/skills/teknovo-ui-ux/SKILL.md` — implementation standards
