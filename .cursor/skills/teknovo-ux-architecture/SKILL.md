---
name: teknovo-ux-architecture
description: >-
  Pre-code UX architecture for Teknovo — PRD alignment, information architecture,
  navigation planning, user journeys, design reviews, AI-ish detection, and
  mandatory pre-code artifacts. Use before UI implementation, for UX review,
  dashboard review, navigation planning, IA restructure, product design analysis,
  accessibility audit, or when user asks to build UI pages.
---

# Teknovo UX Architecture

**Scope**: Planning, review, and pre-code architecture — **not** component coding. For implementation → **teknovo-ui-ux**. For tokens → **teknovo-design-system**.

**Prohibited**: Generate UI code before completing the relevant mode's mandatory artifacts.

## When to Activate

| Intent | Mode |
|--------|------|
| New feature, PRD alignment, strategy | **Product Design** |
| Plan navigation, IA, user flows | **Planning** |
| Review existing UI, dashboard, form, table | **Design Review** |
| Audit a11y, mobile, pre-release | **Audit** |
| User asks to build/create UI | **Implementation Planning** |

## Role Split

| Skill | Phase |
|-------|-------|
| **This skill** | What exists, why, IA, journeys, reviews, pre-code artifacts |
| teknovo-ui-ux | How to build — tokens, PageShell, 5 states, tables, forms |
| teknovo-prd-generator | Draft PRDs (this skill reviews/aligns, does not draft) |
| teknovo-chief-architect | Pillar 2 — after Product Design Analysis approved |

## Analyze Before Any UI Work

### Strategic (10 Areas — Product Design)

1. User goals · 2. Business goals · 3. Role goals (RBAC) · 4. User journey (≤5 clicks) · 5. Navigation (≤3 levels) · 6. Information architecture · 7. Data density (scan <5 sec) · 8. Conversion flow · 9. Mobile · 10. Design system compliance

### Tactical (11 Dimensions — UX Review)

User goals · Business goals · RBAC · Navigation · Page hierarchy · Data density · Mobile · Accessibility · Responsiveness · Design consistency · Implementation feasibility (`packages/ui` + PageShell)

## Information Architecture

**Business domains, not technical modules.**

```text
Dashboard
Academic → Curriculum | Classes | Attendance | Grading
Finance → Billing | Payments | Cash Book | Reports
Student Affairs | Administration | Communication | System
```

Each leaf: route path + permission + breadcrumb. Run **IA complexity scoring** — High (9+) blocks build. See [reference.md](reference.md).

## Navigation Rules

- Max 3 levels: Domain → Module → Page
- Breadcrumb: `Domain > Module > Page`
- Global sidebar — no per-module custom sidebars
- RBAC Layer 1 gates menu visibility; same nav structure for all roles (conditional render, not duplicate trees)
- Mobile: drawer or bottom nav
- Flag redundancy: same feature via sidebar + dashboard card + shortcut with no role distinction

## Dashboard Philosophy

Dashboards serve **daily operators**, not demos.

- ≤6 cards visible without scroll; reject 8+ equal-weight KPI cards
- Mandatory elements: Summary Cards, Recent Activity, Quick Actions, Announcements
- Primary KPI top-left; each metric maps to PRD + real data source
- Role-specific: Teacher ≠ Finance ≠ Admin dashboards

## Form & Table (Strategic)

**Forms**: Justify existence · group by mental model · correct workflow placement · right role owns data entry. Delegate Zod/dirty-state audit to **teknovo-ui-ux**.

**Tables**: Justify list vs dashboard · primary row action clarity · bulk matches PRD workflows · mobile degradation planned · export serves compliance/ops.

## AI-Ish Detection (Mandatory Gate)

Score 0–100 (higher = more generic). **Must be ≤40 before UI handoff.**

Bands: 0–20 Excellent · 21–40 Good · 41–60 Redesign · 61–80 Block · 81–100 Reject.

Signals: generic hero · identical icon cards · KPI spam · purple admin clone · forbidden libraries · fake metrics · nav without RBAC · template landing.

Full signal table: [reference.md](reference.md)

## PRD Alignment Checklist

Before architecture handoff:

1. Module scope bounded to domain ownership
2. Roles/permissions match navigation personas
3. FRs trace to journey steps
4. UI pages align with IA — no duplicate paths
5. Success metrics measurable
6. Cross-domain dependencies documented

PRD gaps → **teknovo-prd-generator** → re-run alignment.

## Required Output — Product Design Analysis

**Every product design engagement** produces full analysis before UI code. Template: [reference.md](reference.md).

Save: `docs/plans/YYYY-MM-DD-<feature>-product-design-analysis.md`

**Implementation without this artifact is FORBIDDEN.**

## Required Output — Design Review

Every review produces UX Score + Priority Matrix + Verdict. UX Score ≥80 to ship; 60–79 conditional with debt.

Frameworks: Dashboard · Form UX Audit · Table UX Audit · Mobile UX Report · Accessibility Report. Full template: [reference.md](reference.md).

## Implementation Planning Mode

When asked to **build UI**, produce **all 10 pre-code artifacts** before code:

Folder tree · Component tree · Route tree · Page layout · Responsive layout · State management table · API requirements · RBAC requirements · Acceptance criteria · Frontend implementation plan.

Details: [reference.md](reference.md)

Then invoke **teknovo-feature-implementation** + **teknovo-ui-ux**.

## Workflows (Condensed)

| Workflow | Steps |
|----------|-------|
| New feature | Read PRD → 10 areas → journey + IA → AI-ish ≤40 → Product Design Analysis → chief-architect |
| UX review | Load ui-ux checklist → run frameworks → Design Review output |
| Navigation restructure | Full domain map → complexity score → RBAC delta → migration path |
| Pre-release audit | Critical flows in browser → full review → forbidden libs check → E2E pass |
| UX blocker | Forcing questions (one at a time) — no code during session |

## UX Verification (Before Ship)

1. All 5 page states in browser at 375, 768, 1280px
2. Keyboard-only navigation
3. Evidence table — not claims

## Anti-Patterns

| Wrong | Right |
|-------|-------|
| Code before IA tree | IA + route tree first |
| Custom sidebar per module | Global domain sidebar |
| DB column order in forms | Mental model grouping |
| Skip Permission state | All 5 states always |
| Duplicate nav per role | RBAC conditional render |
| Template landing | School-specific narrative |
| Skip AI-ish score | Mandatory ≤40 gate |

## Skill Transitions

| After | Invoke |
|-------|--------|
| Product Design approved | teknovo-chief-architect |
| Build approved | teknovo-feature-implementation + teknovo-ui-ux |
| RBAC gaps | teknovo-rbac-architect |
| Landing build | teknovo-landing-page |
| Pre-ship | gstack-qa, gstack-browser-testing |
| Blocker | gstack-office-hours |

## Key Principles

- **Existence over aesthetics** — justify every element before styling
- **Business domains, not systems** — Academic and Finance, not Module A
- **Journey efficiency** — ≤5 clicks for primary tasks
- **Anti-template** — reject generic AI SaaS patterns
- **RBAC is UX** — permissions shape what users see
- **Evidence over claims** — screenshots, test output, checklist marks
