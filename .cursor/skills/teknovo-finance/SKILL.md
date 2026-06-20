---
name: teknovo-finance
description: Finance domain specialist — billing plans, student payments, receipts, cash books, arrears, and finance RBAC for Teknovo school ERP.
---

# Teknovo Finance Domain Skill

Use this skill when designing, implementing, or reviewing **Finance Domain** features: fee types, billing rules, student bills, payments, receipts, cash books, and finance reports.

**Differentiation**: Unlike generic **teknovo-backend-development**, this skill enforces finance-specific immutability, audit, and cross-domain boundaries (Student, Academic external).

---

## When to Activate

- Billing, invoicing, payment, receipt, or cash book work
- Finance reports, arrears (tunggakan), or fee type configuration
- Finance RBAC (`finance.*` permissions)
- Trigger examples: "tagihan", "pembayaran", "kuitansi", "kas", "tunggakan", "billing", "finance module"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Finance Domain | `docs/domain/finance-domain.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| RBAC matrix | `docs/.cursor/gates/security/rbac-matrix.md` |
| Database standard | `docs/standards/database/database-standard.md` |
| API contract | `docs/standards/api/api-contract.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |

Schema references: `docs/database/**` (finance schema ERDs and data dictionaries)

---

## Domain Principles (Non-Negotiable)

### Financial History Is Immutable

- Posted transactions must not be hard-deleted
- Corrections via reversal/adjustment entries — never silent overwrite
- Soft delete only for draft/unposted entities

### Audit First

- Every status change on bills and payments → audit trail
- `created_by`, `updated_by`, correlation IDs on events

### External Ownership

| Entity | Owner Domain |
|--------|--------------|
| Student | Student Domain — reference by ID only |
| Class, Academic Year | Academic Domain — reference by ID only |
| Applicant payments (PPDB) | PPDB owns registration payment lifecycle; Finance may consume events |

---

## Aggregate Roots

Fee Type · Billing Rule · Student Bill · Student Payment · Payment Receipt · Cash Book · Finance Transaction · Finance Report

Implementation order: schema → repository → service (transactions) → controller → UI → events

---

## Key Workflows

### Billing Cycle

```text
Fee Type → Billing Rule → Generate Student Bills → Notify (WA event) → Collect Payment → Receipt → Cash Book Entry
```

### Payment States

Define explicit state machine in service layer:

```text
draft → pending → paid | failed | cancelled
```

Idempotency required for payment gateway callbacks (**teknovo-integration-architect**).

### Arrears (Tunggakan)

- Derived from open bills — not a separate mutable balance without audit
- Reports are read models (**teknovo-reporting**) — no write-back

---

## Events & Jobs

| Event | When |
|-------|------|
| `finance.bill.generated` | Batch or individual bill creation |
| `finance.payment.paid` | Successful payment confirmation |
| `finance.payment.failed` | Gateway or validation failure |
| `finance.receipt.issued` | Receipt number assigned |

Job naming: `finance.generate-bills`, `finance.sync-arrears-report`

Payload must include: `eventId`, `correlationId`, `traceId`, `actorId`, `studentId`, `billId`

---

## RBAC Checklist

- [ ] `@RequirePermissions('finance.bill.read')` on list endpoints
- [ ] Separate permissions for create bill, record payment, void draft, export report
- [ ] Cash book mutations restricted to finance officer roles
- [ ] UI: Permission state for unauthorized finance actions

Reference: `docs/standards/rbac/rbac-standard.md`

---

## UI Requirements

Subdomain: `finance.domain.sch.id`

- PageShell layout with 5 states on every page
- Bill list: filters by academic year, class, payment status
- Payment form: Zod validation, inline errors, receipt preview
- No direct DB access from frontend

Hand off UX planning to **teknovo-ui-ux-specialist** before build.

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Architecture gate | **teknovo-chief-architect** |
| Payment gateway integration | **teknovo-integration-architect** |
| Legacy billing import | **teknovo-data-migration** |
| Performance on large bill runs | **teknovo-performance-engineer** |
| WA payment reminders | **teknovo-communication** |
| QA payment flows | **gstack-qa**, **gstack-browser-testing** |

---

## Mandatory Output Template

```markdown
## Finance Domain Analysis: [feature]

### PRD / Domain Alignment
- [ ] References `docs/domain/finance-domain.md` sections
- [ ] No Student/Academic ownership violations

### Schema Impact
- Tables: [list]
- Immutability rules: [draft vs posted]

### API Endpoints
| Method | Route | Permission |
|--------|-------|------------|

### State Machine
[diagram or table]

### Events Published
- [event names + subscribers]

### RBAC
- [permission list]

### Test Cases
- [ ] Happy path payment
- [ ] Idempotent callback
- [ ] Immutable posted transaction
- [ ] Permission denied

### Verdict: [ready for architect gate / blocked]
```
