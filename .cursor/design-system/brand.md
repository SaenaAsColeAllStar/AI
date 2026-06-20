# Brand Identity

> **Related**: [colors.md](./colors.md) · [typography.md](./typography.md) · [layouts.md](./layouts.md) · [anti-patterns.md](./anti-patterns.md)

Teknovo serves **Indonesian schools** — administrators, teachers, finance officers, and parents — with software that feels as credible as the institutions it supports. The brand is **premium educational institution**, not generic SaaS.

---

## Positioning

| Attribute | Expression |
|-----------|------------|
| **Professional** | Calm, dense, audit-ready ERP; no startup hype |
| **Modern** | Stripe/Linear-tier polish; current typography and spacing |
| **Educational** | School-familiar language (PPDB, Keuangan, Absensi) |
| **Trustworthy** | Real data, honest empty states, document clarity for PPDB |
| **Technology-oriented** | Efficient tools — technology invisible until it saves time |

**Audience**: Kepala sekolah, tata usaha, bendahara, guru, orang tua — varied digital literacy. Copy is Bahasa Indonesia in UI; English for API and developer docs only.

---

## Visual North Stars

Borrow **judgment and restraint**, not pixels. Each reference informs a different layer:

| Reference | Borrow | Apply to |
|-----------|--------|----------|
| **Apple** | Editorial whitespace, product storytelling, confident typography | Landing hero, school profile sections |
| **Stripe** | Financial clarity, typographic hierarchy, tabular data | Finance module, payment flows |
| **Linear** | Speed, keyboard-first density, minimal chrome | Daily admin tables, filters |
| **Vercel** | Clean developer-grade surfaces, precise spacing | ERP shell, settings |
| **Framer** | Purposeful motion, section rhythm on marketing | Landing scroll experience |

Secondary references (ERP density): **Notion** (content hierarchy, forms), **Carbon** (enterprise accessibility, data tables).

**Reject**: ThemeForest admin bundles, crypto/web3 aesthetic, over-hyped startup templates, AI-generated stock imagery.

---

## Two Surfaces, One Brand

Teknovo has two distinct UI contexts with shared tokens but different **tone and density**.

### ERP Portal (Authenticated)

| Dimension | Standard |
|-----------|----------|
| **Tone** | Operational, instructive — task + outcome copy |
| **Layout** | [PageShell](./layouts.md#erp-pageshell) — sidebar + content |
| **Density** | High — tables, filters, ≤7 visible decisions |
| **Color** | ERP primary `#1D4ED8` — semantic only ([colors.md](./colors.md)) |
| **Typography** | Inter throughout |
| **Decoration** | None — no hero bands, gradients, or KPI walls |

**Goal**: Users notice the work, not the chrome. Beauty in ERP is invisible UI.

### Public Landing (Marketing)

| Dimension | Standard |
|-----------|----------|
| **Tone** | Persuasive but honest — school-specific narrative |
| **Layout** | Editorial sections — storytelling scroll ([layouts.md](./layouts.md#landing-editorial-sections)) |
| **Density** | Lower — one primary CTA per section |
| **Color** | Landing primary `#2563EB` — section rhythm white/neutral |
| **Typography** | Geist headings + Inter body |
| **Decoration** | Photography, stats, timeline — not dashboard widgets |

**Goal**: Trust and PPDB conversion in under 5 seconds of scanning.

---

## Logo & Color Usage

| Rule | Detail |
|------|--------|
| **Logo placement** | Sidebar top (ERP); navbar left (landing), min clear space = logo height × 0.5 |
| **Logo on dark** | Use light/wordmark variant on Neutral 900 footer |
| **Brand gradient** | Logo/wordmark only — never on UI chrome or content areas |
| **School co-branding** | School logo alongside Teknovo in portal header; landing hero may feature school crest |
| **Favicon** | Teknovo mark; school subdomain may override for public site |

Do not stretch, recolor, or place logo on busy photography without scrim.

---

## Voice & Copy Principles

Consolidated from taste and copywriting gates. Full microcopy patterns live in `.cursor/gates/taste/copywriting-principles.md`.

### ERP (Instruct)

- **Verb-first buttons**: Simpan, Tambah siswa, Verifikasi dokumen
- **Human status labels**: Lunas, Menunggu verifikasi — not `UNPAID`
- **Calm errors**: Problem + next step — never raw error codes
- **Avoid**: "powerful", "seamless", "AI-powered", "Selamat datang di dashboard intuitif Anda!"

### Landing (Persuade)

- School-specific hero — not "Welcome to the Future of Education"
- Real stats and testimonials — no placeholder numbers
- One primary CTA per section
- Formal Indonesian for announcements; warm but clear for parents

| Context | Example |
|---------|---------|
| ERP empty state | "Belum ada tagihan bulan ini." CTA: **Buat tagihan** |
| Landing PPDB CTA | "Daftar PPDB 2026" — deadline and requirements visible |

---

## Module Brand Expression

Visual priority varies by domain — tokens stay constant; emphasis shifts.

| Module | Brand priority |
|--------|----------------|
| **PPDB** | Trust — document preview, verification clarity |
| **Finance** | Auditability — no playful money colors |
| **CBT** | Focus — minimal chrome during exam |
| **Academic** | Schedule readability, calm calendars |
| **Communication** | Template preview before WA blast |
| **Reporting** | Screen matches print |

---

## Design Director Checklist

Before any surface ships:

- [ ] Could this plausibly sit beside Apple/Stripe/Linear — not ThemeForest?
- [ ] ERP: no decorative hero; landing: no dashboard-style widget grid
- [ ] Copy reviewed in Indonesian for user-visible strings
- [ ] AI-ish score ≤ 40 ([anti-patterns.md](./anti-patterns.md))
- [ ] Phosphor icons only; shadcn/ui + Radix for ERP components

---

## Cross-References

- Agent skill: `.cursor/skills/teknovo-design-system/SKILL.md`
- Taste gate: `.cursor/gates/taste/design-principles.md`
- Landing wireframe: `.cursor/skills/teknovo-landing-page/SKILL.md`
- Product gate: `.cursor/skills/teknovo-ux-architecture/SKILL.md`
