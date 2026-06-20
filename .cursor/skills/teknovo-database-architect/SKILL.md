---
name: teknovo-database-architect
description: Design PostgreSQL 17 schemas, manage Drizzle migrations, enforce soft deletes, indexing strategies, and audit tables.
---

# Teknovo Database Architect Skill

Use this skill when modifying database structures, designing schemas, writing repository methods, or validating SQL migrations.

**Reference**: `docs/standards/database/database-standard.md`, `docs/database/schema-contract.md`, `docs/database/drizzle-contract.md`

---

## PostgreSQL 17 Standards

### Primary Keys
- **UUID v7** mandatory for all primary keys
- Auto-increment integer PKs are **strictly forbidden**
- Use `uuid('id').primaryKey().$defaultFn(() => uuidv7())`

### Audit Columns (Every Business Table)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID v7 | Yes | Primary key |
| `created_at` | timestamptz | Yes | Default `now()` |
| `updated_at` | timestamptz | Yes | Auto-update on change |
| `created_by` | UUID v7 | Yes | FK to auth.users |
| `updated_by` | UUID v7 | Yes | FK to auth.users |
| `deleted_at` | timestamptz | Yes | Nullable, soft delete marker |

### Soft Deletes
- All read queries: `WHERE deleted_at IS NULL`
- Delete operation: `UPDATE SET deleted_at = now(), updated_by = :actorId`
- Hard `DELETE` statements are **forbidden** on business tables
- Exception: audit/event store tables (append-only, no deletes at all)

### Foreign Keys
- Default: `ON DELETE RESTRICT`
- `ON DELETE CASCADE` requires explicit ADR approval
- All FKs must reference UUID v7 PKs

---

## Schema Organization

Tables belong to domain schemas:

| Schema | Domain | Examples |
|--------|--------|----------|
| `auth` | Authentication | users, roles, permissions, sessions |
| `student` | Student lifecycle | students, guardians, documents |
| `academic` | Academics | classes, grades, schedules, attendances |
| `finance` | Finance | bills, payments, receipts, cash_books |
| `cbt` | Testing | question_banks, exam_sessions, attempts |
| `wa` | WhatsApp | templates, campaigns, messages |
| `ppdb` | Admissions | applicants, registrations, verifications |
| `audit` | Audit | audit_logs, activity_logs, event_store |
| `master` | Master data | schools, settings |
| `system` | System | migrations, configs |

Reference: `docs/architecture/data-ownership-matrix.md`

---

## Indexing Strategy

Create explicit indexes for:

- `deleted_at` (partial index: `WHERE deleted_at IS NULL`)
- All foreign key columns
- Columns used in `WHERE`, `JOIN`, `ORDER BY`
- Unique constraints (NISN, NIS, email)
- Composite indexes for common query patterns

```sql
CREATE INDEX idx_students_active ON student.students (school_id)
  WHERE deleted_at IS NULL;
```

---

## Migration Workflow

```bash
# 1. Modify Drizzle schema file
# 2. Generate migration
pnpm drizzle-kit generate

# 3. Review generated SQL — verify audit columns, indexes, constraints
# 4. Apply locally
pnpm drizzle-kit migrate

# 5. Test against clean DB and DB with existing data
# 6. Include migration files in PR
```

**Rules**:
- Never manually edit production database
- Never skip migration review
- Always test rollback path for destructive migrations

---

## Drizzle Schema Pattern

```typescript
export const attendances = pgTable('attendances', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  studentId: uuid('student_id').notNull().references(() => students.id),
  classId: uuid('class_id').notNull().references(() => classes.id),
  date: date('date').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by').notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  activeIdx: index('idx_attendances_active').on(table.studentId)
    .where(isNull(table.deletedAt)),
}));
```

---

## Review Checklist

- [ ] UUID v7 on all PKs
- [ ] All 6 audit columns present
- [ ] Soft delete filter in repository queries
- [ ] FK constraints with RESTRICT
- [ ] Indexes on filter/join columns
- [ ] Correct schema/domain ownership
- [ ] Migration generated and reviewed
- [ ] No duplicate table ownership across domains
