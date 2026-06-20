# Engineering Excellence Principles â€” Teknovo Impeccable Architect

> **Authority**: Coding Standard, `.cursor/docs/memory/coding-standards.md`, `teknovo-backend-development`, `teknovo-feature-implementation`  
> **Reject threshold**: Duplicate code, god components/services, tight coupling, hidden dependencies

---

## Purpose

Engineering excellence keeps Teknovo maintainable across dozens of modules and hundreds of school deployments. Code must be **readable by the next agent**, **testable without production**, and **secure by default**.

---

## Evaluation Dimensions

### 1. Readability

**Question**: Can a senior engineer understand intent in one pass?

| Practice | Standard |
|----------|----------|
| Naming | `kebab-case` files; `PascalCase` types; verbs for functions |
| Function size | Single responsibility; extract when > ~40 lines |
| Nesting | Early returns; max 3 levels |
| Types | Strict TypeScript â€” no `any`, no `@ts-ignore` |
| Comments | Only non-obvious business rules (e.g., Dapodik field mapping) |

**Teknovo example â€” GOOD**:

```typescript
// modules/finance/services/arrears-query.service.ts
async listOverdueInvoices(schoolId: string, filters: ArrearsFilter): Promise<ArrearsListResult>
```

**Reject â€” BAD**:

```typescript
async getData(id: string, type: number): Promise<any>
```

---

### 2. Maintainability

**Question**: Will a localized change stay localized?

| Signal | Good | Bad |
|--------|------|-----|
| Module boundary | Change in PPDB stays in `modules/ppdb/` | PPDB imports Finance repository |
| Config | School settings table / env | Magic strings in 12 files |
| Duplication | Shared util in domain or `packages/` | Copy-paste Zod schema |
| Dependencies | Explicit imports | Dynamic require, hidden singletons |

**Reject when**:
- Same validation logic in controller and service with drift risk
- Feature flag checked in 20 places instead of service gate
- Dead code left "for later"

---

### 3. Scalability

**Question**: Does this perform under real school load?

| Context | Consideration |
|---------|---------------|
| PPDB peak | Thousands of applicants; pagination mandatory |
| Finance | Batch tagihan generation; queue for large schools |
| CBT | Concurrent exam attempts; immutable result writes |
| Reporting | Read replicas / materialized views â€” not OLTP scans |

**Pass criteria**:
- List endpoints paginated with cursor or offset + max limit
- N+1 queries eliminated (Drizzle `with` or batch load)
- Heavy jobs async with status polling
- Indexes on filter columns (`school_id`, `status`, `deleted_at`)

**Reject when**:
- Unbounded `SELECT *` in user-facing API
- Synchronous PDF generation for 500 rows in request thread
- Missing index on foreign keys used in joins

---

### 4. Testability

**Question**: Can business logic be verified without browser or production DB?

| Layer | Test type | Minimum |
|-------|-----------|---------|
| Service | Unit | Critical paths, edge cases, RBAC branches |
| Repository | Integration | Queries with test DB or container |
| Controller | Integration | HTTP + auth + validation errors |
| UI | Component + E2E | 5 page states; critical flow Playwright |

**TDD**: Red-Green-Refactor for service-layer business rules (`superpowers-test-driven-development`).

**Coverage**: 70%+ module baseline; 100% on payment allocation, exam scoring, permission guards.

**Reject when**:
- Service with no tests and complex conditionals
- Mocking entire database in unit tests to avoid designing interfaces
- E2E only â€” no unit tests for calculation logic

---

### 5. Security

**Question**: What could an authenticated or unauthenticated attacker abuse?

| Area | Requirement |
|------|-------------|
| Auth | JWT validation on every protected route |
| RBAC | Permission guard matches menu and API |
| Input | Zod validation; parameterized queries only |
| Output | No PII in logs; mask NIK in non-admin views |
| Rate limit | Login, PPDB public form, WA webhook |
| CORS | Explicit allowlist â€” not `*` in production |

**Teknovo-sensitive**:
- CBT: prevent answer leakage between attempts
- Finance: idempotent payment webhooks
- PPDB: document upload type and size limits

**Reject when**:
- Client-only permission checks
- Secrets in repo or client bundle
- SQL string concatenation

---

## Layer Discipline Checklist

- [ ] Controller: parse, validate, authorize, delegate, respond
- [ ] Service: business rules, transactions, emit events
- [ ] Repository: SQL/Drizzle only; soft-delete filter always
- [ ] No repository exported from module index
- [ ] Cross-module via service public API or HTTP internal client

---

## Code Smells (Automatic Reject)

| Smell | Fix |
|-------|-----|
| God component (500+ line Vue page) | Split: composables, subcomponents, page shell |
| God service | Split by use case (`CreateInvoiceService`, `AllocatePaymentService`) |
| Prop drilling 5+ levels | Provide/inject or store scoped to module |
| `utils.ts` dumping ground | Move to domain-named module |
| Catch-all `try/catch` swallowing errors | Typed errors; user-safe messages |

---

## Verification Commands

Before marking engineering complete:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test -- --coverage
```

Evidence required â€” see `superpowers-verification-before-completion`.

---

## Integration

| Artifact | Use |
|----------|-----|
| `.cursor/gates/quality/review-checklist.md` | Engineering + Security sections |
| `.cursor/gates/quality/quality-gates.md` | Testing Review gate |
| `.cursor/skills/gstack-eng-review/SKILL.md` | Layer audit |
| `.cursor/skills/teknovo-security-review/SKILL.md` | Security pass |
