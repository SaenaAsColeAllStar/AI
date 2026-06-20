---
name: teknovo-auto-orchestrator
description: Autonomous orchestration layer — analyze user intent, select skills, dispatch subagents, execute, verify, and route deployment without unnecessary questions or plan-only stops.
---

# Teknovo Auto-Orchestrator Skill

Autonomous orchestration layer modeled after Claude Code and Cursor agent mode. When a user sends a natural-language implementation request, this skill **analyzes intent**, **selects skills and agents**, **dispatches parallel workstreams**, **executes until complete**, and **routes deployment** — without stopping after architecture or asking unnecessary clarifying questions.

**Entry point**: `.agents/skills/teknovo-auto-orchestrator/orchestrator.js`  
**Config**: `routing.yaml`, `intent-map.yaml`

---

## When to Activate

Load this skill when the user:

- Asks to **build**, **implement**, **create**, **develop**, or **deploy** a feature or system
- Sends a compound request like *"Build landing page for SMK Teknovo"*
- Needs autonomous multi-agent execution without manual skill selection
- Mentions domain keywords: landing page, finance, PPDB, sarpras, deploy

**Trigger words**: build, implement, create, deploy, orchestrate, auto, landing page, finance, PPDB, sarpras, ship, release

---

## Execution Policy (Mandatory)

| Rule | Behavior |
|------|----------|
| Unnecessary questions | **DO NOT** ask — infer from repo, PRD, and conventions |
| Long plans | **DO NOT** produce plan-only output — execute with tools |
| Stop after architecture | **DO NOT** stop — continue through implementation, tests, verification |
| File changes | **DO** create and modify files |
| Builds | **DO** run builds and fix errors (max 10 retries per execution-registry) |
| Completion | **DO** verify with tests before declaring done |

Reference: `execution/execution-registry.yaml`, `.agents/EXECUTION.md`

---

## Autonomous Pipeline

```text
User Message
    ↓
analyzeIntent()          ← orchestrator.js + intent-map.yaml
    ↓
selectSkills()           ← skill paths from intent-map.yaml
    ↓
dispatchPlan()           ← workstreams from routing.yaml
    ↓
Execute Workstreams      ← superpowers-subagent-driven-development
    ↓ (parallel when eligible)
Verify                   ← teknovo-testing-architect, superpowers-verification-before-completion
    ↓
Deploy Prep (if deploy)  ← teknovo-cloudflare-stack
```

### CLI Usage

```bash
node .agents/skills/teknovo-auto-orchestrator/orchestrator.js "Build landing page for SMK Teknovo"
```

### Programmatic API

```javascript
import { analyzeIntent, selectSkills, dispatchPlan, orchestrate } from './orchestrator.js';

const analysis = analyzeIntent('Build school finance system');
// → { intent, skills[], agents[], parallelGroups[], deploy, executionMode, ... }

const paths = selectSkills(analysis.skills);
// → [{ id, path }, ...]

const plan = dispatchPlan(analysis);
// → { workstreams[], parallelGroups[], executionMode, verificationSkills, ... }

const full = orchestrate('Build PPDB system and deploy to Cloudflare');
// → { analysis, plan }
```

---

## Intent Routing

| Intent | Keywords | Primary Skills |
|--------|----------|----------------|
| **Landing Page** | landing page, website, school website, company profile | chief-architect, landing-page, ui-ux, testing-architect, cloudflare-stack |
| **Finance** | finance, accounting, BOS, payroll, billing | chief-architect, finance, database-architect, backend, rbac, testing, security |
| **PPDB** | ppdb, admission, student registration | chief-architect, ppdb, backend, database-architect, testing |
| **Sarpras** | inventory, asset, sarpras, facility management | chief-architect, database-architect, backend, reporting, testing |
| **Deploy overlay** | deploy, release, ship, cloudflare | cloudflare-stack, devops-engineer, gstack-ship |

Full keyword lists: `intent-map.yaml`, `routing.yaml`

---

## Parallel Dispatch Rules

Integrates with:

- **superpowers-dispatching-parallel-agents** — decide when to parallelize sibling agents
- **superpowers-subagent-driven-development** — subagent contracts, boundaries, two-stage review

Auto-parallel when **any** of:

1. **3+ domain intents** detected (e.g., finance + PPDB + sarpras)
2. **Frontend/backend separable** (landing page + backend domain)
3. **Route config** sets `parallel: true` (landing page)
4. **Testing independent** after architecture contracts defined

Max parallel siblings: **3** (configurable in `routing.yaml`)

### Landing Page Parallel Groups

| Group | Workstream | Skills |
|-------|------------|--------|
| 1 | Architecture & IA | chief-architect, landing-page |
| 1 | UI Implementation | ui-ux, ui-ux-specialist |
| 2 | Testing & Deploy Prep | testing-architect, cloudflare-stack |

---

## Verification Gate

Before declaring complete, always run:

1. **teknovo-testing-architect** — test plan, coverage, integration tests
2. **superpowers-verification-before-completion** — build, lint, test evidence

Never claim "done" without command output evidence.

---

## Deployment Routing

When deploy keywords detected (`deploy`, `release`, `ship`, `cloudflare`, `production`):

1. Load **teknovo-cloudflare-stack**
2. Load **teknovo-devops-engineer** and **gstack-ship**
3. Add deployment workstream to dispatch plan (depends on implementation workstreams)
4. Use **cloudflare-mcp** for Pages, DNS, tunnel operations

Reference: `execution/deployment-mode.md`, `.agents/skills/teknovo-cloudflare-stack/SKILL.md`

---

## Integration with Platform Orchestrator

This skill complements `agents/orchestrator/orchestrator.js`:

| Layer | Responsibility |
|-------|----------------|
| **teknovo-auto-orchestrator** | Intent → skills → workstreams (what to do) |
| **agents/orchestrator** | Agent execution, retry, MCP resolution (how to run) |

Recommended flow:

```javascript
import { orchestrate } from '.agents/skills/teknovo-auto-orchestrator/orchestrator.js';
import { runParallel, runSequential } from 'agents/orchestrator/orchestrator.js';

const { analysis, plan } = orchestrate(userMessage);

if (plan.parallel) {
  await runParallel(plan.workstreams.map(ws => ({
    agentId: ws.agents[0],
    task: { description: ws.label, keywords: ws.skills },
  })));
} else {
  await runSequential(/* sequential phases from plan.workstreams */);
}
```

---

## Branch Safety

Before first file edit:

1. Verify not on `main` — use `feature/<scope>` branch
2. Reference: `execution/branch-policy.md`

---

## Self-Tests

```bash
cd .agents/skills/teknovo-auto-orchestrator
npm test
```

Tests verify landing page, finance, PPDB routing and multi-domain parallel dispatch.

---

## Related Skills

| Skill | Role |
|-------|------|
| superpowers-dispatching-parallel-agents | Parallel sibling agent launch |
| superpowers-subagent-driven-development | Subagent contracts and review |
| superpowers-executing-plans | Checklist execution |
| superpowers-verification-before-completion | Evidence-based completion |
| teknovo-testing-architect | Test strategy and coverage |
| teknovo-cloudflare-stack | Deploy routing |
| teknovo-chief-architect | Architecture gate (Pillar 2) |
| teknovo-feature-implementation | End-to-end implementation |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `SKILL.md` | This specification |
| `routing.yaml` | Routing rules, parallel flags, deploy keywords, execution policy |
| `intent-map.yaml` | Intent categories, keywords, skills, agents, MCPs |
| `orchestrator.js` | Runnable intent analyzer and dispatch planner |
| `tests/intent-routing.test.js` | Self-tests for routing correctness |
