---
name: gstack-cso
description: Customer Success Officer — stakeholder communication, status updates, release notes, and school-facing change management for Teknovo deployments.
---

# GStack Customer Success Officer (CSO) Skill

Use this skill when communicating with school stakeholders, drafting release notes, preparing rollout briefings, or translating technical changes into operator-friendly language.

**Differentiation**: Unlike `gstack-office-hours` (internal engineering consultation) or `teknovo-devops-engineer` (infra/deploy gate), CSO owns **external stakeholder communication** and adoption readiness.

Modeled after [GStack CSO](https://github.com/garrytan/gstack) with Teknovo school ERP context.

---

## When to Activate

- User asks for stakeholder update, release notes, or school admin briefing
- Before production rollout to a school tenant
- After incident resolution — customer-facing summary (technical details → `gstack-investigate`, `teknovo-incident-response`)
- Feature launch requiring operator training or change management
- Trigger examples: "stakeholder update", "release notes", "school admin email", "rollout communication", "customer success"

---

## Mandatory Inputs

Before drafting communication, gather:

1. **Audience** — school admin, finance staff, teachers, parents, IT vendor
2. **Change scope** — modules affected (finance, PPDB, CBT, WA, academic)
3. **Impact level** — none / low / medium / high / breaking
4. **Timeline** — deploy window, downtime if any, rollback plan reference
5. **Support channel** — who to contact post-release

Reference: `docs/prd/master/master-prd.md`, affected domain PRDs in `docs/domain/**`

---

## Communication Workflow

### 1. Impact Assessment

| Dimension | Question |
|-----------|----------|
| User workflow | What steps change for daily operators? |
| Data | Any migration, export, or re-entry required? |
| Permissions | New RBAC roles or menu changes? |
| Downtime | Maintenance window required? |
| Training | Demo or SOP update needed? |

### 2. Message Structure

Every stakeholder artifact must include:

1. **Headline** — one sentence: what changed and why it matters
2. **Who is affected** — roles and subdomains (`finance.domain.sch.id`, etc.)
3. **What to do** — numbered steps before/during/after release
4. **What stays the same** — reduce anxiety; call out unchanged workflows
5. **Support** — contact, hours, escalation path

### 3. Tone & Language

- Default: **Bahasa Indonesia** for school operators unless audience is English-only
- Plain language — no internal jargon (Drizzle, BullMQ, UUID v7)
- Action-oriented — every section answers "what do I do?"
- Honest about limitations and known issues

### 4. Release Notes Format

```markdown
## [Version / Date] — [Module Name]

### Ringkasan
[1–2 sentences for school admin]

### Fitur Baru
- [User-visible capability + benefit]

### Perbaikan
- [Bug fix described by user impact]

### Perhatian / Breaking Changes
- [Required action before use]

### Jadwal & Downtime
- [Window or "no downtime"]

### Bantuan
- [Support contact]
```

---

## RBAC & Permission Communication

When releases change permissions:

- List new permissions in operator terms ("Bendahara can now export cash book")
- Reference `docs/.cursor/gates/security/rbac-matrix.md` internally — do not paste raw permission keys to schools unless IT audience
- Hand off permission mapping gaps to **teknovo-rbac-architect**

---

## Handoff Matrix

| Situation | Hand Off To |
|-----------|-------------|
| Technical root cause needed | **gstack-investigate** |
| Outage still active | **teknovo-incident-response** |
| Deploy checklist / infra | **teknovo-devops-engineer** → **gstack-ship** |
| Feature scope unclear | **teknovo-chief-product-designer** |
| Training material / UX walkthrough | **teknovo-ui-ux-specialist** |
| Post-release retrospective | **gstack-retro** |

---

## Mandatory Output Template

```markdown
## Stakeholder Communication: [release/incident/feature]

### Audience
- Primary: [role]
- Secondary: [role]
- Language: [ID/EN]

### Impact Summary
| Area | Level | Notes |
|------|-------|-------|
| [module] | [low/med/high] | [brief] |

### Draft Message
[Full release note or email body]

### Pre-Release Checklist
- [ ] Stakeholders identified
- [ ] Downtime window confirmed with DevOps
- [ ] Rollback message prepared
- [ ] Support channel staffed
- [ ] Training/SOP updated (if needed)

### Post-Release Follow-Up
- [ ] Confirmation sent within [X] hours
- [ ] Feedback channel open for 48h
```

---

## After CSO Work

- **Pre-deploy** → confirm **teknovo-devops-engineer** Deployment Impact Analysis includes stakeholder comms
- **Post-deploy** → **gstack-retro** captures communication lessons
- **Incident** → pair with **teknovo-incident-response** postmortem; CSO owns external summary only
