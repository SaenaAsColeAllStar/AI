# MCP — Filesystem Server

Local filesystem access for AI agents within allowed paths.

## Status

**Ready (template)** — configure allowed directories before enabling in production agents.

## Setup

1. Copy config template:

```bash
cp mcp/filesystem/config.template.json ~/.config/mcp/filesystem.json
```

2. Edit `allowedDirectories` to restrict access to:
   - Workstation repo root
   - Cloned Teknovo V2 monorepo path (e.g. `/workspace/teknovo`)

## Architecture

```text
Agent
  │
  ▼
MCP Filesystem Server
  │
  ▼
Allowed paths only (sandbox)
```

## Security

- **Never** use `["/"]` in production
- Align with `security/ai-agent-security.md` tool limits
- Read-only mode for review agents when possible

## Default allowed paths (example)

| Path | Purpose |
|------|---------|
| `/workspace/AI` | This workstation repo |
| `/workspace/teknovo` | Teknovo V2 target monorepo |
