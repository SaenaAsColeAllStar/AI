---
name: teknovo-data-migration
description: Data migration specialist — seed data, legacy imports, ETL pipelines, and data integrity validation for Teknovo school ERP.
---

# Teknovo Data Migration Skill

Use this skill for **seed scripts, legacy system imports, bulk data fixes, and migration verification** — not routine Drizzle schema migrations (see **teknovo-database-architect**).

**Differentiation**: Schema migrations change structure; data migration moves or transforms **business data** with integrity checks and rollback plans.

---

## When to Activate

- Import students, bills, or applicants from legacy Excel/DB
- Environment seed data for staging/demo schools
- Post-incident data repair (with architect approval)
- Trigger examples: "data migration", "import legacy", "seed data", "ETL", "bulk import", "data integrity"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Database standard | `docs/standards/database/database-standard.md` |
| Drizzle contract | `docs/database/drizzle-contract.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| Domain docs | `docs/domain/**` |

---

## Migration Principles

### Domain Ownership Respect

- Import into correct schema only — no cross-domain table writes from one script
- Student data → Student schema; bills → Finance; applicants → PPDB
- Use service-layer orchestration for cross-domain creates (events, not direct FK hacks)

### UUID v7

- Generate UUID v7 for all imported PKs — never reuse legacy integers as PKs
- Maintain `legacy_id` mapping table if traceability required

### Immutability & Audit

- Finance posted transactions: import as historical read-only records with audit metadata
- Never hard-delete to "fix" import errors — use reversal pattern (**teknovo-finance**)

### Idempotent Runs

- Migration scripts safe to re-run (upsert by natural key or legacy mapping)
- Log row-level failures without stopping entire batch (configurable)

### Soft Deletes

- Imported inactive records get `deleted_at` if applicable — not skipped silently

---

## Migration Workflow

```text
1. Discovery → source schema mapping
2. Dry-run on staging copy
3. Validation report (counts, checksums, sample spot-check)
4. Architect approval (teknovo-chief-architect)
5. Execute with transaction batches
6. Post-migration verification
7. Rollback plan documented before execute
```

### Validation Checklist

- [ ] Row counts match expected (+ documented exclusions)
- [ ] FK integrity — all references resolve
- [ ] No orphan bills without students
- [ ] RBAC test user can access imported data
- [ ] Events published for downstream sync (WA, reporting)

---

## Domain-Specific Notes

| Domain | Skill Reference |
|--------|-----------------|
| Finance | Immutable transactions, fee type mapping |
| PPDB | Applicant vs Student — import stage correct |
| Academic | Academic year / class hierarchy before enrollments |
| CBT | Question bank format validation |

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Schema changes | **teknovo-database-architect** |
| Architecture approval | **teknovo-chief-architect** |
| External source API | **teknovo-integration-architect** |
| Performance on large import | **teknovo-performance-engineer** |
| Incident-related repair | **gstack-investigate**, **teknovo-incident-response** |

---

## Mandatory Output Template

```markdown
## Data Migration Plan: [source → Teknovo]

### Scope
- Domains: [ ]
- Record types: [ ]
- Volume: [approx rows]

### Field Mapping
| Source | Target table.column | Transform |

### Legacy ID Strategy
- Mapping table: [yes/no]
- Natural keys: [ ]

### Dry-Run Results
- Inserted: [ ]
- Failed: [ ]
- Sample verification: [ ]

### Rollback Plan
[steps]

### Approval
- [ ] Chief architect sign-off
- [ ] Finance immutability reviewed (if applicable)

### Post-Migration Verification
- [ ] Automated checks pass
- [ ] Manual spot-check [n] records

### Verdict: [approved for execute / blocked]
```
