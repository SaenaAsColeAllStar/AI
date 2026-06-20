# Motion

> **Related**: [components.md](./components.md) · [spacing.md](./spacing.md) · [anti-patterns.md](./anti-patterns.md)

Motion in Teknovo is **purposeful and restrained**. Micro-interactions confirm actions; they never decorate or distract. ERP prioritizes speed; landing allows slightly richer section reveals.

**Libraries**: Magic UI (ERP subtle) · Aceternity UI (landing only, restrained).

---

## Principles

| Principle | Rule |
|-----------|------|
| **Purpose** | Animate only to confirm state change or direct attention |
| **Speed** | ERP interactions feel instant (<200ms); landing ≤400ms |
| **Subtlety** | Prefer opacity and translate over scale/bounce |
| **Respect** | Honor `prefers-reduced-motion: reduce` |
| **Performance** | Animate `transform` and `opacity` only — not `width`/`height` |

**Don't animate**: table row hover color, sidebar text, financial figures, CBT exam content.

---

## Duration Tokens

| Token | Value | Use |
|-------|-------|-----|
| `duration-instant` | 0ms | Reduced-motion fallback; critical path |
| `duration-fast` | 100ms | Hover states, toggle, checkbox |
| `duration-normal` | 200ms | Dropdown open, tooltip, FAQ accordion |
| `duration-moderate` | 300ms | Modal enter, drawer slide |
| `duration-slow` | 400ms | Landing section reveal (max) |

```css
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-moderate: 300ms;
--duration-slow: 400ms;
```

**Forbidden**: Animations >500ms; infinite decorative loops; parallax on ERP.

---

## Easing Tokens

| Token | Curve | Use |
|-------|-------|-----|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General UI |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Drawers, modals |

No bounce (`cubic-bezier` overshoot) in ERP. Landing may use subtle ease-out on scroll reveal only.

---

## What Animates

| Element | Animation | Duration | Notes |
|---------|-----------|----------|-------|
| Button hover | Background color | `duration-fast` | No scale |
| Dropdown / popover | Fade + translate Y(4px) | `duration-normal` | Radix default OK |
| Modal | Fade overlay + scale 0.98→1 | `duration-moderate` | Focus trap required |
| Drawer (mobile) | Slide from edge | `duration-moderate` | Full-screen on mobile |
| Toast | Slide in + auto dismiss | `duration-normal` | Pause on hover |
| Skeleton | Pulse opacity | `duration-slow` loop | Loading state only |
| FAQ accordion | Height + opacity | `duration-normal` (200ms) | Single open |
| Sidebar collapse | Width | `duration-moderate` | Desktop only |
| Landing scroll reveal | Fade + translate Y(16px) | `duration-slow` | Once per section; Intersection Observer |

---

## What Does NOT Animate

| Element | Reason |
|---------|--------|
| KPI numbers counting up | Vanity; slows scan |
| Chart entry choreographies | Prefer static or user-triggered |
| Gradient shifts | Forbidden aesthetic |
| Lottie hero backgrounds | Performance + AI-ish |
| Table sort | Instant reorder |
| CBT exam timer | Static visibility — no pulse |
| Page route transition (ERP) | Instant swap; skeleton for loading |
| Icon spinners on every button | Loading state on affected control only |

---

## Micro-Interactions

### ERP

| Interaction | Behavior |
|-------------|----------|
| Save form | Button loading spinner → toast "Tersimpan" |
| Delete confirm | Modal fade — no shake animation |
| Row selection | Checkbox instant; bulk bar slide down `duration-normal` |
| Filter apply | Table skeleton or inline loading — no page fade |
| Nav active | Instant border/weight change — no slide indicator |

### Landing

| Interaction | Behavior |
|-------------|----------|
| CTA hover | Subtle bg darken — no lift shadow |
| Testimonial carousel | Slide `duration-moderate`; pause on hover |
| Mobile drawer | Slide `duration-moderate` |
| Sticky PPDB bar | Slide up on scroll past hero |

---

## Reduced Motion

When `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

| Override | Behavior |
|----------|----------|
| Modals | Instant show/hide; focus trap preserved |
| Drawers | Instant show |
| Landing reveals | All content visible immediately |
| Skeleton | Static gray block — no pulse |
| Carousel | Instant jump; arrows still work |

**Never** disable motion system-wide without checking this query.

---

## CBT & Focus Mode

During computer-based tests:

- **No** sidebar animation
- **No** toast animations — static alerts if needed
- Timer: static text; optional 1Hz update with no transition
- Question navigation: instant tab switch
- Submit confirm: modal without entrance animation

---

## Performance Budgets (Landing)

| Metric | Target |
|--------|--------|
| INP | <200ms |
| CLS | <0.1 — reserve space for animated elements |
| LCP | <2s — hero image not delayed by animation |

Don't lazy-load hero image. Animate only after LCP.

---

## Accessibility

- Moving content must not auto-play >5s without pause control
- Carousel: `aria-live="polite"`; keyboard arrows
- Focus visible during and after transitions
- Don't rely on motion alone for state change — pair with color/text

See [components.md](./components.md) for modal focus trap requirements.
