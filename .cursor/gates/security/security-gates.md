# Security Gates — Teknovo Security System

> **Authority**: Mandatory before implementation and before deploy  
> **Precedence**: Assurance Review (`.cursor/gates/assurance/review-workflow.md`) → **Security Gates** → Implementation  
> **Registry**: `.cursor/gates/security/security-principles.md` (index)

---

## Precedence Rule

```text
Assurance Layer     → validate requirements, architecture, risks (proactive audit)
Security Layer      → enforce policy, secure defaults, RBAC/API/DB controls (THIS LAYER)
Implementation      → code after both gates pass
```

Assurance **insecure defaults scan** runs first and feeds gaps into Security Review. Security gate **blocks** even if assurance passed with open security debt.

When security and convenience conflict, **security wins** (see `.cursor/gates/security/security-principles.md`).

---

## Gate Sequence

```text
Assurance Sign-Off (.cursor/gates/assurance/review-workflow.md)
    ↓
1. Requirements & Threat Context
2. RBAC & Authorization
3. API & Authentication
4. Database & Data Protection
5. Infrastructure & Cloudflare (if applicable)
6. Supply Chain (if new deps — cross-ref .cursor/gates/assurance/dependency-review.md)
    ↓
Implementation allowed
    ↓
7. Pre-Deploy Security Re-Check
    ↓
Quality gates → Ship
```

No database migrations, API endpoints, UI routes, Workers, or infra changes until gates **1–6** pass for the change scope.

---

## Gate 1 — Requirements & Threat Context

| Field | Value |
|-------|-------|
| **When** | After assurance; before implementation |
| **Documents** | `.cursor/gates/security/security-principles.md`, module threat notes |
| **Blocks** | Implementation start |

### Pass criteria

- Data classification identified (PII, financial, exam)
- Threat actors considered (insider, student, external)
- Assurance insecure-defaults scan attached
- No unverified Critical assumptions on auth/tenancy

---

## Gate 2 — RBAC & Authorization

| Field | Value |
|-------|-------|
| **Document** | `.cursor/gates/security/rbac-security.md` |
| **When** | Any new route, menu, action |
| **Owner** | `teknovo-rbac-architect` |
| **Blocks** | Controller/UI scaffolding |

### Pass criteria

- Permissions in `domain.resource.action` format
- Role matrix updated
- Backend guard planned for every HTTP method
- UI permission state planned
- `school_id` tenancy from trusted context

---

## Gate 3 — API & Authentication

| Field | Value |
|-------|-------|
| **Document** | `.cursor/gates/security/api-security.md` |
| **When** | New/changed endpoints, webhooks |
| **Blocks** | API implementation |

### Pass criteria

- Zod validation at controller
- Rate limits on auth and expensive endpoints
- CORS explicit origins
- JWT/session TTL appropriate
- Webhook signature verification if applicable

---

## Gate 4 — Database & Data Protection

| Field | Value |
|-------|-------|
| **Document** | `.cursor/gates/security/database-security.md` |
| **When** | Migrations, new tables, exports |
| **Blocks** | Migration apply |

### Pass criteria

- Soft deletes only
- PII fields minimized in list queries
- Audit columns on mutations
- Export paths RBAC-gated and logged

---

## Gate 5 — Infrastructure & Cloudflare

| Field | Value |
|-------|-------|
| **Document** | `.cursor/gates/security/cloudflare-security.md` |
| **When** | Workers, D1, R2, DNS, tunnels |
| **Blocks** | Deploy to edge |

### Pass criteria

- Secrets not in repo
- R2 private by default
- WAF/rate limit considered
- Env separation staging/prod

---

## Gate 6 — Supply Chain (conditional)

| Field | Value |
|-------|-------|
| **Document** | `.cursor/gates/assurance/dependency-review.md` |
| **When** | New packages, GitHub Actions, MCP |
| **Blocks** | Merge with unreviewed deps |

Cross-ref assurance dependency review; security enforces CI audit policy.

---

## Gate 7 — Pre-Deploy Security Re-Check

| Field | Value |
|-------|-------|
| **When** | Before staging/production |
| **Owner** | `teknovo-security-review`, `teknovo-devops-engineer` |
| **Blocks** | `gstack-ship` |

### Pass criteria

- Differential review shows no RBAC/secret regressions
- Static analysis CI green (`.cursor/gates/assurance/static-analysis.md`)
- Second opinion complete for high-risk domains
- Rollback tested

---

## Sign-Off Template

```markdown
## Security Gate Sign-Off — [Feature]

| Gate | Status | Evidence |
|------|--------|----------|
| 1 Threat context | ✅ | Assurance scan link |
| 2 RBAC | ✅ | Matrix diff |
| 3 API | ✅ | OpenAPI + guards |
| 4 Database | ✅ | Migration review |
| 5 Infra | N/A | — |
| 6 Supply chain | ✅ | Dep review |
| 7 Pre-deploy | ☐ | CI run |

**Verdict**: PASS | BLOCK  
**Reviewer**: teknovo-security-review  
**Date**: YYYY-MM-DD
```

---

## Bypass Policy

**No bypass** for Critical security findings.

SEV-1 hotfix: minimal Gate 7 + verbal Gate 2/3; full sign-off within 48 hours. See `teknovo-incident-response`.

---

## Integration

| Document | Role |
|----------|------|
| `.cursor/gates/assurance/review-workflow.md` | Precedes this layer |
| `.cursor/gates/assurance/insecure-defaults.md` | Proactive input to Gate 1 |
| `.cursor/gates/quality/quality-gates.md` | Follows implementation |
| `agents/differential-reviewer.md` | Pre-deploy delta |
| `AGENTS.md` | Master workflow |
