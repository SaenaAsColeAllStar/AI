# Teknovo AI Workstation — Compatibility Report

> **Template** — This file is overwritten at install time by `.cursor/runtime/bootstrap/compatibility.sh`.

**Generated**: _pending install_  
**Host**: _unknown_  
**Repository**: _unknown_

---

## Summary

| Check | Status | Detail |
|-------|--------|--------|
| OS | PENDING | Run `bash .cursor/runtime/bootstrap/install.sh` |
| RAM | PENDING | Minimum 16 GB |
| Disk (free) | PENDING | Minimum 50 GB |
| Python | PENDING | Minimum 3.10 |
| Node.js | PENDING | Minimum 18 |
| GPU | PENDING | Optional — NVIDIA recommended |

---

## Overall

**Result**: PENDING — run installer to generate live report

## Minimum Requirements

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| OS | Linux (Ubuntu 22.04/24.04) | Clore Cloud GPU servers |
| RAM | 16 GB | Qwen 32B inference |
| Disk (free) | 50 GB | Model ~20GB + dependencies |
| Python | 3.10+ | Memory loader, YAML validation |
| Node.js | 18+ | OpenCode CLI |
| Ollama model | qwen3:32b | Pinned in `.cursor/runtime/bootstrap/install.lock.yaml` |
| GPU | Optional | CPU fallback with performance warning |

## GPU Details

_Populated after compatibility check._
