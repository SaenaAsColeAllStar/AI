---
name: teknovo-integration-architect
description: Integration architect — third-party APIs, webhooks, payment gateways, WhatsApp providers, and external system contracts for Teknovo.
---

# Teknovo Integration Architect Skill

Use this skill when connecting Teknovo to **external systems**: payment gateways, WhatsApp Business API, government APIs, SSO, webhooks, and partner services.

**Differentiation**: Unlike **teknovo-api-architect** (internal REST `/api/v1`), integration architect owns **boundary contracts, resilience, and security** at system edges.

---

## When to Activate

- Payment gateway integration or callback handlers
- WA provider webhooks and template sync
- Inbound webhooks from external systems
- Outbound API clients with retry/circuit breaker
- Trigger examples: "integration", "webhook", "payment gateway", "third-party API", "external system", "Midtrans", "Xendit"

---

## Primary Documentation

| Document | Path |
|----------|------|
| API contract (outbound shape) | `docs/standards/api/api-contract.md` |
| Event contract | `docs/standards/events/event-contract.md` |
| Security review template | `docs/reviews/security-review-template.md` |
| Queue contract | `docs/backend/queue-contract.md` |
| Domain events | `docs/architecture/domain-event-catalog.md` |

Domain consumers: **teknovo-finance** (payments), **teknovo-communication** (WA), **teknovo-ppdb** (registration fees)

---

## Integration Design Standards

### Adapter Pattern

```text
Controller/Webhook → Integration Service (adapter) → Domain Service
```

- Adapters translate external payloads ↔ domain DTOs
- Domain services never import vendor SDK types

### Webhook Security

- [ ] Signature verification (HMAC, provider-specific)
- [ ] Idempotency key on all callbacks
- [ ] Replay protection (timestamp window)
- [ ] Rate limiting on webhook endpoints
- [ ] Return 200 only after durable queue enqueue

Hand off security audit to **teknovo-security-review**.

### Resilience

| Pattern | Use |
|---------|-----|
| Retry with backoff | Transient 5xx, network blips |
| Circuit breaker | Provider sustained outage |
| DLQ | Exhausted retries |
| Timeout | Every external call bounded |

Jobs process callbacks async — webhook handler stays fast.

### Secrets & Config

- API keys in environment/secrets manager — never committed
- Per-tenant credentials where multi-school deployment requires

### Contract Documentation

Maintain integration spec per provider:

```markdown
## Provider: [name]
- Base URL:
- Auth:
- Endpoints used:
- Webhook events:
- Idempotency:
- Error codes mapping:
- Sandbox vs production:
```

---

## Common Integrations

| Integration | Domain Skill |
|-------------|--------------|
| Payment gateway | **teknovo-finance**, **teknovo-ppdb** |
| WhatsApp Business | **teknovo-communication** |
| SSO/OAuth | **teknovo-security-review**, auth domain |
| Reporting export storage | **teknovo-cloudflare-stack** (R2) |

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Internal API design | **teknovo-api-architect** |
| Failed callback investigation | **gstack-investigate** |
| Observability for integrations | **teknovo-observability** |
| Load/rate limits | **teknovo-performance-engineer** |

---

## Mandatory Output Template

```markdown
## Integration Architecture: [provider/system]

### Boundary
- Direction: inbound / outbound / both
- Owning domain: [ ]

### Authentication
- Method: [ ]
- Secret storage: [ ]

### Endpoints & Webhooks
| Name | Method | Purpose | Idempotency |

### Error Mapping
| Provider code | Domain action |

### Resilience
- Retry: [ ]
- Circuit breaker: [ ]
- DLQ queue: [ ]

### Security Checklist
- [ ] Signature verified
- [ ] PII minimized in logs
- [ ] RBAC on admin integration settings

### Test Plan
- [ ] Sandbox happy path
- [ ] Duplicate callback
- [ ] Invalid signature rejected

### Verdict: [ready for implementation / blocked]
```
