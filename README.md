# Teknovo AI SuperStack

Enterprise-grade autonomous AI development workstation for [Teknovo V2](https://github.com/SaenaAsColeAllStar/teknovo).

Combines [Superpowers](https://github.com/obra/superpowers) methodology, [GStack](https://github.com/garrytan/gstack) sprint operations, and Teknovo architectural standards into a unified agent skill system.

**COLEALLSTAR × TEKNOVO AI Workstation** — one-command bootstrap for Clore Cloud GPU servers. See [Setup dari Clore Cloud](#setup-dari-clore-cloud-clore-cloud-setup) below.

---

## Structure

```text
Teknovo AI SuperStack
├── Teknovo Rules (AGENTS.md, PRD, ADR, Database, UI/UX Standards)
├── Superpowers (11 skills — brainstorming, planning, TDD, debugging, code-review)
├── GStack (6 skills — office-hours, eng-review, qa, ship, retro, browser-testing)
├── Teknovo Skills (13 skills — rbac, database, api, security, ui-ux, backend, domain)
└── Runtime (Ollama, OpenCode, Qwen 32B, Repository Awareness)
```

---

## Quick Start

### Setup dari Clore Cloud (Clore Cloud Setup)

Panduan lengkap instalasi **COLEALLSTAR × TEKNOVO AI Workstation** dari nol — mulai membuat instance Clore Cloud hingga stack AI siap dipakai.

> **Ringkasan**: buat instance GPU → SSH masuk → clone repo → `bash bootstrap/install.sh` → verifikasi → `opencode`

---

#### 1. Membuat Instance di Clore Cloud

1. **Buat akun / login** di [Clore Cloud](https://clore.ai) (atau panel penyedia GPU yang Anda gunakan).
2. **Pilih GPU instance** dengan spesifikasi minimal:

   | Resource | Minimum | Direkomendasikan |
   |----------|---------|------------------|
   | RAM | 16 GB | 32 GB+ |
   | Disk | 50 GB free | 80 GB+ |
   | GPU VRAM | ~20 GB | NVIDIA RTX 3090 / A5000 / A6000 atau lebih baik |

   Model `qwen3:32b` (pinned in `bootstrap/install.lock.yaml`) membutuhkan ~20 GB VRAM untuk inferensi GPU yang nyaman. Tanpa GPU, Ollama fallback ke CPU (jauh lebih lambat).

3. **Pilih image / Docker template**:

   ```text
   nvidia/cuda:12.4.1-devel-ubuntu22.04
   ```

   Image ini = **Ubuntu 22.04 + CUDA 12.4.1 (devel)** — selaras dengan `bootstrap/install.lock.yaml` (`os: ubuntu-22.04`).

4. **Konfigurasi akses**:
   - Buka port **22 (SSH)** — default untuk akses terminal.
   - Catat **IP publik** dan **kredensial SSH** dari dashboard Clore (username biasanya `clore` atau sesuai template).

5. **Connect via SSH** dari mesin lokal:

   ```bash
   ssh clore@<server-ip>
   ```

   Ganti `clore` jika dashboard menampilkan username berbeda. Pertama kali: terima fingerprint host (`yes`).

---

#### 2. Persiapan Server (first boot)

Setelah SSH masuk, jalankan persiapan dasar sebelum instalasi workstation:

```bash
# Update paket sistem
sudo apt update && sudo apt upgrade -y

# Verifikasi GPU terdeteksi
nvidia-smi

# Verifikasi CUDA toolkit (harus 12.4.x)
nvcc --version

# Install git jika belum ada
sudo apt install -y git

# Clone repository AI SuperStack
git clone https://github.com/SaenaAsColeAllStar/AI.git
cd AI
```

**Yang diharapkan**:

| Perintah | Output yang benar |
|----------|-------------------|
| `nvidia-smi` | Daftar GPU NVIDIA + driver version |
| `nvcc --version` | `Cuda compilation tools, release 12.4` |
| `ls` | Folder `bootstrap/`, `AGENTS.md`, `.agents/`, dll. |

Laporan kompatibilitas otomatis ditulis ke `docs/ai/compatibility-report.md` saat installer berjalan.

---

#### 3. Instalasi AI Workstation (one command)

Dari root repo (`cd AI`):

```bash
bash bootstrap/install.sh

# Resume setelah gagal
bash bootstrap/install.sh --recover

# Opsional: browser dev (code-server + Open WebUI)
INSTALL_BROWSER_DEV=1 bash bootstrap/install.sh --browser-dev
```

**Apa yang dilakukan `install.sh`** (orchestrator idempotent):

| Phase | Script | Fungsi |
|-------|--------|--------|
| Banner | `bootstrap/banner.sh` | Tampilan **COLEALLSTAR × TEKNOVO** |
| 0 | `bootstrap/preflight.sh` | Cek OS, RAM, disk, internet, container, GPU, Python, Node, Docker |
| 1 | `bootstrap/install-runtime.sh` | Git, curl, Node 22, Python 3.10+, PyYAML |
| 2 | `bootstrap/install-ollama.sh` | Ollama server + verifikasi API |
| 3 | `bootstrap/install-model.sh` | Pull model `qwen3:32b` (~20 GB; from lock file) |
| 4 | `bootstrap/install-opencode.sh` | OpenCode CLI + konfigurasi provider Ollama |
| 5 | `bootstrap/install-skills.sh` | Verifikasi skills, memory, taste, quality, security |
| 6 | `bootstrap/build-memory.sh` | Refresh artefak memory |
| 7 | `bootstrap/build-registries.sh` | Generate/validasi `registry/*.yaml` |
| 8–9 | _(repo)_ | Verifikasi MCP templates & dokumentasi |
| 10 | `bootstrap/verify.sh` | Gate verifikasi penuh |
| 12 | `bootstrap/status.sh` | Layar status akhir |

**Versi ter-pin** di `bootstrap/install.lock.yaml`:

```yaml
os: ubuntu-22.04
node: 22
python: 3.10
ollama: latest
model:
  qwen3:32b
opencode:
  version: 1.17.8
```

- **Idempotent** — aman dijalankan ulang setelah gagal atau saat instance GPU diganti.
- **Waktu estimasi**: 15–60 menit (tergantung bandwidth; download model dominan).
- **Log**: `.bootstrap/logs/install-YYYYMMDD-HHMMSS.log`

Detail tiap phase: **[AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)**

---

#### 4. Verifikasi

Setelah instalasi selesai tanpa error:

```bash
# Ollama API — harus return JSON dengan model tags
curl http://127.0.0.1:11434/api/tags

# Model ter-pull
ollama list
# Expected: qwen3:32b

# OpenCode CLI
opencode --version
# Expected: 1.17.8 (atau versi lock terbaru)

# Verifikasi gate penuh + status board
bash bootstrap/verify.sh
bash bootstrap/status.sh
```

Layar status akhir yang diharapkan:

```text
=================================
COLEALLSTAR
          X
TEKNOVO
=================================
✓ Runtime
✓ Python
✓ Node 22
✓ Git
✓ Ollama
✓ Model qwen3:32b
✓ OpenCode
✓ Registry
✓ Skills
✓ Memory
✓ Validation
AI WORKSTATION READY
```

**Mulai coding agent**:

```bash
cd ~/AI   # atau path clone Anda
opencode
```

Test prompt:

```text
Read AGENTS.md and summarize the 12-step workflow.
```

Expected model: `qwen3:32b` · Usage harian: **[AI_RUNTIME.md](AI_RUNTIME.md)**

---

#### 5. Recovery (GPU expiry / server baru)

Saat rental GPU Clore habis atau server di-rebuild:

```bash
git clone https://github.com/SaenaAsColeAllStar/AI.git
cd AI
bash bootstrap/install.sh
```

Installer akan melewati komponen yang sudah terpasang (Ollama, model, OpenCode) dan hanya menginstal ulang yang hilang. Waktu restore: **15–45 menit** (dominasi download model).

Panduan lengkap: **[AI_RECOVERY.md](AI_RECOVERY.md)**

---

#### 6. [PLANNED] Langkah manual (opsional)

Tidak diperlukan untuk menjalankan repo **AI SuperStack** itu sendiri. Diperlukan saat integrasi dengan produk Teknovo V2 atau MCP:

| Item | Alasan | Dokumentasi |
|------|--------|-------------|
| GitHub SSH key | Clone/push repo private Teknovo-V2 | [AI_DEPLOY.md](AI_DEPLOY.md) · [AI_RECOVERY.md](AI_RECOVERY.md) |
| MCP credentials | GitHub PAT, Cloudflare token (opsional) | `mcp/github/README.md` · `mcp/cloudflare/README.md` |
| Clone Teknovo V2 | Repo produk terpisah dari workstation | [AI_DEPLOY.md](AI_DEPLOY.md) |

```bash
# Contoh [PLANNED] — GitHub SSH
ssh-keygen -t ed25519 -C "workstation@clore" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# Tambahkan ke GitHub → Settings → SSH Keys
```

---

### Developer onboarding

1. Read `AGENTS.md` — master agent rules and 12-step workflow
2. Browse `.agents/registry.yaml` — skill autoload and triggers
3. See `docs/ai/AI_SKILLS_CATALOG.md` — complete skill index
4. Deploy to Teknovo-V2: copy or symlink `.agents/` and `AGENTS.md`
5. Runtime usage: [AI_RUNTIME.md](AI_RUNTIME.md) · deploy reference: [AI_DEPLOY.md](AI_DEPLOY.md) · bootstrap detail: [AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)

---

## Workflow

```text
Discovery → Planning → Architecture → Database → API → RBAC → UI → Tests → Code → Review → QA → Ship
```

Agents must never skip planning or generate code before analysis.

---

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | Master agent bootstrap |
| [docs/ai/repository-analysis.md](docs/ai/repository-analysis.md) | Repository and domain maps |
| [docs/ai/AI_ARCHITECTURE.md](docs/ai/AI_ARCHITECTURE.md) | System architecture |
| [docs/ai/AI_WORKFLOW.md](docs/ai/AI_WORKFLOW.md) | 12-phase workflow detail |
| [docs/ai/AI_SKILLS_CATALOG.md](docs/ai/AI_SKILLS_CATALOG.md) | All 30 skills indexed |
| [docs/ai/AI_AGENT_LIFECYCLE.md](docs/ai/AI_AGENT_LIFECYCLE.md) | Agent state machine |
| [docs/ai/AI_ROADMAP.md](docs/ai/AI_ROADMAP.md) | Milestone roadmap |
| [AI_BOOTSTRAP.md](AI_BOOTSTRAP.md) | One-command workstation install |
| [AI_RUNTIME.md](AI_RUNTIME.md) | Ollama, OpenCode, memory usage |
| [AI_RECOVERY.md](AI_RECOVERY.md) | GPU expiry recovery |
| [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) | Workstation architecture |
| [AI_DEPLOY.md](AI_DEPLOY.md) | Deployment reference |

---

## Skills Count

- **Superpowers**: 11 methodological skills
- **GStack**: 6 sprint-loop skills
- **Teknovo Enterprise**: 13 domain/architecture skills
- **Total**: 30 skills

---

## License

MIT — fork, improve, make it yours.
