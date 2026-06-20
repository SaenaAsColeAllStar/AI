# Cloudflare Security â€” Teknovo Security System

> **Scope**: Workers, D1, R2, DNS, tunnels, secrets, environment variables  
> **Source**: `.cursor/docs/memory/architecture-decisions.md`, `.cursor/skills/teknovo-cloudflare-stack/SKILL.md`, `AI_DEPLOY.md`  
> **Reject**: Public secrets, overprivileged accounts, unsafe deployments

---

## Why Cloudflare for Teknovo Security

Teknovo deploys school ERP instances where **no service binds to the public internet directly**. Cloudflare provides edge TLS, WAF, rate limiting, and tunnel ingress to localhost-bound services.

| Benefit | Security outcome |
|---------|------------------|
| Cloudflare Tunnel | API/DB stay on `127.0.0.1`; no open ports on VPS |
| Full (Strict) SSL | Encrypted client-to-edge-to-origin |
| WAF + bot management | Blocks common attacks on login/PPDB |
| Edge rate limits | Protects public registration endpoints |
| R2 private buckets | Documents/backups without public ACL mistakes |

Reference decision record: `.cursor/docs/memory/architecture-decisions.md` â€” Cloudflare Edge Infrastructure.

---

## Subdomain Isolation

Each ERP domain on dedicated subdomain â€” separate cookie scope and CORS policy:

| Subdomain | Service | Security note |
|-----------|---------|---------------|
| `portal.*` | Landing / marketing | Public cache; minimal attack surface |
| `erp.*` | Main ERP | Authenticated staff |
| `ppdb.*` | Admissions | Mixed public registration + admin |
| `cbt.*` | Exams | High integrity; proctor permissions |
| `finance.*` | Billing | Highest sensitivity; strict RBAC |
| `api.*` | REST API | Auth required except documented public |
| `wa.*` | WhatsApp gateway | API key; internal network preferred |

**Reject**: Single wildcard CORS `*` in production.

---

## Cloudflare Tunnel

| Rule | Detail |
|------|--------|
| Origin bind | Services on `127.0.0.1` only â€” never `0.0.0.0` for DB/API |
| Ingress rules | Explicit hostname â†’ local port mapping |
| Tunnel token | Stored as secret â€” not in git |
| Access policy | Optional Cloudflare Access for admin/staging |

### Anti-Patterns

| Wrong | Right |
|-------|-------|
| Expose PostgreSQL port via tunnel | Tunnel to API only; DB local |
| One tunnel token in shared doc | Per-environment secrets in CI |
| Staging tunnel on prod hostname | Separate hostnames per env |

---

## Workers Security

| Control | Requirement |
|---------|-------------|
| Least privilege API token | DNS edit only on required zones |
| Secrets | `wrangler secret put` â€” never in `wrangler.toml` committed |
| Bindings | D1/R2/KV bound explicitly; no wildcard |
| Code review | Worker changes pass Security Review |
| Logging | No PII in Worker console.log in production |

Optional Workers/D1 for lightweight edge tasks â€” **not** a replacement for authoritative PostgreSQL without architecture approval.

---

## D1 Security

| Rule | Detail |
|------|--------|
| Use case | Edge cache, session scratch, non-authoritative data only |
| PII | Do not store student PII in D1 without ADR |
| Migrations | Versioned; reviewed like PostgreSQL |
| Bindings | Per-worker least privilege |

**Reject**: Primary financial or grade data in D1 without explicit architecture sign-off.

---

## R2 Object Storage

### Bucket Structure

| Bucket | Purpose | Access |
|--------|---------|--------|
| `teknovo-documents` | PPDB uploads, student docs | **Private** |
| `teknovo-assets` | Marketing assets | Public CDN |
| `teknovo-backups` | DB backups | **Private** |
| `teknovo-reports` | Generated PDFs | **Private** |

### Access Rules

| Rule | Implementation |
|------|----------------|
| No credentials in frontend | Presigned URLs via backend (5 min expiry) |
| Separate buckets by sensitivity | No mixed public/private bucket |
| Upload validation | MIME + size server-side before presign |
| List permissions | Backend-only; no public list |

**Reject**: R2 access keys in Nuxt bundle or mobile app.

---

## DNS Security

| Control | Detail |
|---------|--------|
| CNAME to tunnel | Standard pattern |
| DNS change review | Security Review for prod DNS edits |
| Subdomain takeover | Remove stale CNAMEs |
| Certificate | Full (Strict); auto-managed |

AI agents: **no autonomous production DNS changes** without human approval (`.cursor/gates/security/ai-agent-security.md`).

---

## Secrets & Environment Variables

| Secret type | Storage |
|-------------|---------|
| Cloudflare API token | CI secret store / Wrangler |
| Tunnel credentials | Encrypted env; rotate on leak |
| R2 access keys | Backend only; rotate quarterly |
| JWT signing key | Env; never commit |
| WhatsApp API key | Env; scoped to WA service |

| Rule | Detail |
|------|--------|
| `.env` in `.gitignore` | Always |
| `.env.example` | Keys documented, no values |
| CI | GitHub encrypted secrets |
| Rotation | Immediate on suspected exposure |

---

## Deployment Security

| # | Check | Critical |
|---|-------|----------|
| C1 | No secrets in repo or build artifacts | Yes |
| C2 | Staging before production | Yes |
| C3 | Tunnel config matches hostname allowlist | Yes |
| C4 | WAF enabled on production zone | Yes |
| C5 | Rate limits on login/PPDB public | Yes |
| C6 | R2 buckets private by default | Yes |
| C7 | Deployment Impact Analysis completed | Yes |
| C8 | Rollback procedure documented | Yes |

Skills: `teknovo-devops-engineer`, `gstack-ship`, `teknovo-cloudflare-stack`

---

## Monitoring & Incident Response

| Signal | Action |
|--------|--------|
| Spike 401/403 | Possible attack or misconfigured deploy |
| Tunnel disconnect | Alert; services unreachable but not exposed |
| WAF blocks | Review false positives |
| Secret leak | Rotate immediately; `teknovo-incident-response` |

---

## Related

- AI agent deploy limits: `.cursor/gates/security/ai-agent-security.md`
- API CORS/headers: `.cursor/gates/security/api-security.md`
- Gates: `.cursor/gates/security/security-gates.md`
- Infrastructure: `docs/infrastructure/cloudflare-setup-guide.md`
