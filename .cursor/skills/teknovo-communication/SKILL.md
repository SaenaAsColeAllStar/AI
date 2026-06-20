---
name: teknovo-communication
description: WhatsApp communication domain — devices, templates, campaigns, message delivery, and notification queues for Teknovo school ERP.
---

# Teknovo Communication (WA) Domain Skill

Use this skill for **WhatsApp messaging**: devices, contacts, groups, templates, campaigns, messages, delivery logs, and notification queues.

**Differentiation**: WA Domain is **event-driven and supporting** — it owns no Student, Finance, or PPDB data. Unlike **teknovo-backend-development**, all sends must go through approved templates with delivery tracking.

---

## When to Activate

- WA sender, template management, broadcast campaigns
- Event-triggered notifications (payment reminder, PPDB result, exam schedule)
- Delivery log investigation, failed message retry
- Trigger examples: "WhatsApp", "WA template", "campaign", "notifikasi", "broadcast", "pesan"

---

## Primary Documentation

| Document | Path |
|----------|------|
| WA Domain | `docs/domain/wa-domain.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |
| Queue contract | `docs/backend/queue-contract.md` |
| RBAC matrix | `docs/.cursor/gates/security/rbac-matrix.md` |

Subdomain: `wa.domain.sch.id` · Schema: `wa`

---

## Domain Principles (Non-Negotiable)

### Event Driven

- React to domain events — **no polling** other domains' databases
- Subscribers register in event catalog; payload carries IDs only

### No Business Ownership

- Resolve contact phone from Student/Applicant via read API or event payload
- Never store duplicate canonical student records in WA schema

### Template First

- Every outbound message uses an approved template
- Free-form text only where provider policy and RBAC allow (e.g., staff reply)

### Delivery Tracking

- States: `queued → sent → delivered | read | failed`
- Failed messages: retry policy + DLQ; never silent drop

---

## Aggregate Roots

Device · Contact · Contact Group · Template · Campaign · Message · Delivery Log · Notification Queue

---

## Key Workflows

### Template Lifecycle

```text
Draft Template → Submit for Approval → Approved → Available in Campaigns/Triggers
```

### Event-Triggered Send

```text
Domain Event → WA Subscriber → Resolve Template + Variables → Queue Message → Provider API → Delivery Log
```

### Campaign Broadcast

```text
Select Contact Group → Choose Template → Schedule → Batch Queue → Monitor Delivery
```

Rate limits and provider quotas — coordinate with **teknovo-performance-engineer** and **teknovo-integration-architect**.

---

## Events Consumed (Examples)

| Source Event | Template Use |
|--------------|--------------|
| `finance.bill.generated` | Payment reminder |
| `ppdb.selection.published` | Admission result |
| `cbt.exam.scheduled` | Exam notification |
| `academic.attendance.absent` | Parent alert (if configured) |

WA publishes: `wa.message.sent`, `wa.message.failed`

---

## RBAC Checklist

- [ ] Template create/edit vs approve separated
- [ ] Campaign send requires explicit permission
- [ ] Device pairing restricted to admin
- [ ] Delivery logs: PII masked in UI where policy requires

---

## Integration

- External WA Business API — webhooks for delivery status (**teknovo-integration-architect**)
- Webhook idempotency and signature verification (**teknovo-security-review**)
- Secrets in env — never in repo

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Provider API contract | **teknovo-integration-architect** |
| Failed delivery investigation | **gstack-investigate** |
| Message content UX | **teknovo-chief-product-designer** |
| Queue backlog performance | **teknovo-performance-engineer** |
| Stakeholder comms about outages | **gstack-cso** |

---

## Mandatory Output Template

```markdown
## WA Communication Analysis: [feature/campaign]

### Trigger Type
- [ ] Event-driven / [ ] Manual campaign

### Source Event (if applicable)
- Event: [ ]
- Payload fields: [ ]

### Template
- Name: [ ]
- Variables: [ ]
- Approval status: [ ]

### Contact Resolution
- How phone/name resolved without owning Student: [ ]

### Queue & Retry
- Job name: [ ]
- Retry/DLQ: [ ]

### RBAC
- Permissions: [ ]

### Delivery Metrics
- Success criteria: [ ]
- Alert on failure rate: [ ] → teknovo-observability

### Test Cases
- [ ] Template render with variables
- [ ] Idempotent webhook update
- [ ] Failed send → DLQ → retry

### Verdict: [ready / blocked]
```
