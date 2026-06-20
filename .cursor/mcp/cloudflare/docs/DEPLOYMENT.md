# Teknovo Cloudflare MCP — Production Deployment

## Overview

Deploy `teknovo-cloudflare-mcp` on developer workstations and CI runners that need Cloudflare automation. The server uses **stdio transport** — no HTTP port exposed.

## Prerequisites

- Node.js ≥ 18
- Cloudflare API token (least privilege — see [SECURITY.md](SECURITY.md))
- Cursor IDE or compatible MCP host

## Workstation Install

```bash
cd mcp/cloudflare
npm ci
cp .env.example .env
# Fill CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ZONE_ID
npm run check
```

## Cursor MCP Registration

### Windows

```json
{
  "mcpServers": {
    "teknovo-cloudflare": {
      "command": "node",
      "args": ["C:\\Users\\fajar\\Downloads\\AI\\mcp\\cloudflare\\server.js"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "${env:CLOUDFLARE_API_TOKEN}",
        "CLOUDFLARE_ACCOUNT_ID": "${env:CLOUDFLARE_ACCOUNT_ID}",
        "CLOUDFLARE_ZONE_ID": "${env:CLOUDFLARE_ZONE_ID}"
      }
    }
  }
}
```

### Linux / macOS

```json
{
  "mcpServers": {
    "teknovo-cloudflare": {
      "command": "node",
      "args": ["/path/to/AI/.cursor/mcp/cloudflare/server.js"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "${env:CLOUDFLARE_API_TOKEN}",
        "CLOUDFLARE_ACCOUNT_ID": "${env:CLOUDFLARE_ACCOUNT_ID}",
        "CLOUDFLARE_ZONE_ID": "${env:CLOUDFLARE_ZONE_ID}"
      }
    }
  }
}
```

Set env vars in shell profile or system secret store before launching Cursor.

## CI/CD Integration (Optional)

For automated staging deploys via GitHub Actions:

```yaml
- name: Install Cloudflare MCP deps
  run: npm ci
  working-directory: mcp/cloudflare

- name: Verify MCP tools
  run: npm test
  working-directory: mcp/cloudflare
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    CLOUDFLARE_ZONE_ID: ${{ secrets.CLOUDFLARE_ZONE_ID }}
```

Direct MCP in CI is uncommon — prefer Wrangler or Cloudflare API in workflow scripts. Use MCP for agent-driven deploy sessions.

## Teknovo School Deploy Sequence

```text
build (npm run build)
  → test (npm test)
  → pages_create_project (if new)
  → pages_deploy
  → dns_create_record (CNAME to pages.dev or tunnel)
  → domain_attach
  → domain_verify
```

Execute via MCP tools when agent has credentials — not documentation-only.

## Production Checklist

- [ ] Token scoped to single account + zone
- [ ] `.env` in `.gitignore`
- [ ] Security reviewer APPROVE for deploy-session
- [ ] SSL/TLS Full (Strict) on zone
- [ ] DNS records proxied where appropriate
- [ ] Audit log review after first deploy

## Monitoring

- Cloudflare Dashboard → Pages → project → Deployments
- Cloudflare Audit Logs for DNS/domain changes
- MCP server logs (stderr) at `info` level during debug only

## Rollback

1. `pages_get_deployment` — identify last good deployment ID
2. Cloudflare Dashboard → Rollback to previous deployment
3. DNS: revert via `dns_update_record` or Dashboard

## Registry

Registered in `.cursor/registry/mcp-registry.yaml` as `teknovo-cloudflare-mcp` (status: configured).

Bundle: `deploy-session` alongside `github-mcp`, `git-mcp`, `shell-mcp`.

## Support

- Troubleshooting: [README.md](../README.md#troubleshooting)
- API: [API.md](API.md)
- Security: [SECURITY.md](SECURITY.md)
