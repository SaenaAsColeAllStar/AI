# MCP — GitHub Server

Model Context Protocol server for GitHub API access (issues, PRs, repos).

## Status

**Placeholder** — configure credentials before use. No secrets are stored in this repository.

## Setup

1. Create a GitHub Personal Access Token (fine-grained or classic) with minimum scopes:
   - `repo` (private repos) or `public_repo`
   - `read:org` if needed for org repos

2. Copy the config template:

```bash
cp mcp/github/config.template.json ~/.config/mcp/github.json
```

3. Set environment variable (never commit):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxxxxxxx"
```

4. Wire into your MCP client (Cursor, OpenCode, etc.) per client documentation.

## Architecture

```text
Agent (OpenCode/Cursor)
        │
        ▼
  MCP GitHub Server
        │
        ▼
  GitHub REST/GraphQL API
```

## Security

- Use fine-grained tokens scoped to specific repositories
- Rotate tokens regularly
- See `security/ai-agent-security.md` for agent commit/deploy boundaries

## [PLANNED]

- Automated MCP server install via npm/npx in a future bootstrap phase
- CI token injection via Cloudflare/GitHub Actions secrets
