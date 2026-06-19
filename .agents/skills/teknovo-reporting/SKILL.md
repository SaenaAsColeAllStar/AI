---
name: teknovo-reporting
description: Reporting domain specialist — read models, dashboards, analytics, PDF export, and scheduled reports with no write-back for Teknovo.
---

# Teknovo Reporting Domain Skill

Use this skill for **dashboards, analytics, report generation, PDF/Excel export, and scheduled reports** across Finance, Academic, PPDB, CBT, and WA.

**Differentiation**: Reporting is **read-only** — no write-back to source domains. Unlike **teknovo-feature-implement** on CRUD modules, reporting builds projections, caches, and export pipelines.

---

## When to Activate

- Dashboard metrics, school analytics, executive summaries
- PDF report cards, finance reports, PPDB statistics
- Scheduled report jobs, export APIs
- Trigger examples: "report", "dashboard", "analytics", "export PDF", "laporan", "read model"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Reporting Domain | `docs/domain/reporting-domain.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |
| API contract | `docs/standards/api/api-contract.md` |

Consumes: Student, Academic, Finance, CBT, PPDB, WA, Audit — **owns nothing**

---

## Domain Rules (Non-Negotiable)

### Read Only

- No UPDATE/INSERT to source domain tables from reporting layer
- Corrections happen in owning domain — reporting refreshes via events or ETL

### Event-Driven Refresh

- Subscribe to domain events to update read models
- Batch reconciliation job for drift detection (nightly)

### Performance

- Heavy aggregations pre-computed in read model tables
- Pagination on all list reports
- **teknovo-performance-engineer** for large exports

---

## Report Categories

| Category | Source Domains | Examples |
|----------|----------------|----------|
| Finance | Finance | Cash book summary, arrears by class |
| Academic | Academic, Student | Attendance summary, grade distribution |
| PPDB | PPDB | Applicant funnel, acceptance rate |
| CBT | CBT | Exam result statistics |
| Operational | WA, Audit | Message delivery rates, audit trail export |

---

## Export Standards

- PDF: branded template, generation timestamp, tenant name
- Excel: column headers in Indonesian for school operators
- Large exports: async job + download link when ready
- Storage: R2 via **teknovo-cloudflare-stack** for temporary files

Job naming: `report.generate`, `report.export`

---

## RBAC Checklist

- [ ] Report access mirrors source domain permissions (finance reports → finance roles)
- [ ] Export actions separately permissioned
- [ ] No PII in exports beyond role entitlement
- [ ] Scheduled reports run as system actor with scoped permissions

---

## UI Requirements

- Dashboard: Loading skeleton, Empty when no data, Error with retry
- Date range filters aligned to academic year (**teknovo-academic**)
- Print-friendly layouts for PDF preview

Hand off dashboard IA to **teknovo-ui-ux-specialist**.

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Source data bugs | Owning domain skill (finance, ppdb, etc.) |
| Slow queries | **teknovo-performance-engineer** |
| File storage | **teknovo-cloudflare-stack** |
| Product metrics definition | **teknovo-chief-product-designer** |

---

## Mandatory Output Template

```markdown
## Reporting Analysis: [report/dashboard name]

### Read Model
- Tables/views: [ ]
- Refresh trigger: event [ ] / schedule [ ]

### Source Domains (read-only)
- [domains + entities]

### Metrics Definition
| Metric | Formula | Filters |

### API / Export
| Endpoint | Permission | Format |

### Performance
- Expected row volume: [ ]
- Pre-aggregation: [yes/no]

### RBAC
- [permissions]

### Test Cases
- [ ] Matches source domain sample totals
- [ ] No write-back paths
- [ ] Export completes under timeout / async job

### Verdict: [ready / blocked]
```
