#!/usr/bin/env python3
"""
Teknovo Memory Refresh Helpers

Regenerates auto-refreshable memory artifacts (primarily repository-map.md).
Called by scripts/refresh-memory.sh and scripts/refresh-memory.ps1
"""

from __future__ import annotations

import argparse
import os
from datetime import date
from pathlib import Path


SKIP_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    ".cursor",
}


def find_repo_root(start: Path | None = None) -> Path:
    current = (start or Path(__file__)).resolve()
    if current.is_file():
        current = current.parent
    for candidate in [current, *current.parents]:
        if (candidate / "memory" / "memory-registry.yaml").exists():
            return candidate
        if (candidate / "AGENTS.md").exists():
            return candidate
    return Path(__file__).resolve().parents[2]


def scan_tree(root: Path, max_depth: int = 4) -> list[str]:
    lines: list[str] = []

    def walk(dir_path: Path, prefix: str, depth: int) -> None:
        if depth > max_depth:
            return
        try:
            entries = sorted(
                [e for e in dir_path.iterdir() if e.name not in SKIP_DIRS],
                key=lambda e: (not e.is_dir(), e.name.lower()),
            )
        except PermissionError:
            return

        for i, entry in enumerate(entries):
            is_last = i == len(entries) - 1
            connector = "└── " if is_last else "├── "
            if entry.is_dir():
                lines.append(f"{prefix}{connector}{entry.name}/")
                extension = "    " if is_last else "│   "
                walk(entry, prefix + extension, depth + 1)
            else:
                lines.append(f"{prefix}{connector}{entry.name}")

    lines.append(f"{root.name}/")
    walk(root, "", 1)
    return lines


def count_skills(skills_root: Path) -> dict[str, int]:
    counts = {"superpowers": 0, "gstack": 0, "teknovo": 0, "total": 0}
    if not skills_root.is_dir():
        return counts
    for category in skills_root.iterdir():
        if not category.is_dir():
            continue
        skill_count = sum(1 for p in category.iterdir() if p.is_dir() and (p / "SKILL.md").exists())
        if category.name == "superpowers":
            counts["superpowers"] = skill_count
        elif category.name == "gstack":
            counts["gstack"] = skill_count
        elif category.name.startswith("teknovo-"):
            counts["teknovo"] += 1
        counts["total"] += skill_count if category.name in ("superpowers", "gstack") else 0
    # teknovo-* are individual dirs at skills root level
    counts["teknovo"] = sum(
        1 for p in skills_root.iterdir()
        if p.is_dir() and p.name.startswith("teknovo-") and (p / "SKILL.md").exists()
    )
    counts["total"] = (
        counts["superpowers"] + counts["gstack"] + counts["teknovo"]
    )
    return counts


def generate_repository_map(repo_root: Path) -> str:
    today = date.today().isoformat()
    tree_lines = scan_tree(repo_root, max_depth=3)
    tree_block = "\n".join(tree_lines)

    skills_root = repo_root / ".cursor" / "skills"
    counts = count_skills(skills_root)

    memory_files = sorted(p.name for p in (repo_root / "memory").glob("*.md")) if (repo_root / "memory").is_dir() else []
    doc_files = sorted(p.name for p in (repo_root / "docs" / "ai").glob("*.md")) if (repo_root / "docs" / "ai").is_dir() else []

    return f"""# Repository Map — Teknovo AI SuperStack

> **Auto-regeneratable**: Run `scripts/refresh-memory.sh` or `scripts/refresh-memory.ps1` to rebuild this file from live repository structure.
> **Last generated**: {today}
> **Source**: Live scan of `{repo_root}`

---

## Overview

| Repository | Role | GitHub |
|------------|------|--------|
| **AI SuperStack** (this repo) | Agent skills, rules, memory, AI docs | `SaenaAsColeAllStar/AI` |
| **Teknovo-V2** (target) | Production PNPM monorepo application | `SaenaAsColeAllStar/teknovo` |

---

## 1. Live Folder Structure (Depth 3)

```text
{tree_block}
```

---

## 2. Package Structure (This Repo)

This repository has **no application packages** (no root `package.json`). Configuration-only.

| Artifact Type | Location | Count |
|---------------|----------|-------|
| Skill definitions | `.cursor/skills/**/SKILL.md` | {counts["total"]} |
| Superpowers skills | `.cursor/skills/superpowers/` | {counts["superpowers"]} |
| GStack skills | `.cursor/skills/gstack/` | {counts["gstack"]} |
| Teknovo skills | `.cursor/skills/teknovo-*/` | {counts["teknovo"]} |
| AI documentation | `.cursor/docs/ai/` | {len(doc_files)} |
| Memory artifacts | `.cursor/docs/memory/` | {len(memory_files)} |

### Memory Files

{chr(10).join(f"- `{f}`" for f in memory_files) or "- (none)"}

### AI Documentation Files

{chr(10).join(f"- `{f}`" for f in doc_files) or "- (none)"}

---

## 3. Target Application Structure (Teknovo-V2)

> Reference layout — lives in Teknovo-V2 repo, not scanned here.

```text
Teknovo-V2/
├── .cursor/
├── apps/portal/                 # Nuxt.js web application
├── packages/ui/                 # Shared UI components
├── docs/                        # ADRs, PRDs, standards
├── drizzle/                     # Migrations
├── pnpm-workspace.yaml
└── package.json
```

---

## 4. Shared Package Structure (Teknovo-V2)

```text
packages/ui/src/components/<domain>/   # Shared UI only
```

---

## 5. Subdomain Architecture (Teknovo-V2 Production)

| Subdomain | Purpose | Port |
|-----------|---------|------|
| `portal.domain.sch.id` | Public landing, admissions | 3000 |
| `ppdb.domain.sch.id` | Student admission | 3000 |
| `erp.domain.sch.id` | Core ERP | 3000 |
| `cbt.domain.sch.id` | Computer-based testing | 3000 |
| `finance.domain.sch.id` | Billing, payments | 3000 |
| `wa.domain.sch.id` | WhatsApp gateway | 4001 |
| `api.domain.sch.id` | REST API `/api/v1` | 4000 |

---

## 6. Database Schemas (Teknovo-V2)

`auth` · `student` · `academic` · `finance` · `cbt` · `wa` · `ppdb` · `audit` · `master` · `system`

---

## Regeneration Notice

This file is **automatically regeneratable**. Run:

```bash
python .cursor/runtime/refresh_helpers.py --repo-map-only
# or
./scripts/refresh-memory.sh
```
"""


def refresh_repository_map(repo_root: Path) -> Path:
    output_path = repo_root / "memory" / "repository-map.md"
    content = generate_repository_map(repo_root)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    return output_path


def update_registry_timestamp(repo_root: Path) -> None:
    registry_path = repo_root / "memory" / "memory-registry.yaml"
    if not registry_path.exists():
        return
    text = registry_path.read_text(encoding="utf-8")
    today = date.today().isoformat()
    if "last_updated:" in text:
        lines = []
        for line in text.splitlines():
            if line.startswith("last_updated:"):
                lines.append(f'last_updated: "{today}"')
            else:
                lines.append(line)
        registry_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh Teknovo memory artifacts")
    parser.add_argument("--repo-root", type=Path, default=None)
    parser.add_argument("--repo-map-only", action="store_true", help="Regenerate repository-map.md only")
    parser.add_argument("--update-registry-ts", action="store_true", default=True)
    args = parser.parse_args()

    repo_root = args.repo_root or find_repo_root()
    os.chdir(repo_root)

    path = refresh_repository_map(repo_root)
    print(f"Regenerated: {path}")

    if args.update_registry_ts:
        update_registry_timestamp(repo_root)
        print(f"Updated registry timestamp")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
