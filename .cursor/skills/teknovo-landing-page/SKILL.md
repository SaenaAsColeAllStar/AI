---
name: teknovo-landing-page
description: >-
  Design, implement, and review Teknovo public school landing pages — section
  wireframe, PPDB conversion funnel, Geist/Inter typography, performance budgets,
  SEO, and mobile sticky CTA. Use for marketing sites, PPDB season pages,
  school homepages, or public-facing conversion surfaces.
---

# Teknovo Landing Page

**Scope**: Public marketing surfaces only — not authenticated ERP dashboards. Strategic narrative review → **teknovo-ux-architecture**. Tokens → **teknovo-design-system**.

## Brand Personality

**Professional, Modern, Educational, Trustworthy, Technology-Oriented.**

**Reject**: Corporate cold · crypto/web3 · over-hyped startup templates · AI-generated faces · glassmorphism overload.

## Section Sequence (Mandatory Order)

1. **Navbar** — sticky 80px; logo; Beranda, Profil, Akademik, Kesiswaan, Fasilitas, Berita, PPDB, Kontak; Portal dropdown; PPDB CTA; mobile drawer
2. **Hero** — 90vh; desktop 50/50 text/image; CTA above fold; mobile stack text-first; no Lottie; hero image ≤300KB
3. **School Overview** — stats grid (4/2/1 cols)
4. **Programs** — TKJ, RPL, TBSM, TKRO cards with bottom CTA (4/2/1)
5. **Advantages** — value props (3×2 / 2×3 / vertical)
6. **Facilities** — masonry / 2 col / horizontal scroll
7. **Achievements** — alternating timeline / vertical mobile
8. **News** — title max 2 lines, desc max 3 lines (3/2/1)
9. **Testimonials** — carousel, quote max 4 lines (3/2/1 visible)
10. **PPDB CTA** — 500px banner; blue bg; timeline; requirements; Register Now
11. **FAQ** — accordion, single open, 200ms (2 col desktop / 1 mobile)
12. **Footer** — 4 cols; Neutral 900 bg; Neutral 100 text

Background rhythm: White ↔ Neutral 50 alternating.

## Typography & Tokens

See **teknovo-design-system** for landing color scale. Headings: Geist 600–800. Body: Inter 400–600.

## Buttons & Forms

- Button height 48px, radius 12px
- **One primary CTA per section** — no competing click targets
- Form inputs 48px height; labels always visible (placeholders ≠ labels)
- Real-time inline validation

## Mobile UX

- **Sticky bottom PPDB CTA** — "Daftar PPDB", min 56px height
- Tap targets ≥44px
- Desktop menu hidden; navigation drawer required

## Performance Budgets

| Metric | Target |
|--------|--------|
| Lighthouse | >95 mobile + desktop |
| LCP | <2s |
| CLS | <0.1 |
| INP | <200ms |

Images: WebP/AVIF; lazy load except hero. Icons: Phosphor with tree-shaking — no Lucide.

## SEO & Analytics

Open Graph meta · JSON-LD schema · sitemap · robots.txt. Track: PPDB buttons, Portal links, contact CTAs, program views.

## Accessibility (WCAG AA)

Contrast ≥4.5:1 · keyboard focus visible · `aria-label` / `aria-describedby` on controls.

## Strategic Review (Before Build)

Run **teknovo-ux-architecture** landing review:

- School-specific hero — not "Welcome to the Future of Education"
- Real stats/testimonials — not placeholder numbers
- Single CTA per section
- AI-ish score ≤40

## Implementation Checklist

- [ ] Section sequence matches wireframe
- [ ] White/Neutral 50 alternation
- [ ] One primary CTA per section
- [ ] Mobile sticky PPDB banner
- [ ] Performance budgets met
- [ ] Phosphor icons only
- [ ] SEO meta + schema present

## References

- `docs/prd/ui-ux/landing-page-prd.md` (if exists)
- `docs/standards/design-system/design-system-contract.md`
