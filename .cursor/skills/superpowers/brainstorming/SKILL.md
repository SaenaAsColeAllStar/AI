---
name: superpowers-brainstorming
description: Perform divergent requirements analysis and architectural brainstorming prior to starting new tasks. MUST use before any creative work — features, components, refactors.
---

# Brainstorming Skill

Use this skill at the beginning of any new task, feature request, or complex refactor. **Do NOT write code, scaffold projects, or invoke implementation skills until design is approved.**

Adapted from [Superpowers brainstorming](https://github.com/obra/superpowers) with Teknovo standards integration.

---

## When to Activate

- User requests a new feature or component
- User describes a refactor or behavior change
- Requirements are vague or incomplete
- Multiple architectural approaches are possible

## Anti-Pattern: "Too Simple To Need Design"

Every task goes through this process — todo lists, single-function utilities, config changes. Simple projects get short designs (a few sentences), but design approval is always required.

---

## Workflow Checklist

Complete in order:

1. **Explore project context** — read files, docs (`docs/adr/**`, `docs/prd/**`), recent commits
2. **Ask clarifying questions** — invoke **.cursor/docs/agents/requirement-clarifier.md**; one at a time; understand purpose, constraints, success criteria
3. **Propose 2-3 approaches** — with trade-offs and recommendation
4. **Present design in sections** — get approval after each section
5. **Write design doc** — save to `docs/plans/YYYY-MM-DD-<feature>-design.md`
6. **Spec self-review** — fix placeholders, contradictions, ambiguity, scope
7. **Assurance checkpoint** — load `.cursor/gates/assurance/decision-validation.md`; resolve Critical ambiguities before planning
8. **Transition to planning** — invoke **superpowers-writing-plans** skill

---

## Teknovo-Specific Checks

During brainstorming, always verify **taste before quality**:

| Check | Reference |
|-------|-----------|
| Removal test / real value | `.cursor/gates/taste/product-principles.md` — reject complexity without measurable value |
| UX restraint | `.cursor/gates/taste/ux-principles.md` — IA depth, cognitive load, no modal wizards |
| Architecture simplicity | `.cursor/gates/taste/architecture-principles.md` — no premature abstraction |
| Product quality bar (after taste) | `.cursor/gates/quality/product-principles.md` |
| UX quality bar (after taste) | `.cursor/gates/quality/ux-principles.md` |
| Domain ownership | `docs/architecture/data-ownership-matrix.md` |
| Subdomain routing | `docs/adr/ADR-011-subdomain-architecture.md` |
| Existing module patterns | `apps/portal/src/modules/` |
| RBAC implications | `docs/standards/rbac/rbac-standard.md` |
| Database schema ownership | `docs/database/schema-contract.md` |
| API contract patterns | `docs/standards/api/api-contract.md` |

---

## Question Strategy

- **One question per message** — do not overwhelm
- **Multiple choice preferred** when options are clear
- **Flag scope creep early** — if request spans multiple independent subsystems, decompose first
- **YAGNI ruthlessly** — remove unnecessary features from all designs

---

## Design Sections to Cover

Scale each section to complexity:

1. **Goal** — what problem this solves, for whom
2. **Architecture** — modules affected, layer changes, event flows
3. **Database** — new tables, schema changes, ownership domain
4. **API** — endpoints, permissions, request/response shapes
5. **RBAC** — new permissions in `domain.resource.action` format
6. **UI** — pages, components, 5 page states
7. **Error handling** — failure modes, retry logic, user messaging
8. **Testing** — critical paths, coverage targets
9. **Risks** — migrations, breaking changes, security concerns

---

## Output

Save validated design to:

```text
docs/plans/YYYY-MM-DD-<feature-name>-design.md
```

Then invoke **superpowers-writing-plans** — the ONLY skill to invoke after brainstorming completes.

**Taste gate**: Run removal test via `.cursor/gates/taste/product-principles.md` and `.cursor/docs/agents/taste-reviewer.md` before design approval.  
**Assurance**: Run **.cursor/docs/agents/requirement-clarifier.md** when requirements unclear.  
**Quality gate**: Score surviving scope against `.cursor/gates/quality/product-principles.md`.

**CLI**: `python .cursor/runtime/load-memory.py --include-taste --include-assurance --taste-bundle planning --assurance-bundle planning`

---

## Key Principles

- Explore alternatives before settling
- Incremental validation — present, get approval, move on
- Follow existing codebase patterns — do not propose unrelated refactoring
- Break systems into well-bounded units with clear interfaces
- Reference actual Teknovo doc paths, not generic best practices
