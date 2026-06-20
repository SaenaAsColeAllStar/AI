# UX Taste — Teknovo Taste System

> **Layer**: Taste (judgement & restraint) — precedes `.cursor/gates/quality/ux-principles.md`  
> **Role**: Design director filter on *how little interface* achieves the task  
> **Sources**: `.cursor/docs/memory/ui-ux-rules.md`, `.cursor/gates/quality/design-taste.md`, Teknovo sidebar IA

---

## Purpose

UX taste optimizes for **task completion speed** and **cognitive calm**, not feature discoverability. School staff use Teknovo between classes, on phones, under pressure. Every extra click, modal, and choice is a tax on real work.

Quality verifies page states and accessibility; **taste rejects the interface patterns that should never be drawn**.

---

## Evaluate Every Screen

| Dimension | Taste question | Pass |
|-----------|----------------|------|
| **Information hierarchy** | Is the primary action obvious in 2 seconds? | One hero action; secondary muted |
| **Navigation simplicity** | Can user reach this in ≤3 sidebar clicks? | Yes, or flatten IA |
| **Task speed** | Fewer steps than paper process? | Measure clicks; target ≤5 for core flows |
| **Cognitive load** | ≤7 visible decisions on screen? | Collapse advanced; progressive disclosure |
| **Mobile** | Usable on 390px without horizontal scroll? | Touch targets ≥44px; no hover-only actions |

---

## Reject: UX Anti-Patterns

### Deep nesting

```text
Akademik → Kelas → Detail → Siswa → Absensi → Input
```

Five levels for daily absensi is unacceptable. **Correct**: Akademik → Absensi (class picker inline) → mark present.

### Confusing navigation

| Anti-pattern | Teknovo fix |
|--------------|-------------|
| Same label in two modules ("Laporan") | Prefix with domain: "Laporan Keuangan", "Laporan Akademik" |
| Settings scattered (user prefs vs school config) | Single **Pengaturan** with clear sections |
| Hidden admin tools in student-facing paths | RBAC + route guard; never show disabled mystery links |

### Too many actions / choices

- **Toolbar rule**: Max **3** primary actions visible; rest in `⋯` menu.
- **Filter rule**: Show 3 common filters; "Filter lanjutan" drawer for the rest.
- **Bulk rule**: One bulk bar when rows selected — not per-row action explosion.

### Unnecessary modals

| Use modal | Use inline / drawer / dedicated page |
|-----------|--------------------------------------|
| Confirm destructive (hapus siswa, void payment) | — |
| Quick edit of 1–2 fields | — |
| — | Multi-step forms (PPDB registration) |
| — | Document preview |
| — | Table with sorting/pagination |

**Rule**: If the modal scrolls, it should be a page.

### Empty dashboard syndrome

Home/dashboard shows 8 widgets, all empty for new schools → shame and confusion.  
**Prefer**: Empty state with **one** CTA ("Tambah siswa pertama", "Buat tagihan").

---

## Prefer: Task-First Layouts

### PageShell discipline

Every authenticated page uses `PageShell`:

```text
[Breadcrumb — max 3 segments]
[Title + optional badge]
[Primary action — right]
[Content: table | form | detail]
```

No decorative hero bands on admin pages.

### Sidebar IA (Teknovo)

| Rule | Limit |
|------|-------|
| Top-level groups | ≤8 (Beranda, PPDB, Akademik, Keuangan, CBT, Komunikasi, Laporan, Pengaturan) |
| Nesting depth | ≤2 expandable levels |
| Icons | Phosphor only; one icon per item; no icon-only nav without tooltip |
| Active state | Left border + subtle background — not neon |

### Lists over cards

For ERP data (siswa, tagihan, peserta PPDB): **data table** with row actions.  
Cards only for: Beranda summary (≤4), landing page marketing.

### Forms

- Single column on mobile; two columns desktop only for short paired fields (NIS/NISN).
- **Simpan** sticky footer on long forms — not modal "Save?"
- Validation inline at blur; summary at submit.

---

## Teknovo Flow Taste

### PPDB — Verifikasi dokumen

**Bad**: Dashboard → PPDB → Pendaftar → Filter → Row → Modal dokumen → Modal approve  
**Good**: PPDB → Pendaftar (filter: Menunggu verifikasi) → Detail side panel → Setujui/Tolak

### Finance — Catat pembayaran

**Bad**: Keuangan → Dashboard → Tagihan → Cari → Detail → Modal bayar → Konfirmasi → Modal sukses  
**Good**: Keuangan → Terima Pembayaran → Cari siswa → Amount + metode → Simpan (toast)

### Academic — Absensi harian

**Bad**: Separate "Absensi dashboard" + "Input absensi" + "Rekap absensi" in nav  
**Good**: Akademik → Absensi → pick class/date → grid tap → auto-save

### RBAC-aware UX

- Hide nav items user cannot access — do not show locked teasing items.
- Permission-denied = full **Permission** page state, not toast-only failure.
- Action buttons absent when no permission — not disabled with mystery tooltip.

---

## Mobile Taste (Indonesia context)

- Many staff use mid-range Android; assume slow 3G occasionally.
- Prefer server-driven lists with pagination over infinite heavy client bundles.
- WhatsApp deep links for parent-facing flows where applicable — don't force app install for one task.
- Date/time: WIB default; clear locale formatting (DD/MM/YYYY).

---

## Cross-References

| Document | Relationship |
|----------|--------------|
| `.cursor/gates/quality/ux-principles.md` | Page states, a11y, formal UX bar |
| `.cursor/gates/quality/design-taste.md` | Visual anti-patterns |
| `.cursor/docs/memory/ui-ux-rules.md` | Tokens, typography, components |
| `.cursor/gates/taste/design-principles.md` | Visual restraint |
| `.cursor/gates/taste/taste-gates.md` | Gate 2 — UX Taste |

---

## Design Director Sign-Off

UX taste passes when:

- [ ] Primary task reachable in ≤3 nav clicks
- [ ] ≤3 visible primary actions per view
- [ ] No modal for multi-step work
- [ ] All 5 page states designed (Loading, Empty, Error, Success, Permission) — quality verifies implementation
- [ ] Mobile layout reviewed at 390px
- [ ] `teknovo-ui-ux-specialist` confirms IA depth ≤3

**When UX and feature count conflict, reduce features.**
