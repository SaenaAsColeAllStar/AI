# API Security â€” Teknovo Security System

> **Scope**: Authentication, authorization, input/output validation, rate limiting, error handling, API versioning  
> **Aligns with**: `docs/standards/api/api-contract.md`, `.cursor/skills/teknovo-api-architect/SKILL.md`  
> **Reject**: Unvalidated input, missing auth, direct DB exposure, unsafe error messages

---

## API Security Model

Teknovo APIs serve subdomain-isolated apps (`erp.*`, `ppdb.*`, `finance.*`, `cbt.*`, `api.*`). All mutation and sensitive read traffic flows through the **Controller â†’ Service â†’ Repository** stack â€” never expose repository or raw SQL to HTTP.

```text
Client (Nuxt) â†’ Cloudflare (TLS, WAF, rate limit) â†’ API (auth, RBAC, Zod) â†’ Service â†’ Repository â†’ PostgreSQL
```

---

## Authentication

| Control | Requirement |
|---------|-------------|
| Access token | JWT, max 15 min TTL |
| Refresh token | HTTP-only, Secure, SameSite cookie; Redis session store |
| Password hash | Argon2id, min 8 chars + school policy |
| Login rate limit | 5 attempts/min/IP (Redis) |
| Token rotation | Refresh rotated on each use |
| Logout | Invalidate session server-side |

**Subdomain cookies**: Scope cookies per subdomain (`erp.domain.sch.id`) â€” do not share session across unrelated subdomains without explicit SSO design.

### Public vs Protected Routes

| Type | Examples | Auth |
|------|----------|------|
| Public read | Landing, PPDB info pages | None; CDN cache |
| Public write | PPDB applicant registration | Captcha/rate limit + Zod; no auth |
| Protected | All ERP mutations, student data | Auth + RBAC mandatory |

**Reject**: "Temporary" public POST for admin actions.

---

## Authorization

Every protected route requires:

1. `AuthGuard` â€” valid session/JWT
2. `PermissionsGuard` â€” `domain.resource.action`
3. Service ownership filter â€” tenancy and IDOR prevention

See `.cursor/gates/security/rbac-security.md` for full RBAC rules.

---

## Input Validation

| Rule | Implementation |
|------|----------------|
| All payloads | Zod schemas at controller boundary |
| Path params | UUID v7 format validated before DB lookup |
| Query params | Typed DTO with max limits (page size cap) |
| File uploads | MIME allowlist, size cap, virus scan if policy requires |
| Webhooks | Signature verification + idempotency key |

### Reject Patterns

| Pattern | Risk | Fix |
|---------|------|-----|
| Raw `req.body` to service | Injection, type confusion | Zod parse â†’ typed DTO |
| String concatenation SQL | SQL injection | Drizzle parameterized only |
| Unbounded `limit=99999` | DoS, data exfil | Max page size 100 default |
| Client-supplied `school_id` | Cross-tenant write | Derive from auth context |

### PPDB Registration Example

```typescript
const CreateApplicantSchema = z.object({
  name: z.string().min(1).max(200),
  birthDate: z.string().date(),
  guardianPhone: z.string().regex(/^\+62\d{9,12}$/),
  // school_id from route/host context â€” NOT from body
});
```

---

## Output Validation & Data Minimization

| Rule | Example |
|------|---------|
| Response envelope | `{ data, meta, errors }` per API contract |
| No internal fields | Strip `deleted_at`, internal notes from public DTOs |
| PII minimization | List view: name + status; detail: full record if permitted |
| Pagination metadata | `cursor`, `hasMore` â€” never full count on huge tables |

**Reject**: Returning stack traces or SQL errors to clients.

---

## Error Handling

| Scenario | Client response | Log (server) |
|----------|-----------------|--------------|
| Validation fail | 400 + field errors | Warn, no PII dump |
| Unauthorized | 401 | Info |
| Forbidden | 403 | Info with user id |
| Not found | 404 | Careful with enumeration |
| Server error | 500 generic message | Error + correlation id |

```json
{
  "errors": [{ "code": "VALIDATION_ERROR", "field": "guardianPhone", "message": "Invalid phone format" }]
}
```

**Never expose**: connection strings, query text, file paths, secret names.

---

## Rate Limiting

| Endpoint class | Limit | Store |
|----------------|-------|-------|
| Login | 5/min/IP | Redis |
| Authenticated API | 60/min/user | Redis |
| Mutations | 30/min/user | Redis |
| File upload | 10/min/user | Redis |
| Public pages | 120/min/IP | Cloudflare edge |
| PPDB registration | 3/hour/IP | Redis + CF |

Finance payment and CBT exam start endpoints: apply **stricter** per-user limits.

---

## API Versioning

| Rule | Detail |
|------|--------|
| Path version | `/api/v1/...` â€” current standard |
| Breaking changes | New version or deprecation header + migration period |
| Deprecation | `Sunset` header; document in API contract |
| Mobile/external clients | Version pinned in integration docs |

**Security note**: Do not maintain unauthenticated legacy versions alongside v1 â€” sunset or gate behind auth.

---

## CORS & Security Headers

Production allowlist only:

- `portal.domain.sch.id`
- `erp.domain.sch.id`
- `ppdb.domain.sch.id`
- `cbt.domain.sch.id`
- `finance.domain.sch.id`

Required headers (via Cloudflare or app):

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or CSP frame-ancestors)
- `Content-Security-Policy` (tuned per app)
- `Referrer-Policy: strict-origin-when-cross-origin`

Reference: `docs/infrastructure/cloudflare-setup-guide.md`

---

## Webhooks & Integrations

| Integration | Controls |
|-------------|----------|
| Payment gateway | HMAC signature, idempotency, replay window |
| WhatsApp provider | API key in env; webhook IP allowlist if available |
| Export jobs | Async queue; download via presigned URL |

---

## API Security Checklist

| # | Check | Critical |
|---|-------|----------|
| A1 | Auth on all non-public protected routes | Yes |
| A2 | RBAC permission per route | Yes |
| A3 | Zod validation on body/query/params | Yes |
| A4 | Standard error envelope; no leak | Yes |
| A5 | Pagination on lists | Yes |
| A6 | Rate limits on auth/public/mutation | Yes |
| A7 | CORS allowlist in production | Yes |
| A8 | OpenAPI/contract updated | No |
| A9 | Idempotency on payments/webhooks | Yes |

---

## Related

- RBAC: `.cursor/gates/security/rbac-security.md`
- Database: `.cursor/gates/security/database-security.md`
- Cloudflare: `.cursor/gates/security/cloudflare-security.md`
- Skill: `teknovo-api-architect`, `teknovo-security-review`
- Agent: `agents/security-reviewer.md`
