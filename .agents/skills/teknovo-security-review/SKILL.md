---
name: teknovo-security-review
description: Perform security audits on authentication headers, JWTs, rate limits, and CORS setups.
---

# Teknovo Security Review Skill

Use this skill when auditing codebase security, configuring credentials, or reviewing auth handlers.

**Reference**: `docs/reviews/security-review-template.md`, `docs/standards/rbac/rbac-standard.md`

**Security System**: `docs/ai/AI_SECURITY_SYSTEM.md`, `security/security-registry.yaml`, `agents/security-reviewer.md` — use for formal gates; this skill for tactical auth/CORS/JWT checks.

---

## Authentication & Sessions

| Control | Requirement |
|---------|-------------|
| Access tokens | Short-lived JWTs (15 min max) |
| Refresh tokens | HTTP-only cookies, validated against Redis sessions |
| Password hashing | Argon2id, minimum 8 characters |
| Session storage | Redis-backed, not in-memory |
| Login rate limit | 5 attempts/minute per IP |
| Token rotation | Refresh token rotated on each use |

---

## Authorization

- [ ] All endpoints have RBAC guards (no public mutation endpoints)
- [ ] Permission checks in service layer for data ownership
- [ ] No role hardcoding — use permission tokens
- [ ] Admin endpoints require elevated permissions
- [ ] File upload endpoints validate MIME type and size

---

## Input Validation

- [ ] All request payloads validated with Zod
- [ ] SQL injection prevented (Drizzle parameterized queries only)
- [ ] XSS prevented (output encoding in UI, CSP headers)
- [ ] File upload paths sanitized (no directory traversal)
- [ ] UUID parameters validated before DB lookup

---

## Secrets & Environment

- [ ] No secrets in source code or git history
- [ ] All credentials loaded from `.env` files
- [ ] `.env` files in `.gitignore`
- [ ] `.env.example` documents required vars (no values)
- [ ] Database bound to `127.0.0.1` only (no public port)
- [ ] Redis bound to `127.0.0.1` only

Reference: `docs/standards/environment/environment-standard.md`

---

## CORS & Headers

- [ ] CORS restricted to designated domain whitelist:
  - `portal.domain.sch.id`
  - `erp.domain.sch.id`
  - `ppdb.domain.sch.id`
  - `cbt.domain.sch.id`
  - `finance.domain.sch.id`
- [ ] Security headers configured:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy`
  - `Referrer-Policy: strict-origin-when-cross-origin`

Reference: `docs/infrastructure/cloudflare-setup-guide.md`

---

## Rate Limiting

| Endpoint | Limit | Implementation |
|----------|-------|----------------|
| Login | 5/min/IP | Redis counter |
| API (authenticated) | 60/min/user | Redis counter |
| API (mutations) | 30/min/user | Redis counter |
| File upload | 10/min/user | Redis counter |
| Public pages | 120/min/IP | Cloudflare rate limit |

---

## Data Protection

- [ ] Soft deletes on all business tables (no data loss)
- [ ] Audit logs on all mutations (append-only)
- [ ] PII fields encrypted at rest where required
- [ ] File uploads via presigned URLs (no direct credential exposure)
- [ ] Database backups encrypted and stored offsite

---

## Security Review Checklist

Run before every PR that touches auth, API, or data:

### Critical (blocks merge)
- [ ] No secrets in code
- [ ] All endpoints have auth + RBAC guards
- [ ] Input validation on all endpoints
- [ ] No SQL injection vectors
- [ ] CORS properly restricted

### Major (blocks merge)
- [ ] Rate limiting on auth endpoints
- [ ] Security headers configured
- [ ] Audit logging on mutations
- [ ] File upload validation

### Minor
- [ ] CSP policy tuned
- [ ] Error messages don't leak internals

---

## Security Review Output

```markdown
## Security Review: [feature/branch]

### Critical
- [ ] [finding or PASS]

### Major
- [ ] [finding or PASS]

### Minor
- [ ] [finding or PASS]

### Verdict: [PASS / FAIL]
```

---

## Incident Response

If security issue found in production:

1. Assess severity and scope
2. Rotate compromised credentials immediately
3. Fix and deploy patch
4. Document in retro (`gstack-retro`)
5. Update this skill if new pattern identified
