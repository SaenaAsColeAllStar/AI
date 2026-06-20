# Architecture Excellence Principles â€” Teknovo Impeccable Architect

> **Authority**: Pillar 2 â€” Chief Architect; ADRs (`docs/adr/**`)  
> **Layer order**: Feature â†’ API â†’ Service â†’ Repository â†’ Database (from `AGENTS.md`)

---

## Purpose

Teknovo is a multi-domain school ERP on a monorepo with strict bounded contexts. Architecture excellence means **clear ownership**, **predictable boundaries**, and **maintainable evolution** â€” not clever abstractions.

---

## Pre-Proposal Evaluation

Before proposing any architecture, answer these four questions in writing.

### 1. Domain Ownership

**Question**: Which bounded context owns this data and behavior?

| Domain | Owns | Must not own |
|--------|------|--------------|
| PPDB | Applicants, selection, registration | Student billing rules |
| Finance | Billing, payments, receipts | Grade calculation |
| Academic | Classes, attendance, grades | Payment status |
| CBT | Exams, attempts, results | Applicant records |
| Communication | WA devices, templates, campaigns | Academic schedules |

**Pass criteria**:
- Owner listed in data-ownership matrix
- Cross-domain reads via API or read model â€” not direct repository import
- Domain events documented for side effects (e.g., `StudentEnrolled` â†’ Finance creates billing plan)

**Reject when**:
- Service in Module A queries Module B's repository directly
- Shared "utils" table without owner
- FK across domains without documented contract

---

### 2. API Boundaries

**Question**: What is the public contract â€” and what stays internal?

**Standard stack**:

```text
HTTP Controller  â†’  Zod validation  â†’  Service  â†’  Repository  â†’  PostgreSQL
```

| Rule | Requirement |
|------|-------------|
| Export surface | Services only â€” repositories are module-private |
| Validation | Zod at controller boundary |
| Response | Standard JSON envelope per API contract |
| Versioning | Breaking changes require ADR or versioned route |
| Permissions | Every route mapped to `domain.resource.action` |

**Teknovo examples**:

| Endpoint | Owner service | Wrong pattern |
|----------|---------------|---------------|
| `POST /api/v1/ppdb/applicants/:id/verify` | `PpdbVerificationService` | Controller calls `FinanceRepository` |
| `GET /api/v1/finance/arrears` | `ArrearsQueryService` | Raw SQL in controller |
| `POST /api/v1/cbt/exams/:id/start` | `ExamAttemptService` | Shared god-service `SchoolService` |

**Reject when**:
- Fat controllers with business logic
- DTOs bypassing Zod
- Internal endpoints exposed without RBAC
- Circular module dependencies

---

### 3. Data Ownership

**Question**: Who may write this row â€” and how are deletes handled?

| Rule | Standard |
|------|----------|
| Primary keys | UUID v7 only â€” no auto-increment |
| Deletes | Soft delete (`deleted_at`); all queries filter |
| Audit | `created_at`, `updated_at`, `created_by`, `updated_by` |
| Tenancy | School scope on every tenant table |
| Migrations | Drizzle; reversible when possible; owned by domain team |

**Reject when**:
- Hard delete on financial or exam records
- Nullable `school_id` on tenant data
- Migration altering another domain's tables without architect review
- JSON blob replacing normalized schema without justification

---

### 4. Future Maintenance Cost

**Question**: What happens when PPDB rules change next year?

| Strategy | When |
|----------|------|
| Configuration | School-specific thresholds, templates |
| Feature flags | Gradual rollout (CBT proctoring modes) |
| Events | Downstream modules react without tight coupling |
| Read models | Reporting aggregates â€” no write-back |

**Reject when**:
- Business rules embedded in UI components
- Copy-paste schema across modules
- "Temporary" cross-module import still present after two sprints

---

## Preferred Layer Flow

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Feature   â”‚  User story, PRD, acceptance criteria
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     API     â”‚  Routes, Zod schemas, RBAC guards, OpenAPI
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Service   â”‚  Business logic, transactions, domain events
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Repository  â”‚  Drizzle queries, soft-delete filters (private)
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Database   â”‚  PostgreSQL 17, indexes, constraints
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Never skip layers.** UI must not call repository. Service must not return raw DB rows to HTTP without mapping.

---

## Architecture Decision Record Triggers

Create or update ADR when:

- New bounded context or module boundary shift
- New external integration (payment gateway, WA provider)
- Auth/RBAC model change
- Subdomain or deployment topology change
- Shared library extracted to `packages/`

---

## Cross-Domain Patterns (Approved)

| Pattern | Example |
|---------|---------|
| Domain event | `ApplicantAccepted` â†’ Academic creates student record |
| Query API | Finance reads student name via `GET /students/:id/summary` |
| Read model | Reporting dashboard from materialized view |
| Anti-corruption layer | Legacy import adapter in `teknovo-data-migration` |

---

## Anti-Patterns (Automatic Reject)

| Anti-pattern | Consequence |
|--------------|-------------|
| God service | Untestable, merge conflicts |
| Shared repository barrel export | Layer violation |
| Anemic domain + fat SQL | Logic scattered |
| UI-driven schema | Tables shaped by one screen |
| `any` / `@ts-ignore` | Type safety collapse |

---

## Architecture Review Output

Before implementation, produce **Architecture Impact Analysis**:

1. Modules and folders affected
2. Schema changes with owner domain
3. API table (method, route, permission, payload)
4. RBAC additions
5. Event flows (if cross-domain)
6. Rollback plan

**Related**: `.cursor/skills/teknovo-chief-architect/SKILL.md`, `.cursor/gates/quality/quality-gates.md`, `.cursor/gates/quality/review-checklist.md`
