# Teknovo Review Checklist — Impeccable Architect

> **Usage**: Complete before PR, before ship, and after major refactors  
> **Verdict rule**: Any ❌ in Critical rows blocks merge until resolved

---

## How to Use

1. Copy section headers into PR description or review artifact
2. Mark each item ✅ (pass), ❌ (fail), N/A (not applicable with reason)
3. Attach evidence links (test output, screenshots, permission matrix diff)
4. Run `.cursor/gates/quality/self-critique.md` before final sign-off
5. Impeccable reviewer validates completeness (`agents/impeccable-reviewer.md`)

---

## 1. Product

| # | Check | Critical |
|---|-------|----------|
| 1.1 | Problem stated for named persona (admin, guru, orang tua, siswa) | Yes |
| 1.2 | Success metric or acceptance criteria documented | Yes |
| 1.3 | Mapped to Master PRD or module PRD section | Yes |
| 1.4 | Complexity score calculated if multi-domain | No |
| 1.5 | Rejected scope creep items documented | No |
| 1.6 | Business value (retention/conversion/compliance) articulated | Yes |

**Reference**: `.cursor/gates/quality/product-principles.md`

---

## 2. UX

| # | Check | Critical |
|---|-------|----------|
| 2.1 | IA path: Domain → Module → Page (≤3 levels) | Yes |
| 2.2 | Sidebar nav entry with RBAC permission | Yes |
| 2.3 | PageShell layout — no custom module sidebar | Yes |
| 2.4 | All 5 page states implemented | Yes |
| 2.5 | Phosphor icons only; design tokens used | Yes |
| 2.6 | Primary action obvious; cognitive load minimized | No |
| 2.7 | Mobile path defined or desktop-only justified | No |
| 2.8 | No generic AI dashboard patterns | Yes |
| 2.9 | Accessibility: labels, focus, contrast | Yes |

**Reference**: `.cursor/gates/quality/ux-principles.md`, `.cursor/gates/quality/design-taste.md`, `.cursor/docs/memory/ui-ux-rules.md`

---

## 3. Architecture

| # | Check | Critical |
|---|-------|----------|
| 3.1 | Domain owner identified | Yes |
| 3.2 | Layer flow: Controller → Service → Repository → DB | Yes |
| 3.3 | No cross-module repository imports | Yes |
| 3.4 | Architecture Impact Analysis artifact (if new module/migration) | Yes |
| 3.5 | Cross-domain via events or public service API | Yes |
| 3.6 | ADR created/updated if boundary change | No |
| 3.7 | Rollback or feature-flag strategy for risky changes | No |

**Reference**: `.cursor/gates/quality/architecture-principles.md`

---

## 4. Database

| # | Check | Critical |
|---|-------|----------|
| 4.1 | UUID v7 primary keys | Yes |
| 4.2 | Soft delete with `deleted_at`; queries filter | Yes |
| 4.3 | Audit columns on mutable tables | Yes |
| 4.4 | `school_id` tenancy where applicable | Yes |
| 4.5 | Drizzle migration reversible or documented | Yes |
| 4.6 | Indexes on filter/join columns | No |
| 4.7 | No hard delete on financial/exam/audit records | Yes |

**Reference**: `teknovo-database-architect`, `.cursor/docs/memory/coding-standards.md`

---

## 5. API

| # | Check | Critical |
|---|-------|----------|
| 5.1 | Zod validation on all inputs | Yes |
| 5.2 | Standard JSON response envelope | Yes |
| 5.3 | Permission on every route (`domain.resource.action`) | Yes |
| 5.4 | OpenAPI or contract doc updated | No |
| 5.5 | Pagination on list endpoints | Yes |
| 5.6 | Idempotency for payments/webhooks | Yes |

**Reference**: `teknovo-api-architect`

---

## 6. Security

| # | Check | Critical |
|---|-------|----------|
| 6.1 | Auth middleware on protected routes | Yes |
| 6.2 | RBAC guard matches API and UI | Yes |
| 6.3 | No secrets in code or client bundle | Yes |
| 6.4 | Parameterized queries only | Yes |
| 6.5 | Rate limits on auth/public endpoints | No |
| 6.6 | PII masked in logs | Yes |
| 6.7 | CORS allowlist in production | Yes |

**Reference**: `teknovo-security-review`, `.cursor/gates/security/review-checklist.md`, `agents/security-reviewer.md`

---

## 7. Performance

| # | Check | Critical |
|---|-------|----------|
| 7.1 | No unbounded list queries | Yes |
| 7.2 | N+1 avoided in hot paths | No |
| 7.3 | Heavy work queued/async | No |
| 7.4 | Bundle impact assessed for new UI deps | No |
| 7.5 | Lighthouse/Core Web Vitals for public pages | No |

**Reference**: `teknovo-performance-engineer`

---

## 8. Deployment

| # | Check | Critical |
|---|-------|----------|
| 8.1 | Deployment Impact Analysis (staging/prod) | Yes |
| 8.2 | Migration run order documented | Yes |
| 8.3 | Env vars documented in `AI_DEPLOY.md` or infra docs | No |
| 8.4 | Rollback procedure defined | Yes |
| 8.5 | CI pipeline green | Yes |

**Reference**: `teknovo-devops-engineer`, `gstack-ship`

---

## 9. RBAC

| # | Check | Critical |
|---|-------|----------|
| 9.1 | New permissions in `domain.resource.action` format | Yes |
| 9.2 | Role matrix updated | Yes |
| 9.3 | Menu/nav gated by permission | Yes |
| 9.4 | UI hides actions user cannot perform | Yes |
| 9.5 | Permission denied state shown (not blank page) | Yes |

**Reference**: `teknovo-rbac-architect`

---

## 10. Testing

| # | Check | Critical |
|---|-------|----------|
| 10.1 | Service unit tests for business logic | Yes |
| 10.2 | Integration tests for repository/API where applicable | No |
| 10.3 | E2E for critical user flow | Yes |
| 10.4 | `tsc --noEmit` passes | Yes |
| 10.5 | Lint passes | Yes |
| 10.6 | Coverage ≥ 70% module baseline | Yes |
| 10.7 | Verification evidence attached | Yes |

**Reference**: `teknovo-testing-architect`, `gstack-qa`, `superpowers-verification-before-completion`

---

## 11. Documentation

| # | Check | Critical |
|---|-------|----------|
| 11.1 | Plan/design docs in `docs/plans/` if feature work | No |
| 11.2 | Module README or domain doc updated | No |
| 11.3 | API changes reflected in contract docs | Yes |
| 11.4 | RBAC matrix updated | Yes |
| 11.5 | Release notes draft for user-facing changes | No |

---

## Sign-Off Block

```markdown
| Gate | Reviewer | Date | Status |
|------|----------|------|--------|
| Product | | | |
| UX | | | |
| Architecture | | | |
| RBAC | | | |
| Testing | | | |
| Documentation | | | |
| Deployment | | | |

**Overall**: ☐ APPROVED FOR MERGE  ☐ APPROVED FOR SHIP  ☐ BLOCKED
```

See `.cursor/gates/quality/quality-gates.md` for mandatory gate order.
