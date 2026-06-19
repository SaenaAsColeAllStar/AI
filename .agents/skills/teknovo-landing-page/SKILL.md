---
name: teknovo-landing-page
description: Design, implement, and review the public-facing school Landing Page (marketing website, information portal, and conversion funnel) in compliance with its visual identity, typography, performance limits, and wireframe constraints.
---

# Teknovo Landing Page Standard Skill

Use this skill when designing, building, modifying, or reviewing the public-facing Landing Page (marketing website, info portal, and conversion funnel) of the Teknovo ERP Platform to ensure absolute fidelity to the design system, wireframe grid, and performance rules.

## 1. Visual Language & Brand Personality
The Landing Page represents the public face of the school. It must feel **Professional, Modern, Educational, Trustworthy, and Technology-Oriented**.
* **Strictly Avoid**:
  * Corporate cold or sterile feeling.
  * Crypto/web3 styles.
  * Over-hyped startup templates.
  * Visually obvious AI-generated graphics or faces.
  * Overuse of glassmorphism.
* **Background Section Alternation**: Sections must follow a visual rhythm:
  `White` (Section N) ➔ `Neutral 50` (Section N+1) ➔ `White` (Section N+2) ➔ `Neutral 50` (Section N+3)

---

## 2. Design Tokens & Systems

### 2.1. Color System (Landing Page Specific)
* **Primary Blue**: `#2563EB` (Primary Hover: `#1D4ED8`, Primary Soft: `#DBEAFE`)
* **Secondary Slate**: `#334155`
* **Accent Sky**: `#0EA5E9` (Sky 500)
* **Status**: Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`
* **Neutrals (Slate series)**:
  * Neutral 50: `#F8FAFC`
  * Neutral 100: `#F1F5F9`
  * Neutral 200: `#E2E8F0`
  * Neutral 300: `#CBD5E1`
  * Neutral 500: `#64748B`
  * Neutral 700: `#334155`
  * Neutral 900: `#0F172A`

### 2.2. Typography & Hierarchy
* **Headings**: `Geist` font (Weights: 600, 700, 800)
* **Body**: `Inter` font (Weights: 400, 500, 600)
* **Fallback**: `system-ui`
* **Type Scale**:
  * Display: `64px` | H1: `48px` | H2: `36px` | H3: `30px` | H4: `24px`
  * Body Large: `18px` | Body: `16px` | Small: `14px` | Caption: `12px`

### 2.3. Spacing, Borders & Shadows
* **Spacing**: 8px Base Unit. Only allowed padding/margin values: `4, 8, 12, 16, 24, 32, 48, 64, 80, 120`.
* **Border Radius**: Small `8px`, Medium `12px`, Large `16px`, Extra Large `24px`. No fully rounded cards or elements.
* **Container**: Max width `1280px` for standard elements; reading/text-heavy content max width `768px`.
* **Shadows**: SM for standard Cards, MD for Dropdowns, LG for Modals. Avoid heavy shadows.

---

## 3. Structural Wireframe & Components

### 3.1. Page Sequence
The Landing Page must follow this exact section flow:
1. **Navbar**: Sticky (80px height), logo, menu (Beranda, Profil, Akademik, Kesiswaan, Fasilitas, Berita, PPDB, Kontak), Portal Dropdown, and PPDB CTA button. Mobile opens drawer nav.
2. **Hero Section**: 90vh height. Desktop: 50/50 layout (Text Left, Image Right). CTA buttons must reside *above the fold*. Mobile: Stack layout (Text First, Image Second). No Lottie animations. Hero Image max size: 300KB.
3. **School Overview**: Statistics grid showing key school metrics. Desktop (4 cols), Tablet (2 cols), Mobile (1 col).
4. **Programs**: Major showcases (TKJ, RPL, TBSM, TKRO). Card Grid. Title, description, and Bottom CTA. Desktop (4 cols), Tablet (2 cols), Mobile (1 col).
5. **Advantages**: Value propositions. Desktop (3x2 Grid), Tablet (2x3 Grid), Mobile (Vertical list).
6. **Facilities**: School facilities showcase. Desktop (Masonry Grid), Tablet (2 cols), Mobile (Horizontal scroll).
7. **Achievements**: School & student timeline. Desktop (Alternating timeline), Mobile (Single vertical line).
8. **News**: Articles and announcements. Desktop (3 cols), Tablet (2 cols), Mobile (1 col). News title max 2 lines, description max 3 lines.
9. **Testimonials**: Quotes carousel. Desktop (3 visible), Tablet (2 visible), Mobile (1 visible). Quotes max 4 lines.
10. **PPDB CTA**: Conversion banner (500px height desktop). Blue background, registration status, timeline, requirements, and main "Register Now" button.
11. **FAQ**: Accordion (single item open behavior, 200ms animation). Desktop (2 cols), Tablet/Mobile (1 col).
12. **Footer**: 4 columns (School Info, Programs, Quick Links, Contact). Neutral 900 background, text Neutral 100, links Neutral 300.

### 3.2. Form and Buttons
* **Buttons**: Height `48px`, border-radius `12px`. Only **one** primary CTA button per section to avoid competing click targets.
* **Forms**: Input height `48px`, border-radius `12px`. Form labels must always be visible; placeholders must not replace labels. Implement real-time inline validation.

---

## 4. Mobile UX Rules
* **Sticky Bottom PPDB CTA**: On mobile viewports, a sticky bottom CTA banner labeled "Daftar PPDB" is mandatory. Minimum height: `56px`.
* **Tap Targets**: All interactive elements (buttons, links, form inputs) must have a minimum tap target size of `44px`.
* **Mobile Menu**: Desktop sidebar/menus must be hidden. The mobile menu must render as a Navigation Drawer.

---

## 5. Performance, SEO, and Accessibility

### 5.1. Performance Budgets
* Lighthouse Score: **> 95** on mobile and desktop.
* Largest Contentful Paint (LCP): **< 2s**.
* Cumulative Layout Shift (CLS): **< 0.1**.
* Interaction to Next Paint (INP): **< 200ms**.
* Images: Use WebP/AVIF formats, lazy load all images except the main Hero image.
* Icons: Ensure tree-shaking is active. Avoid Lucide icons to differentiate from stock AI-generated look.

### 5.2. SEO & Analytics
* **SEO requirements**: Valid Open Graph meta tags, structured schema JSON-LD, sitemap, and robots.txt.
* **Click tracking**: Instrument event clicks on the PPDB buttons, Portal links, contact CTAs, and program views.

### 5.3. Accessibility (WCAG AA)
* Color contrast ratio must meet minimum `4.5:1` criteria.
* Full keyboard tab navigation focus states must be visible.
* Proper screen reader labels (`aria-label`, `aria-describedby`) for all buttons and interactive controls.
