# Anti-Patterns

> **Related**: [brand.md](./brand.md) · [colors.md](./colors.md) · [layouts.md](./layouts.md) · [components.md](./components.md)

This document defines what Teknovo **rejects** — the "AI-ish" aesthetic, template marketplace patterns, and UX decisions that erode trust with schools. Use as a gate before UI implementation and during design review.

---

## AI-Ish Detection Gate

Score **0–100** (higher = more generic). **Must be ≤40 before UI handoff.**

| Band | Score | Action |
|------|-------|--------|
| Excellent | 0–20 | Proceed |
| Good | 21–40 | Proceed with notes |
| Redesign | 41–60 | Revise before code |
| Block | 61–80 | Stop — rework IA/visual |
| Reject | 81–100 | Full redesign |

### Quick Block Rule

**Block UI if ≥2 true** from this checklist:

- [ ] Gradient header or card background
- [ ] More than 4 KPI cards above fold
- [ ] Chart without labeled axes / accessible table alternative
- [ ] Icon per table row without functional reason
- [ ] "Powered by AI" or sparkle branding in admin UI
- [ ] Inter + purple palette + rounded-2xl everything (generic AI stack)
- [ ] Modal wizard where PageShell form suffices
- [ ] Dashboard-style widget grid on public landing page
- [ ] Glassmorphism (blurred panels, neon borders)
- [ ] Generic hero copy ("Welcome to the Future of Education")

Full scoring framework: `.cursor/skills/teknovo-ux-architecture/reference.md`

---

## Forbidden Visual Patterns

### Gradient Overload

| DON'T | DO |
|-------|-----|
| Purple-blue gradient hero "Selamat datang, Admin!" | Plain PageShell title + description |
| Gradient card backgrounds | Flat `color-card` + `color-border` |
| Rainbow chart fills | Solid or single-hue opacity steps |
| Animated gradient backgrounds | Static `color-background` |

**Exception**: Logo/wordmark brand gradient only — never on UI chrome.

### Glassmorphism & Neon

| DON'T | DO |
|-------|-----|
| `backdrop-blur` content panels | Opaque surfaces |
| Neon border glow on cards | 1px `color-border` |
| Frosted floating sidebars | Solid sidebar with hairline border |
| Holographic button effects | Standard primary button |

### KPI & Card Spam

| DON'T | DO |
|-------|-----|
| 6–8 stat cards above fold with ↑12% sparklines | ≤4 metrics on Beranda that drive action |
| Same metric in card + chart + table | One visual job per screen |
| Vanity metrics with no daily action | Tunggakan, PPDB menunggu, absensi hari ini |
| Card grid for siswa/tagihan lists | Data table with row actions |

### Generic Hero & Marketing

| DON'T | DO |
|-------|-----|
| "Welcome to the Future of Education" | School name + specific value proposition |
| Stock AI-generated faces | Real school photography |
| 3-column identical icon feature grid | Editorial section with story + evidence |
| Dashboard preview as landing hero | 50/50 text + school image; PPDB CTA |
| Lottie autoplay background | Static optimized hero image ≤300KB |

### Shadow & Border Overload

| DON'T | DO |
|-------|-----|
| Heavy shadow on every panel | Border preferred; `shadow-sm` max on cards |
| Sidebar with deep shadow | Border only |
| AdminLTE "boxed" colored headers | Flat PageShell header |
| Zebra rainbow rows | Status badge only |

---

## Forbidden UX Patterns

### Navigation

| DON'T | DO |
|-------|-----|
| Per-module custom sidebar | Global domain sidebar |
| Locked nav items teasing access | Hide items user can't access |
| 4+ level deep flyouts | Max 3: Domain → Module → Page |
| Duplicate paths (sidebar + dashboard tile) | One canonical path per feature |
| "Laporan" in two modules unqualified | "Laporan Keuangan", "Laporan Akademik" |

### Modals & Flows

| DON'T | DO |
|-------|-----|
| Multi-step wizard in modal that scrolls | Dedicated PageShell page |
| Confirm inside confirm inside form | Single confirm for destructive |
| Modal for document preview | Side panel or full page |
| 5-click path to daily absensi | Akademik → Absensi → mark present |

### Empty & Error States

| DON'T | DO |
|-------|-----|
| 8 empty dashboard widgets | One empty state + one CTA |
| Undraw illustration characters | Phosphor icon 48px + one line |
| "Loading…" alone on full page | "Memuat data siswa…" + skeleton |
| Raw `Error 500` to staff | "Gagal menyimpan. Periksa koneksi lalu coba lagi." |
| Toast-only permission denial | Full Permission page state |

---

## Forbidden Libraries & Icons

| Category | Forbidden | Approved |
|----------|-----------|----------|
| Icons | Lucide, Font Awesome, Bootstrap Icons, glyphicons | Phosphor, Tabler |
| UI framework | Bootstrap, AdminLTE, Ant Design, Material UI | shadcn/ui + Radix |
| Mixed icon sets | Lucide nav + Phosphor buttons | Phosphor throughout |

---

## Forbidden Copy Patterns

| DON'T | DO |
|-------|-----|
| "Leverage insights to optimize workflows" | "Catat pembayaran siswa" |
| "Smart dashboard" | Name what it shows |
| "AI-powered" (unless real ML) | Explain the actual feature |
| "Selamat datang di dashboard intuitif Anda!" | Plain greeting or skip |
| Emoji bullets in admin settings | Prose labels |
| `UNPAID` in UI | "Belum bayar" |

---

## ERP-Specific Anti-Patterns

### Beranda (Dashboard)

```text
DON'T:
┌─────────────────────────────────────────────┐
│ 🌈 Gradient "Welcome back, Admin!" banner   │
├──────┬──────┬──────┬──────┬──────┬──────┤
│ KPI  │ KPI  │ KPI  │ KPI  │ KPI  │ KPI  │
├──────┴──────┴──────┴──────┴──────┴──────┤
│ 📊 Chart wall (pie + donut + line)        │
└─────────────────────────────────────────────┘

DO:
┌─────────────────────────────────────────────┐
│ Beranda                                     │
│ Selasa, 20 Jun 2026                         │
├──────┬──────┬──────┬──────┐
│ PPDB │Tunggk│Absen │ WA   │  ← max 4, real data
├──────┴──────┴──────┴──────┤
│ Aktivitas terbaru (list)  │
│ Tindakan cepat (links)    │
└─────────────────────────────────────────────┘
```

### Data Tables

```text
DON'T: [Avatar] [Name+email+phone] [3 badges] [mini chart] [4 icons]

DO:   [NIS] [Nama siswa] [Kelas] [Status badge] [⋯]
```

### Finance

| DON'T | DO |
|-------|-----|
| Red/green entire rows | Status badge only |
| Playful coin icons | Tabular nums, `Rp 1.234.567` |
| Chart without export | Table + PDF/CSV export |

---

## Landing-Specific Anti-Patterns

| DON'T | DO |
|-------|-----|
| ERP dashboard screenshot as hero | Editorial 50/50 hero |
| Fake stats (1000+ siswa when new school) | Real or omit until available |
| Multiple competing CTAs per section | One primary CTA |
| Crypto/web3 dark gradient aesthetic | White/Slate 50 rhythm |
| Auto-playing video background | Optimized static image |
| Missing mobile PPDB sticky CTA | 56px sticky "Daftar PPDB" |

---

## Module Anti-Patterns

| Module | DON'T | DO |
|--------|-------|-----|
| **PPDB** | Full-page funnel graphic | Stepper on detail only |
| **PPDB** | Document carousel | Thumbnail grid with file type icon |
| **CBT** | Sidebar during exam | Full-screen focus mode |
| **CBT** | Fancy progress ring | Numbered question pills |
| **Reports** | Dark-mode-only preview | Screen matches print (light) |
| **Communication** | Send without preview | WA template preview |

---

## Bootstrap / AdminLTE Heritage

Automatic fail if present:

- `#337ab7` primary buttons
- Heavy bordered "boxes" with colored headers
- Glyphicon-style icon clutter
- Striped tables with semantic meaning absent
- Collapsed panel accordions for primary navigation

Teknovo uses **shadcn/ui + Tailwind tokens** — not Bootstrap components.

---

## Design Review Questions

Before approving any surface:

1. Would this belong in Stripe/Linear — or a ThemeForest admin bundle?
2. Can a bendahara complete the task in one glance?
3. Is every color semantic — not decorative?
4. Does removing one element improve clarity? **Remove it.**
5. Is Phosphor used with Regular/Bold rules only?
6. Are all 5 page states designed? ([components.md](./components.md))
7. AI-ish score ≤40?

---

## Sign-Off Checklist

Visual taste passes when:

- [ ] No rejected anti-patterns in mockup or implementation
- [ ] Phosphor icons only; sidebar matches [layouts.md](./layouts.md)
- [ ] ≤4 metrics on dashboard views
- [ ] Tables preferred over card grids for ERP data
- [ ] No forbidden libraries
- [ ] Screenshot could plausibly be mistaken for Stripe/Linear-tier — not ThemeForest
- [ ] Copy reviewed — no jargon or AI fluff in admin UI

**Beauty in ERP is invisible UI — users notice the work, not the chrome.**

---

## Cross-References

- Taste gate: `.cursor/gates/taste/design-principles.md`
- UX taste: `.cursor/gates/taste/ux-principles.md`
- Copy taste: `.cursor/gates/taste/copywriting-principles.md`
- Quality bar: `.cursor/gates/quality/design-taste.md`
- AI-ish scoring: `.cursor/skills/teknovo-ux-architecture/SKILL.md`
