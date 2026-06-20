# MCP — Cloudflare Server

MCP integration for Cloudflare Workers, DNS, R2, D1, and Tunnels.

## Status

**Placeholder** — requires Cloudflare API token and account ID.

## Setup

1. Create API token in Cloudflare Dashboard → My Profile → API Tokens
   - Recommended: custom token with least privilege for target zone/account

2. Copy config template:

```bash
cp mcp/cloudflare/config.template.json ~/.config/mcp/cloudflare.json
```

3. Export credentials:

```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
```

## Architecture

```text
Teknovo DevOps Agent
        │
        ▼
  MCP Cloudflare Server
        │
        ├── Workers / D1 / R2
        ├── DNS / Tunnels
        └── Zero Trust (optional)
```

## References

- `security/cloudflare-security.md`
- `.agents/skills/teknovo-cloudflare-stack/SKILL.md`
- `AI_DEPLOY.md` — Teknovo V2 deployment (separate from workstation)

## [PLANNED]

- Official Cloudflare MCP server package when stable
- Bootstrap hook to validate token without storing it
