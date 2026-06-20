# Teknovo Cloudflare MCP — API Reference

All tools return JSON text in MCP `content[0].text`:

```json
{ "success": true, "data": { ... } }
```

Errors:

```json
{ "success": false, "error": "message", "details": { ... } }
```

Missing credentials fail safely without calling Cloudflare.

---

## Pages Tools

### `pages_create_project`

Create a Cloudflare Pages project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Project name |
| `production_branch` | string | No | Default: `main` |
| `build_command` | string | No | Default: `npm run build` |
| `destination_dir` | string | No | Default: `.next` |
| `root_dir` | string | No | Monorepo subdirectory |

**Cloudflare endpoint:** `POST /accounts/{account_id}/pages/projects`

---

### `pages_deploy`

Trigger a deployment for an existing project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | Yes | Pages project name |
| `branch` | string | No | Branch to deploy |

**Cloudflare endpoint:** `POST /accounts/{account_id}/pages/projects/{project_name}/deployments`

---

### `pages_list_projects`

List all Pages projects in the account.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Pagination page |
| `per_page` | number | No | Max 100 |

**Cloudflare endpoint:** `GET /accounts/{account_id}/pages/projects`

---

### `pages_get_deployment`

Get deployment status and metadata.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | Yes | Pages project name |
| `deployment_id` | string | Yes | Deployment ID |

**Cloudflare endpoint:** `GET /accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}`

---

## DNS Tools

All DNS tools operate on `CLOUDFLARE_ZONE_ID`.

### `dns_create_record`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | enum | Yes | A, AAAA, CNAME, TXT, MX, NS, SRV, CAA |
| `name` | string | Yes | Record name |
| `content` | string | Yes | Target value |
| `ttl` | number | No | Default: 1 (auto) |
| `proxied` | boolean | No | Default: true |
| `priority` | number | No | MX/SRV priority |
| `comment` | string | No | Record comment |

**Cloudflare endpoint:** `POST /zones/{zone_id}/dns_records`

---

### `dns_update_record`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `record_id` | string | Yes | DNS record ID |
| `type` | enum | No | Record type |
| `name` | string | No | Record name |
| `content` | string | No | Target value |
| `ttl` | number | No | TTL |
| `proxied` | boolean | No | Proxy status |
| `priority` | number | No | MX/SRV priority |
| `comment` | string | No | Comment |

At least one field besides `record_id` is required.

**Cloudflare endpoint:** `PUT /zones/{zone_id}/dns_records/{record_id}`

---

### `dns_list_records`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | enum | No | Filter by type |
| `name` | string | No | Filter by name |
| `content` | string | No | Filter by content |
| `page` | number | No | Pagination |
| `per_page` | number | No | Max 100 |

**Cloudflare endpoint:** `GET /zones/{zone_id}/dns_records`

---

## Domain Tools

### `domain_attach`

Attach a custom domain to a Pages project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | Yes | Pages project |
| `domain` | string | Yes | FQDN (e.g. `erp.school.sch.id`) |

**Cloudflare endpoint:** `POST /accounts/{account_id}/pages/projects/{project_name}/domains`

---

### `domain_verify`

Check or trigger verification for an attached domain.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | Yes | Pages project |
| `domain` | string | Yes | FQDN |

Returns `{ verified: true|false, status, details }`.

**Cloudflare endpoints:**
- `GET .../domains/{domain}` — current status
- `PATCH .../domains/{domain}` — trigger verification when pending

---

## Error Codes

| HTTP | Meaning | MCP behavior |
|------|---------|--------------|
| 400 | Invalid request | Returns `isError` with API message |
| 403 | Token lacks permission | Returns `isError`; check token scopes |
| 404 | Resource not found | Returns `isError` with context |
| 429 | Rate limited | Auto-retry with Retry-After |
| 5xx | Server error | Retry up to 3 attempts |

---

## Token Scopes (Minimum)

| Scope | Purpose |
|-------|---------|
| Account → Cloudflare Pages → Edit | Pages CRUD, deploy, domains |
| Account → Account Settings → Read | Account ID validation |
| Zone → DNS → Edit | DNS create/update |
| Zone → Zone → Read | Zone validation |
