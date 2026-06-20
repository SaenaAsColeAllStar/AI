# Product Taste — Teknovo Taste System

> **Layer**: Taste (judgement & restraint) — precedes `.cursor/gates/quality/product-principles.md`  
> **Role**: Design director filter on *what deserves to exist*  
> **Tone**: If users would not notice its absence, do not build it.

---

## Purpose

Product taste is the discipline of **saying no**. Quality asks whether a feature is built well; product taste asks whether it should exist at all. Every Teknovo module — PPDB, Finance, Academic, CBT, WA Sender — competes for admin attention in schools that are already overwhelmed. Adding surface area without outcome is a product failure, even when engineering is flawless.

**Precedence**: When product taste and quality disagree on scope, **taste wins**. Remove or defer before polishing.

---

## The Three Questions (Mandatory)

Before any feature enters a PRD, plan, or sprint:

| Question | Pass criteria | Fail action |
|----------|---------------|-------------|
| **Real user value?** | Named persona, recurring task, measurable outcome (time saved, errors reduced, revenue collected) | Reject or merge into existing flow |
| **Can it be removed or simplified?** | Scope reduced to smallest shippable unit; no "nice to have" bundled with "must have" | Cut v2 items; ship core only |
| **Would users notice if gone?** | At least one school admin or staff role would report regression within one week | Do not build; log as backlog noise |

If any answer is weak, **stop**. Do not proceed to architecture or UI.

---

## Reject: Low-Value Complexity

### Patterns to kill on sight

| Pattern | Teknovo example | Verdict |
|---------|-----------------|---------|
| Dashboard for dashboard's sake | "Analytics hub" with 12 charts, no action | Reject — link to filtered lists |
| Duplicate entry points | PPDB stats on home + PPDB module + Reports | One canonical surface |
| Config explosion | 40 school settings for one workflow | Sensible defaults; hide advanced |
| Feature parity chasing | "Competitor X has AI chat" | Reject unless school requested |
| Admin-only power tools in primary nav | Bulk SQL export, raw event stream | Settings or support tooling |
| Notification for everything | WA blast on every status change | User-configured, high-signal only |

### The Removal Test

For every proposed capability, write:

```text
"If we delete [X], [persona] loses [Y]."
```

If Y is vague ("insights", "visibility", "flexibility") — **delete X**.

**Example — PPDB**:  
"If we delete the applicant funnel chart, PPDB staff lose the ability to see stage counts at a glance."  
→ Keep a **single** summary row or badge on the list, not a dedicated analytics page.

**Example — Finance**:  
"If we delete payment method breakdown pie chart, cashiers lose ability to reconcile daily cash."  
→ Cashiers reconcile from **transaction list + export**; pie chart is vanity — **remove**.

---

## Prefer: Focused Outcomes

| Prefer | Over |
|--------|------|
| One list + filters + bulk actions | Separate search, browse, and report pages |
| Status-driven workflows (PPDB: draft → verified → accepted) | Free-form tags and custom pipelines |
| Defaults per school type (SD/SMP/SMA) | Blank-slate configuration |
| Extend existing module | New micro-module for 2 fields |
| Read-only reporting domain | Write-back "smart reports" |

---

## Teknovo Module Taste Rules

### PPDB (Admissions)

- **Keep**: Registration, document verification, selection, announcement, re-registration — the spine.
- **Cut**: Gamification, social sharing widgets, "AI essay scoring" unless contractually sold.
- **Simplify**: One applicant detail page with tabs (Data, Dokumen, Status, Riwayat) — not five routes.

### Finance

- **Keep**: Tagihan, pembayaran, kuitansi, tunggakan, cash book — money in/out with audit trail.
- **Cut**: Predictive "AI revenue forecasting" on v1; multi-currency unless international school.
- **Simplify**: Payment recording in ≤3 clicks from student search.

### Academic

- **Keep**: Kelas, jadwal, absensi, nilai, rapor — operational daily tools.
- **Cut**: Parent social feed, redundant grade visualizations.
- **Simplify**: Absensi = class roster + one tap per student; not a separate "attendance dashboard."

### CBT

- **Keep**: Bank soal, jadwal ujian, attempt, hasil — integrity and immutability.
- **Cut**: Real-time "leaderboard" during exam; proctoring theater without legal requirement.
- **Simplify**: Teacher publishes exam → students see one "Ujian Aktif" entry point.

### Communication (WA)

- **Keep**: Template, campaign, delivery status — schools need reliable broadcast.
- **Cut**: Chatbot builder, multi-channel inbox clone — scope creep.
- **Simplify**: Campaign = pick template + audience + send; advanced segmentation in v2.

### Reporting

- **Keep**: Read models, PDF export, scheduled reports — **no write-back**.
- **Cut**: "Build your own chart" drag-drop BI for school admins.
- **Simplify**: Curated report catalog; parameters, not canvas.

---

## Scope Negotiation Script

When stakeholders ask for more:

1. **Name the user** — "Which role, which day, which task?"
2. **Name the alternative** — "Can they do this today with list + filter + export?"
3. **Name the cost** — "This adds nav item, RBAC permission, tests, training, support."
4. **Offer the smaller yes** — "We ship X now; Y if usage proves need in 90 days."

---

## Cross-References

| Document | Relationship |
|----------|--------------|
| `.cursor/gates/quality/product-principles.md` | Quality bar after taste approves scope |
| `.cursor/gates/taste/taste-gates.md` | Gate 1 — Product Taste |
| `.cursor/gates/taste/taste-checklist.md` | Removal and simplification questions |
| `agents/taste-reviewer.md` | Active removal suggestions |
| `docs/prd/master/master-prd.md` | Source requirements — taste filters PRD items |

---

## Design Director Sign-Off

Product taste passes when:

- [ ] Persona and outcome named in one sentence
- [ ] Removal test written; absence would hurt a real workflow
- [ ] v2 items explicitly deferred, not hidden in v1
- [ ] No new top-level nav unless IA review confirms depth ≤ 3
- [ ] Chief Product Designer (Pillar 1) agrees scope is minimal viable

**If in doubt, ship less.**
