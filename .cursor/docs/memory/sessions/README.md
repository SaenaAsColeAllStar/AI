# Session Memory — Teknovo AI Workstation

Session summaries capture decisions and outcomes from agent work sessions. They accumulate institutional memory beyond static docs.

---

## Directory Purpose

| Field | Purpose |
|-------|---------|
| `.cursor/docs/memory/sessions/` | Per-session markdown logs |
| `.cursor/docs/memory/lessons-learned.md` | Cross-session operational lessons |
| `.cursor/docs/memory/memory-registry.yaml` | Index of all memory artifacts |

---

## When to Create a Session Summary

Create a new file after any session that:

- Implements a feature or memory system change
- Resolves a production/staging incident
- Makes architectural decisions
- Encounters notable failures or workarounds

**Naming**: `YYYY-MM-DD-<short-topic>.md`  
**Example**: `2026-06-20-memory-architect-implementation.md`

---

## Session Summary Template

Copy this template for each new session:

```markdown
# Session: [Title]

**Date**: YYYY-MM-DD  
**Agent**: [Cursor / OpenCode / other]  
**Repository**: [AI SuperStack / Teknovo-V2]  
**Skills loaded**: [list primary skills used]

---

## Goal

[What the session set out to accomplish — 1–3 sentences]

---

## Decisions

| Decision | Rationale | Alternatives considered |
|----------|-----------|------------------------|
| ... | ... | ... |

---

## Files Modified

| File | Change |
|------|--------|
| `path/to/file` | Created / Updated / Deleted — brief description |

---

## Problems Encountered

### Problem 1: [Title]

- **Symptoms**: ...
- **Root cause**: ...
- **Resolution**: ...
- **Time lost**: [optional]

---

## Verification

- [ ] `tsc --noEmit` / lint / tests run
- [ ] Manual verification steps performed
- [ ] Three Pillars artifacts produced (if applicable)

---

## Final Outcome

**Status**: Complete | Partial | Blocked

[Summary of what was delivered, what remains, and recommended next steps]

---

## Follow-ups

- [ ] [Action item with owner if known]
```

---

## Example Session (Reference)

See `2026-06-20-memory-architect-implementation.md` if present — created during Memory Architect system build.

---

## Integration with Memory Loader

`.cursor/runtime/load-memory.py` can include recent session summaries when invoked with:

```bash
python .cursor/runtime/load-memory.py --include-sessions --session-limit 3
```

---

## Retention Policy

| Artifact | Retention |
|----------|-----------|
| Session files | Keep all — lightweight markdown |
| Lessons learned | Merge recurring themes from sessions into `lessons-learned.md` during refresh |
| Stale sessions | Never auto-delete; archive by date prefix |

---

## Related

- `.cursor/docs/memory/lessons-learned.md` — operational failures and fixes
- `.cursor/docs/memory/project-context.md` — static project context
- `gstack-retro` skill — sprint-level retrospectives (team process)
