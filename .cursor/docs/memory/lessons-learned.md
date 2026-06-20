# Lessons Learned — Teknovo AI Workstation

> **Source**: `AI_DEPLOY.md`, `.cursor/docs/ai/repository-analysis.md`, `.cursor/docs/ai/AI_ROADMAP.md`, integration gaps  
> **Last updated**: 2026-06-20  
> **Refresh policy**: Append on new incidents; review after deploy failures

---

## Scope Note

This AI SuperStack repo documents the **Ollama + OpenCode + Qwen** workstation stack. It does **not** contain first-hand logs for CUDA, PyTorch, vLLM, or Qdrant failures — those stacks were **explicitly not chosen** for the Teknovo workstation (see architecture decision: Ollama over vLLM).

Lessons below are extracted from **documented** sources in this repository. Items marked `[EXTERNAL]` are common industry patterns noted for agent awareness when users attempt alternate stacks — not Teknovo-validated incidents.

---

## 1. GPU Workstation Recovery (Documented)

### Issue: GPU cloud instance expires — full environment lost

**Source**: `AI_DEPLOY.md` § Recovery After GPU Expires

**Symptoms**:
- Ollama not running
- Models not pulled
- OpenCode not configured

**Root cause**: Ephemeral GPU rental; local state not persisted outside Git.

**Solution** (10–15 minute restore):

```bash
git clone git@github.com:SaenaAsColeAllStar/teknovo.git
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull qwen3:32b
npm install -g opencode-ai
cd teknovo && opencode
```

**Lesson**: Keep AGENTS.md, skills, docs, and architecture in GitHub — never only on GPU disk. AI SuperStack repo is the recovery source of truth.

---

## 2. Ollama Not Listening

### Issue: OpenCode cannot reach model

**Source**: `AI_DEPLOY.md` § Start Ollama

**Symptoms**: Connection refused to `127.0.0.1:11434`

**Cause**: `ollama serve` not running

**Solution**:
1. Start `ollama serve` in background
2. Verify: `curl http://127.0.0.1:11434/api/tags`
3. Confirm `qwen3:32b` in model list

**Prevention**: Health check endpoint planned for M4 roadmap.

---

## 3. OpenCode Provider Misconfiguration

### Issue: Wrong base URL or model name

**Source**: `AI_DEPLOY.md` § Configure OpenCode

**Symptoms**: OpenCode fails to generate; wrong model loaded

**Cause**: Missing or incorrect `~/.config/opencode/opencode.jsonc`

**Solution**: Use OpenAI-compatible provider pointing to Ollama:

```json
{
  "provider": {
    "ollama-local": {
      "npm": "@ai-sdk/openai-compatible",
      "options": { "baseURL": "http://127.0.0.1:11434/v1" },
      "models": { "qwen3:32b": {} }
    }
  },
  "model": "ollama-local/qwen3:32b"
}
```

---

## 4. Skills Not Available in Teknovo-V2

### Issue: Agent sessions lack Teknovo skills when working in application repo

**Source**: `.cursor/docs/ai/repository-analysis.md` § Integration Gaps

**Symptoms**: Agent ignores Three Pillars gates; missing domain skills

**Cause**: `.cursor/` not symlinked/copied from AI repo into Teknovo-V2

**Solution**:
```bash
cp -r ai/.agents Teknovo-V2/.agents
cp ai/AGENTS.md Teknovo-V2/
# OR: ln -s ../ai/.agents Teknovo-V2/.agents
```

**Status**: Known gap — manual deployment required.

---

## 5. No Automated Skill Trigger Detection

### Issue: Wrong skills loaded for user intent

**Source**: `.cursor/docs/ai/repository-analysis.md` § Integration Gaps

**Cause**: Manual trigger matching via `registry.yaml`; no intent classifier

**Mitigation**: Agents must read `registry.yaml` triggers explicitly. Future: M3 local LLM integration with skill bootstrap hook.

---

## 6. Playwright Container Not Configured

### Issue: E2E browser tests cannot run in CI

**Source**: `.cursor/docs/ai/AI_ROADMAP.md` M2

**Status**: Planned — Docker Compose profile for Playwright + PostgreSQL test DB

**Workaround**: Run Playwright locally via `gstack-browser-testing` skill until M2 complete.

---

## 7. Ollama/Qwen Not Wired to Registry Autoload

### Issue: OpenCode sessions don't auto-load skills at start

**Source**: `.cursor/docs/ai/repository-analysis.md`, `AI_ROADMAP.md` M3

**Status**: Planned Q4 2026 — OpenCode config with skill bootstrap hook, Redis session cache

**Workaround**: Manually read `AGENTS.md` and autoload skills from registry each session. Use `.cursor/runtime/load-memory.py` for memory context injection.

---

## 8. Deployment Failures — Cloudflare & Infrastructure

### Issue: Services exposed on public ports

**Source**: `teknovo-cloudflare-stack` anti-patterns

**Cause**: Binding to `0.0.0.0` instead of localhost + tunnel

**Solution**:
- Bind all services to `127.0.0.1`
- Route via Cloudflare Tunnel ingress rules
- Never commit tunnel credentials to git

### Issue: R2 credentials leaked to frontend

**Cause**: Direct upload credentials in client code

**Solution**: Presigned URLs via backend (5 min max expiry)

### Issue: Missing edge security headers

**Solution**: Configure via Cloudflare Transform Rules or middleware (HSTS, CSP, X-Frame-Options)

---

## 9. CUDA / PyTorch / vLLM Incompatibilities [EXTERNAL — Not Teknovo Stack]

> **Not documented in this repo as experienced failures.** Teknovo AI workstation uses **Ollama**, which bundles its own runtime and avoids manual CUDA/Torch pinning.

If users attempt vLLM instead of Ollama, common industry issues include:

| Issue | Typical Cause | Typical Solution |
|-------|---------------|------------------|
| CUDA version mismatch | PyTorch built for CUDA 11.x, driver has 12.x | Match PyTorch/CUDA/driver versions explicitly |
| Torch conflict | Multiple torch installs (pip + conda) | Single virtualenv; `pip uninstall torch` clean reinstall |
| vLLM build failure | vLLM version incompatible with CUDA/torch combo | Use official vLLM Docker image with pinned versions |
| OOM on 24GB GPU | 32B model without quantization | Use AWQ/GPTQ quant or smaller model; Ollama handles this via pull variants |

**Teknovo recommendation**: Stay on Ollama + `qwen3:32b` per `.cursor/runtime/bootstrap/install.lock.yaml` and `AI_DEPLOY.md`. Do not introduce vLLM to workstation unless Architecture Impact Analysis approves stack change.

---

## 10. Qdrant Incompatibilities [EXTERNAL — Not in Teknovo Stack]

> **Qdrant is not part of the Teknovo AI SuperStack.** This repo uses markdown memory files (`.cursor/docs/memory/`) and skill registry — not vector databases.

If integrating Qdrant for other projects, common issues:

| Issue | Cause | Solution |
|-------|-------|----------|
| Client/server version mismatch | qdrant-client 1.x vs server 0.x | Pin matching versions |
| gRPC vs REST confusion | Wrong port or protocol | Use documented REST `:6333` or gRPC `:6334` |
| Collection dimension mismatch | Embedding model change | Recreate collection with new vector size |

**Teknovo approach**: Use `.cursor/docs/memory/memory-registry.yaml` + `load-memory.py` for structured context, not Qdrant.

---

## 11. Failed npm Global Install (OpenCode)

### Issue: `opencode-ai` not found after install

**Source**: `AI_DEPLOY.md`

**Cause**: npm global bin not in PATH

**Solution**:
```bash
npm install -g opencode-ai
which opencode  # verify PATH
opencode --version  # expect 1.17.x
```

---

## 12. GitHub SSH Clone Failures

### Issue: Cannot clone teknovo repo

**Source**: `AI_DEPLOY.md` § Setup GitHub SSH

**Cause**: SSH key not added to GitHub account

**Solution**:
```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub  # add to GitHub → Settings → SSH Keys
git clone git@github.com:SaenaAsColeAllStar/teknovo.git
```

---

## 13. Production Deploy Without QA Evidence

### Issue: Regression in staging/production

**Source**: `teknovo-devops-engineer` skill — forbidden actions

**Cause**: Skipped Pillar 3 Deployment Impact Analysis or QA phase

**Solution**: Enforce gate order — QA evidence required before ship. Load `gstack-qa`, `gstack-browser-testing`, `superpowers-verification-before-completion`.

---

## Lesson Capture Template

When new lessons occur, append using this format:

```markdown
### Issue: [Short title]
**Date**: YYYY-MM-DD
**Source**: [session/incident/doc]
**Symptoms**: ...
**Root cause**: ...
**Solution**: ...
**Prevention**: ...
```

Also add session summary to `.cursor/docs/memory/sessions/YYYY-MM-DD-<topic>.md`.

---

## Quick Reference: What To Use Instead

| Avoid | Use (Teknovo) |
|-------|---------------|
| vLLM + manual CUDA | Ollama (`AI_DEPLOY.md`) |
| Qdrant vector memory | `.cursor/docs/memory/` + `load-memory.py` |
| Lucide icons | Phosphor Icons (primary) |
| Public DB/API ports | Cloudflare Tunnel + 127.0.0.1 |
| Hard deletes | Soft delete via `deleted_at` |
| Cross-repo DB queries | Domain events (BullMQ) |
