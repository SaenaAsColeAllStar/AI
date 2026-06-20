# MCP — Git Server

Local git operations for repositories on the workstation (status, diff, log).

## Status

**Ready (template)** — no remote credentials required for local operations.

## Setup

1. Copy config template:

```bash
cp mcp/git/config.template.json ~/.config/mcp/git.json
```

2. Ensure SSH keys for GitHub are configured separately ([PLANNED] — see `AI_RECOVERY.md`).

## Architecture

```text
Agent
  │
  ▼
MCP Git Server
  │
  ▼
Local .git repositories
```

## Scope

| Operation | Local MCP | Remote push |
|-----------|-------------|-------------|
| status, diff, log | Yes | N/A |
| commit | Agent policy | N/A |
| push | N/A | SSH/HTTPS credentials |

## Security

- Agents must not force-push to `main`
- See `security/ai-agent-security.md` for commit boundaries
