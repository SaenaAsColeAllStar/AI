#!/usr/bin/env python3
"""One-time generator: merge existing registries into .cursor/registry/skill-registry.yaml skeleton."""
from __future__ import annotations

import json
from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML required")

ROOT = Path(__file__).resolve().parents[2]

# Layer assignments for canonical skill IDs
LAYER_MAP: dict[str, str] = {
    "agents-md": "foundation",
    "agents-contract": "foundation",
    "superpowers-brainstorming": "product",
    "superpowers-writing-plans": "product",
    "superpowers-executing-plans": "engineering",
    "superpowers-systematic-debugging": "engineering",
    "superpowers-verification-before-completion": "review",
    "superpowers-requesting-code-review": "review",
    "superpowers-receiving-code-review": "review",
    "superpowers-test-driven-development": "engineering",
    "superpowers-subagent-driven-development": "automation",
    "superpowers-dispatching-parallel-agents": "automation",
    "superpowers-using-git-worktrees": "automation",
    "superpowers-finishing-development-branch": "review",
    "gstack-office-hours": "product",
    "gstack-eng-review": "review",
    "gstack-qa": "review",
    "gstack-browser-testing": "review",
    "gstack-ship": "deployment",
    "gstack-retro": "review",
    "gstack-cso": "product",
    "gstack-investigate": "deployment",
    "teknovo-chief-product-designer": "product",
    "teknovo-chief-architect": "architecture",
    "teknovo-devops-engineer": "deployment",
    "teknovo-prd-generator": "product",
    "teknovo-feature-implementation": "engineering",
    "teknovo-backend-development": "engineering",
    "teknovo-database-architect": "architecture",
    "teknovo-api-architect": "architecture",
    "teknovo-rbac-architect": "security",
    "teknovo-ui-ux": "ux",
    "teknovo-ui-ux-specialist": "ux",
    "teknovo-domain-management": "architecture",
    "teknovo-landing-page": "ux",
    "teknovo-repository-governance": "architecture",
    "teknovo-testing-architect": "engineering",
    "teknovo-security-review": "security",
    "teknovo-cloudflare-stack": "deployment",
    "teknovo-observability": "deployment",
    "teknovo-incident-response": "deployment",
    "teknovo-performance-engineer": "engineering",
    "teknovo-data-migration": "engineering",
    "teknovo-integration-architect": "architecture",
    "teknovo-finance": "product",
    "teknovo-ppdb": "product",
    "teknovo-cbt": "product",
    "teknovo-communication": "product",
    "teknovo-academic": "product",
    "teknovo-reporting": "product",
}

PRIORITY_MAP: dict[str, str] = {
    "agents-md": "critical",
    "agents-contract": "critical",
    "teknovo-rbac-architect": "critical",
    "teknovo-ui-ux": "critical",
    "teknovo-chief-product-designer": "critical",
    "teknovo-chief-architect": "critical",
    "teknovo-devops-engineer": "critical",
    "teknovo-feature-implementation": "critical",
    "teknovo-backend-development": "critical",
    "teknovo-database-architect": "critical",
    "teknovo-api-architect": "critical",
    "teknovo-security-review": "critical",
    "quality-self-critique": "critical",
    "taste-reviewer": "high",
    "impeccable-reviewer": "high",
    "security-reviewer": "high",
    "superpowers-brainstorming": "high",
    "superpowers-writing-plans": "high",
    "superpowers-verification-before-completion": "high",
    "gstack-eng-review": "high",
    "gstack-qa": "high",
}


def load_yaml(path: Path) -> dict:
    if not path.exists():
        return {}
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def main() -> None:
    legacy = load_yaml(ROOT / ".agents" / "registry.yaml")
    skills_flat = legacy.get("skills", {})
    autoload = set(legacy.get("autoload", []))
    print(f"Legacy skills: {len(skills_flat)}")
    print(f"Autoload: {len(autoload)}")
    print(json.dumps({k: skills_flat[k].get("path") for k in sorted(skills_flat)[:5]}, indent=2))


if __name__ == "__main__":
    main()
