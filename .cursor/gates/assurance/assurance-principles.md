# Assurance Principles — Teknovo Assurance Engineering System

> **Layer**: Assurance (mandatory gate before implementation)  
> **Philosophy**: Never trust assumptions. Verify before implementation. Review before deployment. Challenge before approval.  
> **Tone**: Senior auditor — validates, challenges, and blocks; does not generate to please

---

## Purpose

The Teknovo Assurance Engineering System is the **mandatory validation layer** between requirement clarity and implementation. It sits after Taste (judgement/restraint) and complements Security (policy/enforcement).

Assurance answers: *"Do we actually understand what we are building, what could go wrong, and what evidence proves we are ready?"*

A feature that bypasses assurance review is **blocked** — even if the plan looks complete and the engineer is confident.

---

## Core Philosophy

| Principle | Meaning | Teknovo application |
|-----------|---------|---------------------|
| **Verify, don't assume** | Every claim needs evidence or explicit unknown | "Users need X" → cite PRD section or ask clarifier |
| **Challenge before approve** | Disagreement is a feature, not a failure | Second-opinion on architecture shortcuts |
| **Differential review** | Review the *change*, not just the end state | Diff RBAC matrix, migration delta, API contract |
| **Sharp edges first** | Dangerous paths identified before code | CBT timer race, PPDB quota overflow, finance rounding |
| **Supply chain awareness** | Dependencies are attack surface | Pin Workers bindings, audit GitHub Actions |
| **Static analysis strategy** | Automated checks planned before merge | Semgrep rules for RBAC bypass patterns |
| **No silent bypass** | Emergency paths documented with deadline | SEV-1 hotfix → 48h assurance backfill |

---

## Layer Precedence

```text
Taste Layer              → judgement, removal, restraint
Assurance Layer          → validate requirements, architecture, risks (THIS LAYER)
Security Layer           → policy, secure defaults, RBAC/API/DB controls
Impeccable Quality       → product, UX, engineering excellence
Implementation           → code, migrations, UI
Ship                     → deploy, monitor, rollback
```

When assurance and speed conflict, **assurance wins** unless explicit risk acceptance is documented with owner and deadline.

When assurance and security both flag an issue, **both must pass** — assurance may catch requirement gaps security cannot see (e.g., ambiguous PPDB selection rules).

---

## Assurance Domains

| Domain | Document | Agent / Skill |
|--------|----------|---------------|
| Requirement clarity | `.cursor/gates/assurance/decision-validation.md` | `agents/requirement-clarifier.md` |
| Context completeness | `agents/context-builder.md` | Reads ADR, PRD, RBAC, DB standards |
| Change review | `.cursor/gates/assurance/review-workflow.md` | `agents/differential-reviewer.md` |
| Risk identification | `.cursor/gates/assurance/risk-analysis.md` | All assurance agents |
| Sharp edges | `.cursor/gates/assurance/sharp-edges.md` | Pre-implementation gate |
| Insecure defaults | `.cursor/gates/assurance/insecure-defaults.md` | Before Security layer sign-off |
| Supply chain | `.cursor/gates/assurance/dependency-review.md` | New deps, CI, MCP integrations |
| Static analysis | `.cursor/gates/assurance/static-analysis.md` | Pre-PR and pre-deploy |
| Second opinion | `agents/second-opinion-reviewer.md` | Plans, architecture, deploy |

Cross-reference: `.cursor/gates/security/security-principles.md` for policy; assurance is **proactive audit**, security is **mandatory policy**.

---

## Mandatory Gates (Summary)

Every feature passes **Assurance Review** before implementation:

1. **Requirement Clarification** — ambiguities resolved or explicitly deferred with owner
2. **Context Build** — ADR, PRD, RBAC, DB, UI standards loaded and cited
3. **Decision Validation** — alternatives documented; assumptions listed
4. **Risk Analysis** — top risks with mitigations and test evidence plan
5. **Sharp Edges Scan** — dangerous APIs, fragile abstractions flagged
6. **Insecure Defaults Scan** — proactive audit before security gate
7. **Dependency Review** — new packages, Actions, MCP vetted (if applicable)
8. **Static Analysis Plan** — which scanners run on this change
9. **Second Opinion** — independent challenge on high-risk items

Detail: `.cursor/gates/assurance/review-workflow.md`, `.cursor/gates/assurance/assurance-registry.yaml`

---

## Teknovo-Specific Assurance Focus

| Domain module | Common assurance failures |
|---------------|---------------------------|
| **PPDB** | Unclear selection tie-break rules; quota race conditions; document retention policy |
| **CBT** | Exam timer edge cases; answer save retry; proctoring bypass assumptions |
| **Finance** | Rounding rules; partial payment allocation; receipt immutability |
| **Academic** | Grade lock windows; report card publish vs draft |
| **Communication** | WA template approval; PII in message body; rate limits |
| **Cloudflare** | Worker env secrets; D1 migration order; R2 presigned TTL |
| **RBAC** | Permission only in UI; missing school_id tenancy filter |
| **Monorepo** | Cross-module repository import planned "for convenience" |
| **Ollama workstation** | Agent auto-commit without review; MCP over-permission |

---

## Severity Model

| Level | Blocks implementation? | Examples |
|-------|------------------------|----------|
| **Critical** | Yes | Unresolved requirement conflict; no RBAC plan for write path; unknown data owner |
| **Major** | Yes | Missing ADR reference for cross-domain change; no rollback plan for migration |
| **Minor** | No (track) | Optional doc gap; naming inconsistency |
| **Info** | No | Suggested simplification for future sprint |

---

## Output Artifacts

Assurance produces evidence, not vibes:

| Artifact | When | Location |
|----------|------|----------|
| Clarification log | After requirement clarifier | Plan doc § Open Questions Resolved |
| Context checklist | After context builder | Plan doc § Context Evidence |
| Assurance Review | Before implementation | Plan doc § Assurance Sign-Off |
| Differential review | On PR / diff | PR comment or review doc |
| Second opinion | High-risk plans/deploy | Attached review with dissent noted |

---

## Integration

| Resource | Path |
|----------|------|
| System index | `.cursor/docs/ai/AI_ASSURANCE_SYSTEM.md` |
| Registry | `.cursor/gates/assurance/assurance-registry.yaml` |
| Master rules | `AGENTS.md` — Assurance Layer |
| Memory loader | `python .cursor/runtime/load-memory.py --include-assurance` |
| Workflow | `.cursor/gates/assurance/review-workflow.md` |

**Remember**: Assurance is a gate. BLOCK is acceptable and expected when assumptions remain unverified.
