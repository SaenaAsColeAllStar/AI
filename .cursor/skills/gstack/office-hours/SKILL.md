---
name: gstack-office-hours
description: Engage in interactive consultation, blocker resolution, and architectural discussions using forcing questions.
---

# Office Hours Skill

Use this skill when encountering significant architectural ambiguities, conflicting requirements, or complex system blockers. Modeled after [GStack /office-hours](https://github.com/garrytan/gstack).

---

## When to Activate

- Requirements are unclear or contradictory
- Architectural decision needed with multiple valid approaches
- Blocker prevents progress on current task
- User wants to explore a feature idea before committing to implementation
- Trigger words: blocker, consultation, unclear requirements, architectural question

---

## Forcing Questions (Ask One at a Time)

Adapted from GStack's 6 forcing questions:

1. **What specific pain are you solving?** — not hypotheticals; real examples from users
2. **Who is the user and what do they do today?** — current workflow before your feature
3. **What does success look like in 30 days?** — measurable outcome, not vision
4. **What are you NOT building?** — explicit scope boundaries (YAGNI)
5. **What breaks if this fails?** — failure modes and rollback plan
6. **What's the narrowest wedge to ship tomorrow?** — smallest useful increment

---

## Workflow

### 1. Blocker Isolation
- Identify the exact file, line, doc section, or decision causing the blocker
- Read relevant Teknovo docs before asking questions

### 2. Frame Questions
- One question per message
- Prefer multiple choice when options are clear
- Reference specific doc conflicts (e.g., "PRD says X but ADR-011 says Y")

### 3. Propose Solutions
Present 2-3 paths with effort estimates:

```markdown
## Option A: [Name] (Recommended)
- Effort: [S/M/L]
- Pros: ...
- Cons: ...
- Teknovo compliance: [which standards met]

## Option B: [Name]
...

## Recommendation
[Why Option A with reference to ADR/PRD]
```

### 4. Document Decision
Before writing code, record the decision:
- Update plan with chosen approach
- Create ADR if architectural (`docs/adr/ADR-XXX-<topic>.md`)
- Or append to `implementation_plan.md`

---

## Teknovo Doc Conflict Resolution

When docs conflict, follow priority from `AGENTS.md`:

1. ADR wins over PRD
2. Database Standard wins over informal notes
3. If still ambiguous → ask user, document in ADR

Common conflict sources:
- `docs/prd/` vs `docs/architecture/data-ownership-matrix.md`
- Module PRD vs `docs/standards/rbac/rbac-standard.md`

---

## Guidelines

- Do not guess — ask if requirements are unclear
- Do not write code during office hours — this is consultation only
- Push back on scope creep with evidence
- Transition to **superpowers-brainstorming** when ready to design
- Transition to **superpowers-writing-plans** when design is approved

---

## Output

Consultation summary saved to plan or ADR. User alignment confirmed before proceeding to implementation phases.
