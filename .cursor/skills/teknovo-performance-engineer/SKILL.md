---
name: teknovo-performance-engineer
description: Performance engineering — PostgreSQL query optimization, caching, API latency, queue throughput, bundle size, and Core Web Vitals for Teknovo.
---

# Teknovo Performance Engineer Skill

Use this skill when diagnosing slowness, optimizing queries, designing caches, reducing bundle size, or meeting Core Web Vitals targets.

**Differentiation**: Unlike **teknovo-devops-engineer** (deploy/infra gate) or **teknovo-database-architect** (schema design), performance engineer focuses on **measured optimization** with before/after evidence.

---

## When to Activate

- Slow API endpoints, N+1 queries, large report timeouts
- BullMQ backlog, WA campaign batch delays
- Lighthouse/Core Web Vitals regressions
- Trigger examples: "slow query", "optimize performance", "Lighthouse", "Core Web Vitals", "cache", "bundle size", "N+1"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Database standard | `docs/standards/database/database-standard.md` |
| Testing standard | `docs/standards/testing/testing-standard.md` |
| Landing page limits | `docs/prd/ui-ux/landing-page-prd.md` |
| Deployment standard | `docs/infrastructure/deployment-standard.md` |

Domain-specific hot paths: **teknovo-finance** (bill generation), **teknovo-cbt** (concurrent attempts), **teknovo-reporting** (aggregations)

---

## Performance Workflow

### 1. Measure First (No Premature Optimization)

| Layer | Metrics |
|-------|---------|
| API | p50/p95 latency, error rate, RPS |
| Database | Query time, seq scans, lock waits, connection pool |
| Queue | Job duration, queue depth, DLQ rate |
| Frontend | LCP, INP, CLS, TTFB, JS bundle size |

Establish baseline before changes.

### 2. Backend Optimization

**PostgreSQL**:
- EXPLAIN ANALYZE on hot queries
- Indexes aligned with filter patterns (`deleted_at`, tenant, academic_year)
- Pagination mandatory on list endpoints — no unbounded SELECT
- Batch operations for bill generation / report prep

**Caching**:
- Redis for session, permission cache, read-heavy reference data
- Cache keys include tenant + version; TTL documented
- Invalidate on write via events — no stale financial data

**API**:
- Avoid over-fetching; projection DTOs in repository layer
- Parallelize independent reads in service — not controller

### 3. Queue Throughput

- Chunk campaign sends (**teknovo-communication**)
- Concurrency limits per queue to protect DB and external APIs
- Idempotent workers safe under retry

### 4. Frontend Optimization

- Code-split by route/subdomain
- Lazy-load heavy charts (**teknovo-reporting**)
- Image optimization on portal/landing (**teknovo-landing-page**)
- Target: LCP < 2.5s, INP < 200ms, CLS < 0.1 on critical pages

Reference: `docs/standards/design-system/design-system-contract.md`

---

## Forbidden Shortcuts

- Skip `deleted_at` filter for speed
- Denormalize without architect approval and migration plan
- Cache payment or permission data without invalidation strategy
- Remove audit columns for performance

---

## Handoff Matrix

| Finding | Skill |
|---------|-------|
| Schema/index redesign | **teknovo-database-architect** |
| Missing observability | **teknovo-observability** |
| External API rate limits | **teknovo-integration-architect** |
| Production incident | **gstack-investigate** |
| Load test plan | **teknovo-testing-architect** |

---

## Mandatory Output Template

```markdown
## Performance Analysis: [area]

### Baseline
| Metric | Before | Target |
|--------|--------|--------|

### Bottleneck
[Evidence: query plan, trace, bundle analyzer]

### Proposed Changes
1. [change + expected impact]

### Risk Assessment
- [cache staleness, lock contention, etc.]

### Verification Plan
- [ ] Benchmark script / query timing
- [ ] Regression test
- [ ] Lighthouse run (if UI)

### Verdict: [proceed / needs architect review]
```
