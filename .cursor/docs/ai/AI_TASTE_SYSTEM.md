# Teknovo AI Taste System — Design Director Layer

> **Version**: 1.0 · **Last updated**: 2026-06-20  
> **Registry**: `.cursor/gates/taste/taste-registry.yaml`  
> **Precedence**: **Taste > Impeccable Quality > default generation**

The **Taste System** sits above all other Teknovo AI layers. It enforces judgement, restraint, and removal — what **not** to build — before the Impeccable Quality system verifies excellence in what remains.

Taste is about **scope and simplicity**. Quality is about **gates and evidence**. Both cross-reference; taste leads when they conflict.

---

## Quick Start

| When | Load |
|------|------|
| Brainstorm / PRD | `.cursor/gates/taste/product-principles.md`, `.cursor/gates/taste/architecture-principles.md` |
| Before UI | `.cursor/gates/taste/ux-principles.md`, `.cursor/gates/taste/design-principles.md` |
| Before implementation | `.cursor/gates/taste/taste-gates.md` (all 5 gates) |
| Copy pass | `.cursor/gates/taste/copywriting-principles.md` |
| Review / simplify | `agents/taste-reviewer.md`, `.cursor/gates/taste/taste-checklist.md` |
| After taste passes | `.cursor/gates/quality/**` via `--include-quality` |

**CLI**:

```bash
python .cursor/runtime/load-memory.py --include-taste
python .cursor/runtime/load-memory.py --include-taste --taste-bundle pre-feature
python .cursor/runtime/load-memory.py --include-taste --include-quality --taste-bundle pre-ui --quality-bundle pre-ui
```

**Bundles**: `planning`, `pre-ui`, `pre-feature`, `pre-code`, `full`

Taste bundles load **before** quality when both flags are set.

---

## Precedence Rule

```text
1. Taste Layer       — judgement, removal, restraint (this system)
2. Impeccable Quality — review checklist, quality gates, self-critique
3. Default generation — skills, velocity, patterns
```

Documented in: `AGENTS.md` §3.1, `.cursor/gates/taste/taste-registry.yaml`

---

## Artifact Index

| Artifact | Path | Purpose |
|----------|------|---------|
| Product taste | `.cursor/gates/taste/product-principles.md` | Value, removal test, reject complexity |
| UX taste | `.cursor/gates/taste/ux-principles.md` | Nav, task speed, reject modals/deep IA |
| Visual taste | `.cursor/gates/taste/design-principles.md` | Anti-AI-dashboard; Stripe/Linear/Notion/Carbon |
| Architecture taste | `.cursor/gates/taste/architecture-principles.md` | Simple layers; reject overengineering |
| Copy taste | `.cursor/gates/taste/copywriting-principles.md` | Indonesian human copy; no jargon |
| Taste checklist | `.cursor/gates/taste/taste-checklist.md` | Simpler/smaller/faster/clearer/removable |
| Taste gates | `.cursor/gates/taste/taste-gates.md` | Five gates before implementation |
| Taste reviewer | `agents/taste-reviewer.md` | Design director review agent |
| Registry | `.cursor/gates/taste/taste-registry.yaml` | Paths, triggers, bundles, precedence |

---

## Five Taste Gates (Before Implementation)

1. **Product Taste** — real user value; removal test  
2. **UX Taste** — nav ≤3; ≤3 actions; no modal wizards  
3. **Visual Taste** — no AI slop; Teknovo tokens; table-first  
4. **Architecture Taste** — Feature→API→Service→Repository→DB  
5. **Copywriting Taste** — short Indonesian; verb-first  

Detail: `.cursor/gates/taste/taste-gates.md`

After all five: load quality bundles and Three Pillars gates.

---

## Workflow Integration

```text
Discovery
    ↓
Brainstorm (+ taste planning bundle)     ← superpowers-brainstorming
    ↓
Taste Review (taste-reviewer)            ← agents/taste-reviewer.md
    ↓
Plan (taste-approved scope)              ← superpowers-writing-plans
    ↓
Taste Gates 1–5 sign-off                 ← .cursor/gates/taste/taste-gates.md
    ↓
Product Design Gate (Pillar 1)
    ↓
Architecture Gate (Pillar 2)
    ↓
UX/Visual Taste re-check (pre-UI)
    ↓
Implementation
    ↓
Impeccable Review                        ← agents/impeccable-reviewer.md
    ↓
Self-critique (taste first, then quality) ← taste-checklist + .cursor/gates/quality/self-critique.md
    ↓
Quality gates (6)                        ← .cursor/gates/quality/quality-gates.md
    ↓
GStack eng-review → qa → ship
    ↓
Ship (Pillar 3)
```

---

## Relationship to Quality System

| Taste | Quality |
|-------|---------|
| Should this exist? | Is it built correctly? |
| Remove / simplify | Verify / checklist |
| `.cursor/gates/taste/taste-gates.md` | `.cursor/gates/quality/quality-gates.md` |
| `agents/taste-reviewer.md` | `agents/impeccable-reviewer.md` |
| `.cursor/gates/taste/design-principles.md` | `.cursor/gates/quality/design-taste.md` |

Do not duplicate quality content — cross-reference. Visual source of truth chain:

`AGENTS.md` → `.cursor/gates/taste/design-principles.md` → `.cursor/gates/quality/design-taste.md` → `.cursor/docs/memory/ui-ux-rules.md`

---

## GStack Integration

| Skill | Taste role |
|-------|------------|
| `gstack-eng-review` | No layer bloat vs taste-approved architecture |
| `gstack-qa` | Primary flows match taste-approved UX |
| `gstack-ship` | Taste + quality gates both signed |

See `.cursor/gates/taste/taste-gates.md` § GStack Integration.

---

## Superpowers Integration

- **superpowers-brainstorming** — load taste planning bundle; run removal test before design approval  
- **superpowers-writing-plans** — plan must include Taste Gate Sign-Off block  

---

## Registry & Load Order

Full index: `.cursor/gates/taste/taste-registry.yaml`  
Memory cross-ref: `.cursor/docs/memory/memory-registry.yaml`  
Skill triggers: `.cursor/registry/legacy-registry.yaml` § taste

Loader layer order (when `--include-taste` and `--include-quality`):

1. Memory artifacts (`.cursor/docs/memory/`)  
2. Taste artifacts (`.cursor/gates/taste/`) — layer 2  
3. Quality artifacts (`.cursor/gates/quality/`) — layer 3  

---

## Related Documents

| Document | Path |
|----------|------|
| Master agent rules | `AGENTS.md` |
| Quality system | `.cursor/docs/ai/AI_QUALITY_SYSTEM.md` |
| UI/UX rules | `.cursor/docs/memory/ui-ux-rules.md` |
| Skill registry | `.cursor/registry/legacy-registry.yaml` |
| Memory loader | `.cursor/runtime/load-memory.py` |
