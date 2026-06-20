# Teknovo Cloudflare MCP

Model Context Protocol server for Cloudflare Pages, DNS, and custom domain automation in the Teknovo stack.

## Features

- **Pages**: create projects, deploy, list projects, get deployment status
- **DNS**: create, update, and list zone records
- **Domains**: attach and verify custom domains on Pages projects
- **Security**: env-only credentials, token masking in logs, least-privilege guidance
- **Resilience**: retry with backoff, rate-limit (429) handling

## Quick Start

```bash
cd mcp/cloudflare
cp .env.example .env
# Edit .env with your Cloudflare credentials
npm install
npm test
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | Yes | API token with Pages + DNS permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `CLOUDFLARE_ZONE_ID` | Yes | Zone ID for DNS operations |

Never commit `.env`. See [docs/SECURITY.md](docs/SECURITY.md).

## Cursor MCP Configuration

Add to `.cursor/mcp.json` (or Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "teknovo-cloudflare": {
      "command": "node",
      "args": ["c:/Users/fajar/Downloads/AI/mcp/cloudflare/server.js"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "${env:CLOUDFLARE_API_TOKEN}",
        "CLOUDFLARE_ACCOUNT_ID": "${env:CLOUDFLARE_ACCOUNT_ID}",
        "CLOUDFLARE_ZONE_ID": "${env:CLOUDFLARE_ZONE_ID}"
      }
    }
  }
}
```

Adjust the path for your workstation.

## Architecture

```text
┌─────────────────┐     stdio      ┌──────────────────────┐
│  Cursor / Agent │ ◄────────────► │ teknovo-cloudflare-mcp│
└─────────────────┘                └──────────┬───────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            tools/pages-*.js           tools/dns-*.js           tools/domain-*.js
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                                   lib/cloudflare-client.js
                                              │
                                              ▼
                              Cloudflare REST API v4 (HTTPS)
```

Tool modules in `tools/` are auto-discovered by `server.js` — no manual registration required.

## Available Tools

| Tool | Description |
|------|-------------|
| `pages_create_project` | Create a Cloudflare Pages project |
| `pages_deploy` | Trigger a Pages deployment |
| `pages_list_projects` | List Pages projects |
| `pages_get_deployment` | Get deployment details |
| `dns_create_record` | Create a DNS record |
| `dns_update_record` | Update a DNS record |
| `dns_list_records` | List DNS records |
| `domain_attach` | Attach custom domain to Pages |
| `domain_verify` | Verify custom domain status |

Full API reference: [docs/API.md](docs/API.md)

## Example MCP Calls

### Create Next.js Pages project

```json
{
  "name": "pages_create_project",
  "arguments": {
    "name": "teknovo-erp",
    "production_branch": "main",
    "build_command": "npm run build",
    "destination_dir": ".next"
  }
}
```

### Deploy

```json
{
  "name": "pages_deploy",
  "arguments": {
    "project_name": "teknovo-erp",
    "branch": "main"
  }
}
```

### Create CNAME for subdomain

```json
{
  "name": "dns_create_record",
  "arguments": {
    "type": "CNAME",
    "name": "erp",
    "content": "teknovo-erp.pages.dev",
    "proxied": true
  }
}
```

### Attach and verify domain

```json
{
  "name": "domain_attach",
  "arguments": {
    "project_name": "teknovo-erp",
    "domain": "erp.school.sch.id"
  }
}
```

```json
{
  "name": "domain_verify",
  "arguments": {
    "project_name": "teknovo-erp",
    "domain": "erp.school.sch.id"
  }
}
```

## Teknovo Deployment Workflow

When credentials are available, agents should execute (not just document):

1. `npm run build` — build Next.js app
2. `npm test` — verify tests pass
3. `pages_create_project` — create project if missing
4. `pages_deploy` — deploy to Cloudflare Pages
5. `domain_attach` — attach school subdomain
6. `domain_verify` — confirm DNS verification

See `.agents/skills/teknovo-cloudflare-stack/SKILL.md`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `CLOUDFLARE_API_TOKEN is required` | Copy `.env.example` → `.env` and set all three vars |
| `403 Forbidden` | Token lacks Pages/DNS permissions for account/zone |
| `429 Rate limited` | Server auto-retries; reduce concurrent tool calls |
| `Project already exists` | Use `pages_list_projects` then `pages_deploy` |
| Domain stuck pending | Add required DNS records, then call `domain_verify` |

## Development

```bash
npm run lint    # node --check syntax validation
npm test        # Jest with coverage (≥80% target)
npm run check   # lint + test
```

## References

- [docs/API.md](docs/API.md) — tool schemas and responses
- [docs/SECURITY.md](docs/SECURITY.md) — threat model and token policy
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production deployment
- `security/cloudflare-security.md` — Teknovo security gates
- `.agents/skills/teknovo-cloudflare-stack/SKILL.md` — skill integration

## License

MIT
