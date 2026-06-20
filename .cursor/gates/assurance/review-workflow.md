# Assurance Review Workflow — Teknovo Assurance Engineering System

> **Authority**: No implementation proceeds without completed assurance workflow  
> **Registry**: `.cursor/gates/assurance/assurance-registry.yaml`  
> **Index**: `.cursor/docs/ai/AI_ASSURANCE_SYSTEM.md`

---

## Full Workflow Order

```text
Discovery
    ↓
Taste Layer (5 gates)                    ← .cursor/gates/taste/taste-gates.md
    ↓
Brainstorm                               ← superpowers-brainstorming
    ↓
Requirement Clarifier                    ← agents/requirement-clarifier.md
    ↓
Context Builder                          ← agents/context-builder.md
    ↓
Plan authoring                           ← superpowers-writing-plans
    ↓
Assurance Review (this workflow)         ← .cursor/gates/assurance/* + second-opinion-reviewer
    ↓
Security Review                          ← .cursor/gates/security/security-gates.md
    ↓
Execution branch check                   ← .cursor/gates/execution/branch-policy.md (feature branch, not main)
    ↓
Pillar 1 — Product Design Analysis
    ↓
Pillar 2 — Architecture Impact Analysis
    ↓
Implementation                           ← teknovo-feature-implementation
    ↓
Differential Review (on diff)            ← agents/differential-reviewer.md
    ↓
Impeccable Quality Review                ← agents/impeccable-reviewer.md
    ↓
Self-critique + Quality gates            ← .cursor/gates/quality/self-critique.md, quality-gates.md
    ↓
GStack: eng-review → qa → browser-testing
    ↓
Second Opinion (pre-deploy, high-risk)   ← agents/second-opinion-reviewer.md
    ↓
Ship                                     ← gstack-ship, teknovo-devops-engineer
```

**Hard rule**: Implementation skills (`teknovo-feature-implementation`, migrations, UI scaffolding) are **forbidden** until Assurance Review sign-off exists in the plan document.

---

## Phase A — Pre-Planning (Requirement + Context)

### Step A1: Requirement Clarification

**Agent**: `agents/requirement-clarifier.md`  
**When**: Brainstorm complete; before plan finalization  
**Load**: `.cursor/gates/assurance/decision-validation.md`, `assurance-bundle planning`

| Output | Pass criteria |
|--------|---------------|
| Clarification log | All Critical ambiguities resolved or explicitly deferred with owner + date |
| Conflict register | PRD vs user request conflicts documented with decision |
| Scope boundary | v1 vs v2 deferred items listed |

**Fail action**: Return to `superpowers-brainstorming` or `gstack-office-hours`

### Step A2: Context Build

**Agent**: `agents/context-builder.md`  
**When**: Before architecture decisions in plan  
**Load**: `.cursor/docs/memory/architecture-decisions.md`, relevant ADR, PRD sections

| Output | Pass criteria |
|--------|---------------|
| Context checklist | ADR, PRD, RBAC, DB, API, UI standards cited with paths |
| Gap list | Missing docs flagged; block if Critical gap |

**Fail action**: Read missing docs; invoke `teknovo-chief-architect` if cross-domain

---

## Phase B — Pre-Implementation Assurance Review

### Step B1: Decision Validation

**Document**: `.cursor/gates/assurance/decision-validation.md`  
**When**: Plan draft complete

- List assumptions; mark verified vs unverified
- Document 2+ alternatives for non-trivial decisions
- Record why simpler alternative rejected (or chosen)

### Step B2: Risk Analysis

**Document**: `.cursor/gates/assurance/risk-analysis.md`  
**When**: Plan draft complete

- Top 5 risks with likelihood × impact
- Mitigation per risk
- Test evidence plan per Critical/Major risk

### Step B3: Sharp Edges Scan

**Document**: `.cursor/gates/assurance/sharp-edges.md`  
**When**: Before implementation approval

- Dangerous APIs identified (timers, money, PII export)
- Fragile abstractions flagged
- Maintenance burden scored

### Step B4: Insecure Defaults Scan

**Document**: `.cursor/gates/assurance/insecure-defaults.md`  
**When**: Before Security gate (runs in parallel prep)

- Proactive audit: validation gaps, weak defaults, hardcoded secrets
- Cross-ref `.cursor/gates/security/*` — assurance finds; security policy enforces

### Step B5: Dependency Review (if applicable)

**Document**: `.cursor/gates/assurance/dependency-review.md`  
**When**: New npm/pypi packages, GitHub Actions, MCP servers

- Trustworthiness, maintenance, license, security posture

### Step B6: Static Analysis Plan

**Document**: `.cursor/gates/assurance/static-analysis.md`  
**When**: Before first PR

- Which Semgrep/CodeQL/lint rules apply to this change
- CI integration points

### Step B7: Second Opinion

**Agent**: `agents/second-opinion-reviewer.md`  
**When**: Cross-domain, financial, CBT, PPDB, infra, or Pillar 2 complexity

- Independent challenge; dissent documented
- Verdict: AGREE | AGREE WITH CONCERNS | DISAGREE

### Step B8: Assurance Sign-Off

Embed in plan:

```markdown
## Assurance Sign-Off

| Step | Status | Evidence |
|------|--------|----------|
| Requirement clarification | ✅ | § Clarification log |
| Context build | ✅ | § Context checklist |
| Decision validation | ✅ | § Assumptions |
| Risk analysis | ✅ | § Top risks |
| Sharp edges | ✅ | § Sharp edges |
| Insecure defaults | ✅ | § Defaults scan |
| Dependency review | N/A | — |
| Static analysis plan | ✅ | § CI scanners |
| Second opinion | ✅ | Review attached |

**Verdict**: PASS | BLOCK  
**Reviewer**: [agent/human]  
**Date**: YYYY-MM-DD
```

---

## Phase C — During Implementation

- Re-run **Requirement Clarifier** if scope changes mid-sprint
- Re-run **Context Builder** if new ADR or RBAC standard applies
- No new dependencies without **Dependency Review** addendum

---

## Phase D — Differential Review (PR / Diff)

**Agent**: `agents/differential-reviewer.md`  
**When**: PR opened; before eng-review  
**Load**: `assurance-bundle differential`

Review the **delta**, not just resulting code:

| Check | Focus |
|-------|-------|
| Breaking changes | API contract, migration reversibility |
| Regression risks | Removed guards, changed defaults |
| RBAC regressions | New routes without permissions |
| UX inconsistencies | Page states, copy, nav depth |
| Test delta | Tests removed or weakened |

Integrates with `superpowers-requesting-code-review` and `gstack-eng-review`.

---

## Phase E — Pre-Deploy

**Agent**: `agents/second-opinion-reviewer.md` (mandatory for production)  
**Load**: `assurance-bundle pre-deploy`

- Challenge deployment analysis
- Verify rollback tested
- Confirm static analysis CI green
- Cross-check `.cursor/gates/security/security-gates.md` + `.cursor/gates/quality/quality-gates.md`

---

## GStack Integration

| GStack skill | Assurance relationship |
|--------------|------------------------|
| **gstack-office-hours** | Escalation when clarifier hits unresolved conflict |
| **gstack-eng-review** | Runs **after** differential review; eng-review does not replace assurance |
| **gstack-qa** | Executes test evidence plan from risk analysis |
| **gstack-browser-testing** | E2E covers sharp-edge scenarios flagged in assurance |
| **gstack-ship** | Requires assurance pre-deploy sign-off + quality gates |

### Ship blocker chain

```text
.cursor/gates/assurance/review-workflow.md (Phases A–E)
    → .cursor/gates/security/security-gates.md
    → .cursor/gates/taste/taste-gates.md (re-check if UI changed)
    → .cursor/gates/quality/quality-gates.md
    → gstack-eng-review
    → gstack-qa
    → gstack-ship
    → teknovo-devops-engineer (Pillar 3)
```

---

## CLI Loading by Phase

```bash
# Brainstorm / early planning
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle planning

# Before implementation (full pre-implementation bundle)
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-implementation

# PR / diff review
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle differential

# Before deploy
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-deploy

# Combined with quality + security context
python .cursor/runtime/load-memory.py --include-assurance --include-quality --assurance-bundle pre-implementation --quality-bundle pre-code

# Full assurance context (heavy)
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle full
```

---

## Bypass Policy

**No bypass** for Critical assurance findings.

Emergency hotfix (SEV-1):
1. Minimal differential review + verbal second opinion
2. Full assurance backfill within 48 hours
3. Document in `.cursor/docs/memory/lessons-learned.md`

Invoke `teknovo-incident-response` for SEV-1 path.

---

## Cross-References

| Document | Role |
|----------|------|
| `.cursor/gates/assurance/assurance-principles.md` | Philosophy and severity |
| `agents/requirement-clarifier.md` | Ambiguity detection |
| `agents/context-builder.md` | Standards loading |
| `agents/differential-reviewer.md` | Diff review |
| `agents/second-opinion-reviewer.md` | Challenge conclusions |
| `.cursor/gates/security/security-gates.md` | Next mandatory gate |
| `.cursor/gates/quality/quality-gates.md` | Post-implementation gates |
| `.cursor/gates/taste/taste-gates.md` | Pre-assurance judgement layer |
