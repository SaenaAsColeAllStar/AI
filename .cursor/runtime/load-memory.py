#!/usr/bin/env python3
"""
Teknovo Memory Loader

Loads all memory artifacts from .cursor/docs/memory/ and merges into runtime context.
Runnable as CLI script and importable as module.

Usage:
    python .cursor/runtime/load-memory.py
    python .cursor/runtime/load-memory.py --format json
    python .cursor/runtime/load-memory.py --include-sessions --session-limit 3
    python .cursor/runtime/load-memory.py --keys architecture-decisions,ui-ux-rules
    python .cursor/runtime/load-memory.py --include-quality
    python .cursor/runtime/load-memory.py --include-quality --quality-bundle pre-ship
    python .cursor/runtime/load-memory.py --include-security
    python .cursor/runtime/load-memory.py --include-security --security-bundle pre-api
    python .cursor/runtime/load-memory.py --include-taste
    python .cursor/runtime/load-memory.py --include-taste --taste-bundle pre-feature
    python .cursor/runtime/load-memory.py --include-taste --include-quality --taste-bundle pre-ui --quality-bundle pre-ui
    python .cursor/runtime/load-memory.py --include-assurance
    python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-implementation
    python .cursor/runtime/load-memory.py --include-taste --include-assurance --include-security --assurance-bundle pre-implementation
"""

from __future__ import annotations

import argparse
import json
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
class MemoryArtifact:
    key: str
    path: Path
    description: str = ""
    category: str = ""
    priority: int = 99
    layer: int = 1  # 1=memory, 2=taste, 3=assurance, 4=security, 5=quality
    content: str = ""
    loaded: bool = False
    error: str | None = None


@dataclass
class MemoryContext:
    repo_root: Path
    loaded_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    artifacts: dict[str, MemoryArtifact] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "repo_root": str(self.repo_root),
            "loaded_at": self.loaded_at,
            "warnings": self.warnings,
            "artifacts": {
                key: {
                    "path": str(a.path),
                    "description": a.description,
                    "category": a.category,
                    "priority": a.priority,
                    "loaded": a.loaded,
                    "error": a.error,
                    "content_length": len(a.content),
                    "content": a.content if a.loaded else None,
                }
                for key, a in sorted(
                    self.artifacts.items(),
                    key=lambda x: (x[1].layer, x[1].priority),
                )
            },
        }

    def to_markdown(self, section_separator: str = "\n\n---\n\n") -> str:
        parts = [
            f"# Teknovo Memory Context",
            f"",
            f"**Loaded at**: {self.loaded_at}",
            f"**Repository**: {self.repo_root}",
            f"",
        ]
        if self.warnings:
            parts.append("## Warnings")
            for w in self.warnings:
                parts.append(f"- {w}")
            parts.append("")

        for key, artifact in sorted(
            self.artifacts.items(),
            key=lambda x: (x[1].layer, x[1].priority),
        ):
            if not artifact.loaded:
                continue
            parts.append(f"## [{artifact.priority}] {key}")
            if artifact.description:
                parts.append(f"*{artifact.description}*")
                parts.append("")
            parts.append(artifact.content)

        return section_separator.join(parts)


def find_repo_root(start: Path | None = None) -> Path:
    """Walk up from start (or this file) to find repo root containing .cursor/docs/memory/."""
    current = (start or Path(__file__)).resolve()
    if current.is_file():
        current = current.parent
    for candidate in [current, *current.parents]:
        if (candidate / ".cursor" / "docs" / "memory" / "memory-registry.yaml").exists():
            return candidate
        if (candidate / "AGENTS.md").exists() and (candidate / ".cursor" / "docs" / "memory").is_dir():
            return candidate
    return Path(__file__).resolve().parents[2]


def load_registry(repo_root: Path) -> dict[str, Any]:
    registry_path = repo_root / ".cursor" / "docs" / "memory" / "memory-registry.yaml"
    if not registry_path.exists():
        return {"artifacts": {}, "defaults": {}}

    text = registry_path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(text) or {}

    # Minimal fallback if PyYAML unavailable
    return {"artifacts": {}, "defaults": {}, "_raw_registry": text}


def read_file_safe(path: Path, max_bytes: int = 524288) -> tuple[str, str | None]:
    if not path.exists():
        return "", f"File not found: {path}"
    if not path.is_file():
        return "", f"Not a file: {path}"
    try:
        size = path.stat().st_size
        if size > max_bytes:
            return path.read_text(encoding="utf-8")[:max_bytes], f"Truncated at {max_bytes} bytes"
        return path.read_text(encoding="utf-8"), None
    except OSError as exc:
        return "", str(exc)


def load_session_files(
    sessions_dir: Path,
    limit: int = 5,
    exclude: set[str] | None = None,
) -> list[MemoryArtifact]:
    exclude = exclude or {"README.md"}
    if not sessions_dir.is_dir():
        return []

    files = sorted(
        (p for p in sessions_dir.glob("*.md") if p.name not in exclude),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )[:limit]

    artifacts: list[MemoryArtifact] = []
    for i, path in enumerate(files):
        content, err = read_file_safe(path)
        artifacts.append(
            MemoryArtifact(
                key=f"session-{path.stem}",
                path=path,
                description=f"Session summary: {path.stem}",
                category="episodic",
                priority=100 + i,
                layer=1,
                content=content,
                loaded=err is None or bool(content),
                error=err,
            )
        )
    return artifacts


def load_taste_registry(repo_root: Path) -> dict[str, Any]:
    registry_path = repo_root / ".cursor" / "gates" / "taste" / "taste-registry.yaml"
    if not registry_path.exists():
        return {"artifacts": {}, "bundles": {}}

    text = registry_path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(text) or {}

    return {"artifacts": {}, "bundles": {}, "_raw_registry": text}


def resolve_taste_keys(
    repo_root: Path,
    include_taste: bool = False,
    taste_bundle: str | None = None,
    keys: list[str] | None = None,
) -> list[str] | None:
    """Resolve taste artifact keys from flags and bundle name."""
    if keys is not None:
        return keys

    if not include_taste and not taste_bundle:
        return None

    registry = load_taste_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    bundles: dict[str, Any] = registry.get("bundles", {})

    if taste_bundle:
        bundle = bundles.get(taste_bundle, {})
        bundle_keys = bundle.get("artifacts", [])
        if bundle_keys:
            return list(bundle_keys)

    if include_taste:
        return [
            k for k, v in artifacts_cfg.items()
            if v.get("autoload", False)
        ]

    return None


def load_taste_artifacts(
    repo_root: Path,
    keys: list[str],
    max_file_bytes: int = 524288,
    missing_policy: str = "warn",
) -> tuple[dict[str, MemoryArtifact], list[str]]:
    """Load taste artifacts by key from .cursor/gates/taste/taste-registry.yaml."""
    registry = load_taste_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    loaded: dict[str, MemoryArtifact] = {}
    warnings: list[str] = []

    for key in sorted(keys, key=lambda k: artifacts_cfg.get(k, {}).get("priority", 99)):
        cfg = artifacts_cfg.get(key, {})
        rel_path = cfg.get("path", f".cursor/gates/taste/{key}.md")
        path = repo_root / rel_path

        content, err = read_file_safe(path, max_file_bytes)
        artifact = MemoryArtifact(
            key=f"taste-{key}" if not key.startswith("taste-") else key,
            path=path,
            description=cfg.get("description", ""),
            category=cfg.get("category", "taste"),
            priority=int(cfg.get("priority", 99)),
            layer=int(registry.get("defaults", {}).get("layer", 2)),
            content=content,
            loaded=path.exists() and err is None,
            error=err,
        )
        loaded[artifact.key] = artifact

        if not path.exists():
            msg = f"Missing taste artifact '{key}': {path}"
            if missing_policy == "error":
                raise FileNotFoundError(msg)
            warnings.append(msg)
        elif err and "Truncated" not in (err or ""):
            warnings.append(f"Error loading taste '{key}': {err}")

    return loaded, warnings


def load_assurance_registry(repo_root: Path) -> dict[str, Any]:
    registry_path = repo_root / ".cursor" / "gates" / "assurance" / "assurance-registry.yaml"
    if not registry_path.exists():
        return {"artifacts": {}, "agents": {}, "bundles": {}}

    text = registry_path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(text) or {}

    return {"artifacts": {}, "agents": {}, "bundles": {}, "_raw_registry": text}


def resolve_assurance_keys(
    repo_root: Path,
    include_assurance: bool = False,
    assurance_bundle: str | None = None,
    keys: list[str] | None = None,
) -> tuple[list[str] | None, list[str]]:
    """Resolve assurance artifact keys and optional agent keys from flags and bundle."""
    if keys is not None:
        return keys, []

    if not include_assurance and not assurance_bundle:
        return None, []

    registry = load_assurance_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    bundles: dict[str, Any] = registry.get("bundles", {})

    agent_keys: list[str] = []
    if assurance_bundle:
        bundle = bundles.get(assurance_bundle, {})
        bundle_keys = bundle.get("load_order", bundle.get("artifacts", []))
        agent_keys = list(bundle.get("agents", []))
        if bundle_keys:
            return list(bundle_keys), agent_keys

    if include_assurance:
        return [
            k for k, v in artifacts_cfg.items()
            if v.get("autoload", False)
        ], []

    return None, []


def load_assurance_artifacts(
    repo_root: Path,
    keys: list[str],
    max_file_bytes: int = 524288,
    missing_policy: str = "warn",
) -> tuple[dict[str, MemoryArtifact], list[str]]:
    """Load assurance artifacts by key from .cursor/gates/assurance/assurance-registry.yaml."""
    registry = load_assurance_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    loaded: dict[str, MemoryArtifact] = {}
    warnings: list[str] = []

    for key in sorted(keys, key=lambda k: artifacts_cfg.get(k, {}).get("priority", 99)):
        cfg = artifacts_cfg.get(key, {})
        rel_path = cfg.get("path", f".cursor/gates/assurance/{key}.md")
        path = repo_root / rel_path

        content, err = read_file_safe(path, max_file_bytes)
        artifact = MemoryArtifact(
            key=f"assurance-{key}" if not key.startswith("assurance-") else key,
            path=path,
            description=cfg.get("description", ""),
            category=cfg.get("category", "assurance"),
            priority=int(cfg.get("priority", 99)),
            layer=3,
            content=content,
            loaded=path.exists() and err is None,
            error=err,
        )
        loaded[artifact.key] = artifact

        if not path.exists():
            msg = f"Missing assurance artifact '{key}': {path}"
            if missing_policy == "error":
                raise FileNotFoundError(msg)
            warnings.append(msg)
        elif err and "Truncated" not in (err or ""):
            warnings.append(f"Error loading assurance '{key}': {err}")

    return loaded, warnings


def load_assurance_agents(
    repo_root: Path,
    agent_keys: list[str],
    max_file_bytes: int = 524288,
    missing_policy: str = "warn",
) -> tuple[dict[str, MemoryArtifact], list[str]]:
    """Load assurance agent markdown files from assurance-registry agents section."""
    registry = load_assurance_registry(repo_root)
    agents_cfg: dict[str, Any] = registry.get("agents", {})
    loaded: dict[str, MemoryArtifact] = {}
    warnings: list[str] = []

    for key in agent_keys:
        cfg = agents_cfg.get(key, {})
        rel_path = cfg.get("path", f"agents/{key}.md")
        path = repo_root / rel_path

        content, err = read_file_safe(path, max_file_bytes)
        artifact = MemoryArtifact(
            key=f"assurance-agent-{key}",
            path=path,
            description=cfg.get("description", ""),
            category="assurance-agent",
            priority=int(cfg.get("priority", 99)),
            layer=3,
            content=content,
            loaded=path.exists() and err is None,
            error=err,
        )
        loaded[artifact.key] = artifact

        if not path.exists():
            msg = f"Missing assurance agent '{key}': {path}"
            if missing_policy == "error":
                raise FileNotFoundError(msg)
            warnings.append(msg)
        elif err and "Truncated" not in (err or ""):
            warnings.append(f"Error loading assurance agent '{key}': {err}")

    return loaded, warnings


def load_quality_registry(repo_root: Path) -> dict[str, Any]:
    registry_path = repo_root / ".cursor" / "gates" / "quality" / "quality-registry.yaml"
    if not registry_path.exists():
        return {"artifacts": {}, "bundles": {}}

    text = registry_path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(text) or {}

    return {"artifacts": {}, "bundles": {}, "_raw_registry": text}


def resolve_quality_keys(
    repo_root: Path,
    include_quality: bool = False,
    quality_bundle: str | None = None,
    keys: list[str] | None = None,
) -> list[str] | None:
    """Resolve quality artifact keys from flags and bundle name."""
    if keys is not None:
        return keys

    if not include_quality and not quality_bundle:
        return None

    registry = load_quality_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    bundles: dict[str, Any] = registry.get("bundles", {})

    if quality_bundle:
        bundle = bundles.get(quality_bundle, {})
        bundle_keys = bundle.get("artifacts", [])
        if bundle_keys:
            return list(bundle_keys)

    if include_quality:
        return [
            k for k, v in artifacts_cfg.items()
            if v.get("autoload", False)
        ]

    return None


def load_quality_artifacts(
    repo_root: Path,
    keys: list[str],
    max_file_bytes: int = 524288,
    missing_policy: str = "warn",
) -> tuple[dict[str, MemoryArtifact], list[str]]:
    """Load quality artifacts by key from .cursor/gates/quality/quality-registry.yaml."""
    registry = load_quality_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    loaded: dict[str, MemoryArtifact] = {}
    warnings: list[str] = []

    for key in sorted(keys, key=lambda k: artifacts_cfg.get(k, {}).get("priority", 99)):
        cfg = artifacts_cfg.get(key, {})
        rel_path = cfg.get("path", f".cursor/gates/quality/{key}.md")
        path = repo_root / rel_path

        content, err = read_file_safe(path, max_file_bytes)
        artifact = MemoryArtifact(
            key=f"quality-{key}" if not key.startswith("quality-") else key,
            path=path,
            description=cfg.get("description", ""),
            category=cfg.get("category", "quality"),
            priority=int(cfg.get("priority", 99)),
            layer=5,
            content=content,
            loaded=path.exists() and err is None,
            error=err,
        )
        loaded[artifact.key] = artifact

        if not path.exists():
            msg = f"Missing quality artifact '{key}': {path}"
            if missing_policy == "error":
                raise FileNotFoundError(msg)
            warnings.append(msg)
        elif err and "Truncated" not in (err or ""):
            warnings.append(f"Error loading quality '{key}': {err}")

    return loaded, warnings


def load_security_registry(repo_root: Path) -> dict[str, Any]:
    registry_path = repo_root / ".cursor" / "gates" / "security" / "security-registry.yaml"
    if not registry_path.exists():
        return {"artifacts": {}, "bundles": {}}

    text = registry_path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(text) or {}

    return {"artifacts": {}, "bundles": {}, "_raw_registry": text}


def resolve_security_keys(
    repo_root: Path,
    include_security: bool = False,
    security_bundle: str | None = None,
    keys: list[str] | None = None,
) -> list[str] | None:
    """Resolve security artifact keys from flags and bundle name."""
    if keys is not None:
        return keys

    if not include_security and not security_bundle:
        return None

    registry = load_security_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    bundles: dict[str, Any] = registry.get("bundles", {})

    if security_bundle:
        bundle = bundles.get(security_bundle, {})
        bundle_keys = bundle.get("artifacts", [])
        if bundle_keys:
            return list(bundle_keys)

    if include_security:
        return [
            k for k, v in artifacts_cfg.items()
            if v.get("autoload", False)
        ]

    return None


def load_security_artifacts(
    repo_root: Path,
    keys: list[str],
    max_file_bytes: int = 524288,
    missing_policy: str = "warn",
) -> tuple[dict[str, MemoryArtifact], list[str]]:
    """Load security artifacts by key from .cursor/gates/security/security-registry.yaml."""
    registry = load_security_registry(repo_root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})
    loaded: dict[str, MemoryArtifact] = {}
    warnings: list[str] = []

    for key in sorted(keys, key=lambda k: artifacts_cfg.get(k, {}).get("priority", 99)):
        cfg = artifacts_cfg.get(key, {})
        rel_path = cfg.get("path", f".cursor/gates/security/{key}.md")
        path = repo_root / rel_path

        content, err = read_file_safe(path, max_file_bytes)
        artifact = MemoryArtifact(
            key=f"security-{key}" if not key.startswith("security-") else key,
            path=path,
            description=cfg.get("description", ""),
            category=cfg.get("category", "security"),
            priority=int(cfg.get("priority", 99)),
            layer=4,
            content=content,
            loaded=path.exists() and err is None,
            error=err,
        )
        loaded[artifact.key] = artifact

        if not path.exists():
            msg = f"Missing security artifact '{key}': {path}"
            if missing_policy == "error":
                raise FileNotFoundError(msg)
            warnings.append(msg)
        elif err and "Truncated" not in (err or ""):
            warnings.append(f"Error loading security '{key}': {err}")

    return loaded, warnings


def load_memory(
    repo_root: Path | None = None,
    keys: list[str] | None = None,
    include_sessions: bool = False,
    session_limit: int = 5,
    max_file_bytes: int = 524288,
    include_taste: bool = False,
    taste_bundle: str | None = None,
    taste_only: bool = False,
    include_quality: bool = False,
    quality_bundle: str | None = None,
    quality_only: bool = False,
    include_security: bool = False,
    security_bundle: str | None = None,
    security_only: bool = False,
    include_assurance: bool = False,
    assurance_bundle: str | None = None,
    assurance_only: bool = False,
) -> MemoryContext:
    root = repo_root or find_repo_root()
    registry = load_registry(root)
    defaults = registry.get("defaults", {})
    max_file_bytes = int(registry.get("loader", {}).get("max_file_bytes", max_file_bytes))
    missing_policy = defaults.get("missing_file_policy", "warn")

    ctx = MemoryContext(repo_root=root)
    artifacts_cfg: dict[str, Any] = registry.get("artifacts", {})

    quality_keys = resolve_quality_keys(root, include_quality, quality_bundle, None)
    taste_keys = resolve_taste_keys(root, include_taste, taste_bundle, None)
    security_keys = resolve_security_keys(root, include_security, security_bundle, None)
    assurance_keys, assurance_agent_keys = resolve_assurance_keys(
        root, include_assurance, assurance_bundle, None
    )

    if taste_only or assurance_only:
        target_keys: list[str] = []
    elif quality_only or security_only:
        target_keys = []
    elif keys is not None:
        target_keys = keys
    elif (quality_keys or taste_keys or security_keys or assurance_keys) and (
        include_quality or quality_bundle or include_taste or taste_bundle
        or include_security or security_bundle
        or include_assurance or assurance_bundle
    ):
        target_keys = [
            k for k, v in artifacts_cfg.items()
            if v.get("autoload", False) and k != "sessions"
        ]
    else:
        target_keys = [
            k for k, v in artifacts_cfg.items()
            if v.get("autoload", False) and k != "sessions"
        ]

    for key in sorted(target_keys, key=lambda k: artifacts_cfg.get(k, {}).get("priority", 99)):
        cfg = artifacts_cfg.get(key, {})
        rel_path = cfg.get("path", f".cursor/docs/memory/{key}.md")
        path = root / rel_path

        if key == "sessions":
            continue

        content, err = read_file_safe(path, max_file_bytes)
        artifact = MemoryArtifact(
            key=key,
            path=path,
            description=cfg.get("description", ""),
            category=cfg.get("category", ""),
            priority=int(cfg.get("priority", 99)),
            layer=int(cfg.get("layer", 1)),
            content=content,
            loaded=path.exists() and err is None,
            error=err,
        )
        ctx.artifacts[key] = artifact

        if not path.exists():
            msg = f"Missing memory artifact '{key}': {path}"
            if missing_policy == "error":
                raise FileNotFoundError(msg)
            ctx.warnings.append(msg)
        elif err and "Truncated" not in (err or ""):
            ctx.warnings.append(f"Error loading '{key}': {err}")

    if taste_keys:
        taste_artifacts, taste_warnings = load_taste_artifacts(
            root, taste_keys, max_file_bytes, missing_policy
        )
        ctx.artifacts.update(taste_artifacts)
        ctx.warnings.extend(taste_warnings)

    if assurance_keys:
        assurance_artifacts, assurance_warnings = load_assurance_artifacts(
            root, assurance_keys, max_file_bytes, missing_policy
        )
        ctx.artifacts.update(assurance_artifacts)
        ctx.warnings.extend(assurance_warnings)

    if assurance_agent_keys:
        agent_artifacts, agent_warnings = load_assurance_agents(
            root, assurance_agent_keys, max_file_bytes, missing_policy
        )
        ctx.artifacts.update(agent_artifacts)
        ctx.warnings.extend(agent_warnings)

    if security_keys:
        security_artifacts, security_warnings = load_security_artifacts(
            root, security_keys, max_file_bytes, missing_policy
        )
        ctx.artifacts.update(security_artifacts)
        ctx.warnings.extend(security_warnings)

    if quality_keys:
        quality_artifacts, quality_warnings = load_quality_artifacts(
            root, quality_keys, max_file_bytes, missing_policy
        )
        ctx.artifacts.update(quality_artifacts)
        ctx.warnings.extend(quality_warnings)
    elif keys:
        # Explicit --keys may reference taste-* or quality-* keys in memory registry
        taste_from_keys = [k for k in keys if k.startswith("taste-")]
        if taste_from_keys:
            t_registry = load_taste_registry(root)
            t_cfg = t_registry.get("artifacts", {})
            mapped = []
            for k in taste_from_keys:
                short = k.replace("taste-", "", 1)
                if short in t_cfg or k in t_cfg:
                    mapped.append(short if short in t_cfg else k)
            if mapped:
                taste_artifacts, taste_warnings = load_taste_artifacts(
                    root, mapped, max_file_bytes, missing_policy
                )
                ctx.artifacts.update(taste_artifacts)
                ctx.warnings.extend(taste_warnings)

        quality_from_keys = [k for k in keys if k.startswith("quality-")]
        if quality_from_keys:
            q_registry = load_quality_registry(root)
            q_cfg = q_registry.get("artifacts", {})
            mapped = []
            for k in quality_from_keys:
                short = k.replace("quality-", "", 1)
                if short in q_cfg or k in q_cfg:
                    mapped.append(short if short in q_cfg else k)
            if mapped:
                quality_artifacts, quality_warnings = load_quality_artifacts(
                    root, mapped, max_file_bytes, missing_policy
                )
                ctx.artifacts.update(quality_artifacts)
                ctx.warnings.extend(quality_warnings)

        security_from_keys = [k for k in keys if k.startswith("security-")]
        if security_from_keys:
            s_registry = load_security_registry(root)
            s_cfg = s_registry.get("artifacts", {})
            mapped = []
            for k in security_from_keys:
                short = k.replace("security-", "", 1)
                if short in s_cfg or k in s_cfg:
                    mapped.append(short if short in s_cfg else k)
            if mapped:
                security_artifacts, security_warnings = load_security_artifacts(
                    root, mapped, max_file_bytes, missing_policy
                )
                ctx.artifacts.update(security_artifacts)
                ctx.warnings.extend(security_warnings)

        assurance_from_keys = [k for k in keys if k.startswith("assurance-")]
        if assurance_from_keys:
            a_registry = load_assurance_registry(root)
            a_cfg = a_registry.get("artifacts", {})
            mapped = []
            for k in assurance_from_keys:
                short = k.replace("assurance-", "", 1)
                if short in a_cfg or k in a_cfg:
                    mapped.append(short if short in a_cfg else k)
            if mapped:
                assurance_artifacts, assurance_warnings = load_assurance_artifacts(
                    root, mapped, max_file_bytes, missing_policy
                )
                ctx.artifacts.update(assurance_artifacts)
                ctx.warnings.extend(assurance_warnings)

    if include_sessions or (keys and "sessions" in keys):
        sessions_cfg = artifacts_cfg.get("sessions", {})
        sessions_dir = root / sessions_cfg.get("path", ".cursor/docs/memory/sessions/")
        exclude = set(sessions_cfg.get("exclude", ["README.md"]))
        for artifact in load_session_files(sessions_dir, session_limit, exclude):
            ctx.artifacts[artifact.key] = artifact

    return ctx


def build_context_string(ctx: MemoryContext, fmt: str = "markdown") -> str:
    if fmt == "json":
        return json.dumps(ctx.to_dict(), indent=2, ensure_ascii=False)
    separator = "\n\n---\n\n"
    return ctx.to_markdown(section_separator=separator)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Load Teknovo memory artifacts into runtime context")
    parser.add_argument("--repo-root", type=Path, default=None, help="Repository root path")
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown")
    parser.add_argument("--keys", type=str, default=None, help="Comma-separated artifact keys")
    parser.add_argument("--include-sessions", action="store_true")
    parser.add_argument("--session-limit", type=int, default=5)
    parser.add_argument("--quiet-warnings", action="store_true")
    parser.add_argument(
        "--include-taste",
        action="store_true",
        help="Include taste artifacts with autoload=true from .cursor/gates/taste/taste-registry.yaml",
    )
    parser.add_argument(
        "--taste-bundle",
        type=str,
        default=None,
        choices=["planning", "pre-ui", "pre-feature", "pre-code", "full"],
        help="Load a named taste artifact bundle (loads before quality when both included)",
    )
    parser.add_argument(
        "--taste-only",
        action="store_true",
        help="Load only taste artifacts (no .cursor/docs/memory/ artifacts)",
    )
    parser.add_argument(
        "--include-quality",
        action="store_true",
        help="Include quality artifacts with autoload=true from .cursor/gates/quality/quality-registry.yaml",
    )
    parser.add_argument(
        "--quality-bundle",
        type=str,
        default=None,
        choices=["planning", "pre-ui", "pre-code", "pre-ship", "full"],
        help="Load a named quality artifact bundle",
    )
    parser.add_argument(
        "--quality-only",
        action="store_true",
        help="Load only quality artifacts (no .cursor/docs/memory/ artifacts)",
    )
    parser.add_argument(
        "--include-security",
        action="store_true",
        help="Include security artifacts from .cursor/gates/security/security-registry.yaml",
    )
    parser.add_argument(
        "--security-bundle",
        type=str,
        default=None,
        choices=["planning", "pre-rbac", "pre-api", "pre-db", "pre-deploy", "pre-agent", "full"],
        help="Load a named security artifact bundle (after assurance, before quality)",
    )
    parser.add_argument(
        "--security-only",
        action="store_true",
        help="Load only security artifacts (no .cursor/docs/memory/ artifacts)",
    )
    parser.add_argument(
        "--assurance-only",
        action="store_true",
        help="Load only assurance artifacts (no .cursor/docs/memory/ artifacts)",
    )
    parser.add_argument(
        "--include-assurance",
        action="store_true",
        help="Include assurance artifacts with autoload=true from .cursor/gates/assurance/assurance-registry.yaml",
    )
    parser.add_argument(
        "--assurance-bundle",
        type=str,
        default=None,
        choices=["planning", "pre-implementation", "differential", "pre-deploy", "full"],
        help="Load a named assurance artifact bundle (after taste, before security)",
    )
    args = parser.parse_args(argv)

    keys = [k.strip() for k in args.keys.split(",")] if args.keys else None

    if args.taste_bundle and not args.include_taste:
        args.include_taste = True

    if args.quality_bundle and not args.include_quality:
        args.include_quality = True

    if args.security_bundle and not args.include_security:
        args.include_security = True

    if args.assurance_bundle and not args.include_assurance:
        args.include_assurance = True

    try:
        ctx = load_memory(
            repo_root=args.repo_root,
            keys=keys,
            include_sessions=args.include_sessions,
            session_limit=args.session_limit,
            include_taste=args.include_taste,
            taste_bundle=args.taste_bundle,
            taste_only=args.taste_only,
            include_quality=args.include_quality,
            quality_bundle=args.quality_bundle,
            quality_only=args.quality_only,
            include_security=args.include_security,
            security_bundle=args.security_bundle,
            security_only=args.security_only,
            include_assurance=args.include_assurance,
            assurance_bundle=args.assurance_bundle,
            assurance_only=args.assurance_only,
        )
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    output = build_context_string(ctx, args.format)
    print(output)

    if not args.quiet_warnings and ctx.warnings:
        print("\n# Load Warnings\n", file=sys.stderr)
        for w in ctx.warnings:
            print(f"- {w}", file=sys.stderr)

    loaded = sum(1 for a in ctx.artifacts.values() if a.loaded)
    print(f"\n# Loaded {loaded} artifact(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
