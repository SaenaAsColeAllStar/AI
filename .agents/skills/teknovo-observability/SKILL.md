---
name: teknovo-observability
description: Observability specialist — structured logging, distributed tracing, metrics, alerting, SLOs, and dashboards complementing Teknovo DevOps.
---

# Teknovo Observability Skill

Use this skill to design and review **logging, tracing, metrics, alerting, and SLOs** across API, queues, and subdomains.

**Differentiation**: **teknovo-devops-engineer** owns deploy/infra gate and platform setup; observability owns **signal quality, alert rules, and SLO definitions** for engineering and on-call.

---

## When to Activate

- Adding logging/tracing to new modules
- Defining alerts for payment failures, queue DLQ, API error spikes
- SLO/SLI design for school-facing uptime
- Trigger examples: "observability", "logging", "tracing", "alerting", "SLO", "monitoring", "dashboard", "metrics"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Queue contract | `docs/backend/queue-contract.md` |
| Event contract | `docs/standards/events/event-contract.md` |
| Deployment standard | `docs/infrastructure/deployment-standard.md` |
| Cloudflare setup | `docs/infrastructure/cloudflare-setup-guide.md` |
| Audit domain | `docs/domain/audit/audit-domain.md` |

---

## Observability Standards

### Structured Logging

Every log line should include:

```json
{
  "timestamp": "ISO8601",
  "level": "info|warn|error",
  "service": "finance-api",
  "traceId": "...",
  "correlationId": "...",
  "tenantId": "...",
  "actorId": "...",
  "message": "...",
  "context": {}
}
```

- No secrets, tokens, or full PII in logs
- Error logs include stack trace server-side only

### Distributed Tracing

- Propagate `traceId` and `correlationId` from HTTP → service → repository → queue job
- BullMQ job payload must carry tracing fields (see **teknovo-backend-development**)

### Metrics (Minimum Set)

| Metric | Type | Labels |
|--------|------|--------|
| `http_request_duration_seconds` | histogram | route, method, status |
| `queue_job_duration_seconds` | histogram | queue, job_name |
| `queue_depth` | gauge | queue |
| `db_query_duration_seconds` | histogram | operation |
| `external_api_call_duration` | histogram | provider |

### Alerting Rules

| Alert | Condition | Runbook |
|-------|-----------|---------|
| API error rate | 5xx > threshold 5m | **gstack-investigate** |
| DLQ depth | > 0 sustained | Queue + domain skill |
| Payment callback failures | spike | **teknovo-finance** |
| WA delivery failure rate | > threshold | **teknovo-communication** |
| Tunnel unhealthy | health check fail | **teknovo-devops-engineer** |

Alerts must link to runbook section — not bare thresholds.

### SLO Examples

| Service | SLI | SLO |
|---------|-----|-----|
| API (erp) | successful requests / total | 99.5% / 30d |
| PPDB registration | successful submits | 99% during wave |
| WA delivery | delivered / sent | 95% / 24h |

Error budget policy: freeze non-critical deploys when budget exhausted.

---

## Domain-Specific Signals

| Domain | Critical Signals |
|--------|------------------|
| Finance | payment.paid rate, callback latency, bill generation job duration |
| PPDB | registration submit errors, verification queue age |
| CBT | active attempts, submit failures, grading job backlog |
| WA | send rate, provider 429, template rejection count |

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Incident active | **teknovo-incident-response** → **gstack-investigate** |
| Infra provisioning | **teknovo-devops-engineer**, **teknovo-cloudflare-stack** |
| Performance tuning | **teknovo-performance-engineer** |
| Security log review | **teknovo-security-review** |
| Stakeholder status | **gstack-cso** |

---

## Mandatory Output Template

```markdown
## Observability Plan: [service/module]

### Signals Added
- Logs: [fields]
- Traces: [spans]
- Metrics: [names]

### Dashboards
- [panel descriptions]

### Alerts
| Name | Query/Condition | Severity | Runbook |

### SLO (if applicable)
- SLI: [ ]
- Target: [ ]
- Error budget: [ ]

### Verification
- [ ] Trace visible end-to-end
- [ ] Test alert fires in staging
- [ ] No PII/secrets in logs

### Verdict: [ready / blocked]
```
