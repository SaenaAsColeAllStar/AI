# Teknovo MCP Stack

Model Context Protocol servers for the Teknovo AI SuperStack workstation. Each server is an independent Node.js package under `mcp/` with auto-discovered tools, Zod validation, Jest tests (≥80% coverage), and Cursor stdio integration.

## Servers

| Server | Package | Tools | Risk | Env Vars |
|--------|---------|-------|------|----------|
| [Cloudflare](cloudflare/) | `teknovo-cloudflare-mcp` | 9 — Pages, DNS, domains | critical | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID` |
| [GitHub](github/) | `teknovo-github-mcp` | 9 — repos, PRs, issues, workflows | high | `GITHUB_TOKEN`, `GITHUB_OWNER` |
| [Filesystem](filesystem/) | `teknovo-filesystem-mcp` | 5 — read, write, list, search, info | medium | `TEKNOVO_WORKSPACE` |
| [Git](git/) | `teknovo-git-mcp` | 7 — status, diff, log, commit, push, branches | medium | `TEKNOVO_WORKSPACE` |
| [PostgreSQL](postgres/) | `teknovo-postgres-mcp` | 3 — query, list_tables, describe_table | high | `DATABASE_URL` |
| [Qdrant](qdrant/) | `teknovo-qdrant-mcp` | 3 — collection_list, search, upsert | medium | `QDRANT_URL`, `QDRANT_API_KEY` |

Registry: `registry/mcp-registry.yaml`

Skill: `.agents/skills/teknovo-mcp-stack/SKILL.md`

---

## Quick Setup

### 1. Install all servers

```powershell
cd mcp/cloudflare && npm install && npm run check
cd ../github && npm install && npm run check
cd ../filesystem && npm install && npm run check
cd ../git && npm install && npm run check
cd ../postgres && npm install && npm run check
cd ../qdrant && npm install && npm run check
```

### 2. Configure environment

Copy each server's `.env.example` to `.env` and fill credentials. Never commit `.env` files.

### 3. Add to Cursor

Copy `mcp/mcp-config.template.json` into Cursor MCP settings (`.cursor/mcp.json` or Settings → MCP). Adjust absolute paths for your workstation.

---

## Cursor MCP Configuration

Use the template at [`mcp-config.template.json`](mcp-config.template.json):

```json
{
  "mcpServers": {
    "teknovo-cloudflare": {
      "command": "node",
      "args": ["C:/Users/fajar/Downloads/AI/mcp/cloudflare/server.js"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "${env:CLOUDFLARE_API_TOKEN}",
        "CLOUDFLARE_ACCOUNT_ID": "${env:CLOUDFLARE_ACCOUNT_ID}",
        "CLOUDFLARE_ZONE_ID": "${env:CLOUDFLARE_ZONE_ID}"
      }
    }
  }
}
```

Replace `C:/Users/fajar/Downloads/AI` with your workspace root. The template includes all six Teknovo servers.

---

## Architecture

```text
Cursor Agent
     │ stdio
     ├── teknovo-cloudflare-mcp  → Cloudflare REST API
     ├── teknovo-github-mcp      → GitHub REST API
     ├── teknovo-filesystem-mcp  → TEKNOVO_WORKSPACE (path-guarded)
     ├── teknovo-git-mcp         → git CLI (repo-scoped, no force push)
     ├── teknovo-postgres-mcp    → PostgreSQL (read-only)
     └── teknovo-qdrant-mcp      → Qdrant REST API
```

Each server:
- Auto-discovers tools from `tools/*.js`
- Validates inputs with Zod
- Returns structured JSON `{ success, data | error }`
- Logs to stderr (stdio-safe)

---

## Security

| Server | Guard |
|--------|-------|
| Filesystem | Path traversal blocked; scoped to `TEKNOVO_WORKSPACE` |
| Git | Force push blocked; repo root required |
| PostgreSQL | Read-only SQL only; DDL/DML blocked |
| Cloudflare | Requires security-reviewer APPROVE before writes |
| GitHub | Token least-privilege; no secrets in logs |

See `security/ai-agent-security.md` and per-server `docs/SECURITY.md` (Cloudflare).

---

## Bundles (from registry)

| Bundle | Servers |
|--------|---------|
| `dev-session` | filesystem, git |
| `deploy-session` | filesystem, git, github, cloudflare |
| `investigate-session` | filesystem, git, postgres |

---

## Development

Per server:

```bash
npm run lint    # node --check syntax
npm test        # Jest with coverage
npm run check   # lint + test
npm start       # stdio MCP server
```

## References

- `registry/mcp-registry.yaml` — risk levels, activation conditions
- `.agents/skills/teknovo-cloudflare-stack/SKILL.md` — Cloudflare deploy workflow
- `.agents/skills/teknovo-mcp-stack/SKILL.md` — cross-MCP orchestration
