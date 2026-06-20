---
name: teknovo-auto-orchestrator
description: Autonomous orchestration â€” parse intent, select skills/agents, build execution chains, enforce gates (Taste â†’ Assurance â†’ Security â†’ Implementation â†’ Verification â†’ Ship), and dispatch work without plan-only stops. Triggers on orchestrate, route, dispatch, auto, landing, finance, ppdb, sarpras, deploy, feature, build, implement.
---

# Teknovo Auto-Orchestrator

Declarative orchestration layer for the Teknovo AI SuperStack. When a user sends a natural-language implementation request, this skill **parses intent**, **loads the matching chain**, **enforces workflow gates**, **dispatches skills in order** (parallel where policy allows), and **runs the verification chain** before any "done" claim.

**Source of truth**: YAML configs in this directory â€” not runtime JavaScript. Agents read these files directly.

| File | Role |
|------|------|
| `SKILL.md` | Agent instructions (this file) |
| `intent-routing.yaml` | Intent keywords/patterns â†’ `chain_ref` |
| `chain-map.yaml` | Predefined skill/agent execution chains |
| `execution-policy.yaml` | Gates, verification, retries, block conditions |

**Platform complement**: `.cursor/orchestrator/orchestrator.js` handles agent dispatch, MCP resolution, and retry at runtime. This skill decides **what** to run; the platform orchestrator decides **how** to run it.

---

## When to Activate

Load this skill when the user:

- Asks to **build**, **implement**, **create**, **develop**, or **deploy** a feature or system
- Uses **orchestrate**, **route**, **dispatch**, or **auto** orchestration language
- Mentions domain keywords: **landing**, **finance**, **PPDB**, **sarpras**, **deploy**, **feature**
- Needs autonomous multi-skill execution without manual skill selection

**Trigger words**: orchestrate, route, dispatch, auto, landing, finance, ppdb, sarpras, deploy, feature, build, implement, create, ship, release

---

## Configuration Files â€” How to Use

### 1. `intent-routing.yaml`

- **`intents:`** â€” Each intent has `id`, `keywords`, `patterns`, `chain_ref`, `priority`, `required_gates`
- **`resolution:`** â€” Tie-breaking and multi-domain parallel threshold
- **`skill_paths:`** â€” Resolve skill IDs to filesystem paths (`.cursor/skills/` for native Cursor skills)

**Match algorithm**:

1. Normalize user message (lowercase, trim)
2. Score each intent by keyword/pattern hits
3. Select highest `priority` + score; use `fallback: true` intent (`generic-feature`) if no match
4. Read `chain_ref` â†’ load chain from `chain-map.yaml`
5. If deploy keywords detected, append `pre-ship` overlay from `resolution.deploy_overlay_chain`

### 2. `chain-map.yaml`

- **`chains:`** â€” Each chain has `id`, `description`, ordered `phases:`
- Each phase: `skill` or `agent`, optional `bundle`, `gate`, `parallel_group`, `artifact`, `verdict`
- **`always_load:`** â€” Skills/agents appended to every chain

**Phase execution**:

- Run phases sequentially unless `parallel_group` matches (see `execution-policy.yaml` â†’ `parallel_allowed`)
- Honor `gate` phases before any implementation phase
- Load bundles via `python .cursor/runtime/load-skills.py --bundle <name>`

### 3. `execution-policy.yaml`

- **`gates:`** â€” Mandatory gates with order, artifacts, block conditions
- **`verification_chain:`** â€” build â†’ lint â†’ test â†’ self-critique (evidence required)
- **`retry:`** â€” Max 10 automatic retries (`.cursor/gates/execution/failure-recovery.md`)
- **`parallel_allowed:`** â€” Which phase groups may run concurrently
- **`block_conditions:`** â€” Hard stops (main branch, missing assurance, security BLOCK)
- **`completion_criteria:`** â€” All verification pass before "done"

---

## Step-by-Step Orchestration Workflow

```text
User Message
    â†“
1. Parse intent          â† intent-routing.yaml (keywords + patterns)
    â†“
2. Match chain_ref       â† highest priority intent
    â†“
3. Build chain           â† chain-map.yaml phases + always_load
    â†“
4. Apply policy          â† execution-policy.yaml (gates, branch safety, retries)
    â†“
5. Dispatch skills       â† sequential; parallel where parallel_group allows
    â†“
6. Verification chain    â† build, lint, test, self-critique
    â†“
7. Ship (if deploy)      â† pre-ship chain overlay
```

### Step 1 â€” Parse intent

Extract domain, deploy flag, and autonomous mode from user message. Check `autonomous_triggers` in `intent-routing.yaml`.

### Step 2 â€” Load intent match

```bash
python .cursor/runtime/load-skills.py --trigger "landing page build"
python .cursor/runtime/load-skills.py --bundle pre-implementation
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-implementation
python .cursor/runtime/load-memory.py --include-security --security-bundle pre-api
```

Read `intent-routing.yaml` â†’ resolve `chain_ref`.

### Step 3 â€” Build chain

Load `chain-map.yaml` â†’ expand `phases` for the matched chain. Resolve skill paths from `intent-routing.yaml` â†’ `skill_paths`. Append deploy overlay (`pre-ship`) when deploy keywords present.

### Step 4 â€” Apply execution policy

Before first file edit:

1. **branch_safety** â€” `git branch --show-current`; never write on `main`/`master`
2. **taste** â†’ **assurance** â†’ **security_pre_impl** â€” gates per intent `required_gates`
3. Enable **retry** (max 10) on build/test failures

Cross-ref Cursor rules: `.cursor/rules/01-product.mdc` through `07-cloudflare.mdc`

### Step 5 â€” Dispatch skills in order

Integrate with:

- **superpowers-dispatching-parallel-agents** â€” parallel sibling agents
- **superpowers-subagent-driven-development** â€” subagent contracts

Use `.cursor/orchestrator/orchestrator.js` for `runSequential()` / `runParallel()` when programmatic dispatch is available.

**Parallel rules** (from `execution-policy.yaml`):

- Landing page: `ui-build` group after architecture gate
- 3+ domain intents: `domain-modules` group after shared architecture
- Never parallelize security gates with implementation

### Step 6 â€” Run verification chain

Mandatory before "done":

| Step | Action |
|------|--------|
| build | `npm run build` (or project equivalent) |
| lint | `tsc --noEmit`, linters |
| test | unit + integration; `gstack-qa` for functional validation |
| self_critique | `.cursor/gates/quality/self-critique.md` |

Load **superpowers-verification-before-completion** and **teknovo-testing-architect**. Retry failures up to 10 times per `.cursor/gates/execution/failure-recovery.md`.

---

## Predefined Chains (Summary)

| Chain ID | Phase sequence (skills) |
|----------|-------------------------|
| **landing-page** | chief-product-designer â†’ chief-architect â†’ landing-page + ui-ux â†’ testing â†’ cloudflare |
| **finance** | chief-architect â†’ finance â†’ backend â†’ database â†’ testing |
| **ppdb** | chief-architect â†’ ppdb â†’ backend â†’ testing |
| **sarpras** | chief-architect â†’ reporting â†’ backend â†’ testing |
| **generic-feature** | taste â†’ assurance â†’ security â†’ chief-architect â†’ feature-implementation â†’ testing |
| **pre-ship** | verification â†’ quality â†’ security-pre-deploy â†’ devops/cloudflare/ship |
| **security-review** | assurance â†’ security â†’ security-review |

Full phase definitions: `chain-map.yaml`

---

## Workflow Integration

Mandatory order per `AGENTS.md` and `execution-policy.yaml`:

```text
Taste â†’ Assurance â†’ Security (pre-impl) â†’ Implementation â†’ Verification â†’ Quality â†’ Security (pre-deploy) â†’ Ship
```

| Gate | Artifact / Verdict | Blocks |
|------|-------------------|--------|
| Taste | `.cursor/gates/taste/taste-gates.md` | UI code, scope expansion |
| Assurance | Assurance Sign-Off APPROVE | First code edit |
| Security pre-impl | APPROVE from security-reviewer | Code, routes, migrations |
| Branch safety | `feature/*` branch | Writes on main |
| Verification | Build + test evidence | "Done" claim |
| Quality | self-critique + quality gates | Merge |
| Security pre-deploy | APPROVE | Staging/production deploy |

---

## Sample Routing

### "Build landing page for SMK Teknovo"

1. **Intent**: `landing-page` (keywords: landing page, build)
2. **Chain**: `landing-page`
3. **Phases**: taste â†’ assurance â†’ product-design (`teknovo-chief-product-designer`) â†’ security APPROVE â†’ architecture â†’ landing-page + ui-ux (parallel) â†’ testing â†’ cloudflare (if deploy)
4. **Skills loaded**: `pre-feature`, `pre-ui`, `pre-implementation`, `teknovo-landing-page`, `teknovo-ui-ux`, `teknovo-testing-architect`

### "Build school finance module"

1. **Intent**: `finance` (keywords: finance, build)
2. **Chain**: `finance`
3. **Phases**: taste â†’ assurance â†’ security APPROVE (`pre-api`) â†’ architecture â†’ finance â†’ backend â†’ database â†’ testing
4. **Skills loaded**: `teknovo-finance`, `teknovo-backend-development`, `teknovo-database-architect`, `teknovo-rbac-architect`, `teknovo-testing-architect`

---

## Native Cursor Skills & Rules

Native skills live in `.cursor/skills/`:

| Skill | Path |
|-------|------|
| teknovo-ux-architecture (Pillar 1) | `.cursor/skills/teknovo-ux-architecture/SKILL.md` |
| teknovo-ui-ux | `.cursor/skills/teknovo-ui-ux/SKILL.md` |
| teknovo-landing-page | `.cursor/skills/teknovo-landing-page/SKILL.md` |
| teknovo-design-system | `.cursor/skills/teknovo-design-system/SKILL.md` |
| teknovo-security | `.cursor/skills/teknovo-security/SKILL.md` |
| teknovo-security-review | `.cursor/skills/teknovo-security-review/SKILL.md` |

Persistent gates: `.cursor/rules/01-product.mdc` â€¦ `07-cloudflare.mdc`

Index: `.cursor/skills/README.md`

---

## Autonomous Execution Policy

| Rule | Behavior |
|------|----------|
| Unnecessary questions | **DO NOT** ask â€” infer from repo, PRD, conventions |
| Long plans | **DO NOT** produce plan-only output â€” execute with tools |
| Stop after architecture | **DO NOT** stop â€” continue through implementation, tests, verification |
| File changes | **DO** create and modify files |
| Builds | **DO** run builds and fix errors (max 10 retries) |
| Completion | **DO** pass verification chain before declaring done |

Reference: `.cursor/gates/execution/execution-registry.yaml`, `.cursor/docs/EXECUTION.md`, `.cursor/gates/execution/failure-recovery.md`

---

## Branch Safety

Before first file edit:

```bash
git branch --show-current
```

| Branch | Action |
|--------|--------|
| `main` / `master` | `git checkout -b feature/<scope>` |
| `feature/*` | Proceed |

Reference: `.cursor/gates/execution/branch-policy.md`, `.cursor/rules/06-github.mdc`

---

## Related Skills

| Skill | Role |
|-------|------|
| superpowers-dispatching-parallel-agents | Parallel sibling agent launch |
| superpowers-subagent-driven-development | Subagent contracts and review |
| superpowers-verification-before-completion | Evidence-based completion |
| teknovo-testing-architect | Test strategy and coverage |
| teknovo-chief-architect | Architecture gate (Pillar 2) |
| teknovo-chief-product-designer | Product design gate (Pillar 1) |
| teknovo-feature-implementation | End-to-end implementation |
| teknovo-devops-engineer | Ship gate (Pillar 3) |

---

## Declarative Orchestration Note

Orchestration is **declarative** â€” agents read `intent-routing.yaml`, `chain-map.yaml`, and `execution-policy.yaml` directly. There is no required JavaScript entry point in this skill package. The platform orchestrator at `.cursor/orchestrator/orchestrator.js` remains available for programmatic agent dispatch when needed.
