---
name: teknovo-security
description: >-
  Teknovo Security System — principles, mandatory gates, workflow order, hard
  rules, and bundle loading. Use before implementation, RBAC/API/DB/infra changes,
  security review, deploy, or when security conflicts with convenience.
---

# Teknovo Security — Core Gate

**Scope**: Principles, gates, workflow position, automatic BLOCK patterns. For domain rules → **teknovo-security-domain**. For Cloudflare/agent → **teknovo-security-infra**. For audits/verdicts → **teknovo-security-review**.

**Source artifacts** (detailed reference, do not delete): `.cursor/gates/security/security-principles.md`, `.cursor/gates/security/security-gates.md`, `.cursor/gates/security/security-registry.yaml`

## Hard Rules (AGENTS.md)

| Rule | Requirement |
|------|-------------|
| Security Review | Must pass **before** implementation, deploy, and production |
| RBAC | No mutation endpoint without RBAC; **no UI-only authorization** |
| Secrets | No secrets in code; host secret store only |
| Agent deploy | No autonomous agent production deploy |
| Audit | Append-only audit trails on sensitive data mutations |
| Bypass | No bypass for Critical findings; security wins over convenience |

## Workflow Position

```text
Discovery → Planning → Taste → Assurance Sign-Off
    ↓
SECURITY (pre-implementation) ← this layer
    ↓
Implementation → Quality → Assurance (differential) → SECURITY (pre-deploy) → Ship
```

Assurance runs first; Security **blocks** even if assurance passed with open security debt.

## Core Philosophy

| Principle | Teknovo application |
|-----------|---------------------|
| Least privilege | `domain.resource.action`; scoped tokens; minimal MCP |
| Defense in depth | API guard + service ownership + DB tenancy + audit |
| Explicit permissions | Deny by default; every route/menu/API/action mapped |
| Auditability | `created_by`, `updated_by`, append-only audit tables |
| Secure defaults | Soft deletes; localhost DB bind; presigned R2; short JWT TTL |

**Assume**: users, developers, and AI make mistakes — design systems that fail safely.

## Threat Model (School ERP)

High-sensitivity data: student PII, guardian contacts, financial records, exam results, admission documents.

| Threat | Primary control |
|--------|-----------------|
| Insider cross-school access | Service `school_id` tenancy |
| Role escalation (SISWA → finance API) | Backend RBAC on every HTTP method |
| Brute-force login | Rate limits, WAF, Argon2id |
| Forgot permission on DELETE | Security Review + 403 integration tests |
| Agent exposes secret | AI agent rules; no prod deploy without gate |

## Mandatory Review Triggers

Security Review required when change touches:

- Auth, sessions, JWT, passwords
- RBAC permissions, roles, route guards
- New/modified API endpoints (especially mutations)
- Database schema (PII, financial, exam, admission)
- File upload, export, bulk download
- Cloudflare DNS, tunnel, Worker, D1, R2
- Secrets, env vars, CI credentials
- MCP tools, agent deploy/commit permissions
- Third-party integrations (payment, WhatsApp)

## Security Gates

No migrations, API endpoints, UI routes, Workers, or infra until gates **1–6** pass for scope.

| Gate | Document / Skill | Blocks |
|------|------------------|--------|
| 1 Threat context | `.cursor/gates/security/security-principles.md` | Implementation start |
| 2 RBAC | **teknovo-security-domain** | Controller/UI scaffolding |
| 3 API & auth | **teknovo-security-domain** | API implementation |
| 4 Database | **teknovo-security-domain** | Migration apply |
| 5 Infra | **teknovo-security-infra** | Edge deploy |
| 6 Supply chain | `.cursor/gates/assurance/dependency-review.md` (conditional) | Merge with unreviewed deps |
| 7 Pre-deploy | **teknovo-security-review** + devops | `gstack-ship` |

### Gate Sign-Off Template

```markdown
## Security Gate Sign-Off — [Feature]

| Gate | Status | Evidence |
|------|--------|----------|
| 1 Threat context | ✅/❌ | Assurance scan |
| 2 RBAC | ✅/❌ | Matrix diff |
| 3 API | ✅/❌ | OpenAPI + guards |
| 4 Database | ✅/❌ | Migration review |
| 5 Infra | ✅/N/A | — |
| 6 Supply chain | ✅/N/A | Dep review |
| 7 Pre-deploy | ☐ | CI run |

**Verdict**: PASS | BLOCK
```

## Automatic BLOCK Patterns

| Pattern | Fix |
|---------|-----|
| Missing authorization on mutation | `@RequirePermissions('domain.resource.action')` |
| UI-only security | Guard API; UI is advisory |
| Hard delete on protected data | Soft delete + audit |
| Secrets in repo | Wrangler secrets / env injection |
| Public DB bind (`0.0.0.0`) | `127.0.0.1` + Cloudflare Tunnel |
| Unvalidated input | Zod at controller |
| Cross-tenant leak | Service-layer `school_id` filter |
| Agent prod deploy | Human gate + security-gates |

## When to Load Which Skill

| Change type | Load order |
|-------------|------------|
| Any significant feature | **teknovo-security** → **teknovo-security-review** |
| RBAC, permissions, nav | + **teknovo-security-domain** (RBAC section) |
| API endpoints, webhooks | + **teknovo-security-domain** (API section) |
| Migrations, schema | + **teknovo-security-domain** (DB section) |
| Deploy, DNS, R2, tunnel | + **teknovo-security-infra** |
| Agent/MCP/automation | + **teknovo-security-infra** (agent section) |

**CLI**: `python .cursor/runtime/load-memory.py --include-security --security-bundle pre-api`

## Integration

| Layer | Relationship |
|-------|--------------|
| Taste | Approves *what*; Security approves *whether safe* |
| Assurance | Precedes Security; feeds insecure-defaults scan |
| Quality | Includes Security Review in quality gates |
| Three Pillars | Architecture Impact must include RBAC/Security section |

## Related

- Index: `.cursor/docs/ai/AI_SECURITY_SYSTEM.md`
- Registry: `.cursor/gates/security/security-registry.yaml`, `.cursor/registry/skill-registry.yaml`
- Review agent artifact: `agents/security-reviewer.md` (formal verdict workflow in **teknovo-security-review**)
