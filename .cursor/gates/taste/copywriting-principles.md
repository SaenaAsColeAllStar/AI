# Copywriting Taste — Teknovo Taste System

> **Layer**: Taste (judgement & restraint)  
> **Role**: Design director filter on *what we call things*  
> **Locale**: Bahasa Indonesia primary; English for dev docs and API identifiers only

---

## Purpose

Copy is interface. Bad labels force training; jargon erodes trust with school staff who are not "users" in a SaaS pitch — they are **guru, tata usaha, bendahara, kepala sekolah**.

Copywriting taste demands **clear, short, action-oriented, human** language. Every label, toast, error, and empty state is a product decision.

---

## Prefer

| Principle | Good (ID) | Why |
|-----------|-----------|-----|
| **Clear** | "Simpan perubahan" | Not "Apply configuration" |
| **Short** | "Hapus" | Not "Hapus data permanen dari sistem" on button |
| **Action-oriented** | "Tambah siswa" | Not "Manajemen entitas siswa" |
| **Human** | "Tagihan belum lunas" | Not "Status pembayaran: UNPAID" |
| **Specific** | "3 dokumen ditolak" | Not "Beberapa masalah ditemukan" |
| **Calm errors** | "Gagal menyimpan. Periksa koneksi lalu coba lagi." | Not "Error 500: Internal server exception" |

### Button labels

- Primary: verb + object — **Simpan**, **Kirim**, **Terima pembayaran**, **Verifikasi dokumen**
- Destructive: explicit — **Hapus siswa**, **Batalkan tagihan** (with confirm)
- Secondary: **Batal**, **Kembali**, **Unduh PDF**

### Navigation (sidebar)

Use school-familiar terms:

| Use | Avoid |
|-----|-------|
| PPDB | "Modul admisi digital" |
| Keuangan | "Financial management suite" |
| Absensi | "Attendance tracking system" |
| Rapor | "Report card engine" |
| Pengaturan | "Configuration center" |

### Status labels

PPDB: `Menunggu verifikasi`, `Diterima`, `Ditolak`  
Finance: `Lunas`, `Belum bayar`, `Sebagian`  
CBT: `Belum mulai`, `Sedang ujian`, `Selesai`

Sentence case for labels; title case only for proper nouns (PPDB, NISN).

---

## Avoid

### Corporate jargon

| Avoid | Use instead |
|-------|-------------|
| "Leverage synergies" | — (delete the feature) |
| "Optimize workflow efficiency" | "Lebih cepat catat absensi" |
| "Stakeholder alignment" | Internal docs only |
| "Onboarding journey" | "Daftar sekolah baru" |

### Marketing fluff

- No "powerful", "seamless", "cutting-edge", "next-generation" in admin UI.
- Landing page (`teknovo-landing-page` skill) may persuade; **ERP interior must instruct**.

### Buzzwords

| Avoid | Context |
|-------|---------|
| "AI-powered" | Unless feature is literally ML — then explain what it does |
| "Smart dashboard" | Say what it shows |
| "Insights" | Name the metric |
| "Portal" | Use module name unless technical route |
| "Solution" | Never in button or nav |

### Generic AI wording

Reject copy that sounds LLM-generated:

- "Selamat datang di dashboard intuitif Anda!"
- "Temukan wawasan berharga dengan satu klik"
- "Tingkatkan produktivitas tim Anda hari ini"
- Emoji bullets in admin settings

Replace with **task + outcome**: "Catat pembayaran siswa" / "Lihat pendaftar hari ini."

---

## Indonesian Context (Teknovo ERP)

### Audience literacy

- Assume varied digital literacy; avoid English abbreviations without expansion on first use.
- **NISN**, **NPSN** — OK with tooltip on first encounter.
- Parent-facing PPDB copy: simpler sentences; avoid passive voice.

### Formal vs informal

- Admin UI: **formal Indonesian** (Anda optional; prefer direct imperatives: "Pilih kelas").
- Student/parent portals: warm but clear — no slang.
- Legal/announcement text: formal; support review for PPDB pengumuman.

### Numbers and currency

- Rp 1.500.000 ( Indonesian grouping )
- Dates: **20 Jun 2026** or **20/06/2026** — consistent per locale setting
- Phone: +62 format in display

### Error messages (staff)

```text
Bad:  "Validation failed: applicantId required"
Good: "Pendaftar tidak ditemukan. Refresh halaman atau hubungi admin."

Bad:  "Insufficient permission"
Good: "Anda tidak punya akses untuk mengubah tagihan. Hubungi bendahara."
```

Map RBAC denial to **role name** when helpful.

### Empty states (examples)

| Module | Copy |
|--------|------|
| PPDB | "Belum ada pendaftar. Bagikan link PPDB ke calon siswa." CTA: **Salin link** |
| Finance | "Belum ada tagihan bulan ini." CTA: **Buat tagihan** |
| Academic | "Belum ada jadwal untuk kelas ini." CTA: **Atur jadwal** |

---

## Microcopy Patterns

### Toasts

- Success: "[Object] tersimpan" — **Pembayaran tercatat**
- Error: Problem + action — **Gagal mengirim WA. Coba lagi nanti.**
- Never: "Success!" alone

### Confirm dialogs

```text
Title: Hapus tagihan?
Body: Tagihan untuk [Nama Siswa] — [Periode] akan dihapus. 
      Tindakan ini tidak bisa dibatalkan.
Actions: [Batal] [Hapus tagihan]
```

### Form hints

- One line max under field
- Example: NISN hint — "10 digit, cek di kartu siswa"

### Loading

- "Memuat data siswa…" — specific
- Not: "Loading…" alone on full page

---

## API vs UI Copy

| Layer | Language |
|-------|----------|
| API field names | English camelCase (`applicantStatus`) |
| API error codes | English snake (`APPLICANT_NOT_FOUND`) |
| UI display | Indonesian via i18n map |
| Developer docs | English |

Never expose raw error codes to school staff.

---

## Cross-References

| Document | Relationship |
|----------|--------------|
| `.cursor/gates/taste/ux-principles.md` | Label placement and hierarchy |
| `.cursor/gates/taste/product-principles.md` | Feature naming scope |
| `.cursor/gates/quality/ux-principles.md` | a11y includes readable copy |
| `.cursor/gates/taste/taste-gates.md` | Gate 5 — Copywriting Taste |

---

## Design Director Sign-Off

Copywriting taste passes when:

- [ ] All user-visible strings reviewed in Indonesian
- [ ] No jargon, buzzwords, or AI-fluff in admin UI
- [ ] Buttons are verb-first; errors suggest next step
- [ ] Status enums have human-readable labels
- [ ] Empty states have one CTA, one sentence

**If you wouldn't say it to a guru in the staff room, don't put it in the UI.**
