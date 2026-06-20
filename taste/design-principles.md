# Visual Taste — Teknovo Taste System

> **Layer**: Taste (judgement & restraint) — precedes `quality/design-taste.md`  
> **Role**: Design director filter on *how it looks* — calm, dense, credible  
> **North stars**: Stripe, Linear, Notion, Carbon — not template marketplaces

---

## Purpose

Visual taste protects Teknovo from **AI-generated admin slop**: purple gradients, glassmorphism cards, chart walls, and icon soup that signal "prototype," not "system schools trust with student data."

School admins judge credibility in seconds. Finance officers must read numbers for hours. **Restraint is professionalism.**

---

## Reject: Visual Anti-Patterns

### Generic AI dashboards

| Signal | Example | Verdict |
|--------|---------|---------|
| Gradient hero | Purple-blue banner "Selamat datang, Admin!" | Remove — use plain title |
| KPI card grid (6+) | Cards with ↑12% sparklines on every page | Max 4 on Beranda; rest in lists |
| "AI Insights" panel | Chat bubble suggesting obvious actions | Reject unless real ML product |
| Stock illustration | Undraw-style empty states | Simple icon + one line copy |
| Random chart types | Pie + donut + radar for same dataset | One appropriate chart or table |

### Bootstrap / AdminLTE heritage

- Heavy bordered boxes, `$primary` blue everywhere, glyphicon-style clutter.
- **Teknovo uses**: shadcn/ui + Radix + Tailwind tokens — not Bootstrap components.

### Gradient overload

- No gradient backgrounds on content areas.
- Logo/wordmark only may use brand gradient; UI chrome stays flat.
- Chart fills: solid or single-hue opacity steps — not rainbow.

### Shadow overload

| Element | Shadow |
|---------|--------|
| Sidebar | None or hairline border |
| Cards | `shadow-sm` max; prefer border |
| Modals/drawers | Elevated — only floating layer |
| Tables | None — zebra or border only |

### Card / chart / color overload

**One screen, one visual job:**

- List page → table dominates; filters quiet.
- Detail page → metadata grid + tabs; no sidebar chart junk.
- Dashboard → ≤4 metrics + 1 optional chart + quick links.

**Color semantics** (from design system):

- Primary: actions only
- Destructive: delete/void
- Muted: secondary text, borders
- Success/warning: status badges — not full row backgrounds

Never use color as decoration.

---

## Prefer: Teknovo Visual Language

### Reference aesthetic

| Reference | Borrow |
|-----------|--------|
| **Stripe Dashboard** | Typographic hierarchy, whitespace, confident emptiness |
| **Linear** | Speed, keyboard-first density, minimal chrome |
| **Notion** | Content-forward, subtle borders, calm sidebar |
| **Carbon (IBM)** | Data-dense tables, enterprise gravitas |

### Teknovo tokens (non-negotiable)

| Token | Rule |
|-------|------|
| **Icons** | Phosphor (`@phosphor-icons/vue`) — regular weight default; bold for active nav only |
| **Sidebar** | Collapsible; school logo top; module groups; user menu bottom |
| **Typography** | System scale from design contract — no ad-hoc `text-2xl` on body pages |
| **Radius** | Consistent `rounded-md` — not mixed pill + square |
| **Spacing** | 4px grid; PageShell padding from layout contract |

### Data density without clutter

```text
Good table row:
[NIS] [Nama siswa] [Kelas] [Status badge] [⋯]

Bad table row:
[Avatar] [Nama + email + phone stacked] [3 badges] [mini chart] [4 icon buttons]
```

### Beranda (home) taste

For authenticated admin:

1. **Greeting line** — plain text, no banner.
2. **≤4 stat tiles** — only metrics that drive action (tunggakan, PPDB menunggu, absensi hari ini).
3. **Quick actions** — text links or compact buttons, not card grid.
4. **Recent activity** — optional single list; no social feed aesthetic.

### Empty states

- One Phosphor icon (48px, muted)
- One sentence Bahasa Indonesia, human tone
- One primary CTA
- No illustration library characters

---

## Module-Specific Visual Rules

### PPDB

- Status pipeline: horizontal stepper on detail only — not full-page funnel graphic.
- Document thumbnails: grid with clear file type icon — not carousel.

### Finance

- Amounts: tabular nums, right-aligned, Rp prefix consistent.
- Never red/green entire rows — badge for status only.

### CBT

- Exam UI: maximum focus — no sidebar during attempt; timer visible, calm contrast.
- Question nav: numbered pills, not fancy progress ring.

### Reports / PDF

- Screen preview matches print — no dark-mode-only report that prints broken.

---

## AI-Ish Detection Checklist

Flag design as **AI-ish** (block UI implementation) if ≥2 true:

- [ ] Gradient header or card background
- [ ] More than 4 KPI cards above fold
- [ ] Chart without labeled axes / accessible table alternative
- [ ] Icon per table row without functional reason
- [ ] "Powered by AI" or sparkle emoji in admin UI
- [ ] Inter font + purple palette + rounded-2xl everything (generic stack)
- [ ] Modal wizard where PageShell form suffices

Invoke `teknovo-chief-product-designer` for AI-ish score review.

---

## Cross-References

| Document | Relationship |
|----------|--------------|
| `quality/design-taste.md` | Formal design quality bar |
| `memory/ui-ux-rules.md` | Component and token specs |
| `taste/ux-principles.md` | Layout and flow restraint |
| `.agents/skills/teknovo-ui-ux/SKILL.md` | Implementation standards |
| `taste/taste-gates.md` | Gate 3 — Visual Taste |

---

## Design Director Sign-Off

Visual taste passes when:

- [ ] No rejected anti-patterns present in mockup or implementation
- [ ] Phosphor icons only; sidebar matches contract
- [ ] ≤4 metrics on dashboard views
- [ ] Tables preferred over card grids for ERP data
- [ ] Screenshot could plausibly be mistaken for Stripe/Linear-tier product — not ThemeForest

**Beauty in ERP is invisible UI — users notice the work, not the chrome.**
