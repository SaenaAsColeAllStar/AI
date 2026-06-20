# Sharp Edges Analysis — Teknovo Assurance Engineering System

> **When**: Before implementation approval  
> **Inspired by**: Sharp-edges methodology (dangerous APIs, hidden complexity)  
> **Pair with**: `.cursor/gates/assurance/risk-analysis.md`, `.cursor/gates/assurance/insecure-defaults.md`

---

## Purpose

Sharp edges are **correct-looking code paths that fail badly** under real school ERP load, human error, or adversarial input. Assurance identifies them **before** implementation so mitigations land in design, not post-mortem.

---

## Sharp Edge Categories

### 1. Dangerous APIs & Patterns

| Edge | Teknovo example | Mitigation |
|------|-----------------|------------|
| Unbounded query | `GET /students` without limit | Cursor pagination mandatory |
| Floating-point money | `number` for rupiah | Integer minor units in DB |
| Client-side timer | CBT countdown in Vue only | Server `ends_at` authority |
| `delete()` hard remove | Finance receipt cleanup | Soft delete + audit |
| Fire-and-forget async | WA send without await/log | Queue + delivery status |
| Global state in Worker | Shared mutable across requests | Request-scoped context |
| `eval` / dynamic SQL | Report builder shortcut | Parameterized queries only |
| Cross-module repo import | Finance reads PPDB repo | Service API or event |

### 2. Fragile Abstractions

| Edge | Signal | Mitigation |
|------|--------|------------|
| Generic `BaseService<T>` | Hidden queries; untestable | Explicit service per aggregate |
| Mega Zod schema | 40 optional fields | Split DTOs per use case |
| Config-driven permissions in JSON | No type check; drift | RBAC matrix + codegen/guards |
| "Utility" dump file | `helpers.ts` grows unbounded | Module-local functions |
| Premature event bus | One subscriber | Direct service call until 2+ consumers |
| Wrapper around wrapper | 4 layers for one CRUD | Collapse to standard stack |

### 3. Overengineering

| Edge | Question to ask | Taste/assurance action |
|------|-----------------|------------------------|
| New microservice | Why not monorepo module? | Block without ADR |
| Plugin system for 2 variants | YAGNI | Defer |
| Real-time WebSocket | Is polling sufficient? | Default polling |
| Custom auth | Why not existing JWT flow? | Reject |
| Dashboard widget framework | Can list filters suffice? | Reject (PPDB stats) |

### 4. Maintenance Risks

| Edge | Long-term cost | Mitigation |
|------|----------------|------------|
| Undocumented state machine | PPDB status bugs | Diagram + enum + tests |
| Magic strings for status | Typos in production | Const enum / DB check |
| Copy-paste across modules | Divergent bug fixes | Shared package with owner |
| Missing migration down | Failed deploy stuck | Document rollback |
| English + ID mixed UI | Support confusion | Copywriting gate |

### 5. Hidden Complexity

| Edge | Looks simple | Actually |
|------|--------------|----------|
| "Just add a field" | Migration + backfill + RBAC + UI states | Full layer plan |
| Bulk import CSV | Encoding, duplicates, partial failure | Dry-run + error report |
| Timezone "later" | Jadwal ujian wrong nationwide | Explicit TZ in ADR |
| Multi-school switch | Cache leak between tenants | Invalidate on context change |
| Exam resume | Tab close mid-attempt | Idempotent resume token |

---

## Sharp Edges Worksheet

```markdown
## Sharp Edges Scan — [Feature]

| # | Edge | Category | Severity | Mitigation in plan | Owner |
|---|------|----------|----------|-------------------|-------|
| 1 | ... | Dangerous API | Critical | ... | ... |

**Scan verdict**: CLEAR | MITIGATED | BLOCK
```

---

## Module-Specific Scan Lists

### PPDB

- [ ] Quota check atomic with accept action
- [ ] Document upload virus/size limits defined
- [ ] PII fields excluded from list API responses
- [ ] Selection algorithm inputs logged

### CBT

- [ ] Server-side exam lock on submit
- [ ] Anti double-submit on answer save
- [ ] Proctoring bypass paths reviewed
- [ ] Question randomization seed per attempt

### Finance

- [ ] No negative balance without explicit credit note flow
- [ ] Receipt numbers unique per school/year
- [ ] Export CSV row limit

### Cloudflare Workers

- [ ] CPU time budget for handler
- [ ] D1 batch size limits
- [ ] No sync long loop in request path

---

## Severity → Action

| Severity | Action |
|----------|--------|
| Critical | Must mitigate in design before implementation |
| Major | Mitigation planned with test evidence |
| Minor | Document in plan backlog |

---

## Integration

- **Requirement clarifier**: Ambiguity often hides sharp edges
- **Differential reviewer**: Verify mitigations present in diff, not just plan
- **Security layer**: Sharp edges overlap insecure defaults — both must pass
- **Static analysis**: Custom Semgrep rules for known edges (see `.cursor/gates/assurance/static-analysis.md`)

---

## Related

- `.cursor/gates/assurance/insecure-defaults.md`
- `.cursor/gates/assurance/risk-analysis.md`
- `.cursor/gates/taste/architecture-principles.md`
- `agents/differential-reviewer.md`
