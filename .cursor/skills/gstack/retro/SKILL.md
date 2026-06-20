---
name: gstack-retro
description: Conduct retrospective reviews of recent sprint cycles to document lessons and optimize workflows.
---

# Retro Skill

Use this skill after completing a feature, sprint, or significant task to capture lessons and improve future workflows.

Modeled after [GStack /retro](https://github.com/garrytan/gstack) and [gstack-openclaw-retro](https://github.com/garrytan/gstack).

---

## When to Activate

- Feature shipped to production
- Sprint cycle completed
- Significant bug or incident resolved
- User asks for retrospective or post-mortem
- Trigger words: retrospective, post-mortem, sprint review, lessons learned

---

## Retro Protocol

### 1. Gather Context

Review the completed work:

- Plan document (`docs/plans/*-plan.md`)
- PR description and review comments
- QA report
- Ship report
- Any incidents or blockers encountered

### 2. Retro Questions

Answer each honestly:

1. **What went well?** â€” patterns to repeat
2. **What didn't go well?** â€” friction points, wasted effort
3. **What surprised us?** â€” unexpected complexity, doc gaps
4. **What would we do differently?** â€” process improvements
5. **What skills/docs need updating?** â€” registry or standard gaps

### 3. Classify Findings

| Category | Action |
|----------|--------|
| **Keep doing** | Document as best practice |
| **Start doing** | Add to workflow or skill |
| **Stop doing** | Remove from process |
| **Try next time** | Experiment in next sprint |

---

## Retro Output Template

Save to `docs/retros/YYYY-MM-DD-<sprint-or-feature>.md`:

```markdown
# Retrospective: [Sprint/Feature Name]
Date: YYYY-MM-DD

## Summary
[1-2 sentences on what was delivered]

## Metrics
- Plan tasks: X/X completed
- Time in each phase: Discovery [X] â†’ Planning [X] â†’ Code [X] â†’ QA [X]
- Review rounds: X
- Bugs found post-ship: X

## What Went Well
- [specific positive pattern]

## What Didn't Go Well
- [specific friction point]

## Surprises
- [unexpected finding]

## Action Items
| Action | Owner | Priority |
|--------|-------|----------|
| [update skill X with Y] | Agent | High |
| [add ADR for Z decision] | Architect | Medium |

## Skill/Doc Updates Needed
- [ ] Update `.cursor/skills/<skill>/SKILL.md` with [change]
- [ ] Add section to `docs/standards/<standard>.md`
- [ ] Create ADR for [architectural decision]

## Keep / Start / Stop / Try
- **Keep**: [pattern]
- **Start**: [new practice]
- **Stop**: [anti-pattern]
- **Try**: [experiment for next sprint]
```

---

## Skill Improvement Loop

If retro identifies skill gaps:

1. Update the relevant `SKILL.md` in `.cursor/skills/`
2. Update trigger in `.cursor/registry/legacy-registry.yaml` if needed
3. Update `.cursor/docs/ai/AI_SKILLS_CATALOG.md`
4. Consider adding to `.cursor/docs/ai/AI_ROADMAP.md` if major gap

---

## Incident Retros

For production incidents, additionally document:

- **Timeline**: when detected, when resolved
- **Root cause**: technical and process
- **Impact**: users affected, data affected
- **Prevention**: what prevents recurrence
- **Detection**: how to catch faster next time

Invoke **superpowers-systematic-debugging** methodology for root cause section.

---

## Guidelines

- Be honest â€” retros are for improvement, not blame
- Focus on process and tooling, not individuals
- Every retro must produce at least one actionable item
- Update skills/docs when patterns repeat across retros
