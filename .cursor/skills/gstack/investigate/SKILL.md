---
name: gstack-investigate
description: Production incident and anomaly investigation — evidence collection, timeline reconstruction, hypothesis testing, and root cause analysis for Teknovo systems.
---

# GStack Investigate Skill

Use this skill for **production incidents**, recurring errors, data anomalies, and post-deploy regressions requiring structured root cause analysis.

**Differentiation**: Unlike `superpowers-systematic-debugging` (local/dev bug fixing) or `teknovo-incident-response` (outage command & rollback), investigate focuses on **deep RCA with evidence** across logs, traces, queues, and database state.

Modeled after [GStack /investigate](https://github.com/garrytan/gstack) with Teknovo observability standards.

---

## When to Activate

- Production outage or degraded service
- Intermittent 5xx, queue backlog, or failed WA/PPDB/finance jobs
- Data mismatch between domains (e.g., payment recorded but bill still open)
- Post-deploy regression reported by school
- Trigger examples: "investigate production", "root cause", "incident timeline", "why did payments fail", "queue stuck"

---

## Investigation Phases

### Phase 1 — Stabilize Context (Do Not Fix Yet)

Collect before changing production:

| Source | What to Capture |
|--------|-----------------|
| Incident window | Start time, peak, current status (UTC + WIB) |
| Scope | Subdomain, tenant/school, affected modules |
| Symptoms | User reports, error rates, latency |
| Recent changes | Deploys, migrations, config, DNS |
| Correlation IDs | From API responses, job payloads, audit logs |

Reference: `docs/domain/audit/audit-domain.md`, `docs/backend/queue-contract.md`

### Phase 2 — Evidence Collection

```text
Logs → Traces → Metrics → Database → Queue → External APIs
```

| Layer | Teknovo Sources |
|-------|-----------------|
| API | Application logs, `/api/v1` error envelopes, rate limit hits |
| Queue | BullMQ job status, DLQ depth, retry counts |
| Database | Read-only queries on affected aggregates; check `deleted_at`, audit columns |
| Edge | Cloudflare analytics, tunnel health |
| Integrations | WA provider webhooks, payment gateway callbacks |

Load **teknovo-observability** for logging/tracing conventions.

**Rules**:
- Read-only on production unless **teknovo-incident-response** approves write/fix
- Never expose PII in investigation notes shared externally
- Preserve log excerpts with timestamps and correlationId

### Phase 3 — Timeline Reconstruction

Build chronological narrative:

```markdown
| Time (WIB) | Event | Source | Confidence |
|------------|-------|--------|------------|
| HH:MM | Deploy vX.Y | CI/CD | confirmed |
| HH:MM | finance.payment.failed spike | logs | confirmed |
| HH:MM | First user report | support | reported |
```

### Phase 4 — Hypothesis Testing

For each hypothesis:

1. State hypothesis clearly
2. Define falsifiable test (query, log filter, replay job)
3. Record result: confirmed / rejected / inconclusive
4. Rank by likelihood × impact

Common Teknovo failure patterns:

| Pattern | Check |
|---------|-------|
| Cross-domain event missed | Event catalog, subscriber registration, idempotency key |
| RBAC 403 spike | New route missing `@RequirePermissions` |
| Soft-delete leak | Query missing `deleted_at IS NULL` |
| Finance immutability | Attempted update on posted transaction |
| WA template rejection | Template approval status, provider error code |
| CBT attempt loss | Exam session lock, attempt preservation rules |

Reference domain skills: **teknovo-finance**, **teknovo-ppdb**, **teknovo-cbt**, **teknovo-communication**

### Phase 5 — Root Cause & Contributing Factors

Distinguish:

- **Root cause** — single actionable fix
- **Contributing factors** — monitoring gaps, missing tests, process failures
- **Blast radius** — tenants, records, money at risk

---

## Handoff Matrix

| Finding | Hand Off To |
|---------|-------------|
| Need immediate rollback | **teknovo-incident-response** |
| Fix requires code change | **superpowers-systematic-debugging** → **teknovo-feature-implementation** |
| Schema/data repair | **teknovo-data-migration** (with architect approval) |
| Missing alerts/dashboards | **teknovo-observability** |
| External API failure | **teknovo-integration-architect** |
| Customer-facing summary | **gstack-cso** |
| Post-incident learning | **gstack-retro** |

---

## Mandatory Output Template

```markdown
## Investigation Report: [incident-id / title]

### Executive Summary
[2–3 sentences: what broke, root cause, current status]

### Impact
- Duration: [start–end]
- Users/Tenants: [scope]
- Data/Money at risk: [assessment]

### Timeline
[Table of events]

### Root Cause
[Clear statement + evidence links]

### Contributing Factors
- [factor]

### Evidence
- Logs: [excerpt references]
- Queries: [read-only SQL summary]
- Jobs: [job IDs, DLQ entries]

### Remediation
- Immediate: [done / in progress]
- Short-term fix: [PR/issue]
- Long-term prevention: [monitoring, test, process]

### Open Questions
- [unresolved items]

### Handoffs
- [ ] incident-response (if outage)
- [ ] cso (external comms)
- [ ] retro (postmortem)
```

---

## After Investigation

- **Outage resolved** → **teknovo-incident-response** postmortem within 48h
- **Fix merged** → **gstack-qa** regression on affected flows
- **Monitoring gap** → **teknovo-observability** action items
