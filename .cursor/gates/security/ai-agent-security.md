# AI Agent Security — Teknovo Security System

> **Scope**: Tool permissions, deployment permissions, commit permissions, credentials, MCP, agent boundaries  
> **Context**: Teknovo AI SuperStack workstation (Cursor, OpenCode, Ollama/Qwen, this repository)  
> **Reject**: Unrestricted deployment, unrestricted DNS, secret exposure, unsafe automation

---

## Purpose

This repository **is** an AI workstation. Agents read standards, generate plans, modify code, run commands, and may invoke MCP tools. AI Agent Security defines **boundaries** so agent mistakes do not become production incidents.

**Assume**: The agent will run the wrong command, commit the wrong file, or expose a secret — design constraints anyway.

---

## Agent Threat Model

| Mistake | Impact | Control |
|---------|--------|---------|
| Commit `.env` with tokens | Credential leak | Pre-commit hooks; never stage secrets |
| `wrangler deploy` to production | Unauthorized release | Human gate; no prod deploy in agent rules |
| DNS record change | Subdomain takeover risk | Block autonomous prod DNS |
| `git push --force` | History destruction | User rules forbid unless explicit |
| Read/write outside workspace | Data exfiltration | Tool sandbox; workspace path only |
| Over-broad MCP access | External system abuse | MCP allowlist per session |

---

## Tool Permissions

### Allowed (with standards)

| Tool class | Constraint |
|------------|------------|
| Read files | Repository and documented Teknovo-V2 paths |
| Write code | After Security + Architecture gates for risky changes |
| Shell (dev) | `tsc`, `lint`, `test`, local `pnpm` — no prod infra |
| Memory loader | `load-memory.py` with approved bundles |
| Search/grep | Read-only codebase exploration |

### Restricted — Human Approval Required

| Action | Why |
|--------|-----|
| Production deploy | `gstack-ship` + Pillar 3 gate |
| DNS / Cloudflare zone edit | Permanent customer impact |
| Database migration on production | Data integrity |
| Secret rotation / creation | High blast radius |
| Force push to main | Repository integrity |
| Disable security hooks | Bypass detection |

---

## Deployment Permissions

Agents **must not** autonomously:

- Run `wrangler deploy` to production environments
- Modify Cloudflare tunnel ingress for production hostnames
- Apply D1/R2 production binding changes
- Trigger GitHub Actions workflow_dispatch for production without user request

**Allowed**: Draft Deployment Impact Analysis; run staging deploy **only when user explicitly requests**.

Reference: `.cursor/gates/security/security-gates.md`, `AI_DEPLOY.md`

---

## Commit Permissions

From user rules and security policy:

| Rule | Detail |
|------|--------|
| Commit only when user asks | No proactive commits |
| No secrets in commits | Scan diff for tokens, keys, passwords |
| No `--no-verify` | Unless user explicitly requests |
| No force push to main | Warn user |
| Hook failure | Fix and **new** commit — no amend after reject |

Pre-commit should reject: `.env`, `*.pem`, `credentials.json`, known token patterns.

---

## Credential Handling

| Rule | Implementation |
|------|----------------|
| Never print secrets | Redact in logs and agent output |
| Load from env | Ollama at `127.0.0.1:11434` — local only |
| MCP tokens | Session-scoped; not written to repo |
| Cloudflare/API keys | CI or local env only |
| User messages | Do not repeat pasted credentials in summaries |

If user pastes a secret: warn to rotate; do not echo in commits or docs.

---

## MCP Permissions

| Principle | Application |
|-----------|-------------|
| Least privilege | Enable only MCP servers needed for task |
| Read vs write | Prefer read-only integrations for investigation |
| External deploy MCPs | Treat as production — human gate |
| Audit | Log which MCP actions were taken in session summary |

**Reject**: Connecting unrestricted production database MCP without read-only role.

---

## Agent Boundaries

### Session Scope

```text
Discovery → Planning → Taste → Architecture → SECURITY REVIEW → Implementation
```

Agents **must not** skip to implementation without security artifacts loaded for the change type.

### Subagent Rules

| Subagent | Constraint |
|----------|------------|
| `security-review` | Read-only for audits |
| `shell` | No destructive git/infra without approval |
| `explore` | Read-only |
| Background agents | No autonomous prod deploy |

### Ollama / Local LLM

| Control | Detail |
|---------|--------|
| Bind local | `127.0.0.1:11434` — not exposed to LAN/WAN |
| No training on secrets | Do not paste prod credentials into prompts |
| Model output | Untrusted — validate before execute |

---

## Workstation-Specific Checks

| # | Check | Critical |
|---|-------|----------|
| AI1 | Agent rules loaded from `AGENTS.md` | Yes |
| AI2 | Security bundle loaded before RBAC/API/DB work | Yes |
| AI3 | No secrets in generated files | Yes |
| AI4 | Prod deploy requires explicit user + gate | Yes |
| AI5 | MCP scope documented for session | Yes |
| AI6 | Session summary excludes credentials | Yes |

---

## Safe Automation Patterns

| Good | Bad |
|------|-----|
| `load-memory.py --security-bundle pre-api` before endpoint work | Agent writes API without review |
| Security reviewer BLOCK on missing RBAC | "Ship fast" override |
| User approves deploy command | Agent chains deploy after green tests |
| `.env.example` updated without values | Copy `.env` to repo |

---

## Related

- Principles: `.cursor/gates/security/security-principles.md`
- Cloudflare: `.cursor/gates/security/cloudflare-security.md`
- Gates: `.cursor/gates/security/security-gates.md`
- Agent: `agents/security-reviewer.md`
- Deploy: `AI_DEPLOY.md`, `teknovo-devops-engineer`
