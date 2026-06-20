---
name: teknovo-cloudflare-stack
description: Configure and manage Cloudflare Tunnels, DNS records, R2 Storage buckets, Pages deployments, and edge security headers via MCP automation.
---

# Teknovo Cloudflare Stack Skill

Use this skill when managing domain routing, tunnel configuration, asset storage, Pages deployments, or edge security.

**Reference**: `docs/infrastructure/cloudflare-setup-guide.md`, `docs/infrastructure/deployment-standard.md`, `docs/SECRET_STORE.md`, `.cursor/gates/execution/deployment-mode.md`, `.cursor/mcp/cloudflare/README.md`

**Execution mode**: When deploy is requested, run the full pipeline in `.cursor/gates/execution/deployment-mode.md` — build, test, self-heal failures (max 10 retries), deploy, verify DNS/HTTPS. **Execute with MCP and shell tools; do not respond with instructions-only mode** when credentials exist.

**MCP Server**: `teknovo-cloudflare-mcp` at `.cursor/mcp/cloudflare/` — invoke tools directly when credentials exist in Teknovo secret store.

**Secret store**: `/root/.config/teknovo/secrets/cloudflare.env` (Linux) or `%USERPROFILE%\.config\teknovo\secrets\cloudflare.env` (Windows). Loader: `mcp/shared/secrets.js`.

---

## Auto-Deploy Triggers

When the user says **"deploy ke cloudflare"**, **"deploy ke smk.ctos.web.id"**, or similar deploy-to-Cloudflare intent — and credentials are configured — **execute** the MCP deployment workflow immediately. Do not respond with instructions-only mode.

---

## MCP Deployment Workflow

When Cloudflare credentials are available (secret store or env), **execute** this sequence:

```text
build_nextjs → run_tests → pages_create_project → pages_deploy → domain_attach → domain_verify
```

| Step | Action | MCP Tool |
|------|--------|----------|
| 1 | Build Next.js app | Shell: `npm run build` |
| 2 | Run test suite | Shell: `npm test` |
| 3 | Create Pages project (if new) | `pages_create_project` |
| 4 | Deploy to Cloudflare Pages | `pages_deploy` |
| 5 | Attach school subdomain | `domain_attach` |
| 6 | Verify DNS / domain status | `domain_verify` |

### Example: Full ERP deploy

```json
// 1. Create project (skip if exists — use pages_list_projects first)
{ "name": "pages_create_project", "arguments": {
  "name": "teknovo-erp",
  "build_command": "npm run build",
  "destination_dir": ".next"
}}

// 2. Deploy
{ "name": "pages_deploy", "arguments": { "project_name": "teknovo-erp", "branch": "main" }}

// 3. Attach domain
{ "name": "domain_attach", "arguments": {
  "project_name": "teknovo-erp",
  "domain": "erp.school.sch.id"
}}

// 4. Verify
{ "name": "domain_verify", "arguments": {
  "project_name": "teknovo-erp",
  "domain": "erp.school.sch.id"
}}
```

### DNS for Pages custom domain

If Cloudflare requires CNAME for subdomain:

```json
{ "name": "dns_create_record", "arguments": {
  "type": "CNAME",
  "name": "erp",
  "content": "teknovo-erp.pages.dev",
  "proxied": true
}}
```

---

## MCP Tool Reference

| Tool | Purpose |
|------|---------|
| `pages_create_project` | Create Cloudflare Pages project |
| `pages_deploy` | Trigger deployment |
| `pages_list_projects` | List existing projects |
| `pages_get_deployment` | Check deployment status |
| `dns_create_record` | Create DNS record |
| `dns_update_record` | Update DNS record |
| `dns_list_records` | List zone records |
| `domain_attach` | Attach custom domain to Pages |
| `domain_verify` | Verify domain status |

Server: `node .cursor/mcp/cloudflare/server.js` — see `.cursor/mcp/cloudflare/docs/API.md`.

**Security**: Requires `security-reviewer` APPROVE before write operations in deploy-session. Never hardcode tokens.

---

## Subdomain Architecture

| Subdomain | Service | Port |
|-----------|---------|------|
| `portal.domain.sch.id` | Nuxt landing page | 3000 |
| `erp.domain.sch.id` | ERP application | 3000 |
| `ppdb.domain.sch.id` | PPDB application | 3000 |
| `cbt.domain.sch.id` | CBT application | 3000 |
| `finance.domain.sch.id` | Finance application | 3000 |
| `api.domain.sch.id` | REST API server | 4000 |
| `wa.domain.sch.id` | WhatsApp gateway | 4001 |

Reference: `docs/adr/ADR-011-subdomain-architecture.md`

---

## Cloudflare Tunnels

Configure secure access without opening public ports:

```yaml
# cloudflared config.yml
tunnel: teknovo-production
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: api.domain.sch.id
    service: http://127.0.0.1:4000
  - hostname: erp.domain.sch.id
    service: http://127.0.0.1:3000
  - hostname: portal.domain.sch.id
    service: http://127.0.0.1:3000
  - service: http_status:404
```

**Rules**:
- All services bind to `127.0.0.1` — never `0.0.0.0`
- Tunnel credentials never in git
- One tunnel per environment (staging, production)
- Health check endpoint monitored

---

## DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | api | `<tunnel-id>.cfargotunnel.com` | Yes |
| CNAME | erp | `<tunnel-id>.cfargotunnel.com` | Yes |
| CNAME | portal | `<tunnel-id>.cfargotunnel.com` | Yes |
| CNAME | ppdb | `<tunnel-id>.cfargotunnel.com` | Yes |
| CNAME | cbt | `<tunnel-id>.cfargotunnel.com` | Yes |
| CNAME | finance | `<tunnel-id>.cfargotunnel.com` | Yes |

---

## R2 Storage

### Bucket Structure

| Bucket | Purpose | Access |
|--------|---------|--------|
| `teknovo-documents` | Student documents, PPDB uploads | Private |
| `teknovo-assets` | Public marketing assets | Public (CDN) |
| `teknovo-backups` | Database backups | Private |
| `teknovo-reports` | Generated PDF reports | Private |

### Upload Pattern

```typescript
// NEVER expose R2 credentials to frontend
// Use presigned URLs for client uploads

const presignedUrl = await r2.createPresignedUrl({
  bucket: 'teknovo-documents',
  key: `students/${studentId}/${documentId}`,
  expiresIn: 300, // 5 minutes
});
```

**Rules**:
- Direct upload credentials never exposed to frontend
- Presigned URLs with short expiry (5 min max)
- Cache-Control headers on public assets
- File metadata in database, files in R2

---

## Edge Security Headers

Configure via Cloudflare Transform Rules or application middleware:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Cloudflare Configuration Checklist

- [ ] Tunnel configured for all subdomains
- [ ] DNS records pointing to tunnel
- [ ] SSL/TLS mode: Full (Strict)
- [ ] Security headers applied
- [ ] Rate limiting rules on public endpoints
- [ ] R2 buckets created with correct access policies
- [ ] Presigned URL pattern for file uploads
- [ ] WAF rules enabled (OWASP core ruleset)
- [ ] Bot management enabled on login endpoints
- [ ] Services bound to 127.0.0.1 only

---

## Environment Variables

Credentials belong in Teknovo secret store — never in git:

```text
/root/.config/teknovo/secrets/cloudflare.env   # Linux production
%USERPROFILE%\.config\teknovo\secrets\cloudflare.env   # Windows dev
```

Required keys: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`

See `docs/SECRET_STORE.md` for GitHub and OpenRouter secret files.

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Public port on application server | Cloudflare Tunnel to localhost |
| R2 credentials in frontend | Presigned URLs via backend |
| Missing security headers | Configure via Cloudflare or middleware |
| Single bucket for all file types | Separate buckets by access level |
| Database exposed to internet | 127.0.0.1 only, tunnel for API |
