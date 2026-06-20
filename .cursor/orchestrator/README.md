# Platform Orchestrator

Central routing agent for the Teknovo Multi-Agent Platform.

## Contract Files

| File | Purpose |
|------|---------|
| `agent.yaml` | Discovery metadata, dependencies, MCP requirements |
| `config.yaml` | Skills, triggers, failure recovery policy |
| `capabilities.yaml` | Exposed capabilities and skill references |
| `workflow.yaml` | Sequential, parallel, and conditional workflow patterns |
| `system-prompt.md` | Runtime system prompt for orchestrator sessions |
| `AGENT.md` | Human-readable specification |

## API

```js
import {
  routeTask,
  dispatchTask,
  decomposeTask,
  runParallel,
  runSequential,
  runConditional,
  executeWorkflow,
} from './orchestrator.js';
```

## Example Workflows

**Frontend → Testing → Cloudflare**

```js
await runSequential([
  { id: 'frontend', agentId: 'platform-frontend', task: { description: 'Build UI' } },
  { id: 'testing', agentId: 'platform-testing', task: { description: 'Run E2E' }, dependsOn: ['frontend'] },
  { id: 'deploy', agentId: 'platform-cloudflare', task: { description: 'Deploy Pages' }, dependsOn: ['testing'] },
]);
```

**Frontend + Backend parallel → Testing waits**

```js
await runParallel([
  { agentId: 'platform-frontend', task: { description: 'UI' } },
  { agentId: 'platform-backend', task: { description: 'API' } },
]);
await runSequential([
  { id: 'testing', agentId: 'platform-testing', task: { description: 'Verify' } },
]);
```

## CLI

```bash
cd .cursor/orchestrator && npm install && node orchestrator.js "Route task to backend"
```
