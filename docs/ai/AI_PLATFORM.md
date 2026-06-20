# Teknovo Multi-Agent Platform

> Platform orchestration for specialized agents, MCP discovery, and workflow execution.
> Implementation: `agents/orchestrator/` · Registries: `registry/agents.yaml`, `registry/mcp.yaml`

## Purpose

The Multi-Agent Platform routes tasks from a single orchestrator to domain specialists (frontend, backend, devops, testing) while discovering skills and MCP servers automatically.

## Components

### Orchestrator (`agents/orchestrator/`)

- Loads `registry/agents.yaml` and `registry/mcp.yaml`
- Decomposes compound tasks via `decomposeTask()` and `selectAgents()`
- Routes by keywords/domain to platform agents
- Executes parallel (`runParallel`), sequential (`runSequential`), and conditional (`runConditional`) workflows
- Failure recovery: isolate failures, retry max 10, aggregate partial results via `onAgentFailure()`

### Platform Agents

| Agent | Path | Domain |
|-------|------|--------|
| Orchestrator | `agents/orchestrator/` | Routing, decomposition, parallel coordination |
| Frontend | `agents/frontend/` | Next.js, React, Tailwind, UI, SEO, a11y |
| Backend | `agents/backend/` | Node/TS, REST, DB, RBAC |
| DevOps | `agents/devops/` | Docker, CI/CD, pipelines, deploy verify |
| Testing | `agents/testing/` | Unit, integration, E2E, Lighthouse |
| Cloudflare | `agents/cloudflare/` | Pages, DNS, SSL, production deploy |
| GitHub | `agents/github/` | PR, releases, issues, repo automation |

Each agent exposes a **5-file contract**: `agent.yaml`, `capabilities.yaml`, `workflow.yaml`, `system-prompt.md`, `README.md` — plus legacy `AGENT.md`, `config.yaml`, and `index.js`.

**Chief Architect** (`chief-architect` in `registry/agents.yaml`) serves as meta/routing entry to the orchestrator.

### Shared Platform Libraries (`shared/`)

| Package | Purpose |
|---------|---------|
| `shared/secret-store/` | Secret loader wrappers |
| `shared/logging/` | Structured logger with masking |
| `shared/validation/` | Zod validation helpers |
| `shared/workflow/` | Workflow engine, retry, failure recovery |

### Registries (Split)

| Registry | Path | Notes |
|----------|------|-------|
| Agents | `registry/agents.yaml` | Platform + reviewers |
| Skills | `registry/skills.yaml` | Index → `skill-registry.yaml` |
| MCP | `registry/mcp.yaml` | Tools, secret paths, risk levels |

Legacy registries (`agent-registry.yaml`, `mcp-registry.yaml`, `skill-registry.yaml`) remain for backward compatibility.

## Usage

```js
import {
  dispatchTask,
  routeTask,
  runParallel,
  runSequential,
} from './agents/orchestrator/orchestrator.js';

// Single dispatch
const result = await dispatchTask({
  description: 'Run E2E tests for login page',
  keywords: ['e2e', 'playwright', 'test'],
});

// Parallel: Frontend + Backend
await runParallel([
  { agentId: 'platform-frontend', task: { description: 'Build UI' } },
  { agentId: 'platform-backend', task: { description: 'Build API' } },
]);

// Sequential: Frontend → Testing → Cloudflare
await runSequential([
  { id: 'ui', agentId: 'platform-frontend', task: { description: 'UI' } },
  { id: 'test', agentId: 'platform-testing', task: { description: 'E2E' }, dependsOn: ['ui'] },
  { id: 'deploy', agentId: 'platform-cloudflare', task: { description: 'Deploy' }, dependsOn: ['test'] },
]);
```

## Integration Points

- `.agents/registry.yaml` — orchestrator + platform agents in orchestration section
- `execution/execution-registry.yaml` — orchestrator link, retry policy
- `memory/memory-registry.yaml` — platform documentation artifacts

## Documentation

- [platform/README.md](../../platform/README.md)
- [platform/ARCHITECTURE.md](../../platform/ARCHITECTURE.md)
- [AGENTS.md](../../AGENTS.md) — Multi-Agent Platform section

## Workflow Order

```text
Orchestrator → Specialist Agent → Skills + MCPs → Workflow Engine → Verify → Ship
```

Platform agents operate within the existing Teknovo gate order (Taste → Assurance → Security → Implementation → QA → Ship).
