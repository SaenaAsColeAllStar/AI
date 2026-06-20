# Database Security â€” Teknovo Security System

> **Scope**: UUID v7, soft delete, audit logs, ownership tracking, FK constraints, data isolation  
> **Aligns with**: `docs/standards/database/database-standard.md`, `.cursor/skills/teknovo-database-architect/SKILL.md`  
> **Reject**: Hard deletes, shared ownership, cross-domain access, missing audit trails

---

## Database Security Model

PostgreSQL 17 holds authoritative school data. Access path is **Repository only** â€” no direct HTTP-to-DB, no cross-module repository imports. Database binds to `127.0.0.1`; Cloudflare Tunnel exposes API â€” not PostgreSQL.

```text
API Service â†’ Repository (tenant-aware queries) â†’ PostgreSQL (private)
                     â†“
              Audit log (append-only)
```

---

## Primary Keys â€” UUID v7

| Rule | Rationale |
|------|-----------|
| UUID v7 for all PKs | Sortable, non-enumerable, no sequence leak |
| No auto-increment | Prevents ID guessing attacks |
| Validate UUID format in API | Reject malformed IDs before query |

**Reject**: Integer IDs on student, payment, or exam tables.

---

## Soft Deletes

| Rule | Detail |
|------|--------|
| `deleted_at` on business tables | Filter `WHERE deleted_at IS NULL` in all queries |
| No hard delete | Financial, academic, exam, audit records **never** physically deleted |
| Cascade soft delete | Document parent-child soft delete behavior |
| Unique constraints | Account for soft delete (partial unique indexes) |

### Protected Tables (No Hard Delete â€” Ever)

- `student_payments`, `billing_plans`, `cash_book_entries`
- `exam_attempts`, `exam_results`, `question_banks` (published)
- `ppdb_applicants` (post-verification)
- `audit_logs`, `security_events`

---

## Audit Columns & Logs

### Row-Level Audit Columns

Every mutable table:

```text
created_at, created_by, updated_at, updated_by, deleted_at, deleted_by
```

### Append-Only Audit Log

Mutations on sensitive domains write to audit table:

| Field | Purpose |
|-------|---------|
| `actor_id` | Who performed action |
| `action` | `domain.entity.verb` |
| `entity_id` | Target UUID |
| `school_id` | Tenancy |
| `payload_hash` | Change fingerprint (not full PII dump) |
| `ip_address` | Request origin |
| `timestamp` | UTC |

**Finance payment example**: `finance.payment.created` with bill id, amount, method â€” no full card data.

---

## Ownership Tracking

| Column | Usage |
|--------|-------|
| `school_id` | Multi-tenant isolation â€” **mandatory** on school-scoped tables |
| `created_by` | Accountability |
| Domain FKs | `student_id`, `class_id`, `applicant_id` with proper constraints |

### Tenancy Rule

Every list/read/write query in repository must include `school_id` from authenticated context â€” **never** from client-supplied body alone.

```sql
-- Correct pattern (via Drizzle)
WHERE school_id = :schoolId AND deleted_at IS NULL
```

---

## Foreign Key Constraints

| Rule | Example |
|------|---------|
| FK with explicit on-delete policy | Soft delete parent â†’ children remain or cascade soft |
| No orphan PII | Student delete (soft) â†’ handle dependent records |
| Cross-schema references | Document in Architecture Impact Analysis |
| Index FK columns | Prevent slow joins enabling DoS |

**Reject**: Application-only "FK" without DB constraint on financial links.

---

## Data Isolation

### School Boundary

| Domain | Isolation |
|--------|-----------|
| Academic | Classes, grades scoped to `school_id` |
| Finance | Bills/payments per school |
| PPDB | Applicants per admission cycle + school |
| CBT | Exams and attempts per school |

### Cross-Domain Access

| Allowed | Forbidden |
|---------|-----------|
| Service calls exported public API | Repository import from another module |
| Domain events (async) | Direct SQL join across ownership boundaries without review |
| Read models in reporting | Write-back from reporting to operational tables |

Reference: `docs/architecture/data-ownership-matrix.md`

---

## Query Security

| Rule | Implementation |
|------|----------------|
| Parameterized only | Drizzle ORM â€” no string concat SQL |
| Row limits | All list queries paginated |
| Select column minimization | No `SELECT *` in hot paths with PII |
| Encryption at rest | PostgreSQL volume + backup encryption |
| PII fields | Encrypt sensitive columns where policy requires (e.g. national ID) |

---

## Migrations Security

| # | Check | Critical |
|---|-------|----------|
| D1 | Migration reviewed in Security Review if PII/finance | Yes |
| D2 | Reversible or rollback documented | Yes |
| D3 | No seed of real credentials | Yes |
| D4 | Indexes for tenant filters | Yes |
| D5 | Audit columns added to new mutable tables | Yes |
| D6 | RBAC seed for new permissions | Yes |

---

## Backup & Recovery

| Control | Detail |
|---------|--------|
| Backups | Encrypted; stored in `teknovo-backups` R2 (private) |
| Restore access | SUPER_ADMIN / break-glass only; audited |
| PII in backups | Same protection as production |

---

## Reject Patterns

| Pattern | Risk | Fix |
|---------|------|-----|
| Hard DELETE on payment | Compliance violation | Soft delete |
| Missing `school_id` | Cross-tenant leak | Add column + backfill + filter |
| Shared table without tenancy | All schools see all rows | Partition by school |
| Audit log UPDATE | Tampering | Append-only; no UPDATE/DELETE |
| Cross-module repo query | Boundary violation | Service API or event |

---

## Related

- API layer: `.cursor/gates/security/api-security.md`
- RBAC: `.cursor/gates/security/rbac-security.md`
- Cloudflare R2 backups: `.cursor/gates/security/cloudflare-security.md`
- Skill: `teknovo-database-architect`
- Memory: `.cursor/docs/memory/architecture-decisions.md`
