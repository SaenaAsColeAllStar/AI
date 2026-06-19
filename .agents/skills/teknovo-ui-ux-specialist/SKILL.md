---
name: teknovo-ui-ux-specialist
description: Principal UX Architect for enterprise dashboard reviews, information architecture, navigation planning, accessibility audits, design QA, and pre-implementation UI architecture. Use for UX review, design review, dashboard review, form audit, accessibility audit, navigation planning, and build UI requests.
triggers:
  - UX review
  - design review
  - dashboard review
  - form audit
  - table audit
  - accessibility audit
  - a11y review
  - mobile UX review
  - navigation planning
  - information architecture
  - build UI
  - page layout plan
  - UX audit
  - pre-release UX
---

# Teknovo UI/UX Specialist Skill

Use this skill when acting as **Principal UX Architect** for Teknovo V2 enterprise dashboards. This skill governs **reviews, audits, planning sessions, and pre-implementation architecture** — not day-to-day component coding standards.

> **Differentiation**: Load **teknovo-ui-ux** for token compliance, component rules, and implementation checklists. Load **teknovo-ui-ux-specialist** for structured UX analysis, information architecture, review frameworks, and mandatory pre-code architecture artifacts.

**Primary References**:
- `docs/standards/design-system/design-system-contract.md`
- `docs/standards/design-system/navigation-architecture-standard.md`
- `docs/standards/design-system/ui-design-sistem-standard.md`
- `docs/standards/rbac/rbac-standard.md`
- `docs/security/rbac-matrix.md`
- `docs/architecture/folder-contract.md`
- `docs/prd/master/master-prd.md`
- `apps/portal/` (Nuxt portal), `packages/ui/` (shared components)

---

## When to Activate

| Intent | Mode |
|--------|------|
| Review existing UI, dashboard, form, or table | **Design Review Mode** |
| Plan navigation, IA, or user flows before build | **Planning Mode** |
| Audit accessibility, mobile, or pre-release UX | **Audit Mode** |
| User asks to build/create UI pages or modules | **Implementation Mode** |
| Blocker on UX direction or conflicting nav requirements | **UX Review Session** |

**Prohibited**: Generate UI code before completing the relevant mode's mandatory artifacts.

---

## Agent Responsibilities

Before any review or build recommendation, analyze all eleven dimensions:

| # | Dimension | Questions to Answer |
|---|-----------|---------------------|
| 1 | **User goals** | Who uses this? What task are they completing? What is their daily workflow? |
| 2 | **Business goals** | What KPI, compliance, or operational outcome does this UI serve? |
| 3 | **RBAC structure** | Which roles see menu, route, action, and data? Map to `domain.resource.action`. |
| 4 | **Navigation structure** | Domain → Module → Page depth ≤ 3? Global sidebar consistency? |
| 5 | **Page hierarchy** | Dashboard → Module → Feature → Detail flow correct? |
| 6 | **Data density** | Is information overload present? Can users scan in < 5 seconds? |
| 7 | **Mobile experience** | Drawer/bottom nav? Tap targets ≥ 44px? Table → card fallback? |
| 8 | **Accessibility** | Contrast, keyboard, focus, screen reader labels, skip links? |
| 9 | **Responsiveness** | Breakpoints: mobile (<768px), tablet (768–1024px), desktop (>1024px)? |
| 10 | **Design consistency** | Tokens, typography, spacing, icons (Phosphor/Tabler only)? |
| 11 | **Implementation feasibility** | Can this be built with `packages/ui` + PageShell without custom sidebar? |

Cross-reference **teknovo-rbac-architect** for permission matrices and **teknovo-ui-ux** for token/component enforcement during implementation.

---

## Superpowers → UX Workflows

Embedded workflows adapted from Superpowers methodology. Follow in order when planning or reviewing.

### 1. User Flow Brainstorming (from brainstorming)

**When**: New feature, unclear user journey, multiple UX approaches.

**Protocol**:
1. Read `docs/prd/**`, `docs/architecture/domain-context-map.md`, target module in `apps/portal/`
2. Ask one clarifying question at a time (persona, current workflow, success metric)
3. Propose 2–3 flow options with trade-offs
4. Document approved flow in `docs/plans/YYYY-MM-DD-<feature>-ux-flow.md`
5. Transition to Navigation Planning or Dashboard Planning

**Output**: User flow diagram (mermaid or numbered steps), persona table, scope boundaries (YAGNI).

### 2. Navigation Planning (from writing-plans)

**When**: New domain/module, sidebar restructure, menu RBAC mapping.

**Protocol**:
1. Generate Information Architecture tree (see § Information Architecture Rules)
2. Map each leaf page to route, permission, and breadcrumb
3. Detect navigation complexity score
4. Save to plan: route tree + permission matrix delta

**Output**: Route tree, nav RBAC table, complexity assessment.

### 3. Dashboard Planning (from writing-plans)

**When**: New dashboard or KPI surface.

**Protocol**:
1. Define primary user persona and top 3 tasks
2. Specify: Summary Cards, Recent Activity, Quick Actions, Announcements (mandatory per nav standard)
3. Plan card hierarchy (primary metrics top-left, secondary below)
4. Define data sources and loading/error states per card

**Output**: Dashboard wireframe spec (ASCII or section list), card inventory, API requirements.

### 4. Form Planning (from writing-plans)

**When**: Create/edit flows, multi-step wizards, settings pages.

**Protocol**:
1. Group fields by mental model (not database column order)
2. Define validation flow (Zod schema outline), error summary placement
3. Plan dirty-state and autosave behavior
4. Specify mobile field order and input types

**Output**: Field grouping table, step indicator plan (if multi-step), validation flow diagram.

### 5. Design Review (from code-review mindset)

**When**: PR review, post-implementation audit, stakeholder UX sign-off.

**Protocol**:
1. Load **teknovo-ui-ux** checklist as baseline
2. Run all Review Frameworks (§ Review Frameworks)
3. Generate mandatory **Design Review Output Template** (§ Design Review Output)
4. Classify findings: Critical / Major / Minor / Info

**Output**: Full design review document with UX Score and Priority Matrix.

### 6. UX Verification (from verification-before-completion)

**When**: Before declaring UI work complete or shipping.

**Protocol**:
1. Verify all 5 page states in browser or Storybook
2. Run responsive checks at 375px, 768px, 1280px
3. Keyboard-only navigation test
4. Capture evidence table (not claims)

**Output**: UX Verification Evidence table appended to review or QA report.

### 7. Execution Planning (from executing-plans)

**When**: Approved UX architecture ready for build handoff.

**Protocol**:
1. Produce Implementation Mode artifacts (§ Implementation Mode) if not already done
2. Break UI tasks into layer order: shared components → page shell → queries → states
3. Checkpoint after each page: 5 states verified before next page

**Output**: Frontend Implementation Plan with task checklist; invoke **teknovo-feature-implementation** for code.

---

## GStack → UX Workflows

Embedded workflows adapted from GStack sprint loop.

### 1. UX Review Sessions (from office-hours)

**When**: UX blockers, conflicting stakeholder requirements, architectural UX decisions.

**Forcing Questions** (one at a time):
1. What specific user pain does this screen solve?
2. Who is the primary user and what do they do today without this UI?
3. What does success look like in 30 days (measurable)?
4. What are you NOT building on this screen?
5. What breaks if this navigation change fails?
6. What is the narrowest wedge to ship tomorrow?

**Output**: Decision record in plan or ADR; no code during session.

### 2. Navigation Review (from eng-review)

**When**: Sidebar changes, new domain modules, breadcrumb audits.

**Checklist**:
- [ ] Follows business domains (Academic, Finance) — not technical modules
- [ ] Max 3 levels: Domain → Module → Page
- [ ] Breadcrumb format: `Domain > Module > Page`
- [ ] No per-module custom sidebars
- [ ] Mobile: drawer or bottom nav; desktop sidebar hidden
- [ ] Menu items gated by RBAC Layer 1 (menu visibility)

**Output**: Navigation Review section in Design Review Output.

### 3. Accessibility Review (from eng-review)

**When**: Any new page, form, table, or pre-release audit.

**Checklist**:
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large text/UI components)
- [ ] Focus visible on all interactive elements
- [ ] Tab order matches visual order
- [ ] Form fields have associated labels (`htmlFor` / `aria-label`)
- [ ] Error messages linked via `aria-describedby`
- [ ] Tables have proper headers and scope
- [ ] Icon-only buttons have accessible names
- [ ] Skip-to-content link present on portal layouts

**Output**: Accessibility Report (§ Review Frameworks).

### 4. Mobile Review (from browser-testing)

**When**: Responsive layouts, touch interactions, mobile nav.

**Checklist**:
- [ ] Tap targets ≥ 44×44px
- [ ] No horizontal scroll at 375px viewport
- [ ] Sidebar replaced by drawer/bottom nav
- [ ] Tables degrade to card list or horizontal scroll with sticky first column
- [ ] Primary CTA reachable with thumb (bottom sheet or sticky footer if needed)
- [ ] Modals full-screen on mobile

**Output**: Mobile UX Report (§ Review Frameworks). Run Playwright responsive tests when code exists.

### 5. Design QA Review (from qa)

**When**: Post eng-review, pre-ship functional UX validation.

**Protocol**:
1. Functional matrix per page state (Loading, Empty, Error, Success, Permission)
2. RBAC matrix per role (SUPER_ADMIN, GURU, SISWA, etc.)
3. Cross-browser spot check (Chromium + WebKit minimum)
4. Design token spot-check against **teknovo-ui-ux**

**Output**: Design QA section with pass/fail per state and role.

### 6. Pre-Release UX Audit (from browser-testing + ship mindset)

**When**: Before staging/production deploy of UI changes.

**Protocol**:
1. Run critical user flows in browser (login, primary module happy path)
2. Complete full Design Review Output Template on changed pages
3. Confirm no forbidden libraries (Lucide, Bootstrap, Ant Design, MUI)
4. Confirm `pnpm test:e2e` passes for affected flows
5. UX Score ≥ 80 required for ship; 60–79 = conditional with documented debt

**Output**: Pre-Release UX Audit verdict: SHIP / HOLD / REWORK.

---

## Information Architecture Rules

**Always generate an Information Architecture (IA) tree** before navigation or build recommendations.

### IA Tree Template

```text
[App Root]
├── Dashboard
├── Academic                          ← Domain (Level 1)
│   ├── Classes                       ← Module (Level 2)
│   │   ├── Class List                ← Page (Level 3)
│   │   ├── Create Class
│   │   └── Class Detail
│   ├── Attendance
│   │   ├── Daily Attendance
│   │   └── Attendance Reports
│   └── Grading
│       ├── Grade Input
│       └── Report Cards
├── Finance                           ← Domain (Level 1)
│   ├── Billing
│   │   ├── SPP Bills
│   │   ├── Create Bill
│   │   └── Payment History
│   ├── Cash Book
│   │   ├── Daily Cash
│   │   └── Cash Reports
│   └── Scholarships
│       └── Scholarship List
├── Student Affairs
├── Administration
├── Communication
└── System
```

### Academic Domain Example (Full)

```text
Academic
├── Curriculum
│   ├── Subject List          /academic/subjects
│   ├── Create Subject        /academic/subjects/create
│   └── Subject Detail        /academic/subjects/:id
├── Classes
│   ├── Class List            /academic/classes
│   ├── Create Class          /academic/classes/create
│   └── Class Detail          /academic/classes/:id
└── Scheduling
    ├── Timetable View        /academic/schedules
    └── Room Allocation       /academic/schedules/rooms
```

### Finance Domain Example (Full)

```text
Finance
├── Billing
│   ├── SPP Bills             /finance/billing/spp
│   ├── Create Bill           /finance/billing/spp/create
│   └── Bill Detail           /finance/billing/spp/:id
├── Payments
│   ├── Payment List          /finance/payments
│   └── Record Payment        /finance/payments/create
└── Reports
    ├── Revenue Summary       /finance/reports/revenue
    └── Outstanding Balances  /finance/reports/outstanding
```

### Navigation Complexity Detection

Score each module:

| Signal | Weight | Threshold |
|--------|--------|-----------|
| Depth > 3 levels | +3 per violation | Critical |
| Pages without breadcrumb | +2 each | Major |
| Duplicate paths for same feature | +2 each | Major |
| > 12 sibling pages under one module | +2 | Major — recommend sub-grouping |
| Mixed domain items in one module | +3 | Critical |
| Orphan pages (no sidebar entry) | +1 each | Minor |
| Role-specific nav variants | +2 each | Major — use RBAC hide, not duplicate nav |

**Complexity Rating**:
- **Low** (0–3): Proceed
- **Medium** (4–8): Recommend IA simplification
- **High** (9+): Mandatory IA redesign before build

**Recommendations format**: State problem → proposed restructure → RBAC impact → migration path for existing routes.

---

## Review Frameworks

Each framework produces structured output. Use during Design Review Mode.

### Dashboard Review

Evaluate: hierarchy, visual balance, CTA placement, card density, scanability, readability.

```markdown
## Dashboard Review: [Dashboard Name]

| Criterion | Score (1–5) | Finding |
|-----------|-------------|---------|
| Visual hierarchy | | Primary KPI prominence |
| Visual balance | | Grid alignment, whitespace |
| CTA placement | | Primary action visible without scroll |
| Card density | | Cards per viewport ≤ 6 on desktop |
| Scanability | | F-pattern or Z-pattern readable |
| Readability | | Typography scale, contrast |

**UX Findings**
- [Critical/Major/Minor] [finding]

**UX Score**: [average × 20 = 0–100]

**Recommendations**
1. [Prioritized action]
```

**Mandatory dashboard elements** (per navigation standard): Summary Cards, Recent Activity, Quick Actions, Announcements.

### Form Review → Form UX Audit

Evaluate: validation flow, field grouping, field order, user effort, mobile usability.

```markdown
## Form UX Audit: [Form Name]

| Criterion | Pass? | Notes |
|-----------|-------|-------|
| Field grouping matches mental model | ✅/❌ | |
| Logical field order (general → specific) | ✅/❌ | |
| Zod validation with inline errors | ✅/❌ | |
| Error summary at top on submit | ✅/❌ | |
| Dirty state + navigate-away prompt | ✅/❌ | |
| Mobile: appropriate input types | ✅/❌ | tel, email, number |
| Mobile: single column layout | ✅/❌ | |
| Step indicator (if multi-step) | ✅/❌ | |
| Primary submit reachable on mobile | ✅/❌ | |

**User Effort Score**: [Low / Medium / High] — [field count, required fields, steps]

**Recommendations**
1. [Action]
```

### Table Review → Table UX Audit

Evaluate: search, filter, sorting, pagination, bulk actions, exports.

```markdown
## Table UX Audit: [Table Name]

| Feature | Present? | Quality (1–5) | Finding |
|---------|----------|---------------|---------|
| Search | ✅/❌ | | |
| Filters | ✅/❌ | | |
| Column sorting | ✅/❌ | | |
| Pagination | ✅/❌ | | |
| Records-per-page selector | ✅/❌ | | |
| Bulk actions | ✅/❌ | | |
| Column visibility toggle | ✅/❌ | | |
| Export (PDF/CSV) | ✅/❌ | | |
| Sticky header on scroll | ✅/❌ | | |
| Empty state with CTA | ✅/❌ | | |
| Mobile card/list fallback | ✅/❌ | | |

**Recommendations**
1. [Action]
```

### Mobile UX Review → Mobile UX Report

Evaluate: tap targets, sidebar, drawer, bottom nav.

```markdown
## Mobile UX Report: [Page/Module Name]

**Viewport tested**: 375×667 (iPhone SE baseline)

| Check | Pass? | Finding |
|-------|-------|---------|
| Desktop sidebar hidden | ✅/❌ | |
| Drawer or bottom nav active | ✅/❌ | |
| Tap targets ≥ 44px | ✅/❌ | |
| No horizontal overflow | ✅/❌ | |
| Primary CTA thumb-reachable | ✅/❌ | |
| Table responsive fallback | ✅/❌ | |
| Modal full-screen on mobile | ✅/❌ | |

**Recommendations**
1. [Action]
```

### Accessibility Review → Accessibility Report

Evaluate: contrast, spacing, keyboard, focus, screen reader.

```markdown
## Accessibility Report: [Page/Component Name]

| WCAG 2.1 Area | Pass? | Finding |
|---------------|-------|---------|
| Color contrast (AA) | ✅/❌ | |
| Focus indicators | ✅/❌ | |
| Keyboard navigation | ✅/❌ | |
| Skip link | ✅/❌ | |
| Form labels | ✅/❌ | |
| Error announcements | ✅/❌ | |
| Heading hierarchy | ✅/❌ | |
| Icon button labels | ✅/❌ | |
| Table semantics | ✅/❌ | |

**Severity Summary**: [X Critical, Y Major, Z Minor]

**Recommendations**
1. [Action with WCAG reference]
```

---

## Design System Enforcement

Cross-check all reviews against **teknovo-ui-ux** and design system contract.

| Category | Standard |
|----------|----------|
| **Typography** | Inter primary; weights 400/500 body, 600/700 headings |
| **Color Tokens** | Primary `#1D4ED8`, Accent `#0EA5E9`, Success `#16A34A`, Warning `#D97706`, Danger `#DC2626`, Neutral `#0F172A`, Background `#F8FAFC`, Card `#FFFFFF` |
| **Spacing Tokens** | 4, 8, 12, 16, 24, 32, 48, 64px only |
| **Component Consistency** | shadcn/ui + Radix base; `packages/ui` exports; no mixed libraries |
| **Icon Consistency** | Phosphor primary, Tabler secondary; **no** Lucide, Font Awesome, Bootstrap |

### Mandatory Page States

Every content page MUST implement all five:

| State | Requirement |
|-------|-------------|
| **Loading** | Skeleton or spinner during TanStack Query fetch |
| **Empty** | Friendly message + CTA if user has create permission |
| **Error** | Non-blocking error card with Retry action |
| **Success** | Toast/alert on successful mutation |
| **Permission** | Lock screen or restricted view for unauthorized roles |

Missing any state = **Major** finding (blocks ship).

### Page Layout Contract

```text
PageShell
├── PageHeader (breadcrumb, title, description, optional primary action)
├── PageContent (tables, forms, dashboard grid)
└── PageFooter (secondary actions, metadata)
```

---

## Design Review Output Template

**Every review MUST generate ALL sections below.** Do not omit sections — mark N/A with rationale if not applicable.

```markdown
# Design Review: [Feature/Page/Module Name]

**Reviewer**: Teknovo UI/UX Specialist
**Date**: YYYY-MM-DD
**Scope**: [files, routes, or Figma reference]
**Mode**: [Design Review / Audit / Pre-Release]

---

## 1. Executive Summary
[2–4 sentences: overall UX health, top risk, ship recommendation]

## 2. UX Score
**Overall**: [0–100]
| Area | Score | Weight |
|------|-------|--------|
| Information Architecture | | 15% |
| Navigation | | 15% |
| Dashboard | | 15% |
| Forms | | 15% |
| Tables | | 10% |
| Mobile | | 15% |
| Accessibility | | 10% |
| Design System | | 5% |

## 3. Information Architecture Review
[IA tree snippet, complexity score, findings]

## 4. Navigation Review
[Sidebar structure, breadcrumb compliance, RBAC menu mapping]

## 5. Dashboard Review
[Use Dashboard Review framework — or N/A]

## 6. Form Review
[Use Form UX Audit framework — or N/A]

## 7. Table Review
[Use Table UX Audit framework — or N/A]

## 8. Mobile Review
[Use Mobile UX Report framework]

## 9. Accessibility Review
[Use Accessibility Report framework]

## 10. Design System Compliance
| Token/Rule | Compliant? | Violations |
|--------------|------------|------------|
| Typography | ✅/❌ | |
| Color tokens | ✅/❌ | |
| Spacing tokens | ✅/❌ | |
| Components (shadcn/Radix) | ✅/❌ | |
| Icons (Phosphor/Tabler) | ✅/❌ | |
| PageShell layout | ✅/❌ | |
| 5 page states | ✅/❌ | |

## 11. Recommended Improvements
1. [Improvement with expected impact]
2. ...

## 12. Priority Matrix

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **High** | | S/M/L | |
| **Medium** | | S/M/L | |
| **Low** | | S/M/L | |

---

**Verdict**: [PASS ≥80 / CONDITIONAL 60–79 / FAIL <60]
**Next Step**: [ship / rework / invoke teknovo-feature-implementation]
```

Save reviews to: `docs/reviews/YYYY-MM-DD-<feature>-ux-review.md`

---

## Implementation Mode

**When asked to build UI**, generate ALL ten artifacts BEFORE any code. Never generate UI code before architecture and UX analysis complete.

### Mandatory Pre-Code Artifacts

#### 1. Folder Tree

```text
apps/portal/app/
├── pages/[domain]/[module]/[page].vue
├── components/[domain]/
packages/ui/src/components/
└── [new shared components if needed]
```

Align with `docs/architecture/folder-contract.md`. No dump files.

#### 2. Component Tree

```text
PageName
├── PageShell
│   ├── PageHeader
│   │   ├── Breadcrumb
│   │   └── PrimaryActionButton (RBAC-gated)
│   ├── PageContent
│   │   ├── [DomainTable | DomainForm | DashboardGrid]
│   │   └── [EmptyState | ErrorState | LoadingSkeleton]
│   └── PageFooter
└── [Modals, Drawers as siblings]
```

#### 3. Route Tree

```text
/[domain]
├── /[domain]/[module]           → list page    permission: domain.module.read
├── /[domain]/[module]/create    → create form  permission: domain.module.create
└── /[domain]/[module]/:id       → detail page  permission: domain.module.read
```

#### 4. Page Layout

Describe PageShell sections, grid columns, primary/secondary actions, breadcrumb path.

#### 5. Responsive Layout

| Breakpoint | Layout behavior |
|------------|-----------------|
| Mobile (<768px) | Single column, drawer nav, card table fallback |
| Tablet (768–1024px) | 2-column grid, collapsible sidebar |
| Desktop (>1024px) | Full sidebar, multi-column dashboard |

#### 6. State Management

| State | Trigger | UI Component | Data Source |
|-------|---------|--------------|-------------|
| Loading | Query pending | Skeleton | TanStack Query |
| Empty | data.length === 0 | EmptyState + CTA | Query success |
| Error | Query error | ErrorCard + Retry | Query error |
| Success | Mutation ok | Toast | Mutation onSuccess |
| Permission | RBAC check fail | PermissionDenied | Route guard / usePermissions |

#### 7. API Requirements

| Method | Route | Permission | Used By |
|--------|-------|------------|---------|
| GET | /api/v1/... | domain.resource.read | List/Detail |

#### 8. RBAC Requirements

| Permission | Roles | UI Element |
|------------|-------|------------|
| domain.resource.create | ADMIN_* | "Create" button, /create route |

Map all 5 RBAC layers (menu, route, API, action, data ownership).

#### 9. Acceptance Criteria

```markdown
- [ ] User with [role] can [action] from [entry point]
- [ ] All 5 page states render correctly
- [ ] Mobile layout passes Mobile UX Report checks
- [ ] Breadcrumb shows Domain > Module > Page
- [ ] E2E test covers happy path + permission denied
```

#### 10. Frontend Implementation Plan

Task breakdown (2–5 min tasks) following layer order:

```text
1. Shared components in packages/ui (if needed)
2. Zod schemas + types
3. TanStack Query hooks (queries/mutations)
4. Page components with 5 states
5. Route registration + RBAC guards
6. E2E test spec
7. UX Verification evidence
```

Save to: `docs/plans/YYYY-MM-DD-<feature>-frontend-plan.md`

**Transition**: After artifacts approved → invoke **superpowers-writing-plans** (full stack) or **teknovo-feature-implementation** (UI layer) → **teknovo-ui-ux** during coding.

---

## Skill Transitions

| After This Skill... | Invoke |
|---------------------|--------|
| Planning complete | superpowers-writing-plans |
| Build approved | teknovo-feature-implementation + teknovo-ui-ux |
| Review finds RBAC gaps | teknovo-rbac-architect |
| Review complete, code exists | gstack-browser-testing → gstack-qa |
| Pre-release audit pass | gstack-ship |
| UX blocker | gstack-office-hours |
| Review feedback on UI | superpowers-receiving-code-review |

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Code before IA tree | Generate IA + route tree first |
| Custom sidebar per module | Global domain-driven sidebar |
| Database column order in forms | Mental model field grouping |
| Skip Permission state | Always implement 5 states |
| UX review without score | Always produce UX Score + Priority Matrix |
| Lucide icons for convenience | Phosphor/Tabler equivalents |
| Desktop-only table on mobile | Card fallback or responsive table |
| Duplicate nav for roles | RBAC conditional render, same structure |

---

## Key Principles

- **Evidence over claims** — UX verification requires screenshots, test output, or checklist marks
- **Business domains, not systems** — Academic and Finance, not "Module A"
- **RBAC is UX** — hidden actions confuse users; permission states must be explicit
- **Scanability first** — enterprise dashboards serve daily operators, not demos
- **Mobile is not optional** — drawer nav and tap targets are mandatory
- **Differentiate roles** — this skill plans and audits; teknovo-ui-ux enforces standards during build
