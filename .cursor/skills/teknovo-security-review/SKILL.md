---
name: teknovo-security-review
description: >-
  Teknovo security audit and review gate — APPROVE/BLOCK verdict, attack surface
  mapping, ten-section checklist, tactical JWT/CORS/rate-limit/secrets checks.
  Use for security review, security audit, OWASP, vulnerability check, pre-deploy
  security, or PRs touching auth, RBAC, API, PII, payments, or infra.
---

# Teknovo Security Review

**Scope**: Formal Security Review with verdict. For principles/gates → **teknovo-security**. For domain controls → **teknovo-security-domain**. For Cloudflare/agent → **teknovo-security-infra**.

**Agent artifact**: `agents/security-reviewer.md` · **Full checklist**: [reference.md](reference.md)

## When to Activate

- User requests security review, audit, or vulnerability check
- **Before implementation** — after architecture, before first code
- Before RBAC, API, DB, or Cloudflare changes
- Before deploy or production release
- Any change touches auth, permissions, PII, payments, or infra secrets

## Review Workflow

### Step 1 — Gather Context

1. User request / plan / PR description
2. Architecture Impact Analysis (RBAC/Security sections)
3. Diff or files under review
4. Relevant ADR and `.cursor/docs/memory/architecture-decisions.md`
5. Security bundle matching change type

```bash
python .cursor/runtime/load-memory.py --include-security --security-bundle pre-api
python .cursor/runtime/load-memory.py --include-security --security-bundle pre-deploy
```

### Step 2 — Map Attack Surface

Document: new/changed endpoints; data classes (PII, financial, exam); external integrations; infra changes (DNS, R2, tunnel, secrets); agent/automation scope.

### Step 3 — Run Checklist

Execute applicable sections from [reference.md](reference.md). Cross-check `.cursor/gates/quality/review-checklist.md` §6 (Security).

### Step 4 — Assess Risk

| Level | Criteria |
|-------|----------|
| **Critical** | Auth bypass, secret exposure, cross-tenant write |
| **High** | Missing audit on payment, no login rate limit, IDOR likely |
| **Medium** | Incomplete headers, doc gaps with partial controls |
| **Low** | Hardening opportunities |

### Step 5 — Mitigation Plan

Each finding: control, owner layer (API/Service/DB/Infra), verification test.

### Step 6 — Verdict

| Verdict | Meaning |
|---------|---------|
| **APPROVE** | No Critical/High open items |
| **APPROVE WITH CONDITIONS** | High items tracked before merge/deploy milestone |
| **BLOCK** | Critical or unmitigated High — do not implement/merge/deploy |

## Automatic BLOCK

```text
❌ Mutation endpoint without RBAC guard
❌ Permission check only in Vue/Nuxt, not API
❌ Hard delete on financial/exam/audit records
❌ Secret in source, commit, or client bundle
❌ PostgreSQL or Redis bound to 0.0.0.0
❌ R2 credentials in frontend
❌ List endpoint without school_id filter
❌ Agent autonomous production deploy
❌ Client-supplied school_id trusted for authorization
❌ Raw SQL string concatenation with user input
```

## Tactical Controls (Quick Audit)

### Authentication & Sessions

| Control | Requirement |
|---------|-------------|
| Access tokens | JWT, max 15 min TTL |
| Refresh tokens | HTTP-only cookies; Redis sessions |
| Password hashing | Argon2id, min 8 chars |
| Login rate limit | 5/min/IP |
| Token rotation | Refresh rotated on each use |

### Secrets & Environment

- No secrets in source or git history
- Credentials from env / secret store only
- `.env` gitignored; `.env.example` without values
- DB and Redis bound to `127.0.0.1` only

Reference: `docs/standards/environment/environment-standard.md`

### CORS & Headers

Production allowlist: `portal.*`, `erp.*`, `ppdb.*`, `cbt.*`, `finance.*` (per school domain)

Required: HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, CSP, `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Login | 5/min/IP |
| API (authenticated) | 60/min/user |
| Mutations | 30/min/user |
| File upload | 10/min/user |
| Public pages | 120/min/IP (Cloudflare) |

## Output Template

Use the full template in [reference.md](reference.md). Minimum:

```markdown
## Security Review — [Subject]

**Risk Level**: Critical | High | Medium | Low
**Approval Recommendation**: APPROVE | APPROVE WITH CONDITIONS | BLOCK
**Gate**: Pre-Implementation | Pre-Deploy | Pre-Production

### Executive Summary
[2-3 sentences]

### Findings
#### 1. [Title]
- **Severity**: Critical | High | Medium | Low
- **Mitigation**: [control + test]

### Approval Recommendation
**APPROVE** | **APPROVE WITH CONDITIONS** | **BLOCK**
```

## Gate Enforcement

| Gate | Action |
|------|--------|
| Pre-Implementation | BLOCK code start if Critical RBAC/validation gaps in plan |
| Pre-Deploy | BLOCK `gstack-ship` if secrets/infra checklist fails |
| Pre-Production | BLOCK release if staging security evidence stale |

## Skill Orchestration

| Finding | Skill |
|---------|-------|
| RBAC gap | `teknovo-rbac-architect` |
| API/auth | `teknovo-api-architect` |
| Schema/audit | `teknovo-database-architect` |
| Cloudflare/R2 | `teknovo-cloudflare-stack`, `teknovo-devops-engineer` |
| Deploy | `gstack-ship` |
| Incident | `teknovo-incident-response` |

## Incident Response

If security issue found in production:

1. Assess severity and scope
2. Rotate compromised credentials immediately
3. Fix and deploy patch
4. Document in retro (`gstack-retro`)
5. Update security skills if new pattern identified

## Tone

Direct, risk-focused, no hedging on BLOCK. Cite `.cursor/gates/security/**` documents. Every Critical/High finding includes exploit scenario + fix.
