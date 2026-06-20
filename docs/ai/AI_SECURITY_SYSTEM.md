# Teknovo AI Security System — Security Architect

> **Version**: 1.0 · **Last updated**: 2026-06-20  
> **Registry**: `security/security-registry.yaml`

The **Teknovo Security System** is the mandatory security review layer for the AI SuperStack. It complements Three Pillars, Taste, and Impeccable Quality — **no feature bypasses security review**.

**Philosophy**: Assume users, developers, and AI make mistakes. Systems must remain secure despite mistakes.

---

## Quick Start

| When | Load |
|------|------|
| Planning / architecture | `security/security-principles.md`, `security/security-gates.md` |
| Before RBAC changes | `security/rbac-security.md` |
| Before API work | `security/api-security.md` |
| Before migrations | `security/database-security.md` |
| Before deploy | `security/cloudflare-security.md`, `security/security-gates.md` |
| AI workstation / MCP | `security/ai-agent-security.md` |
| Review / audit | `security/review-checklist.md`, `agents/security-reviewer.md` |

**CLI**: `python ai-agent/runtime/load-memory.py --include-security`  
**Bundles**: `--security-bundle planning | pre-rbac | pre-api | pre-db | pre-deploy | pre-agent | full`

---

## Artifact Index

| Artifact | Path | Purpose |
|----------|------|---------|
| Security principles | `security/security-principles.md` | Master philosophy and threat model |
| RBAC security | `security/rbac-security.md` | Roles, permissions, guards, ownership |
| API security | `security/api-security.md` | Auth, validation, rate limits, CORS |
| Database security | `security/database-security.md` | UUID v7, soft delete, audit, tenancy |
| Cloudflare security | `security/cloudflare-security.md` | Workers, D1, R2, DNS, tunnels, secrets |
| AI agent security | `security/ai-agent-security.md` | Agent tools, MCP, commits, deploy limits |
| Review checklist | `security/review-checklist.md` | Ten-section pre-ship security checklist |
| Security gates | `security/security-gates.md` | Pre-implementation, pre-deploy, pre-production |
| Security reviewer | `agents/security-reviewer.md` | Formal review with risk + verdict |
| Registry | `security/security-registry.yaml` | Paths, triggers, bundles |
| Tactical skill | `.agents/skills/teknovo-security-review/SKILL.md` | JWT, CORS, rate limit checklist |

---

## Workflow Integration

```text
Discovery
    ↓
Planning + Taste (scope)
    ↓
Architecture Gate (Pillar 2)
    ↓
SECURITY GATE (pre-implementation)     ← agents/security-reviewer.md
    ↓
Implementation
    ↓
Impeccable Quality Review
    ↓
SECURITY GATE (pre-deploy)
    ↓
Ship (Pillar 3 — gstack-ship)
    ↓
SECURITY GATE (pre-production)
```

**Order**: Taste → **Security (before code)** → Implementation → Impeccable Quality → **Security (before ship)** → Ship

---

## Security Gates Summary

1. **Pre-Implementation** — before migrations, APIs, RBAC, routes  
2. **Pre-Deploy** — before staging/production deploy  
3. **Pre-Production** — final release authorization  

Detail: `security/security-gates.md`

---

## Bundles

| Bundle | Artifacts | Use case |
|--------|-----------|----------|
| `planning` | principles, gates | Plan authoring |
| `pre-rbac` | principles, rbac, checklist | Permission/nav changes |
| `pre-api` | principles, api, rbac, checklist | Endpoint work |
| `pre-db` | principles, database, rbac, checklist | Migrations |
| `pre-deploy` | principles, cloudflare, api, checklist, gates | Deploy |
| `pre-agent` | principles, ai-agent, checklist | Workstation/MCP |
| `full` | All security artifacts | Full audit |

---

## Invoking Security Reviewer

1. Load context: `python ai-agent/runtime/load-memory.py --include-security --security-bundle pre-api`
2. Read `agents/security-reviewer.md` and applicable `security/*.md`
3. Run `security/review-checklist.md`
4. Produce output: Risk Level, Attack Surface, Mitigation Plan, Approval (APPROVE/BLOCK)
5. Registry trigger: "security review", "security audit", "OWASP", "before deploy"

Or reference in chat: *"Run security-reviewer on this PR/plan before implementation."*

---

## Ecosystem Links

| System | Integration |
|--------|-------------|
| `AGENTS.md` | Security Layer section |
| `.agents/registry.yaml` | Security triggers + security-reviewer |
| `memory/memory-registry.yaml` | Security artifact entries |
| `ai-agent/runtime/load-memory.py` | `--include-security`, `--security-bundle` |
| Taste | `taste/taste-gates.md` — security required after taste |
| Quality | `quality/quality-gates.md` — Security Review mandatory gate |
| Superpowers | `writing-plans`, `requesting-code-review` |
| GStack | `gstack-eng-review`, `gstack-ship` |
| Skills | `teknovo-security-review`, `teknovo-rbac-architect` |

---

## Related Documentation

- Master agent rules: `AGENTS.md`
- Architecture decisions: `memory/architecture-decisions.md`
- Quality system: `docs/ai/AI_QUALITY_SYSTEM.md`
- Deploy: `AI_DEPLOY.md`
- RBAC skill: `.agents/skills/teknovo-rbac-architect/SKILL.md`
