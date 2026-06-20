# Spacing System

> **Related**: [layouts.md](./layouts.md) · [typography.md](./typography.md) · [components.md](./components.md)

Teknovo uses a **4px base grid**. All padding, margin, and gap values derive from the scale — no ad-hoc values like 13px or 27px.

---

## Spacing Scale

| Token | Value | Common use |
|-------|-------|------------|
| `space-1` | 4px | Icon-text gap, tight inline spacing |
| `space-2` | 8px | Compact list items, badge padding |
| `space-3` | 12px | Input internal padding, small gaps |
| `space-4` | 16px | Card padding (compact), form field gap |
| `space-6` | 24px | Card padding (default), section inner gap |
| `space-8` | 32px | PageShell content padding, form sections |
| `space-12` | 48px | Section vertical padding (ERP) |
| `space-16` | 64px | Large section breaks |
| `space-20` | 80px | Landing section padding (vertical) |
| `space-30` | 120px | Landing hero/major section padding |

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-30: 7.5rem;   /* 120px */
```

**ERP default range**: `space-1` through `space-16`.  
**Landing adds**: `space-20`, `space-30` for editorial breathing room.

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 8px | Badges, chips, small inputs |
| `radius-md` | 12px | Buttons, inputs, cards (default) |
| `radius-lg` | 16px | Modals, large cards |
| `radius-xl` | 24px | Landing feature cards (marketing only) |

**Rules**:
- No fully rounded (`rounded-full`) cards — pills for badges/avatars only
- ERP cards: `radius-md` consistently
- Don't mix 4px, 12px, and 24px on the same page

---

## Shadows

| Token | Use |
|-------|-----|
| `shadow-sm` | Cards — prefer border over shadow when possible |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Modals, drawers (floating layers only) |
| None | Sidebar, tables, page background |

**Rule**: One elevation level per view — not shadow on every panel.

---

## Page Margins & Containers

| Context | Max width | Horizontal padding |
|---------|-----------|-------------------|
| ERP PageShell content | Fluid (sidebar layout) | `space-8` (32px) desktop · `space-4` mobile |
| Landing container | **1280px** | `space-4` mobile · `space-8` tablet+ |
| Reading prose | **768px** | Inherited from section |
| Full-bleed hero | 100vw | Edge-to-edge image; text in container |

```css
.container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-8);
}

.prose {
  max-width: 768px;
}
```

---

## Component Spacing

| Component | Spacing rule |
|-----------|--------------|
| **Button** | Height 40px (ERP) · 48px (landing); padding-x `space-4`–`space-6` |
| **Input** | Height 40px (ERP) · 48px (landing); padding `space-3` horizontal |
| **Form fields** | Vertical gap `space-4`; section gap `space-8` |
| **Table cells** | Padding `space-3` vertical · `space-4` horizontal |
| **Card** | Padding `space-6`; gap between cards `space-4`–`space-6` |
| **PageHeader** | Margin bottom `space-6`; title-to-description `space-2` |
| **Sidebar item** | Padding-y `space-2`; padding-x `space-4`; gap to icon `space-3` |
| **Toolbar** | Gap between actions `space-2`; max 3 visible primaries |
| **Modal** | Padding `space-6`; footer gap `space-4` |

---

## Section Padding

### ERP

| Area | Padding |
|------|---------|
| PageShell content area | `space-8` all sides (desktop) |
| Dashboard grid gap | `space-6` |
| Between form sections | `space-8` + optional divider |
| Table to pagination | `space-4` |

### Landing

| Section | Vertical padding |
|---------|------------------|
| Standard section | `space-20` (80px) top/bottom |
| Hero | `space-30` (120px) or 90vh min-height |
| Compact (FAQ) | `space-16` |
| Footer | `space-12` internal |

Background alternation: no extra padding compensation — rhythm comes from consistent `space-20`.

---

## Responsive Breakpoints

| Name | Min width | Layout shifts |
|------|-----------|---------------|
| `mobile` | 0 | Single column; drawer nav; `space-4` page padding |
| `tablet` | 768px | Sidebar → drawer optional; 2-col grids |
| `desktop` | 1024px | Full sidebar; multi-column forms |
| `wide` | 1280px | Container max reached |

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

**Mobile baseline test**: 375×667 (iPhone SE). No horizontal overflow at 375px.

---

## Grid Gaps

| Layout | Column gap | Row gap |
|--------|------------|---------|
| ERP dashboard (≤4 cards) | `space-6` | `space-6` |
| Form 2-column desktop | `space-6` | `space-4` |
| Landing stats (4 col) | `space-6` | `space-6` |
| Landing programs (4 col) | `space-8` | `space-8` |

---

## Accessibility

- Touch targets ≥ **44×44px** — use padding, not just visual size
- Focus rings: 2px offset, don't reduce spacing to fit
- Scrollable regions: min padding `space-4` so content doesn't clip under scrollbar

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| `p-[13px]`, `gap-5` arbitrary | Scale tokens only |
| Cramped 4px card padding | Minimum `space-4` for interactive areas |
| Inconsistent card padding across modules | `space-6` default everywhere |
| 8+ KPI cards with `space-2` gaps | ≤4 cards with `space-6` |
