# Teknovo Platform Orchestrator

Central routing agent for the Teknovo Multi-Agent Platform. Dispatches tasks to specialized platform agents, discovers skills and MCP servers, and coordinates parallel work with failure recovery.

## Responsibilities

- Load `registry/agents.yaml` and `registry/mcp.yaml`
- Route tasks by keywords and domain to frontend, backend, devops, testing agents
- Discover skills from `.agents/skills/` and MCP servers from `mcp/`
- Coordinate parallel agent dispatch
- Apply execution-system retry policy (max 10 retries per step)

## Usage

```js
import { dispatchTask, routeTask } from './orchestrator.js';

const route = routeTask({
  description: 'Deploy Next.js app to Cloudflare Pages',
  keywords: ['cloudflare', 'deploy', 'next.js'],
});

const result = await dispatchTask({
  description: 'Add RBAC permission for finance module',
  keywords: ['rbac', 'api', 'backend'],
});
```

## CLI

```bash
cd agents/orchestrator
npm install
node orchestrator.js "Fix failing E2E tests for login page"
```

## Failure Recovery

Workflow steps use `shared/workflow` with up to 10 retries (aligned with `execution/execution-registry.yaml`).

## Blocks

- No direct implementation without routing to a specialist agent
- No secret exposure in dispatch payloads
