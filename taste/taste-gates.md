# Taste Gates — Teknovo Taste System

> **Rule**: Product taste gates run **before** architecture and **before** security pre-implementation review  
> **Principle**: If users would not notice its absence, do not build it

---

## Gate Order (Cross-Layer)

```text
┌─────────────────────┐
│ 1. Product Taste    │  Scope — what deserves to exist
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. Architecture     │  Pillar 2 — how it fits
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. Assurance Review │  Validate requirements, risks — before code
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. Security Review  │  Pre-implementation — can it be built safely?
└──────────┬──────────┘
           ▼
     Implementation
```

**Critical**: Passing taste does **not** bypass assurance or security. **Assurance Sign-Off** (`assurance/review-workflow.md`) and Security Gate 1 are mandatory before any implementation.

Taste removes low-value scope; Assurance validates requirements and risks; Security validates remaining scope is safe to build.

---

## Gate 1 — Product Taste

**When**: Before PRD finalization, sprint commitment, or architecture work on new surface area

**Artifacts**: `taste/product-principles.md`, `taste/ux-principles.md`

**Pass criteria**:
- Three Questions answered (user value, simplification, notice-if-gone)
- Removal Test documented for non-trivial features
- Low-value complexity patterns rejected

**Blocks**: Architecture and Security review on rejected scope

---

## Gate 2 — UX Taste (Pre-UI)

**When**: Before first UI commit

**Artifacts**: `taste/ux-principles.md`, `quality/design-taste.md`

**Pass criteria**:
- Nav depth ≤ 3
- No AI dashboard slop
- Primary action clear for school admin personas

**Note**: UX Quality gate (`quality/quality-gates.md`) runs again pre-release; Security does not replace UX review.

---

## Relationship to Assurance & Security

| Taste decision | Assurance / Security implication |
|----------------|----------------------------------|
| Feature cut | Smaller attack surface — document in plan |
| Feature kept | Full Assurance Review + Security Review on RBAC/API/data touched |
| Simplified flow | Fewer endpoints — verify each in differential review |
| Public PPDB form kept | Assurance: clarify validation rules; Security: rate limit, no PII leak |

Load assurance then security after taste planning:

```bash
python ai-agent/runtime/load-memory.py --include-assurance --assurance-bundle pre-implementation
python ai-agent/runtime/load-memory.py --include-security --security-bundle planning
```

---

## Bypass Policy

No bypass for taste on net-new user-facing modules. Emergency hotfix (SEV-1) may skip taste re-evaluation but **never** skips assurance or security gates.

---

## Related

- Assurance workflow: `assurance/review-workflow.md`
- Security gates: `security/security-gates.md`
- Product taste: `taste/product-principles.md`
- Master workflow: `AGENTS.md`
- Assurance index: `docs/ai/AI_ASSURANCE_SYSTEM.md`
- Security index: `docs/ai/AI_SECURITY_SYSTEM.md`
