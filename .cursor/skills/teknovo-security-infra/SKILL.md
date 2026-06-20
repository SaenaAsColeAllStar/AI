---
name: teknovo-security-infra
description: >-
  Teknovo Cloudflare and AI agent security — tunnels, R2, Workers, DNS, secrets,
  MCP boundaries, commit rules, no autonomous prod deploy. Use for Cloudflare
  deploy, tunnel, R2, DNS, Workers, MCP setup, Cursor agent sessions, or automation.
---

# Teknovo Security — Infrastructure & Agent

**Scope**: Cloudflare edge/deploy hardening and AI workstation boundaries. For RBAC/API/DB → **teknovo-security-domain**. For gates → **teknovo-security**. For formal audit → **teknovo-security-review**.

**Source artifacts**: `.cursor/gates/security/cloudflare-security.md`, `.cursor/gates/security/ai-agent-security.md`

---

## Cloudflare Security Model

No service binds to the public internet directly. Cloudflare provides TLS, WAF, rate limits, tunnel ingress to localhost-bound services.

| Benefit | Outcome |
|---------|---------|
| Cloudflare Tunnel | API/DB on `127.0.0.1`; no open VPS ports |
| Full (Strict) SSL | Encrypted client-to-edge-to-origin |
| WAF + bot management | Login/PPDB attack mitigation |
| Edge rate limits | Public registration protection |
| R2 private buckets | No public ACL mistakes |

### Subdomain Isolation

| Subdomain | Sensitivity |
|-----------|-------------|
| `portal.*` | Public cache; minimal surface |
| `erp.*` | Authenticated staff |
| `ppdb.*` | Mixed public + admin |
| `cbt.*` | High integrity |
| `finance.*` | Highest — strict RBAC |
| `api.*` | Auth except documented public |
| `wa.*` | API key; internal preferred |

**Reject**: Wildcard CORS `*` in production.

### Cloudflare Tunnel

| Rule | Detail |
|------|--------|
| Origin bind | `127.0.0.1` only — never `0.0.0.0` for DB/API |
| Ingress | Explicit hostname → local port |
| Tunnel token | Secret — not in git |
| DB exposure | Tunnel to API only; PostgreSQL stays local |

### Workers & D1

| Control | Requirement |
|---------|-------------|
| API token | Least privilege — DNS edit on required zones only |
| Secrets | `wrangler secret put` — never committed in `wrangler.toml` |
| Bindings | D1/R2/KV explicit; no wildcard |
| Logging | No PII in production `console.log` |
| D1 PII | No student PII in D1 without ADR; not authoritative for finance/grades |

### R2 Object Storage

| Bucket | Access |
|--------|--------|
| `teknovo-documents` | **Private** — PPDB, student docs |
| `teknovo-assets` | Public CDN — marketing only |
| `teknovo-backups` | **Private** — encrypted DB backups |
| `teknovo-reports` | **Private** — generated PDFs |

| Rule | Implementation |
|------|----------------|
| Frontend access | Presigned URLs via backend (5 min expiry) |
| Upload | MIME + size validated server-side before presign |
| Keys | Backend only — **never** in Nuxt bundle or mobile app |

### Secrets & Environment

| Secret | Storage |
|--------|---------|
| Cloudflare API token | CI secret / Wrangler |
| Tunnel credentials | Encrypted env; rotate on leak |
| R2 keys | Backend only; rotate quarterly |
| JWT signing key | Env; never commit |
| WhatsApp API key | Env; scoped to WA service |

| Rule | Detail |
|------|--------|
| `.env` | Always in `.gitignore` |
| `.env.example` | Keys documented, no values |
| Rotation | Immediate on suspected exposure |

### Deploy Checklist

| # | Check | Critical |
|---|-------|----------|
| C1 | No secrets in repo or build artifacts | Yes |
| C2 | Staging before production | Yes |
| C3 | Tunnel config matches hostname allowlist | Yes |
| C4 | WAF enabled on production zone | Yes |
| C5 | Rate limits on login/PPDB public | Yes |
| C6 | R2 buckets private by default | Yes |
| C7 | Deployment Impact Analysis completed | Yes |
| C8 | Rollback documented | Yes |

**Skills**: `teknovo-devops-engineer`, `teknovo-cloudflare-stack`, `gstack-ship`

---

## AI Agent Security

This repository **is** an AI workstation. Assume the agent will run wrong commands, commit wrong files, or expose secrets — constrain anyway.

### Agent Threat Model

| Mistake | Control |
|---------|---------|
| Commit `.env` with tokens | Pre-commit hooks; never stage secrets |
| `wrangler deploy` to production | Human gate; forbidden in agent rules |
| DNS record change | Block autonomous prod DNS |
| `git push --force` | Forbidden unless user explicit |
| Over-broad MCP | MCP allowlist per session |

### Tool Permissions

**Allowed (with standards)**:

| Tool | Constraint |
|------|------------|
| Read/write code | After Security + Architecture gates for risky changes |
| Shell (dev) | `tsc`, `lint`, `test`, local `pnpm` — no prod infra |
| Memory loader | Approved bundles only |

**Restricted — human approval required**:

| Action | Why |
|--------|-----|
| Production deploy | Pillar 3 + `gstack-ship` gate |
| DNS / Cloudflare zone edit | Permanent customer impact |
| Production DB migration | Data integrity |
| Secret rotation / creation | High blast radius |
| Force push to main | Repository integrity |
| Disable security hooks | Bypass detection |

### Deployment Rules

Agents **must not** autonomously:

- Run `wrangler deploy` to production
- Modify production tunnel ingress
- Apply D1/R2 production binding changes
- Trigger production GitHub Actions without user request

**Allowed**: Draft Deployment Impact Analysis; staging deploy **only when user explicitly requests**.

### Commit Rules

| Rule | Detail |
|------|--------|
| Commit | Only when user asks |
| Secrets | Scan diff for tokens, keys, passwords |
| `--no-verify` | Only if user explicitly requests |
| Hook failure | Fix and **new** commit — no amend after reject |

Pre-commit rejects: `.env`, `*.pem`, `credentials.json`, known token patterns.

### Credential Handling

- Never print secrets — redact in logs and output
- MCP tokens session-scoped; not written to repo
- If user pastes secret: warn to rotate; do not echo in commits or docs

### MCP Permissions

| Principle | Application |
|-----------|-------------|
| Least privilege | Enable only servers needed for task |
| Read vs write | Prefer read-only for investigation |
| External deploy MCPs | Treat as production — human gate |
| Production DB MCP | Read-only role only |

### Session Scope

```text
Discovery → Planning → Taste → Architecture → SECURITY REVIEW → Implementation
```

Agents **must not** skip implementation without security artifacts for the change type.

### Agent Checklist

| # | Check | Critical |
|---|-------|----------|
| AI1 | `AGENTS.md` rules loaded | Yes |
| AI2 | Security bundle loaded before RBAC/API/DB work | Yes |
| AI3 | No secrets in generated files | Yes |
| AI4 | Prod deploy requires explicit user + gate | Yes |
| AI5 | MCP scope minimal and documented | Yes |

### Safe vs Unsafe Patterns

| Good | Bad |
|------|-----|
| `load-memory.py --security-bundle pre-api` | API without review |
| Security reviewer BLOCK on missing RBAC | "Ship fast" override |
| User approves deploy command | Agent chains deploy after green tests |
| `.env.example` without values | Copy `.env` to repo |

---

## Monitoring Signals

| Signal | Action |
|--------|--------|
| Spike 401/403 | Possible attack or misconfigured deploy |
| Tunnel disconnect | Alert; services unreachable but not exposed |
| Secret leak | Rotate immediately; `teknovo-incident-response` |
