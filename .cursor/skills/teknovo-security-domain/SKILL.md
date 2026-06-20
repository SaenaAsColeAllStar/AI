---
name: teknovo-security-domain
description: >-
  Teknovo RBAC, API, and database security — permission guards, Zod validation,
  tenancy, soft deletes, audit logs, rate limits, CORS. Use for RBAC changes,
  REST endpoints, migrations, Drizzle schema, route guards, or IDOR prevention.
---

# Teknovo Security — Domain Layer (RBAC · API · Database)

**Scope**: Authorization, API auth/validation, data protection. For gates/workflow → **teknovo-security**. For Cloudflare/R2 → **teknovo-security-infra**. For formal audit → **teknovo-security-review**.

**Source artifacts**: `.cursor/gates/security/rbac-security.md`, `.cursor/gates/security/api-security.md`, `.cursor/gates/security/database-security.md`

---

## RBAC — Core Rule

> **No route. No menu. No API. No action without permission mapping.**

Frontend hiding is **not** authorization. Backend guards are authoritative.

### Permission Format

```text
domain.resource.action
```

Examples: `ppdb.applicant.verify`, `finance.payment.create`, `cbt.exam.start`, `academic.grade.input`

### Five Access Layers (All Required)

| Layer | Implementation | Failure mode |
|-------|----------------|--------------|
| 1 Menu | Sidebar `hasPermission(...)` | Info disclosure |
| 2 Route | Nuxt middleware / route meta | Direct URL bypass |
| 3 API | Controller `@RequirePermissions` | **Critical** — mutation/theft |
| 4 Action | Button visibility | UX; pairs with layer 3 |
| 5 Data ownership | Service filters `school_id`, class, student | **Critical** — horizontal escalation |

### Data Ownership (Service Layer)

| Role | Filter |
|------|--------|
| ADMIN_* | `WHERE school_id = ctx.schoolId` |
| GURU | Assigned `class_id` / `subject_id` only |
| SISWA | `WHERE student_id = ctx.studentId` |
| ORANG_TUA | `WHERE student_id IN ctx.linkedStudentIds` |

**Reject**: Hardcoded `if (role === 'ADMIN')` — use `hasPermission(...)`.

### API Guard Pattern

```typescript
@Controller('api/v1/ppdb/applicants')
@UseGuards(AuthGuard, PermissionsGuard)
export class ApplicantController {
  @Patch(':id/verify')
  @RequirePermissions('ppdb.applicant.verify')
  async verify(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.applicantService.verify(id, user);
  }
}
```

### RBAC Checklist (Per Endpoint)

| # | Check | Critical |
|---|-------|----------|
| R1 | Permission in `domain.resource.action` format | Yes |
| R2 | Guard on class or method | Yes |
| R3 | Permission seeded + RBAC matrix updated | Yes |
| R4 | Service enforces ownership/tenancy | Yes |
| R5 | 403 for unauthorized (not silent 404 hiding) | Yes |
| R6 | Integration test: wrong role → 403 | Yes |

### Reject: Escalation & IDOR

| Vulnerability | Mitigation |
|---------------|------------|
| Horizontal escalation | Service filter by assignment |
| Vertical escalation | Deny by default; no public admin routes |
| IDOR (change UUID in URL) | Ownership check every read/write |
| Client-supplied `school_id` | Derive from auth context only |

High-risk: `finance.payment.create` — idempotency key, rate limit 30/min/user, append-only audit.

---

## API Security

```text
Client → Cloudflare (TLS, WAF, rate limit) → API (auth, RBAC, Zod) → Service → Repository → PostgreSQL
```

**Never** expose repository or raw SQL to HTTP.

### Authentication

| Control | Requirement |
|---------|-------------|
| Access token | JWT, max 15 min TTL |
| Refresh token | HTTP-only, Secure, SameSite; Redis session |
| Password | Argon2id, min 8 chars |
| Login rate limit | 5/min/IP (Redis) |
| Token rotation | Refresh rotated on each use |
| Logout | Invalidate server session |

| Route type | Auth |
|------------|------|
| Public read (landing) | None; CDN cache |
| Public write (PPDB register) | Captcha/rate limit + Zod |
| Protected (ERP, student data) | Auth + RBAC mandatory |

**Reject**: "Temporary" public POST for admin actions.

### Input Validation

| Rule | Implementation |
|------|----------------|
| All payloads | Zod at controller |
| Path params | UUID v7 validated before DB |
| Query params | Typed DTO; page size cap (max 100) |
| File uploads | MIME allowlist, size cap |
| Webhooks | Signature + idempotency key |

**Reject**: Raw `req.body` to service; string-concat SQL; unbounded `limit=99999`.

### Error Handling

| Scenario | Client | Server log |
|----------|--------|------------|
| Validation | 400 + field errors | Warn, no PII dump |
| Unauthorized | 401 | Info |
| Forbidden | 403 | Info with user id |
| Server error | 500 generic | Error + correlation id |

**Never expose**: connection strings, query text, file paths, secret names.

### Rate Limiting

| Class | Limit | Store |
|-------|-------|-------|
| Login | 5/min/IP | Redis |
| Authenticated API | 60/min/user | Redis |
| Mutations | 30/min/user | Redis |
| File upload | 10/min/user | Redis |
| Public pages | 120/min/IP | Cloudflare |
| PPDB registration | 3/hour/IP | Redis + CF |

Stricter limits on finance payment and CBT exam start.

### CORS & Headers (Production Allowlist)

- `portal.domain.sch.id`, `erp.domain.sch.id`, `ppdb.domain.sch.id`, `cbt.domain.sch.id`, `finance.domain.sch.id`

Required: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`

### API Checklist

| # | Check | Critical |
|---|-------|----------|
| A1 | Auth on protected routes | Yes |
| A2 | RBAC permission per route | Yes |
| A3 | Zod on body/query/params | Yes |
| A4 | Standard error envelope | Yes |
| A5 | Pagination on lists | Yes |
| A6 | Rate limits on auth/public/mutation | Yes |
| A7 | CORS allowlist in production | Yes |
| A8 | Idempotency on payments/webhooks | Yes |

---

## Database Security

```text
API Service → Repository (tenant-aware) → PostgreSQL (127.0.0.1)
                     ↓
              Audit log (append-only)
```

### Primary Keys & Soft Deletes

- **UUID v7** for all PKs — no auto-increment on student/payment/exam tables
- **`deleted_at`** on business tables; filter `WHERE deleted_at IS NULL`
- **No hard delete** on: payments, exam results, PPDB post-verification, audit logs

### Audit

Every mutable table: `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`

Sensitive mutations → append-only audit: `actor_id`, `action`, `entity_id`, `school_id`, `payload_hash`, `ip_address`, `timestamp`

### Tenancy

Every repository query includes `school_id` from authenticated context — **never** from client body alone.

```sql
WHERE school_id = :schoolId AND deleted_at IS NULL
```

### Query Rules

| Rule | Detail |
|------|--------|
| Parameterized only | Drizzle — no string concat SQL |
| Row limits | All lists paginated |
| Column minimization | No `SELECT *` with PII in hot paths |
| Cross-module | Service API or events — no cross-module repo imports |

### Migration Checklist

| # | Check | Critical |
|---|-------|----------|
| D1 | Reviewed if PII/finance | Yes |
| D2 | Rollback documented | Yes |
| D3 | No real credentials in seed | Yes |
| D4 | Indexes for tenant filters | Yes |
| D5 | Audit columns on new mutable tables | Yes |
| D6 | RBAC seed for new permissions | Yes |

### Reject Patterns

| Pattern | Fix |
|---------|-----|
| Hard DELETE on payment | Soft delete |
| Missing `school_id` | Add column + backfill + filter |
| Audit log UPDATE | Append-only only |
| Cross-module repo query | Service boundary |

---

## Orchestration Skills

| Gap | Skill |
|-----|-------|
| RBAC design | `teknovo-rbac-architect` |
| API contract | `teknovo-api-architect` |
| Schema/migrations | `teknovo-database-architect` |
