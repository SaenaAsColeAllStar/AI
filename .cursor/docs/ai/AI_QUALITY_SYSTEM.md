# Teknovo AI Quality System — Impeccable Architect

> **Version**: 1.0 · **Last updated**: 2026-06-20  
> **Registry**: `.cursor/gates/quality/quality-registry.yaml`

The **Impeccable Architect** quality system enforces product, UX, architecture, and engineering excellence across the Teknovo AI SuperStack. It complements — not replaces — the Three Pillars gates and the 12-step workflow in `AGENTS.md`.

---

## Quick Start

| When | Load |
|------|------|
| New feature / brainstorm | `.cursor/gates/quality/product-principles.md`, `.cursor/gates/quality/architecture-principles.md` |
| Before UI code | `.cursor/gates/quality/ux-principles.md`, `.cursor/gates/quality/design-taste.md` |
| Before implementation | `.cursor/gates/quality/engineering-principles.md` |
| Before PR / ship | `.cursor/gates/quality/review-checklist.md`, `.cursor/gates/quality/quality-gates.md` |
| Before "done" | `.cursor/gates/quality/self-critique.md` |
| Full review | `agents/impeccable-reviewer.md` |

**CLI**: `python .cursor/runtime/load-memory.py --include-quality`  
**Bundle**: `--quality-bundle pre-ship` (planning, pre-ui, pre-code, pre-ship, full)

---

## Artifact Index

| Artifact | Path | Purpose |
|----------|------|---------|
| Product principles | `.cursor/gates/quality/product-principles.md` | User/business value, complexity, maintenance |
| UX principles | `.cursor/gates/quality/ux-principles.md` | Cognitive load, IA, a11y, mobile, page states |
| Architecture principles | `.cursor/gates/quality/architecture-principles.md` | Domain ownership, layers, API/data boundaries |
| Engineering principles | `.cursor/gates/quality/engineering-principles.md` | Code quality, tests, security, scalability |
| Review principles | `.cursor/gates/quality/review-principles.md` | Review philosophy, Superpowers/GStack links |
| Review checklist | `.cursor/gates/quality/review-checklist.md` | 11-section pre-ship checklist |
| Design taste | `.cursor/gates/quality/design-taste.md` | Anti-AI-dashboard; Stripe/Linear/Notion/Carbon |
| Quality gates | `.cursor/gates/quality/quality-gates.md` | Six mandatory gates before feature complete |
| Self-critique | `.cursor/gates/quality/self-critique.md` | Five questions before final output |
| Reviewer agent | `agents/impeccable-reviewer.md` | Cross-functional quality enforcement |
| Registry | `.cursor/gates/quality/quality-registry.yaml` | Paths, triggers, bundles |

---

## Workflow Integration

```text
Discovery
    ↓
Brainstorm (+ product-principles)     ← superpowers-brainstorming
    ↓
Plan (+ architecture/UX sections)     ← superpowers-writing-plans
    ↓
Architecture Gate (Pillar 2)
    ↓
UX Gate (pre-UI)                      ← ux-principles, design-taste
    ↓
Implementation (+ engineering-principles)
    ↓
Impeccable Review                     ← agents/impeccable-reviewer.md
    ↓
Self-critique + review-checklist
    ↓
Quality gates (6)                     ← gstack-eng-review, gstack-qa, gstack-ship
    ↓
Ship (Pillar 3)
```

---

## Quality Gates Summary

1. **Architecture Review** — before migrations / new modules  
2. **UX Review** — before UI code and pre-release  
3. **RBAC Review** — before merge  
4. **Testing Review** — before PR approval  
5. **Documentation Review** — before merge  
6. **Deployment Review** — before staging/production  

Detail: `.cursor/gates/quality/quality-gates.md`

---

## Ecosystem Links

| System | Integration |
|--------|-------------|
| `AGENTS.md` | Impeccable Quality Layer section |
| `.cursor/registry/legacy-registry.yaml` | Quality triggers + impeccable-reviewer |
| `.cursor/docs/memory/memory-registry.yaml` | Quality artifact entries |
| `.cursor/runtime/load-memory.py` | `--include-quality`, `--quality-bundle` |
| Superpowers | brainstorming, writing-plans, requesting-code-review |
| GStack | eng-review, qa, ship |
| Three Pillars | Product Design / Architecture / Deployment analyses |

---

## Related Documentation

- Master agent rules: `AGENTS.md`
- AI workflow: `.cursor/docs/ai/AI_WORKFLOW.md`
- UI rules memory: `.cursor/docs/memory/ui-ux-rules.md`
- Skills catalog: `.cursor/docs/ai/AI_SKILLS_CATALOG.md`
