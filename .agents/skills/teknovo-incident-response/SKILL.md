---
name: teknovo-incident-response
description: Incident response commander — outage triage, rollback decisions, communication coordination, and postmortem facilitation for Teknovo production.
---

# Teknovo Incident Response Skill

Use this skill as **incident commander** during active outages: triage, mitigate, rollback, coordinate teams, and drive postmortem.

**Differentiation**: **gstack-investigate** performs deep RCA; incident response **commands the outage timeline** and authorized production actions. **teknovo-devops-engineer** owns deploy platform; incident response owns **severity classification and rollback go/no-go**.

---

## When to Activate

- Production down or severely degraded
- Data corruption risk or payment processing halted
- Security incident affecting tenants
- Trigger examples: "incident", "outage", "rollback", "production down", "SEV-1", "emergency deploy"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Deployment standard | `docs/infrastructure/deployment-standard.md` |
| CI/CD standard | `docs/infrastructure/cicd-standard.md` |
| Cloudflare setup | `docs/infrastructure/cloudflare-setup-guide.md` |
| Audit domain | `docs/domain/audit/audit-domain.md` |

---

## Severity Levels

| Level | Definition | Response |
|-------|------------|----------|
| **SEV-1** | Full outage or data loss risk | All-hands, exec notify, rollback authority |
| **SEV-2** | Major feature broken (payments, PPDB wave) | Domain owner + DevOps on bridge |
| **SEV-3** | Partial degradation, workaround exists | Scheduled fix, monitor |
| **SEV-4** | Minor, no user impact | Ticket, normal sprint |

---

## Incident Response Workflow

### 1. Declare & Assign Roles

| Role | Responsibility |
|------|----------------|
| Incident Commander (IC) | This skill — decisions, timeline |
| Technical Lead | **gstack-investigate** — RCA |
| Comms Lead | **gstack-cso** — stakeholder updates |
| DevOps | **teknovo-devops-engineer** — rollback/deploy |
| Domain Expert | finance/ppdb/cbt/wa skill as needed |

### 2. Triage (First 15 Minutes)

- Confirm scope: which subdomains, tenants, modules
- Check recent deploys, migrations, DNS, provider status
- Enable war-room channel; start incident doc with timestamps (WIB)

### 3. Mitigate

Priority order:

1. **Stop the bleeding** — disable feature flag, pause queue consumer, block bad deploy traffic
2. **Rollback** if deploy-correlated — coordinate with DevOps
3. **Failover** — tunnel, DB replica (per infra runbook)
4. **Communicate** — internal status every 30 min (SEV-1/2)

**Never** run destructive data fixes without architect + backup confirmation (**teknovo-data-migration**).

### 4. Resolve

- Verify fix with smoke tests (**gstack-qa**)
- Monitor error rates 30–60 min post-fix (**teknovo-observability**)
- Close incident when SLI restored

### 5. Postmortem (Within 48h)

Blameless format:

- Summary, impact, timeline, root cause, action items (owner + due date)
- Hand detailed RCA to **gstack-investigate**
- Process improvements → **gstack-retro**

External summary → **gstack-cso** (no internal jargon)

---

## Rollback Decision Matrix

| Signal | Action |
|--------|--------|
| Error rate spike within 15m of deploy | Strong rollback candidate |
| Migration partially applied | Stop app, assess DB state, architect consult |
| External provider outage | Mitigate + comms; no app rollback |
| Data corruption detected | Halt writes, snapshot, **teknovo-data-migration** plan |

---

## Handoff Matrix

| Phase | Skill |
|-------|-------|
| Investigation | **gstack-investigate** |
| Deploy/rollback | **teknovo-devops-engineer**, **gstack-ship** |
| Customer updates | **gstack-cso** |
| Alerts/monitoring | **teknovo-observability** |
| Security breach | **teknovo-security-review** |

---

## Mandatory Output Template

```markdown
## Incident Record: [INC-YYYYMMDD-NN]

### Severity: [SEV-N]
### Status: [investigating | mitigating | resolved]

### Impact
- Start: [WIB]
- Affected: [subdomains/tenants]
- User impact: [description]

### Timeline
| Time | Action | Owner |

### Current Mitigation
[what's in place now]

### Rollback Decision
- [ ] Rollback executed / [ ] Not required / [ ] Pending
- Version: [ ]

### Communications
- Internal: [ ]
- External (CSO): [ ]

### Next Update
[time + owner]

### Postmortem
- Scheduled: [ ]
- Action items: [ ]
```

---

## After Incident

- **SEV-1/2** → mandatory postmortem + observability action items
- **Fix PR** → **gstack-eng-review**, **teknovo-security-review** if edge-related
- **Retro** → **gstack-retro** for process gaps
