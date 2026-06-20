# Teknovo AI Security System â€” Security Architect

> **Version**: 1.0 Â· **Last updated**: 2026-06-20  
> **Registry**: `.cursor/gates/security/security-registry.yaml`

The **Teknovo Security System** is the mandatory security review layer for the AI SuperStack. It complements Three Pillars, Taste, and Impeccable Quality â€” **no feature bypasses security review**.

**Philosophy**: Assume users, developers, and AI make mistakes. Systems must remain secure despite mistakes.

---

## Quick Start

| When | Load |
|------|------|
| Planning / architecture | `.cursor/gates/security/security-principles.md`, `.cursor/gates/security/security-gates.md` |
| Before RBAC changes | `.cursor/gates/security/rbac-security.md` |
| Before API work | `.cursor/gates/security/api-security.md` |
| Before migrations | `.cursor/gates/security/database-security.md` |
| Before deploy | `.cursor/gates/security/cloudflare-security.md`, `.cursor/gates/security/security-gates.md` |
| AI workstation / MCP | `.cursor/gates/security/ai-agent-security.md` |
| Review / audit | `.cursor/gates/security/review-checklist.md`, `agents/security-reviewer.md` |

**CLI**: `python .cursor/runtime/load-memory.py --include-security`  
**Bundles**: `--security-bundle planning | pre-rbac | pre-api | pre-db | pre-deploy | pre-agent | full`

---

## Artifact Index

| Artifact | Path | Purpose |
|----------|------|---------|
| Security principles | `.cursor/gates/security/security-principles.md` | Master philosophy and threat model |
| RBAC security | `.cursor/gates/security/rbac-security.md` | Roles, permissions, guards, ownership |
| API security | `.cursor/gates/security/api-security.md` | Auth, validation, rate limits, CORS |
| Database security | `.cursor/gates/security/database-security.md` | UUID v7, soft delete, audit, tenancy |
| Cloudflare security | `.cursor/gates/security/cloudflare-security.md` | Workers, D1, R2, DNS, tunnels, secrets |
| AI agent security | `.cursor/gates/security/ai-agent-security.md` | Agent tools, MCP, commits, deploy limits |
| Review checklist | `.cursor/gates/security/review-checklist.md` | Ten-section pre-ship security checklist |
| Security gates | `.cursor/gates/security/security-gates.md` | Pre-implementation, pre-deploy, pre-production |
| Security reviewer | `agents/security-reviewer.md` | Formal review with risk + verdict |
| Registry | `.cursor/gates/security/security-registry.yaml` | Paths, triggers, bundles |
| Tactical skill | `.cursor/skills/teknovo-security-review/SKILL.md` | JWT, CORS, rate limit checklist |

---

## Workflow Integration

```text
Discovery
    â†“
Planning + Taste (scope)
    â†“
Architecture Gate (Pillar 2)
    â†“
SECURITY GATE (pre-implementation)     â† agents/security-reviewer.md
    â†“
Implementation
    â†“
Impeccable Quality Review
    â†“
SECURITY GATE (pre-deploy)
    â†“
Ship (Pillar 3 â€” gstack-ship)
    â†“
SECURITY GATE (pre-production)
```

**Order**: Taste â†’ **Security (before code)** â†’ Implementation â†’ Impeccable Quality â†’ **Security (before ship)** â†’ Ship

---

## Security Gates Summary

1. **Pre-Implementation** â€” before migrations, APIs, RBAC, routes  
2. **Pre-Deploy** â€” before staging/production deploy  
3. **Pre-Production** â€” final release authorization  

Detail: `.cursor/gates/security/security-gates.md`

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

1. Load context: `python .cursor/runtime/load-memory.py --include-security --security-bundle pre-api`
2. Read `agents/security-reviewer.md` and applicable `.cursor/gates/security/*.md`
3. Run `.cursor/gates/security/review-checklist.md`
4. Produce output: Risk Level, Attack Surface, Mitigation Plan, Approval (APPROVE/BLOCK)
5. Registry trigger: "security review", "security audit", "OWASP", "before deploy"

Or reference in chat: *"Run security-reviewer on this PR/plan before implementation."*

---

## Ecosystem Links

| System | Integration |
|--------|-------------|
| `AGENTS.md` | Security Layer section |
| `.cursor/registry/legacy-registry.yaml` | Security triggers + security-reviewer |
| `.cursor/docs/memory/memory-registry.yaml` | Security artifact entries |
| `.cursor/runtime/load-memory.py` | `--include-security`, `--security-bundle` |
| Taste | `.cursor/gates/taste/taste-gates.md` â€” security required after taste |
| Quality | `.cursor/gates/quality/quality-gates.md` â€” Security Review mandatory gate |
| Superpowers | `writing-plans`, `requesting-code-review` |
| GStack | `gstack-eng-review`, `gstack-ship` |
| Skills | `teknovo-security-review`, `teknovo-rbac-architect` |

---

## Related Documentation

- Master agent rules: `AGENTS.md`
- Architecture decisions: `.cursor/docs/memory/architecture-decisions.md`
- Quality system: `.cursor/docs/ai/AI_QUALITY_SYSTEM.md`
- Deploy: `AI_DEPLOY.md`
- RBAC skill: `.cursor/skills/teknovo-rbac-architect/SKILL.md`
