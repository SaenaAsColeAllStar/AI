# Architecture Taste â€” Teknovo Taste System

> **Layer**: Taste (judgement & restraint) â€” precedes `.cursor/gates/quality/architecture-principles.md`  
> **Role**: Principal architect filter on *how little structure* solves the problem  
> **Stack**: Feature â†’ API â†’ Service â†’ Repository â†’ Database

---

## Purpose

Architecture taste prevents **elegant overengineering** â€” the monorepo full of abstractions nobody asked for. Teknovo serves Indonesian schools on Cloudflare edge + PostgreSQL; the architecture must be **boring, owned, and deletable**.

Quality verifies layer isolation and RBAC; **taste rejects systems that should be one module, one table, one service**.

**Precedence**: When taste says "too many layers," simplify before passing architecture quality gates.

---

## Evaluate Every Design

| Dimension | Taste question | Pass |
|-----------|----------------|------|
| **Complexity** | Can a new agent understand this module in 30 minutes? | Yes â€” or document why not |
| **Scalability** | Will this work for 5,000 students without redesign? | Index + pagination plan |
| **Maintainability** | One team owns end-to-end? | Clear domain in ownership matrix |
| **Domain boundaries** | Does data have a single writer? | Yes â€” events for cross-domain reads |

---

## Reject: Architecture Anti-Patterns

### Premature abstraction

| Smell | Teknovo example | Fix |
|-------|-----------------|-----|
| Generic `BaseCrudService<T>` | Shared magic for PPDB + Finance | Explicit services per aggregate |
| Plugin system for 2 integrations | WA provider adapter framework | Two provider classes behind interface |
| Event bus for sync CRUD | Publish `StudentUpdated` on every field blur | Events on state transitions only |
| Repository interface + impl for one DB | `IApplicantRepository` with single Drizzle impl | Concrete repository until second impl needed |

**Rule**: Abstract on the **second** proven duplicate, not the first guess.

### Overengineering

- **CQRS** for simple CRUD lists â€” reject unless read model proven bottleneck.
- **Saga orchestrator** for two-table updates â€” use transaction.
- **Feature flags** for every toggle â€” school settings table suffices.
- **Separate microservice** for reports â€” reporting is read model in monorepo until scale demands split.

### Microservices without need

Teknovo V2 is a **modular monolith** on Cloudflare Workers + D1/PostgreSQL. Do not split:

- PPDB service on separate deployable
- "Notification microservice" before queue throughput measured

Split only when: independent scaling, team boundary, or failure isolation is **documented and measured**.

### Excessive patterns / layers

```text
Bad: Controller â†’ Facade â†’ Orchestrator â†’ CommandHandler â†’ Service â†’ Repository â†’ DAO
Good: Controller â†’ Service â†’ Repository â†’ Database
```

Forbidden:

- Controller calling repository directly (layer violation â€” quality catches)
- **Five** intermediate layers between controller and database (taste catches)

### Cross-module repository imports

Never. Service-to-service via published interface or domain events only.

---

## Prefer: Simple Systems

### Layer contract (Teknovo)

```text
Feature (UI/page)
    â†“ HTTP
API (Controller + Zod validation + RBAC guard)
    â†“
Service (business rules, transactions, events)
    â†“
Repository (Drizzle queries, soft-delete filters)
    â†“
Database (PostgreSQL 17, UUID v7 PKs)
```

One direction. No shortcuts down; no skips up.

### Clear ownership

| Domain | Owns writes | Others consume via |
|--------|-------------|-------------------|
| PPDB | applicants, admission status | events â†’ Academic (enrollment) |
| Finance | invoices, payments | read APIs for Reporting |
| Academic | classes, grades, attendance | Reporting read models |
| CBT | exams, attempts, results | Academic grade import (explicit) |

Reference: `docs/architecture/data-ownership-matrix.md`

### Explicit boundaries

- **API**: REST + standard JSON envelope; OpenAPI for public routes.
- **RBAC**: Permission per route and UI action â€” no implicit "admin can all."
- **Soft deletes**: `deleted_at` filter in repository â€” not optional.
- **Migrations**: One module folder owns schema files.

### When to add complexity (allowed)

| Trigger | Acceptable addition |
|---------|---------------------|
| Proven duplicate logic in 3+ services | Shared domain helper (not god util) |
| Cross-domain workflow | Outbox + event handler |
| Report chokes OLTP | Read replica or materialized view |
| External integration | Adapter + webhook idempotency table |

Each requires ADR if structural.

---

## Teknovo Module Taste

### PPDB

- **Prefer**: `applicants`, `applicant_documents`, `admission_cycles` â€” normalized, not EAV.
- **Reject**: Configurable workflow engine for 4 fixed stages.

### Finance

- **Prefer**: Ledger-style payment records; idempotent receipt numbers.
- **Reject**: Double-entry accounting framework unless finance PRD phase 2.

### CBT

- **Prefer**: Immutable attempt snapshots; append-only results.
- **Reject**: Real-time WebSocket proctoring infra on v1.

### Communication

- **Prefer**: Queue table + worker retry for WA sends.
- **Reject**: Kafka because "enterprise."

---

## Simplification Prompts

Before Architecture Impact Analysis (Pillar 2), answer:

1. **Tables**: Can we merge any? Can any be a JSON column on parent?
2. **Endpoints**: Can list + detail + mutate cover it without custom RPC explosion?
3. **Services**: One service per aggregate root â€” are we splitting too fine?
4. **Events**: Is this sync read sufficient? Event only if decoupling required.
5. **Delete test**: If we removed this module boundary, what breaks?

---

## Cross-References

| Document | Relationship |
|----------|--------------|
| `.cursor/gates/quality/architecture-principles.md` | Formal architecture quality bar |
| `.cursor/gates/quality/engineering-principles.md` | Code-level standards |
| `.cursor/docs/memory/architecture-decisions.md` | ADR summaries |
| `.cursor/gates/taste/taste-gates.md` | Gate 4 â€” Architecture Taste |
| `.cursor/skills/teknovo-chief-architect/SKILL.md` | Pillar 2 gate |

---

## Principal Architect Sign-Off

Architecture taste passes when:

- [ ] Layer stack is Controller â†’ Service â†’ Repository â†’ DB â€” no extra tiers
- [ ] No abstraction without second use case
- [ ] Domain owner identified; no shared mutable tables
- [ ] Monolith modules preferred over new deployables
- [ ] `teknovo-chief-architect` agrees design is minimal viable

**The best architecture is the one you can delete module-by-module without archaeology.**
