# Taste Checklist — Teknovo Taste System

> **Purpose**: Fast design-director review before implementation  
> **Use with**: `agents/taste-reviewer.md`, `.cursor/gates/taste/taste-gates.md`  
> **Precedence**: Complete taste checklist **before** `.cursor/gates/quality/review-checklist.md`

---

## How to Use

Run this checklist at:

- End of brainstorming (scope trim)
- After design doc, before writing-plans execution
- Before first UI commit
- Before Architecture Impact Analysis sign-off
- When any stakeholder adds "just one more thing"

Mark each: **✅ Pass** · **❌ Fail** · **➖ N/A**

Any **❌** on a Core question blocks implementation until resolved or explicitly deferred with taste reviewer approval.

---

## Core Questions (All Features)

| # | Question | Pass evidence |
|---|----------|---------------|
| 1 | **Simpler?** | Written simpler alternative considered; chosen path has fewer moving parts | 
| 2 | **Smaller?** | v1 scope list; deferred items documented in plan |
| 3 | **Faster?** | Core user task click count estimated (target ≤5) |
| 4 | **Clearer?** | Primary action and nav path obvious; copy reviewed |
| 5 | **Removable?** | Removal test written — users would notice absence |
| 6 | **Improves outcomes?** | Named persona + metric (time, errors, revenue, compliance) |
| 7 | **Design director approve?** | Taste reviewer or Chief Product Designer sign-off |
| 8 | **Principal architect approve?** | Minimal layers; owner identified; no premature abstraction |

---

## Product Taste

Reference: `.cursor/gates/taste/product-principles.md`

- [ ] Persona named (e.g., "Staf PPDB", "Bendahara")
- [ ] Problem is recurring, not one-off demo
- [ ] Feature not duplicating existing list/filter/export
- [ ] "Would users notice if gone?" — yes with specific workflow
- [ ] v2/nice-to-have explicitly cut from v1
- [ ] No feature added because competitor has it

---

## UX Taste

Reference: `.cursor/gates/taste/ux-principles.md`

- [ ] Nav depth ≤3 clicks to primary task
- [ ] ≤3 primary actions visible per view
- [ ] No unnecessary modals for multi-step work
- [ ] Mobile 390px layout considered
- [ ] RBAC: hidden nav + Permission state — not disabled mystery
- [ ] Empty state = icon + sentence + one CTA

---

## Visual Taste

Reference: `.cursor/gates/taste/design-principles.md`, `.cursor/docs/memory/ui-ux-rules.md`

- [ ] No AI dashboard slop (gradient hero, chart wall, KPI overload)
- [ ] Phosphor icons only; sidebar matches contract
- [ ] Tables for ERP data; cards only where justified
- [ ] ≤4 metric tiles on dashboard views
- [ ] AI-ish score ≤1 (see design-principles checklist)

---

## Architecture Taste

Reference: `.cursor/gates/taste/architecture-principles.md`

- [ ] Controller → Service → Repository → DB — no extra tiers
- [ ] No new microservice/deployable without ADR justification
- [ ] Single domain owner for mutable data
- [ ] No abstraction without second concrete use case
- [ ] Events only for real decoupling — not sync CRUD fanfare

---

## Copywriting Taste

Reference: `.cursor/gates/taste/copywriting-principles.md`

- [ ] UI strings in Bahasa Indonesia — human, short
- [ ] Buttons verb-first (Simpan, Hapus, Verifikasi)
- [ ] No buzzwords ("AI-powered", "insights", " seamless")
- [ ] Errors explain problem + next step
- [ ] Status labels school-friendly (Lunas, Menunggu verifikasi)

---

## Documentation Taste

- [ ] Plan/design doc states **what we are not building**
- [ ] No placeholder TODO in committed specs
- [ ] ADR only if structural decision — not for every CRUD page

---

## Sign-Off Block

```text
Feature: _______________________
Reviewer: taste-reviewer / human
Date: _________________________

Core 1–8: [ ] all pass or deferred with reason
Product:  [ ] pass
UX:       [ ] pass
Visual:   [ ] pass
Architecture: [ ] pass
Copy:     [ ] pass

Deferred items (v2):
-

Verdict: [ ] PROCEED TO QUALITY GATES  [ ] CUT SCOPE  [ ] REJECT
```

---

## After Taste Passes

Load quality layer:

```bash
python .cursor/runtime/load-memory.py --include-taste --include-quality --taste-bundle pre-feature --quality-bundle planning
```

Then run `.cursor/gates/quality/quality-gates.md` and Three Pillars gates as applicable.

---

## Cross-References

| Document | Role |
|----------|------|
| `.cursor/gates/taste/taste-gates.md` | Mandatory gate sequence |
| `agents/taste-reviewer.md` | Review agent |
| `.cursor/gates/quality/review-checklist.md` | Post-taste quality bar |
| `.cursor/gates/quality/self-critique.md` | Final output critique |
