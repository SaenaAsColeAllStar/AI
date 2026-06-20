# Security Principles â€” Teknovo Security System

> **Layer**: Security (mandatory review before implementation)  
> **Philosophy**: Assume users, developers, and AI make mistakes â€” systems must remain secure despite mistakes  
> **Tone**: Principal Security Architect â€” proactive risk identification, secure defaults, explicit permissions

---

## Purpose

The Teknovo Security System is the **mandatory security review layer** in the AI SuperStack workflow. It sits after product/taste planning and architecture design, and **before any implementation** (database migrations, API endpoints, UI routes, infrastructure changes, or agent automation).

Security is not a post-ship checkbox. A feature that bypasses security review is **blocked** â€” regardless of product value or engineering quality.

**Precedence**: When security and convenience conflict, **security wins**. When security and speed conflict, **security wins with documented risk acceptance** (never silent bypass).

---

## Core Philosophy

Aligned with defense-in-depth and secure-by-default practice (including public guidance such as Anthropic's cybersecurity skills philosophy): **mistakes happen** â€” design systems that fail safely.

| Principle | Meaning | Teknovo application |
|-----------|---------|---------------------|
| **Least Privilege** | Grant minimum access required for the task | RBAC `domain.resource.action`; scoped D1/R2; agent tool limits |
| **Defense in Depth** | Multiple independent controls | API guard + service ownership filter + DB tenancy + audit log |
| **Explicit Permissions** | No implicit access; deny by default | Every route, menu, API, action mapped; no "public write" endpoints |
| **Auditability** | Mutations traceable to actor and time | `created_by`, `updated_by`, append-only audit tables |
| **Traceability** | Security decisions documented | Security Review artifact; Architecture Impact includes RBAC/Security |
| **Secure Defaults** | Safe out of the box | Soft deletes; localhost DB bind; presigned R2; short JWT TTL |

---

## Threat Model (School ERP Context)

Teknovo handles **high-sensitivity data**: student PII, guardian contacts, financial records, exam results, admission documents.

| Threat actor | Example attack | Primary controls |
|--------------|----------------|------------------|
| Authenticated insider | GURU views another school's grades | Data ownership in service layer; `school_id` tenancy |
| Role escalation | SISWA calls finance API directly | Backend RBAC guards on every HTTP method |
| External attacker | Brute-force login on `erp.*` | Rate limits, Cloudflare WAF, Argon2id |
| Developer mistake | Forgot permission on DELETE | Security Review + eng-review; 403 integration tests |
| AI agent mistake | Agent deploys with exposed secret | AI agent security rules; no prod deploy without gate |
| Supply chain | Malicious dependency | Lockfile, CI audit, pinned versions |

---

## Security Domains

| Domain | Document | When to load |
|--------|----------|--------------|
| RBAC & authorization | `.cursor/gates/security/rbac-security.md` | New routes, menus, permissions, roles |
| API & auth | `.cursor/gates/security/api-security.md` | Endpoints, webhooks, integrations |
| Database & data | `.cursor/gates/security/database-security.md` | Migrations, schemas, queries |
| Cloudflare & infra | `.cursor/gates/security/cloudflare-security.md` | Deploy, DNS, Workers, D1, R2, tunnels |
| AI workstation | `.cursor/gates/security/ai-agent-security.md` | Agent sessions, MCP, automation, commits |
| Review checklist | `.cursor/gates/security/review-checklist.md` | Pre-PR, pre-deploy, security audit |
| Gates | `.cursor/gates/security/security-gates.md` | Before implementation, deploy, production |

**Skill**: `.cursor/skills/teknovo-security-review/SKILL.md` â€” tactical auth/CORS/JWT/rate-limit controls and APPROVE/BLOCK gate  
**Agent**: `agents/security-reviewer.md` â€” formal Security Review with verdict

---

## Mandatory Security Review Triggers

Security Review (`agents/security-reviewer.md`) is **required** when change touches:

- Authentication, sessions, JWT, password flows
- RBAC permissions, roles, route guards
- New or modified API endpoints (especially mutations)
- Database schema (PII, financial, exam, admission tables)
- File upload, export, or bulk download
- Cloudflare DNS, tunnel, Worker, D1, R2 configuration
- Secrets, environment variables, CI credentials
- MCP tools, agent deploy/commit permissions
- Third-party integrations (payment gateway, WhatsApp API)

---

## Reject Patterns (Automatic BLOCK)

| Pattern | Example | Fix |
|---------|---------|-----|
| Missing authorization | POST `/api/v1/finance/payments` without guard | Add `@RequirePermissions('finance.payment.create')` |
| UI-only security | Hide delete button; API open | Guard API; UI is advisory only |
| Hard delete on protected data | DELETE row from `student_payments` | Soft delete + audit |
| Secrets in repo | `CLOUDFLARE_API_TOKEN=xxx` in `.ts` | Wrangler secrets / env injection |
| Public DB/API bind | PostgreSQL on `0.0.0.0:5432` | `127.0.0.1` + Cloudflare Tunnel |
| Unvalidated input | Raw `req.body` to repository | Zod at controller boundary |
| Cross-tenant leak | List all students without `school_id` | Service-layer tenancy filter |
| Agent prod deploy | Cursor agent runs `wrangler deploy` unchecked | Human gate + security-gates |

---

## Workflow Position

```text
Discovery â†’ Planning â†’ Taste (scope) â†’ Architecture (Pillar 2)
    â†“
SECURITY REVIEW â† mandatory before implementation
    â†“
Implementation â†’ Impeccable Quality â†’ Ship (Pillar 3)
```

Detail: `.cursor/gates/security/security-gates.md`, `.cursor/docs/ai/AI_SECURITY_SYSTEM.md`

---

## Integration with Other Layers

| Layer | Relationship |
|-------|--------------|
| **Taste** | Taste approves *what* to build; Security approves *whether it can be built safely* |
| **Three Pillars** | Architecture Impact Analysis must include RBAC/Security section |
| **Impeccable Quality** | Quality gate includes Security Review (`.cursor/gates/quality/quality-gates.md`) |
| **teknovo-security-review skill** | Tactical checklist; Security System is strategic gate + artifacts |

---

## Security Review Output (Summary)

Every review produces:

| Field | Description |
|-------|-------------|
| **Risk Level** | Critical / High / Medium / Low |
| **Attack Surface** | New endpoints, data exposed, infra changes |
| **Mitigation Plan** | Concrete controls before merge |
| **Approval** | APPROVE / APPROVE WITH CONDITIONS / BLOCK |

Template: `agents/security-reviewer.md`

---

## Related

- Master rules: `AGENTS.md` â€” Security Layer
- Registry: `.cursor/gates/security/security-registry.yaml`
- Runtime: `python .cursor/runtime/load-memory.py --include-security`
- Architecture: `.cursor/docs/memory/architecture-decisions.md` â€” Cloudflare, RBAC
- RBAC skill: `.cursor/skills/teknovo-rbac-architect/SKILL.md`
