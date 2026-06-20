# Teknovo AI Assurance System — Assurance Engineering

> **Version**: 1.0 · **Last updated**: 2026-06-20  
> **Registry**: `.cursor/gates/assurance/assurance-registry.yaml`

The **Assurance Engineering System** validates requirements, architecture, and risks before implementation. It complements Taste (judgement), Security (policy), and Impeccable Quality (excellence). **No implementation proceeds without assurance review.**

---

## Quick Start

| When | Load |
|------|------|
| Brainstorm / unclear scope | `agents/requirement-clarifier.md`, `.cursor/gates/assurance/decision-validation.md` |
| Before plan finalization | `agents/context-builder.md`, `.cursor/gates/assurance/review-workflow.md` |
| Before implementation | Full pre-implementation bundle (mandatory) |
| PR / diff | `agents/differential-reviewer.md` |
| Pre-deploy (high-risk) | `agents/second-opinion-reviewer.md` |

**CLI**: `python .cursor/runtime/load-memory.py --include-assurance`  
**Bundles**: `--assurance-bundle planning | pre-implementation | differential | pre-deploy | full`

---

## Artifact Index

| Artifact | Path | Purpose |
|----------|------|---------|
| Assurance principles | `.cursor/gates/assurance/assurance-principles.md` | Philosophy, precedence, severity |
| Review workflow | `.cursor/gates/assurance/review-workflow.md` | Phases A–E, GStack, CLI |
| Risk analysis | `.cursor/gates/assurance/risk-analysis.md` | Risk register, domain catalog |
| Decision validation | `.cursor/gates/assurance/decision-validation.md` | Assumptions, alternatives, conflicts |
| Sharp edges | `.cursor/gates/assurance/sharp-edges.md` | Dangerous APIs, fragile abstractions |
| Insecure defaults | `.cursor/gates/assurance/insecure-defaults.md` | Proactive audit before security gate |
| Dependency review | `.cursor/gates/assurance/dependency-review.md` | Supply chain, Actions, MCP |
| Static analysis | `.cursor/gates/assurance/static-analysis.md` | Semgrep, CodeQL, CI strategy |
| Registry | `.cursor/gates/assurance/assurance-registry.yaml` | Paths, bundles, agents |

---

## Agent Index

| Agent | Path | When |
|-------|------|------|
| Requirement clarifier | `agents/requirement-clarifier.md` | Ambiguity, missing requirements |
| Context builder | `agents/context-builder.md` | ADR/PRD/standards before decisions |
| Differential reviewer | `agents/differential-reviewer.md` | PR/diff review |
| Second opinion reviewer | `agents/second-opinion-reviewer.md` | Challenge plans and deploy |

---

## Workflow Integration

```text
Taste Layer (5 gates)
    ↓
Brainstorm                    ← superpowers-brainstorming + requirement-clarifier
    ↓
Context Builder               ← agents/context-builder.md
    ↓
Plan                          ← superpowers-writing-plans
    ↓
Assurance Review (mandatory)  ← .cursor/gates/assurance/* + second-opinion (if high-risk)
    ↓
Security Review               ← .cursor/gates/security/security-gates.md
    ↓
Pillar 1 → Pillar 2
    ↓
Implementation
    ↓
Differential Review           ← agents/differential-reviewer.md
    ↓
Impeccable Quality + gates
    ↓
Second Opinion (pre-deploy)
    ↓
Ship (Pillar 3)
```

---

## Layer Precedence

```text
Taste → Assurance → Security → Implementation → Quality → Ship
```

Assurance focuses on: ambiguity, assumptions, sharp edges, differential review, supply chain, static analysis strategy, second opinions.

---

## CLI Examples

```bash
# Planning phase
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle planning

# Mandatory before code
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-implementation

# PR review
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle differential

# Production deploy
python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-deploy

# Assurance only (light)
python .cursor/runtime/load-memory.py --include-assurance --assurance-only

# Combined with quality
python .cursor/runtime/load-memory.py --include-assurance --include-quality \
  --assurance-bundle pre-implementation --quality-bundle pre-code
```

---

## Agent Invocation

| Agent | How to invoke |
|-------|---------------|
| **Requirement clarifier** | User intent "clarify requirements"; after brainstorm; registry trigger `unclear requirements`; load `agents/requirement-clarifier.md` |
| **Context builder** | Before plan execution; registry trigger `before implementation`; `@context-builder` or explicit "build context from ADR/PRD" |
| **Differential reviewer** | On PR/diff; before `superpowers-requesting-code-review`; Cursor Bugbot-style "review branch changes" |
| **Second opinion reviewer** | Cross-domain/finance/CBT/deploy; registry trigger `second opinion`; mandatory pre-production |

---

## Cross-References

| System | Document |
|--------|----------|
| Master rules | `AGENTS.md` § Assurance Layer |
| Taste | `.cursor/docs/ai/AI_TASTE_SYSTEM.md` |
| Security | `.cursor/docs/ai/AI_SECURITY_SYSTEM.md` |
| Quality | `.cursor/docs/ai/AI_QUALITY_SYSTEM.md` |
| Skill registry | `.cursor/registry/legacy-registry.yaml` |
| Memory | `.cursor/docs/memory/memory-registry.yaml` |

---

## Hard Rules

1. No `teknovo-feature-implementation` until Assurance Sign-Off in plan
2. Differential review before eng-review on every PR
3. Second opinion mandatory for production deploy of high-risk domains
4. BLOCK is acceptable — unverified assumptions must not ship
