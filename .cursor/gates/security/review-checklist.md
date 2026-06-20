# Security Review Checklist — Teknovo Security System

> **Usage**: Complete before implementation sign-off, PR, deploy, and security audits  
> **Agent**: `agents/security-reviewer.md` validates this checklist  
> **Verdict**: Any ❌ in Critical rows → BLOCK until resolved

---

## How to Use

1. Select sections matching the change (RBAC-only PR skips Cloudflare unless infra touched)
2. Mark ✅ pass, ❌ fail, N/A with reason
3. Attach evidence: permission matrix diff, test output, config redacted screenshots
4. Produce Security Review artifact with Risk Level and Approval Recommendation
5. Cross-check `.cursor/gates/quality/review-checklist.md` section 6 (Security) — both must align

**CLI context**: `python .cursor/runtime/load-memory.py --include-security --security-bundle full`

---

## 1. Authentication

| # | Check | Critical |
|---|-------|----------|
| 1.1 | Protected routes require valid session/JWT | Yes |
| 1.2 | Access token TTL ≤ 15 minutes | Yes |
| 1.3 | Refresh token HTTP-only, Secure, SameSite | Yes |
| 1.4 | Passwords hashed with Argon2id | Yes |
| 1.5 | Login rate limit enforced (5/min/IP) | Yes |
| 1.6 | Logout invalidates server session | No |
| 1.7 | Public routes explicitly documented | Yes |

**Reference**: `.cursor/gates/security/api-security.md`, `teknovo-security-review`

---

## 2. Authorization (RBAC)

| # | Check | Critical |
|---|-------|----------|
| 2.1 | Permission format `domain.resource.action` | Yes |
| 2.2 | API guard on **every** HTTP method including GET | Yes |
| 2.3 | UI route guard matches API permission | Yes |
| 2.4 | Menu/action visibility aligned | Yes |
| 2.5 | Service-layer data ownership enforced | Yes |
| 2.6 | RBAC matrix updated | Yes |
| 2.7 | 403 integration test for unauthorized role | Yes |
| 2.8 | No role hardcoding for access decisions | Yes |

**Reference**: `.cursor/gates/security/rbac-security.md`, `teknovo-rbac-architect`

---

## 3. Validation

| # | Check | Critical |
|---|-------|----------|
| 3.1 | Zod validation on all request payloads | Yes |
| 3.2 | UUID params validated before DB access | Yes |
| 3.3 | File upload MIME/size validated | Yes |
| 3.4 | Pagination max enforced on lists | Yes |
| 3.5 | Webhook signatures verified | Yes |
| 3.6 | No client-supplied tenancy bypass (`school_id` in body) | Yes |

**Reference**: `.cursor/gates/security/api-security.md`

---

## 4. Auditability

| # | Check | Critical |
|---|-------|----------|
| 4.1 | Audit columns on new mutable tables | Yes |
| 4.2 | Sensitive mutations write append-only audit log | Yes |
| 4.3 | Actor (`created_by`/`updated_by`) populated | Yes |
| 4.4 | Financial/exam actions auditable | Yes |
| 4.5 | No hard delete on protected records | Yes |

**Reference**: `.cursor/gates/security/database-security.md`

---

## 5. Traceability

| # | Check | Critical |
|---|-------|----------|
| 5.1 | Security Review artifact for significant changes | Yes |
| 5.2 | Architecture Impact includes RBAC/Security section | Yes |
| 5.3 | Plan documents security controls | Yes |
| 5.4 | Deployment Impact for infra changes | Yes |

**Reference**: `.cursor/gates/security/security-gates.md`

---

## 6. Least Privilege

| # | Check | Critical |
|---|-------|----------|
| 6.1 | Permissions granted minimally per role | Yes |
| 6.2 | No wildcard over-permission (`finance.*`) without ADR | Yes |
| 6.3 | Cloudflare/R2 tokens scoped to required buckets/zones | Yes |
| 6.4 | CI secrets minimal scope | Yes |
| 6.5 | Agent/MCP tools limited to task scope | Yes |

**Reference**: `.cursor/gates/security/security-principles.md`, `.cursor/gates/security/ai-agent-security.md`

---

## 7. Secrets Management

| # | Check | Critical |
|---|-------|----------|
| 7.1 | No secrets in source or git history | Yes |
| 7.2 | `.env` gitignored; `.env.example` without values | Yes |
| 7.3 | Wrangler/CI secrets for Cloudflare tokens | Yes |
| 7.4 | Presigned URLs for R2 — no frontend keys | Yes |
| 7.5 | Logs redact PII and secrets | Yes |

**Reference**: `.cursor/gates/security/cloudflare-security.md`, `teknovo-security-review`

---

## 8. Data Protection

| # | Check | Critical |
|---|-------|----------|
| 8.1 | UUID v7 primary keys | Yes |
| 8.2 | Soft delete with query filters | Yes |
| 8.3 | `school_id` tenancy on scoped tables | Yes |
| 8.4 | Parameterized queries only (Drizzle) | Yes |
| 8.5 | PII minimized in API responses | Yes |
| 8.6 | Encrypted backups (R2 private bucket) | No |

**Reference**: `.cursor/gates/security/database-security.md`

---

## 9. Infrastructure Security

| # | Check | Critical |
|---|-------|----------|
| 9.1 | Services bind `127.0.0.1` — not public DB port | Yes |
| 9.2 | Cloudflare Tunnel for ingress | Yes |
| 9.3 | CORS production allowlist | Yes |
| 9.4 | Security headers (HSTS, CSP, nosniff) | Yes |
| 9.5 | WAF/rate limits on public endpoints | Yes |
| 9.6 | Staging validated before production | Yes |

**Reference**: `.cursor/gates/security/cloudflare-security.md`, `.cursor/docs/memory/architecture-decisions.md`

---

## 10. AI Agent Safety

| # | Check | Critical |
|---|-------|----------|
| 10.1 | No autonomous production deploy | Yes |
| 10.2 | No autonomous prod DNS changes | Yes |
| 10.3 | Commits exclude credentials | Yes |
| 10.4 | Security bundle loaded before risky implementation | Yes |
| 10.5 | MCP scope justified and minimal | Yes |

**Reference**: `.cursor/gates/security/ai-agent-security.md`

---

## Severity Summary

| Level | Blocks merge/deploy? | Examples |
|-------|----------------------|----------|
| Critical | Yes | Missing API auth, secret in repo, cross-tenant query |
| High | Yes | Missing audit on payment, no rate limit on login |
| Medium | Conditional | Incomplete OpenAPI, missing CSP tuning |
| Low | No | Doc gap, optional hardening |

---

## Quick Status Template

```markdown
## Security Checklist — [Feature/PR]

| Section | Status | Notes |
|---------|--------|-------|
| Authentication | ☐ | |
| Authorization | ☐ | |
| Validation | ☐ | |
| Auditability | ☐ | |
| Traceability | ☐ | |
| Least Privilege | ☐ | |
| Secrets | ☐ | |
| Data Protection | ☐ | |
| Infrastructure | ☐ | |
| AI Agent Safety | ☐ | |

**Critical failures**: 0  
**Ready for Security Reviewer**: ☐ Yes ☐ No
```

---

## Related

- Gates: `.cursor/gates/security/security-gates.md`
- Reviewer: `agents/security-reviewer.md`
- Quality cross-check: `.cursor/gates/quality/review-checklist.md` §6
- Skill: `.cursor/skills/teknovo-security-review/SKILL.md`
