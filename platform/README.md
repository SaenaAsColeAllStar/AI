# Teknovo Multi-Agent Platform

Production multi-agent orchestration layer for the Teknovo AI SuperStack Workstation.

## Components

| Path | Purpose |
|------|---------|
| `agents/orchestrator/` | Task routing, sub-agent dispatch, skill/MCP discovery |
| `agents/frontend/` | Next.js, React, Tailwind, UI, SEO, a11y |
| `agents/backend/` | Node/TS, REST, DB, auth, RBAC |
| `agents/devops/` | Docker, CI/CD, Cloudflare, deploy verify |
| `agents/testing/` | Unit/integration/E2E, build verify, Lighthouse |
| `shared/` | Secret store, logging, validation, workflow engine |
| `registry/agents.yaml` | Platform agent registry |
| `registry/skills.yaml` | Skills index (→ skill-registry.yaml) |
| `registry/mcp.yaml` | MCP servers with secret paths and tools |

## Quick Start

```bash
# Orchestrator
cd agents/orchestrator && npm install && npm test

# Route a task
node orchestrator.js "Deploy Next.js landing to Cloudflare Pages"

# Shared packages
cd shared/workflow && npm install && npm test
cd shared/secret-store && npm install && npm test
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) and [docs/ai/AI_PLATFORM.md](../docs/ai/AI_PLATFORM.md).

## Registries

- **Canonical skills**: `registry/skill-registry.yaml`
- **Platform agents**: `registry/agents.yaml`
- **Legacy compat**: `registry/agent-registry.yaml`, `registry/mcp-registry.yaml`

## Secret Store

All MCP credentials via `shared/secret-store` → `mcp/shared/secrets.js`. Never commit secrets.
