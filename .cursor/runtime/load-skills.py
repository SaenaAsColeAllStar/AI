#!/usr/bin/env python3
"""
Teknovo Skill Loader

Resolves skills from .cursor/registry/skill-registry.yaml by trigger keywords, bundles,
or explicit skill IDs. Complements .cursor/runtime/load-memory.py.

Usage:
    python .cursor/runtime/load-skills.py --discover
    python .cursor/runtime/load-skills.py --list-layers
    python .cursor/runtime/load-skills.py --trigger "RBAC permission"
    python .cursor/runtime/load-skills.py --bundle pre-implementation
    python .cursor/runtime/load-skills.py --ids teknovo-rbac-architect,security-rbac-security
    python .cursor/runtime/load-skills.py --autoload --format json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore[assignment]


@dataclass
class ResolvedSkill:
    id: str
    path: Path
    layer: str
    priority: str
    description: str
    depends_on: list[str] = field(default_factory=list)
    content: str = ""
    loaded: bool = False
    error: str | None = None
    match_reason: str = ""


@dataclass
class SkillContext:
    repo_root: Path
    loaded_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    skills: dict[str, ResolvedSkill] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "repo_root": str(self.repo_root),
            "loaded_at": self.loaded_at,
            "warnings": self.warnings,
            "skills": {
                k: {
                    "id": s.id,
                    "path": str(s.path),
                    "layer": s.layer,
                    "priority": s.priority,
                    "description": s.description,
                    "depends_on": s.depends_on,
                    "match_reason": s.match_reason,
                    "loaded": s.loaded,
                    "error": s.error,
                    "content_length": len(s.content),
                    "content": s.content if s.loaded else None,
                }
                for k, s in sorted(
                    self.skills.items(),
                    key=lambda x: (
                        LAYER_ORDER.get(x[1].layer, 99),
                        PRIORITY_ORDER.get(x[1].priority, 99),
                        x[0],
                    ),
                )
            },
        }

    def to_markdown(self) -> str:
        parts = [
            "# Teknovo Skill Context",
            "",
            f"**Loaded at**: {self.loaded_at}",
            f"**Repository**: {self.repo_root}",
            "",
        ]
        if self.warnings:
            parts.append("## Warnings")
            for w in self.warnings:
                parts.append(f"- {w}")
            parts.append("")

        for _, skill in sorted(
            self.skills.items(),
            key=lambda x: (
                LAYER_ORDER.get(x[1].layer, 99),
                PRIORITY_ORDER.get(x[1].priority, 99),
                x[0],
            ),
        ):
            if not skill.loaded:
                continue
            parts.append(f"## [{skill.layer}/{skill.priority}] {skill.id}")
            parts.append(f"*{skill.description}* — match: {skill.match_reason}")
            parts.append("")
            parts.append(skill.content)

        return "\n\n---\n\n".join(parts)


LAYER_ORDER = {
    "foundation": 1,
    "memory": 2,
    "product": 3,
    "ux": 4,
    "architecture": 5,
    "engineering": 6,
    "security": 7,
    "assurance": 8,
    "deployment": 9,
    "automation": 10,
    "review": 11,
    "mcp": 12,
}

PRIORITY_ORDER = {"critical": 1, "high": 2, "medium": 3, "optional": 4}

SKILLS_ROOT = ".cursor/skills"
SKILL_FILE_NAME = "SKILL.md"


def discover_skill_files(repo_root: Path) -> dict[str, Path]:
    """Scan .cursor/skills/**/SKILL.md and map directory name -> path."""
    root = repo_root / SKILLS_ROOT
    discovered: dict[str, Path] = {}
    if not root.exists():
        return discovered
    for skill_file in root.rglob(SKILL_FILE_NAME):
        if skill_file.parent == root:
            continue
        discovered[skill_file.parent.name] = skill_file
    return discovered


def resolve_skill_path(repo_root: Path, skill_id: str, cfg: dict[str, Any]) -> Path:
    """Resolve skill path from registry entry, with filesystem discovery fallback."""
    rel = cfg.get("path", "")
    if rel:
        path = repo_root / rel
        if path.exists():
            return path
    discovered = discover_skill_files(repo_root)
    candidates = [skill_id]
    if "-" in skill_id:
        candidates.append(skill_id.split("-", 1)[-1])
    for candidate in candidates:
        if candidate in discovered:
            return discovered[candidate]
    return repo_root / rel if rel else repo_root / SKILLS_ROOT / skill_id / SKILL_FILE_NAME


def find_repo_root(start: Path | None = None) -> Path:
    current = (start or Path(__file__)).resolve()
    if current.is_file():
        current = current.parent
    for candidate in [current, *current.parents]:
        if (candidate / ".cursor" / "registry" / "skill-registry.yaml").exists():
            return candidate
        if (candidate / "AGENTS.md").exists():
            return candidate
    return Path(__file__).resolve().parents[2]


def load_skill_registry(repo_root: Path) -> dict[str, Any]:
    path = repo_root / ".cursor" / "registry" / "skill-registry.yaml"
    if not path.exists():
        return {"skills": {}, "bundles": {}, "autoload": []}
    text = path.read_text(encoding="utf-8")
    if yaml is None:
        return {"skills": {}, "_raw": text}
    return yaml.safe_load(text) or {}


def read_file_safe(path: Path, max_bytes: int = 524288) -> tuple[str, str | None]:
    if not path.exists():
        return "", f"File not found: {path}"
    if path.suffix == ".md" or path.suffix == "":
        pass
    try:
        size = path.stat().st_size
        content = path.read_text(encoding="utf-8")
        if size > max_bytes:
            return content[:max_bytes], f"Truncated at {max_bytes} bytes"
        return content, None
    except OSError as exc:
        return "", str(exc)


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def trigger_matches(query: str, triggers: list[str]) -> bool:
    q = normalize(query)
    for trigger in triggers:
        t = normalize(trigger)
        if t in q or q in t:
            return True
        if any(word in q for word in t.split() if len(word) > 3):
            return True
    return False


def resolve_skill_ids(
    registry: dict[str, Any],
    *,
    skill_ids: list[str] | None = None,
    bundle: str | None = None,
    autoload: bool = False,
    trigger: str | None = None,
    include_dependencies: bool = True,
) -> dict[str, str]:
    """Return skill_id -> match_reason."""
    skills_cfg: dict[str, Any] = registry.get("skills", {})
    bundles: dict[str, Any] = registry.get("bundles", {})
    resolved: dict[str, str] = {}

    def add(sid: str, reason: str) -> None:
        if sid in skills_cfg:
            resolved[sid] = reason

    if skill_ids:
        for sid in skill_ids:
            add(sid.strip(), "explicit id")

    if bundle and bundle in bundles:
        for sid in bundles[bundle].get("skills", []):
            add(sid, f"bundle:{bundle}")

    if autoload:
        for sid in registry.get("autoload", []):
            add(sid, "autoload")

    if trigger:
        for sid, cfg in skills_cfg.items():
            triggers = cfg.get("activate_when", [])
            if trigger_matches(trigger, triggers):
                add(sid, f"trigger:{trigger}")

    if include_dependencies:
        queue = list(resolved.keys())
        seen = set(resolved.keys())
        while queue:
            sid = queue.pop(0)
            deps = skills_cfg.get(sid, {}).get("depends_on", [])
            for dep in deps:
                if dep not in seen and dep in skills_cfg:
                    seen.add(dep)
                    resolved[dep] = f"depends_on:{sid}"
                    queue.append(dep)

    return resolved


def load_skills(
    repo_root: Path | None = None,
    skill_ids: list[str] | None = None,
    bundle: str | None = None,
    autoload: bool = False,
    trigger: str | None = None,
    include_dependencies: bool = True,
    max_file_bytes: int = 524288,
) -> SkillContext:
    root = repo_root or find_repo_root()
    registry = load_skill_registry(root)
    skills_cfg: dict[str, Any] = registry.get("skills", {})
    ctx = SkillContext(repo_root=root)

    id_reasons = resolve_skill_ids(
        registry,
        skill_ids=skill_ids,
        bundle=bundle,
        autoload=autoload,
        trigger=trigger,
        include_dependencies=include_dependencies,
    )

    for sid, reason in id_reasons.items():
        cfg = skills_cfg.get(sid, {})
        path = resolve_skill_path(root, sid, cfg)
        content, err = read_file_safe(path, max_file_bytes)
        status = cfg.get("status", "active")
        if status == "planned" and not path.exists():
            ctx.warnings.append(f"Skill '{sid}' is [PLANNED] — file not yet created: {path}")
            content = f"# [PLANNED] {sid}\n\nSee .cursor/registry/skill-registry.yaml and .cursor/docs/ai/skill-governance.md\n"
            err = None

        skill = ResolvedSkill(
            id=sid,
            path=path,
            layer=cfg.get("layer", "engineering"),
            priority=cfg.get("priority", "medium"),
            description=cfg.get("description", ""),
            depends_on=list(cfg.get("depends_on", [])),
            content=content,
            loaded=(path.exists() or status == "planned") and err is None,
            error=err,
            match_reason=reason,
        )
        ctx.skills[sid] = skill

        if not path.exists() and status != "planned":
            ctx.warnings.append(f"Missing skill file '{sid}': {path}")
        elif err and err != f"Truncated at {max_file_bytes} bytes":
            ctx.warnings.append(f"Error loading '{sid}': {err}")

    return ctx


def validate_registry(repo_root: Path) -> list[str]:
    errors: list[str] = []
    registry = load_skill_registry(repo_root)
    if yaml is None:
        errors.append("PyYAML not installed — cannot parse registry")
        return errors

    skills = registry.get("skills", {})
    if not skills:
        errors.append("No skills defined in .cursor/registry/skill-registry.yaml")
        return errors

    layers = set(registry.get("layers", {}).keys())
    priorities = set(registry.get("priority_levels", {}).keys())

    for sid, cfg in skills.items():
        if cfg.get("id") != sid:
            errors.append(f"Skill key/id mismatch: {sid} vs {cfg.get('id')}")
        layer = cfg.get("layer")
        if layer not in layers:
            errors.append(f"Invalid layer '{layer}' for skill {sid}")
        priority = cfg.get("priority")
        if priority not in priorities:
            errors.append(f"Invalid priority '{priority}' for skill {sid}")
        path = resolve_skill_path(repo_root, sid, cfg)
        if cfg.get("status") != "planned" and not path.exists():
            errors.append(f"Missing path for {sid}: {path}")
        for dep in cfg.get("depends_on", []):
            if dep not in skills:
                errors.append(f"Unknown dependency '{dep}' on skill {sid}")

    autoload = registry.get("autoload", [])
    for sid in autoload:
        if sid not in skills:
            errors.append(f"Autoload references unknown skill: {sid}")

    return errors


def list_layer_counts(repo_root: Path) -> dict[str, int]:
    registry = load_skill_registry(repo_root)
    counts: dict[str, int] = {}
    for cfg in registry.get("skills", {}).values():
        layer = cfg.get("layer", "unknown")
        counts[layer] = counts.get(layer, 0) + 1
    return counts


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Load Teknovo skills from central registry")
    parser.add_argument("--repo-root", type=Path, default=None)
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown")
    parser.add_argument("--ids", type=str, default=None, help="Comma-separated skill IDs")
    parser.add_argument("--bundle", type=str, default=None)
    parser.add_argument("--trigger", type=str, default=None, help="Match activate_when keywords")
    parser.add_argument("--autoload", action="store_true")
    parser.add_argument("--no-deps", action="store_true", help="Skip depends_on expansion")
    parser.add_argument("--discover", action="store_true", help="List SKILL.md files under .cursor/skills")
    parser.add_argument("--validate", action="store_true", help="Validate registry schema and paths")
    parser.add_argument("--list-layers", action="store_true", help="Print skill counts per layer")
    args = parser.parse_args(argv)

    root = args.repo_root or find_repo_root()

    if args.discover:
        discovered = discover_skill_files(root)
        for name in sorted(discovered):
            rel = discovered[name].relative_to(root)
            print(f"{name}: {rel}")
        print(f"\n# Discovered {len(discovered)} skill file(s) under {SKILLS_ROOT}/", file=sys.stderr)
        return 0

    if args.validate:
        errors = validate_registry(root)
        if errors:
            print("Validation FAILED:", file=sys.stderr)
            for e in errors:
                print(f"  - {e}", file=sys.stderr)
            return 1
        counts = list_layer_counts(root)
        total = sum(counts.values())
        print(f"Validation OK — {total} skills across {len(counts)} layers")
        for layer in sorted(counts, key=lambda l: LAYER_ORDER.get(l, 99)):
            print(f"  {layer}: {counts[layer]}")
        return 0

    if args.list_layers:
        counts = list_layer_counts(root)
        for layer in sorted(counts, key=lambda l: LAYER_ORDER.get(l, 99)):
            print(f"{layer}: {counts[layer]}")
        return 0

    if not any([args.ids, args.bundle, args.trigger, args.autoload, args.discover]):
        parser.error("Specify --ids, --bundle, --trigger, --autoload, --discover, --validate, or --list-layers")

    ids = [i.strip() for i in args.ids.split(",")] if args.ids else None
    ctx = load_skills(
        repo_root=root,
        skill_ids=ids,
        bundle=args.bundle,
        autoload=args.autoload,
        trigger=args.trigger,
        include_dependencies=not args.no_deps,
    )

    if args.format == "json":
        print(json.dumps(ctx.to_dict(), indent=2, ensure_ascii=False))
    else:
        print(ctx.to_markdown())

    if ctx.warnings:
        print("\n# Warnings\n", file=sys.stderr)
        for w in ctx.warnings:
            print(f"- {w}", file=sys.stderr)

    loaded = sum(1 for s in ctx.skills.values() if s.loaded)
    print(f"\n# Resolved {loaded} skill(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
