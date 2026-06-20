---
name: superpowers-dispatching-parallel-agents
description: Decide when to parallelize work across sibling agents, define independent workstreams, and synthesize results without duplicating effort.
---

# Dispatching Parallel Agents Skill

Use this skill to **choose parallelism** and **launch sibling agents** for independent top-level workstreams. Pair with **superpowers-subagent-driven-development** for contract/review details and **superpowers-using-git-worktrees** for isolation.

Adapted from [Superpowers dispatching-parallel-agents](https://github.com/obra/superpowers).

---

## When to Activate

- Request spans **2+ independent ownership areas** (backend vs frontend, domain A vs domain B)
- Broad exploration where parallel hypotheses improve accuracy
- User asks to run agents in parallel, multitask, or split workstreams
- Trigger words: parallel agents, sibling agents, dispatch, multitask, split workstreams

**Do NOT parallelize** when work shares heavy context, is a single bug hunt, or is a medium refactor better handled by one agent.

---

## Dispatch Protocol

### 1. Classify Workstreams

| Signal | Action |
|--------|--------|
| Independent files/modules | **Parallel** sibling agents |
| Shared schema + API + UI for one feature | **Single** agent (may use subagents internally) |
| Adversarial review (security + eng) | **Parallel** reviewers, then synthesize |

### 2. Define Sibling Agent Briefs

Each parallel agent gets:

```markdown
## Sibling Agent: [Name]

### Independent Deliverable
[One coherent output — not a step in another agent's task]

### Scope Boundary
- ALLOWED: [paths]
- FORBIDDEN: [paths owned by siblings]

### Do NOT
- Duplicate investigation already assigned to another sibling
- Modify files outside scope

### Return Format
- Findings (bullets)
- Files touched (if any)
- Blockers requiring parent coordination
```

### 3. Launch Rules

- **One message, multiple launches** when workstreams are truly independent
- **Background** for long-running tracks; parent coordinates synthesis
- **Max sibling count**: prefer 2–3; avoid agent spam

### 4. Synthesis (Parent Responsibility)

After siblings complete:

1. Merge findings — remove duplicates
2. Resolve conflicts (same file, contradictory advice)
3. Produce single recommendation or implementation plan
4. Hand off to **superpowers-writing-plans** or **teknovo-feature-implementation**

---

## Teknovo Integration

| Phase | Parallel? | Example |
|-------|-----------|---------|
| Pillar 1 + Pillar 2 analysis | Sequential gates | Product design before architecture |
| Security review + eng review | Parallel | Independent checklists |
| Finance module + PPDB module (unrelated) | Parallel | Separate domain skills |
| Single feature end-to-end | Single agent | One coherent worker |

Load domain skills per sibling: `teknovo-finance`, `teknovo-ppdb`, `teknovo-chief-architect`, etc.

---

## Handoffs

| After dispatch | Skill |
|----------------|-------|
| Contracts + two-stage review | superpowers-subagent-driven-development |
| Isolated branches | superpowers-using-git-worktrees |
| Unified plan | superpowers-writing-plans |
| Implementation | teknovo-feature-implementation |

---

## Mandatory Output (Dispatch Plan)

Before launching siblings, produce:

```markdown
## Parallel Dispatch Plan

### Workstreams
| # | Agent focus | Independent? | Skill(s) |
|---|-------------|--------------|----------|

### Synthesis Owner
[Parent agent merges at step X]

### Anti-Duplication
[What each agent must NOT redo]
```

No sibling launches without this plan.
