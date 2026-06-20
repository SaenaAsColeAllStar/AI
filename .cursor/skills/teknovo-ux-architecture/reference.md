# UX Architecture Reference Templates

Use these templates during planning, review, and pre-code phases. Save artifacts to `docs/plans/` or `docs/reviews/`.

## Product Design Analysis

Save: `docs/plans/YYYY-MM-DD-<feature>-product-design-analysis.md`

```markdown
# Product Design Analysis: [Name]

**PRD Reference**: [path]
**Status**: Draft | Approved | Blocked

## Executive Summary
[3–5 sentences: intent, top risk, recommendation]

## User Personas
| Persona | Role | Primary Goals | Pain Points | Success Metric |

## User Journey
| Step | Screen | Clicks | RBAC | Notes |
**Total Clicks**: [N] — PASS ≤5 / FAIL

## Business Goals
| Goal | Metric | PRD Ref | How UI Serves It |

## Information Architecture
[Domain tree + complexity score: Low 0–3 / Medium 4–8 / High 9+]

## Navigation Architecture
[Sidebar, breadcrumbs, mobile nav, redundancy findings]

## Dashboard Architecture
[Widget inventory with justification — or N/A]

## Conversion Flow
[Primary CTA, funnel, trust signals]

## AI-ish Score
**Score**: [N]/100 — [Band ≤40 to proceed]

## Product Design Score
| Area | Score | Weight |
**Overall**: [0–100] — APPROVE ≥75 / CONDITIONAL 60–74 / BLOCK <60

**Verdict**: [APPROVE / CONDITIONAL / BLOCK]
```

## Design Review Output

Save: `docs/reviews/YYYY-MM-DD-<feature>-ux-review.md`

Sections required: Executive Summary · UX Score (weighted) · IA Review · Navigation · Dashboard · Form · Table · Mobile · Accessibility · Design System Compliance · Priority Matrix · Verdict (PASS ≥80 / CONDITIONAL 60–79 / FAIL <60).

## Pre-Code Artifacts (Build UI)

Before any UI code, produce all ten:

1. **Folder tree** — `apps/portal/` + `packages/ui/` aligned with folder contract
2. **Component tree** — PageShell hierarchy with state components
3. **Route tree** — paths + `domain.resource.action` permissions
4. **Page layout** — sections, grid, breadcrumb
5. **Responsive layout** — mobile/tablet/desktop breakpoints
6. **State management table** — Loading/Empty/Error/Success/Permission triggers
7. **API requirements** — method, route, permission
8. **RBAC requirements** — all 5 layers (menu, route, API, action, data)
9. **Acceptance criteria** — role-based + 5 states + E2E
10. **Frontend implementation plan** — task breakdown

Save plan: `docs/plans/YYYY-MM-DD-<feature>-frontend-plan.md`

## IA Complexity Scoring

| Signal | Weight |
|--------|--------|
| Depth > 3 | +3 each |
| No breadcrumb | +2 each |
| Duplicate paths | +2 each |
| >12 sibling pages | +2 |
| Mixed domains in module | +3 |
| Orphan pages | +1 each |
| Duplicate nav per role | +2 each |

## AI-ish Detection Signals

| Signal | Points |
|--------|--------|
| Generic hero headline | +15 |
| 3+ identical icon feature cards | +10 |
| 8+ equal KPI cards | +15 |
| Purple gradient admin layout | +20 |
| Forbidden icon libraries | +25 |
| Placeholder/fake metrics | +10 |
| Nav without RBAC | +10 |
| Generic landing template | +20 |
| Lorem / AI imagery | +15 |

**Gate**: Score ≤40 before UI implementation handoff.

## Forcing Questions (One at a Time)

1. What user pain does this screen solve that no existing screen solves?
2. What happens if we remove this navigation item?
3. What measurable outcome improves in 30 days?
4. What are we NOT building on this surface?
5. What is the narrowest wedge to ship tomorrow?
