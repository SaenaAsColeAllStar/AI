---
name: teknovo-cloudflare-stack
description: Configure and manage Cloudflare Tunnels, DNS records, R2 Storage buckets, and edge security headers.
---

# Teknovo Cloudflare Stack Skill

Use this skill when managing domain routing, tunnel configuration, asset storage, or edge security.

**Reference**: `docs/infrastructure/cloudflare-setup-guide.md`, `docs/infrastructure/deployment-standard.md`

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

```bash
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_TUNNEL_TOKEN=

# R2 Storage
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=teknovo-documents
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

Never commit these values. Document in `.env.example`.

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Public port on application server | Cloudflare Tunnel to localhost |
| R2 credentials in frontend | Presigned URLs via backend |
| Missing security headers | Configure via Cloudflare or middleware |
| Single bucket for all file types | Separate buckets by access level |
| Database exposed to internet | 127.0.0.1 only, tunnel for API |
