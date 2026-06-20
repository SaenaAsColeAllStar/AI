# Self-Critique System â€” Teknovo Impeccable Architect

> **Mandatory**: Run before final output, PR submission, gate sign-off, or "task complete" claims  
> **Pair with**: `superpowers-verification-before-completion`  
> **Taste first**: Run `.cursor/gates/taste/taste-checklist.md` before this critique when scope/UI changed â€” taste precedes quality (see `.cursor/docs/ai/AI_TASTE_SYSTEM.md`)

---

## Purpose

Self-critique is the last line of defense against acceptable-but-mediocre work. Agents and humans must **challenge their own output** before shipping. Approval-seeking without refinement is a workflow violation.

---

## The Five Questions

Answer each honestly. Any "No" requires refinement before proceeding.

### 1. Is there a simpler solution?

| Ask | Action if failing |
|-----|-------------------|
| Can this be one table instead of three? | Consolidate schema |
| Can this be config instead of code? | Use school settings |
| Can this reuse an existing page? | Extend list + detail |
| Is this abstraction used twice? | If not, inline it (YAGNI) |

**Teknovo example**: Instead of a new "Dashboard Widget API" for PPDB stats, add filters to existing applicant list.

---

### 2. Is this more maintainable?

| Ask | Action if failing |
|-----|-------------------|
| Will the next agent find files predictably? | Follow folder contract |
| Is domain logic in the service layer? | Move out of UI/controller |
| Are tests covering the change? | Add service tests |
| Is duplication introduced? | Extract shared module |

---

### 3. Is this more user-friendly?

| Ask | Action if failing |
|-----|-------------------|
| Fewer clicks than before? | Shorten flow |
| Clear labels in Bahasa operasional? | Rewrite copy |
| All 5 page states handled? | Implement missing states |
| Works on mobile if persona needs it? | Responsive pass |

---

### 4. Is this more scalable?

| Ask | Action if failing |
|-----|-------------------|
| Paginated lists? | Add cursor/limit |
| Indexed queries? | Add migration index |
| Async for heavy jobs? | Queue batch tagihan |
| Event-driven for cross-domain? | Replace sync coupling |

---

### 5. Would principal architect and designer approve?

| Role | They reject if... |
|------|-------------------|
| **Chief Architect** | Layer violation, unclear domain owner, cross-module repo import |
| **Chief Product Designer** | AI dashboard slop, nav depth > 3, feature without user value |
| **Security Reviewer** | Missing RBAC on mutations, secrets in code, cross-tenant data path, UI-only auth |

If any would reject â€” **refine before presenting as done**.

**Security self-check**: Run `.cursor/gates/security/review-checklist.md` applicable sections or `python .cursor/runtime/load-memory.py --include-security --security-bundle planning` before claiming implementation-ready.

---

## Self-Critique Worksheet

Copy into plan, PR, or session summary:

```markdown
## Self-Critique â€” [Feature/Task]

**Date**: YYYY-MM-DD

### Simpler?
- Current approach:
- Simpler alternative considered:
- Decision:

### Maintainable?
- Layer/domain compliance:
- Test coverage:
- Duplication check:

### User-friendly?
- Primary persona:
- Click count / cognitive load:
- Page states:

### Scalable?
- Load assumptions:
- Query/bundle concerns:

### Principal approval?
- Architect would approve: â˜ Yes â˜ No â€” fix:
- Designer would approve: â˜ Yes â˜ No â€” fix:

### Refinement actions taken
1.
2.

**Ready to ship**: â˜ Yes â˜ No
```

---

## When to Run

| Trigger | Minimum critique |
|---------|------------------|
| End of brainstorming | Questions 1, 5 (product scope) |
| Plan complete | All 5 |
| Before UI commit | 3, 5 |
| Before PR | All 5 + checklist |
| Before deploy | All 5 + quality gates |
| User says "done" | All 5 + verification evidence |

---

## Integration with Verification

Self-critique does **not** replace automated checks:

```text
Implement â†’ tsc/lint/test â†’ self-critique â†’ quality gates â†’ ship
```

`superpowers-verification-before-completion` requires **evidence**; self-critique requires **judgment**.

---

## Escalation

If self-critique reveals unresolved conflict (e.g., UX wants simplicity, Finance needs detail):

1. Document trade-off in plan
2. Invoke `gstack-office-hours` or Pillar review
3. Do not ship with silent compromise

---

## Related

- `.cursor/gates/taste/taste-checklist.md` â€” run first for scope/simplicity (Taste > Quality)
- `.cursor/gates/assurance/review-workflow.md` â€” reopen if self-critique reveals unverified assumptions
- `.cursor/docs/ai/AI_ASSURANCE_SYSTEM.md` â€” assurance layer checkpoint
- `.cursor/docs/ai/AI_TASTE_SYSTEM.md` â€” taste layer precedence
- `.cursor/gates/quality/quality-gates.md`
- `.cursor/gates/quality/review-checklist.md`
- `agents/impeccable-reviewer.md`
- `.cursor/gates/security/review-checklist.md` â€” security self-check
- `.cursor/docs/ai/AI_SECURITY_SYSTEM.md`
- `.cursor/skills/superpowers-verification-before-completion/SKILL.md`
