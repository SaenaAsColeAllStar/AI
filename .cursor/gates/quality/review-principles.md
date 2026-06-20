# Review Principles — Teknovo Impeccable Architect

> **Purpose**: Unified review philosophy across product, UX, architecture, and engineering  
> **Engine**: `.cursor/gates/quality/review-checklist.md` + `agents/impeccable-reviewer.md`  
> **Taste first**: Scope and simplification reviews use `agents/taste-reviewer.md` before this quality review pass

---

## Review Philosophy

Teknovo reviews are **gates, not suggestions**. A reviewer identifies blockers with severity, cites the violated principle, and proposes a concrete fix. Praise without evidence is noise; approval without checklist completion is negligence.

### Severity Model

| Level | Definition | Blocks merge / ship? |
|-------|------------|-------------------|
| **Critical** | Security hole, data loss, layer violation, missing RBAC on write | Yes |
| **Major** | Missing page state, untested business logic, IA depth > 3, schema without owner | Yes |
| **Minor** | Naming inconsistency, non-token color, missing JSDoc on public API | No — fix in follow-up OK |
| **Info** | Future improvement, optional refactor | No |

Critical and Major issues require resolution before `.cursor/gates/quality/quality-gates.md` sign-off.

---

## Review Types

| Review | When | Primary artifacts |
|--------|------|-------------------|
| Product | After brainstorming / PRD draft | `.cursor/gates/quality/product-principles.md` |
| UX | Before UI code; pre-release | `.cursor/gates/quality/ux-principles.md`, `.cursor/gates/quality/design-taste.md` |
| Architecture | Before migrations / new modules | `.cursor/gates/quality/architecture-principles.md` |
| Engineering | During PR; before merge | `.cursor/gates/quality/engineering-principles.md` |
| Full stack | Before ship | `.cursor/gates/quality/review-checklist.md` |

---

## Reviewer Behavior

1. **Read context first** — PRD, plan, ADR, diff — not drive-by comments
2. **Cite standards** — link principle file section, not opinion
3. **One issue per comment** — actionable, with file path when known
4. **Propose fix** — "Split `PpdbService` into verification vs enrollment" not "too big"
5. **Reject weak solutions** — challenge assumptions; ask "is there a simpler way?"

---

## Superpowers Integration

Load these skills alongside review principles:

| Skill | Role in review |
|-------|----------------|
| `superpowers-brainstorming` | Validate product value before design investment |
| `superpowers-writing-plans` | Ensure plan includes quality dimensions before code |
| `superpowers-requesting-code-review` | Structure PR with checklist evidence |
| `superpowers-receiving-code-review` | Address feedback systematically |
| `superpowers-verification-before-completion` | Evidence before "done" claims |

**Workflow**:

```text
Brainstorm → product-principles score → design approval
     ↓
Writing-plans → architecture + UX sections in plan
     ↓
Implementation → eng-review + impeccable-reviewer
     ↓
Requesting-code-review → review-checklist attached to PR
     ↓
Quality gates → ship (gstack-ship)
```

---

## GStack Integration

| GStack skill | Review focus |
|--------------|--------------|
| `gstack-eng-review` | Layer isolation, Teknovo coding standards |
| `gstack-qa` | Functional flows, boundary cases |
| `gstack-browser-testing` | E2E evidence for critical paths |
| `gstack-ship` | Deployment gate after all quality gates pass |

Eng-review and QA are **not substitutes** for product/UX/architecture review — they complement the checklist.

---

## Three Pillars Alignment

| Pillar | Review responsibility |
|--------|----------------------|
| Chief Product Designer | User value, IA, conversion, anti-AI-dashboard |
| Chief Architect | Domain ownership, API/RBAC/schema |
| DevOps Engineer | CI, deploy impact, rollback |

Impeccable reviewer orchestrates checklist sections; pillars own gate artifacts (Product Design Analysis, Architecture Impact Analysis, Deployment Impact Analysis).

---

## Output Format

Every review session produces:

```markdown
## Impeccable Review — [Feature/PR name]

**Date**: YYYY-MM-DD
**Reviewer**: [agent/human]
**Verdict**: APPROVE | APPROVE WITH MINOR | BLOCK

### Blockers (Critical/Major)
1. [Issue] — [Principle] — [Fix]

### Minor / Info
- ...

### Checklist summary
| Section | Pass |
|---------|------|
| Product | ✅/❌ |
| UX | ✅/❌ |
| ... | |

### Self-critique applied
- [ ] Simpler alternative considered
- [ ] Principal architect would approve
- [ ] Principal designer would approve
```

---

## When to Invoke Impeccable Reviewer

- Before first line of UI code (UX + product pass)
- Before database migration merge (architecture pass)
- Before PR request (full checklist)
- Before deploy (`.cursor/gates/quality/quality-gates.md`)
- When user asks for "review", "audit", or "quality check"

**Agent definition**: `agents/impeccable-reviewer.md`

For scope and removal reviews first, invoke `agents/taste-reviewer.md` and `.cursor/gates/taste/taste-gates.md`. Precedence: **Taste > Quality** (`.cursor/gates/taste/taste-registry.yaml`).
