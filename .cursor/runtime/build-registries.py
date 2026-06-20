#!/usr/bin/env python3
"""Build .cursor/registry/skill-registry.yaml from consolidated Teknovo sources."""
from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML required: pip install pyyaml")

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "registry" / "skill-registry.yaml"

LAYERS = {
    "foundation": {"order": 1, "description": "Master contracts, AGENTS.md, workstation bootstrap"},
    "memory": {"order": 2, "description": "Long-term Claude-Mem artifacts and session context"},
    "product": {"order": 3, "description": "PRD, product design, domain modules, planning methodology"},
    "ux": {"order": 4, "description": "UI/UX implementation, design taste, copy, landing pages"},
    "architecture": {"order": 5, "description": "Chief architect gate, DB, API, DDD, monorepo governance"},
    "engineering": {"order": 6, "description": "Implementation, TDD, backend, migrations, performance"},
    "security": {"order": 7, "description": "Security principles, RBAC security, security review gate"},
    "assurance": {"order": 8, "description": "Trail-of-Bits-inspired verification, context, diff review"},
    "deployment": {"order": 9, "description": "DevOps, Cloudflare, ship, observability, incidents"},
    "automation": {"order": 10, "description": "Subagents, parallel dispatch, git worktrees"},
    "review": {"order": 11, "description": "Quality gates, taste review, eng-review, QA, code review"},
    "mcp": {"order": 12, "description": "Model Context Protocol integrations and agent tool boundaries"},
}

PRIORITY_ORDER = ["critical", "high", "medium", "optional"]

CONFLICT_RESOLUTION = {
    "document_priority": [
        "AGENTS.md and docs/adr/**",
        "Master PRD (docs/prd/master/master-prd.md)",
        "Teknovo standards (database, API, RBAC, design system, coding)",
        ".cursor/registry/skill-registry.yaml",
        "Domain sub-registries (taste, quality, security, assurance, memory)",
        ".cursor/registry/legacy-registry.yaml (legacy compatibility)",
        "External / third-party guidance",
    ],
    "skill_conflicts": [
        {
            "id": "taste-vs-expansion",
            "when": "Taste layer recommends removal vs feature expansion",
            "winner": "taste",
            "rule": "Taste wins â€” simplify or cut scope before polishing",
        },
        {
            "id": "security-vs-convenience",
            "when": "Security requirement vs developer convenience",
            "winner": "security",
            "rule": "Security wins â€” no bypass for speed",
        },
        {
            "id": "agents-vs-external",
            "when": "AGENTS.md vs external blog/tool defaults",
            "winner": "agents-md",
            "rule": "AGENTS.md wins â€” Teknovo contracts override external patterns",
        },
        {
            "id": "assurance-vs-assumption",
            "when": "Assurance gate vs assumed requirements",
            "winner": "assurance",
            "rule": "Assurance wins â€” clarify before implement",
        },
        {
            "id": "rbac-vs-ui-only-auth",
            "when": "UI-only permission check vs server RBAC",
            "winner": "security",
            "rule": "Server RBAC mandatory â€” UI checks are supplemental only",
        },
    ],
    "review_order": [
        "requirement-clarifier",
        "context-builder",
        "taste-reviewer",
        "security-reviewer",
        "impeccable-reviewer",
        "differential-reviewer",
        "second-opinion-reviewer",
    ],
    "precedence_chain": "AGENTS.md > ADR > PRD > Teknovo Skills > Security > Assurance > Impeccable > Taste > External",
}

# Explicit skill definitions: id -> partial config merged with legacy
EXTRA_SKILLS: dict[str, dict[str, Any]] = {
    "agents-md": {
        "layer": "foundation",
        "priority": "critical",
        "source": "foundation",
        "path": "AGENTS.md",
        "description": "Master agent contract â€” identity, workflow, Three Pillars, layer precedence",
        "depends_on": [],
        "activate_when": ["session start", "every task", "bootstrap"],
        "conflicts": [],
        "autoload": True,
    },
    "agents-contract": {
        "layer": "foundation",
        "priority": "critical",
        "source": "foundation",
        "path": ".cursor/docs/AGENTS.md",
        "description": "Extended agent contract with Teknovo-V2 document paths",
        "depends_on": ["agents-md"],
        "activate_when": ["session start", "V2 paths", "module work"],
        "conflicts": [],
        "autoload": False,
    },
    "quality-review-principles": {
        "layer": "review",
        "priority": "high",
        "source": "quality",
        "path": ".cursor/gates/quality/review-principles.md",
        "description": "Unified review philosophy, severity model, Superpowers/GStack integration",
        "depends_on": ["quality-self-critique"],
        "activate_when": ["code review", "review request", "quality audit"],
        "conflicts": [],
        "autoload": False,
    },
    "security-principles": {
        "layer": "security",
        "priority": "critical",
        "source": "security",
        "path": ".cursor/gates/security/security-principles.md",
        "description": "Master security principles â€” least privilege, defense in depth",
        "depends_on": ["agents-md"],
        "activate_when": ["security review", "new feature", "architecture gate"],
        "conflicts": [],
        "autoload": False,
    },
    "security-rbac-security": {
        "layer": "security",
        "priority": "critical",
        "source": "security",
        "path": ".cursor/gates/security/rbac-security.md",
        "description": "RBAC hierarchy, permission mapping, route guards",
        "depends_on": ["security-principles", "teknovo-rbac-architect"],
        "activate_when": ["RBAC", "permission", "role", "route guard"],
        "conflicts": [],
        "autoload": False,
    },
    "security-api-security": {
        "layer": "security",
        "priority": "high",
        "source": "security",
        "path": ".cursor/gates/security/api-security.md",
        "description": "Auth, validation, rate limits, CORS, API error handling",
        "depends_on": ["security-principles"],
        "activate_when": ["REST API", "endpoint", "webhook"],
        "conflicts": [],
        "autoload": False,
    },
    "security-database-security": {
        "layer": "security",
        "priority": "high",
        "source": "security",
        "path": ".cursor/gates/security/database-security.md",
        "description": "UUID v7, soft delete, audit logs, tenancy, FK constraints",
        "depends_on": ["security-principles"],
        "activate_when": ["migration", "schema", "drizzle"],
        "conflicts": [],
        "autoload": False,
    },
    "security-cloudflare-security": {
        "layer": "security",
        "priority": "high",
        "source": "security",
        "path": ".cursor/gates/security/cloudflare-security.md",
        "description": "Workers, D1, R2, DNS, tunnels, secrets hardening",
        "depends_on": ["security-principles"],
        "activate_when": ["cloudflare", "deploy", "tunnel", "R2"],
        "conflicts": [],
        "autoload": False,
    },
    "security-ai-agent-security": {
        "layer": "mcp",
        "priority": "high",
        "source": "security",
        "path": ".cursor/gates/security/ai-agent-security.md",
        "description": "Agent tool limits, MCP boundaries, credentials, workstation safety",
        "depends_on": ["security-principles", "agents-md"],
        "activate_when": ["agent session", "MCP", "automation", "cursor"],
        "conflicts": [],
        "autoload": False,
    },
    "security-review-checklist": {
        "layer": "security",
        "priority": "high",
        "source": "security",
        "path": ".cursor/gates/security/review-checklist.md",
        "description": "Ten-section security checklist for pre-PR and pre-merge",
        "depends_on": ["security-principles"],
        "activate_when": ["security audit", "before PR", "before merge"],
        "conflicts": [],
        "autoload": False,
    },
    "security-gates": {
        "layer": "security",
        "priority": "critical",
        "source": "security",
        "path": ".cursor/gates/security/security-gates.md",
        "description": "Mandatory security gates â€” pre-implementation, pre-deploy, pre-production",
        "depends_on": ["security-principles"],
        "activate_when": ["deploy", "release", "before implementation", "security gate"],
        "conflicts": [],
        "autoload": False,
    },
    "security-reviewer": {
        "layer": "security",
        "priority": "critical",
        "source": "security",
        "path": ".cursor/docs/agents/security-reviewer.md",
        "description": "Security review agent â€” risk level, attack surface, APPROVE/BLOCK verdict",
        "depends_on": ["agents-md", "security-principles", "security-gates"],
        "activate_when": ["security review", "security audit", "OWASP", "pre-deploy security"],
        "conflicts": [],
        "autoload": False,
    },
    "requirement-clarifier": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/docs/agents/requirement-clarifier.md",
        "description": "Requirements auditor â€” ambiguity, conflicts, missing criteria before planning",
        "depends_on": ["agents-md", "superpowers-brainstorming"],
        "activate_when": ["unclear requirements", "clarify", "ambiguous", "before planning"],
        "conflicts": [],
        "autoload": False,
    },
    "context-builder": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/docs/agents/context-builder.md",
        "description": "Context architect â€” verifies ADR/PRD/standards loaded before decisions",
        "depends_on": ["agents-md", "requirement-clarifier"],
        "activate_when": ["context", "read ADR", "standards", "before implementation"],
        "conflicts": [],
        "autoload": False,
    },
    "differential-reviewer": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/docs/agents/differential-reviewer.md",
        "description": "[PLANNED] Diff-focused review â€” lockfile, migration, RBAC delta analysis",
        "depends_on": ["context-builder", "security-reviewer"],
        "activate_when": ["diff review", "PR diff", "lockfile change", "migration diff"],
        "conflicts": [],
        "autoload": False,
        "status": "planned",
    },
    "second-opinion-reviewer": {
        "layer": "assurance",
        "priority": "medium",
        "source": "assurance",
        "path": ".cursor/docs/agents/second-opinion-reviewer.md",
        "description": "[PLANNED] Challenges architecture and deploy decisions pre-production",
        "depends_on": ["impeccable-reviewer", "security-reviewer"],
        "activate_when": ["second opinion", "high risk", "pre-deploy review", "architecture challenge"],
        "conflicts": [],
        "autoload": False,
        "status": "planned",
    },
    "assurance-principles": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/gates/assurance/assurance-principles.md",
        "description": "Assurance philosophy â€” verify assumptions, evidence over narrative",
        "depends_on": ["agents-md"],
        "activate_when": ["assurance", "verify", "Trail of Bits", "before implementation"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-review-workflow": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/gates/assurance/review-workflow.md",
        "description": "End-to-end assurance workflow integrating all review agents",
        "depends_on": ["assurance-principles"],
        "activate_when": ["assurance review", "review workflow", "gate sequence"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-risk-analysis": {
        "layer": "assurance",
        "priority": "medium",
        "source": "assurance",
        "path": ".cursor/gates/assurance/risk-analysis.md",
        "description": "Structured risk analysis for features and infrastructure changes",
        "depends_on": ["assurance-principles", "security-principles"],
        "activate_when": ["risk analysis", "threat model", "impact assessment"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-decision-validation": {
        "layer": "assurance",
        "priority": "medium",
        "source": "assurance",
        "path": ".cursor/gates/assurance/decision-validation.md",
        "description": "Validates one-way door decisions against ADR and PRD",
        "depends_on": ["context-builder", "assurance-principles"],
        "activate_when": ["decision validation", "ADR check", "one-way door"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-sharp-edges": {
        "layer": "assurance",
        "priority": "medium",
        "source": "assurance",
        "path": ".cursor/gates/assurance/sharp-edges.md",
        "description": "Documents sharp edges and footguns in Teknovo stack",
        "depends_on": ["assurance-principles"],
        "activate_when": ["sharp edge", "footgun", "gotcha", "edge case review"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-insecure-defaults": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/gates/assurance/insecure-defaults.md",
        "description": "Catalog of insecure defaults to reject in code and config",
        "depends_on": ["security-principles", "assurance-principles"],
        "activate_when": ["insecure default", "config review", "env vars"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-dependency-review": {
        "layer": "assurance",
        "priority": "high",
        "source": "assurance",
        "path": ".cursor/gates/assurance/dependency-review.md",
        "description": "Dependency and lockfile change review methodology",
        "depends_on": ["assurance-principles", "differential-reviewer"],
        "activate_when": ["dependency", "lockfile", "npm audit", "package upgrade"],
        "conflicts": [],
        "autoload": False,
    },
    "assurance-static-analysis": {
        "layer": "assurance",
        "priority": "medium",
        "source": "assurance",
        "path": ".cursor/gates/assurance/static-analysis.md",
        "description": "Static analysis expectations and CI integration for Teknovo",
        "depends_on": ["assurance-principles", "teknovo-testing-architect"],
        "activate_when": ["static analysis", "SAST", "lint gate", "CI check"],
        "conflicts": [],
        "autoload": False,
    },
}

LAYER_BY_SOURCE = {
    "taste": {"product-principles": "product", "ux-principles": "ux", "design-principles": "ux",
              "architecture-principles": "architecture", "copywriting-principles": "ux",
              "taste-checklist": "review", "taste-gates": "review", "taste-reviewer": "review"},
    "quality": {"product-principles": "product", "ux-principles": "ux", "architecture-principles": "architecture",
                "engineering-principles": "engineering", "review-principles": "review",
                "review-checklist": "review", "design-taste": "ux", "quality-gates": "review",
                "self-critique": "review", "impeccable-reviewer": "review"},
}

LAYER_BY_CATEGORY = {
    "planning": "product",
    "implementation": "engineering",
    "review": "review",
    "troubleshooting": "engineering",
    "domain": "product",
    "cross-cutting": "engineering",
    "quality": "review",
    "taste": "review",
}

PRIORITY_BY_ROLE = {
    "pillar-1": "critical",
    "pillar-2": "critical",
    "pillar-3": "critical",
}

MEMORY_SKILLS = {
    "memory-project-context": {"path": ".cursor/docs/memory/project-context.md", "layer": "memory", "priority": "critical",
        "description": "Master project context â€” agent identity, workflow, constraints", "autoload": True,
        "activate_when": ["session start", "bootstrap"]},
    "memory-repository-map": {"path": ".cursor/docs/memory/repository-map.md", "layer": "memory", "priority": "high",
        "description": "Folder and package structure for AI repo and Teknovo-V2", "autoload": True,
        "activate_when": ["repo structure", "where is", "find file"]},
    "memory-product-context": {"path": ".cursor/docs/memory/product-context.md", "layer": "memory", "priority": "high",
        "description": "Teknovo vision, ERP modules, business concepts", "autoload": True,
        "activate_when": ["product context", "ERP module", "business rule"]},
    "memory-domain-knowledge": {"path": ".cursor/docs/memory/domain-knowledge.md", "layer": "memory", "priority": "high",
        "description": "Bounded contexts, schemas, domain events", "autoload": True,
        "activate_when": ["domain", "bounded context", "domain event"]},
    "memory-architecture-decisions": {"path": ".cursor/docs/memory/architecture-decisions.md", "layer": "memory", "priority": "high",
        "description": "ADR summaries â€” monorepo, Cloudflare, Nuxt, RBAC", "autoload": True,
        "activate_when": ["ADR", "architecture decision", "why we chose"]},
    "memory-coding-standards": {"path": ".cursor/docs/memory/coding-standards.md", "layer": "memory", "priority": "critical",
        "description": "Layer isolation, naming, database, API, RBAC standards", "autoload": True,
        "activate_when": ["coding standard", "naming", "layer isolation"]},
    "memory-ui-ux-rules": {"path": ".cursor/docs/memory/ui-ux-rules.md", "layer": "memory", "priority": "high",
        "description": "Color tokens, typography, sidebar, page states", "autoload": True,
        "activate_when": ["design token", "sidebar", "page state"]},
    "memory-lessons-learned": {"path": ".cursor/docs/memory/lessons-learned.md", "layer": "memory", "priority": "medium",
        "description": "Installation failures, deployment issues, recovery notes", "autoload": True,
        "activate_when": ["lessons learned", "past incident", "workstation recovery"]},
}

TEKNOVO_LAYER = {
    "teknovo-rbac-architect": "security",
    "teknovo-security-review": "security",
    "teknovo-cloudflare-stack": "deployment",
    "teknovo-devops-engineer": "deployment",
    "teknovo-observability": "deployment",
    "teknovo-incident-response": "deployment",
    "teknovo-chief-product-designer": "product",
    "teknovo-chief-architect": "architecture",
    "teknovo-prd-generator": "product",
    "teknovo-ui-ux": "ux",
    "teknovo-ui-ux-specialist": "ux",
    "teknovo-landing-page": "ux",
    "teknovo-database-architect": "architecture",
    "teknovo-api-architect": "architecture",
    "teknovo-domain-management": "architecture",
    "teknovo-repository-governance": "architecture",
    "teknovo-integration-architect": "architecture",
    "teknovo-backend-development": "engineering",
    "teknovo-feature-implementation": "engineering",
    "teknovo-testing-architect": "engineering",
    "teknovo-performance-engineer": "engineering",
    "teknovo-data-migration": "engineering",
    "gstack-ship": "deployment",
    "gstack-investigate": "deployment",
    "superpowers-subagent-driven-development": "automation",
    "superpowers-dispatching-parallel-agents": "automation",
    "superpowers-using-git-worktrees": "automation",
}


def infer_layer(skill_id: str, legacy_entry: dict) -> str:
    if skill_id in TEKNOVO_LAYER:
        return TEKNOVO_LAYER[skill_id]
    cat = legacy_entry.get("category", "")
    if cat in LAYER_BY_CATEGORY:
        return LAYER_BY_CATEGORY[cat]
    if skill_id.startswith("taste-"):
        key = skill_id.replace("taste-", "")
        return LAYER_BY_SOURCE["taste"].get(key, "review")
    if skill_id.startswith("quality-"):
        key = skill_id.replace("quality-", "")
        return LAYER_BY_SOURCE["quality"].get(key, "review")
    if skill_id.startswith("superpowers-"):
        name = skill_id.replace("superpowers-", "")
        if name in ("brainstorming", "writing-plans"):
            return "product"
        if name in ("executing-plans", "test-driven-development", "systematic-debugging"):
            return "engineering"
        if name in ("subagent-driven-development", "dispatching-parallel-agents", "using-git-worktrees"):
            return "automation"
        return "review"
    if skill_id.startswith("gstack-"):
        name = skill_id.replace("gstack-", "")
        if name in ("ship", "investigate"):
            return "deployment"
        if name in ("office-hours", "cso"):
            return "product"
        return "review"
    if skill_id.startswith("teknovo-"):
        if "finance" in skill_id or "ppdb" in skill_id or "cbt" in skill_id or "communication" in skill_id or "academic" in skill_id or "reporting" in skill_id:
            return "product"
    return "engineering"


def infer_priority(skill_id: str, legacy_entry: dict) -> str:
    if legacy_entry.get("role") in PRIORITY_BY_ROLE:
        return "critical"
    if skill_id in ("agents-md", "memory-coding-standards", "memory-project-context"):
        return "critical"
    if legacy_entry.get("autoload"):
        if skill_id.startswith("taste-") or skill_id.startswith("quality-"):
            return "high" if legacy_entry.get("autoload") else "medium"
        return "high"
    if skill_id.startswith("taste-"):
        return "medium"
    if skill_id.startswith("quality-"):
        return "high" if skill_id in ("quality-self-critique", "impeccable-reviewer") else "medium"
    if skill_id.startswith("teknovo-finance") or skill_id.startswith("teknovo-ppdb"):
        return "medium"
    if legacy_entry.get("category") == "domain":
        return "medium"
    if legacy_entry.get("category") == "cross-cutting":
        return "medium"
    return "optional"


def infer_source(skill_id: str, path: str) -> str:
    if path.startswith(".cursor/gates/taste/"):
        return "taste"
    if path.startswith(".cursor/gates/quality/"):
        return "quality"
    if path.startswith(".cursor/gates/security/"):
        return "security"
    if path.startswith(".cursor/gates/assurance/"):
        return "assurance"
    if path.startswith(".cursor/docs/memory/"):
        return "memory"
    if path.startswith("agents/"):
        if skill_id in ("taste-reviewer", "impeccable-reviewer"):
            return skill_id.split("-")[0]
        if skill_id == "security-reviewer":
            return "security"
        return "assurance"
    if path.startswith(".cursor/skills/superpowers/"):
        return "superpowers"
    if path.startswith(".cursor/skills/gstack/"):
        return "gstack"
    if path.startswith(".cursor/skills/teknovo"):
        return "teknovo"
    if path in ("AGENTS.md", ".cursor/docs/AGENTS.md"):
        return "foundation"
    return "teknovo"


def get_triggers(legacy: dict, skill_id: str) -> list[str]:
    for section in ("planning", "implementation", "review", "troubleshooting", "taste", "quality"):
        block = legacy.get(section, {})
        if skill_id in block and "trigger" in block[skill_id]:
            return block[skill_id]["trigger"]
    return ["on demand"]


def infer_depends(skill_id: str) -> list[str]:
    deps: list[str] = ["agents-md"]
    if skill_id.startswith("quality-") or skill_id == "impeccable-reviewer":
        deps.extend(["taste-gates", "taste-reviewer"])
    if skill_id.startswith("taste-") and skill_id != "taste-reviewer":
        deps = ["agents-md"]
    if skill_id.startswith("teknovo-"):
        if "chief" not in skill_id:
            deps.append("teknovo-chief-architect")
    if skill_id == "impeccable-reviewer":
        deps.extend(["taste-reviewer", "quality-self-critique"])
    if skill_id == "taste-reviewer":
        deps = ["agents-md", "taste-gates"]
    if skill_id == "security-reviewer":
        deps.extend(["security-principles", "security-gates"])
    if skill_id.startswith("superpowers-executing"):
        deps.append("superpowers-writing-plans")
    if skill_id.startswith("gstack-ship"):
        deps.extend(["gstack-qa", "security-reviewer", "quality-gates"])
    return sorted(set(deps))


def build_skills() -> dict[str, dict]:
    legacy = yaml.safe_load((ROOT / ".agents" / "registry.yaml").read_text(encoding="utf-8"))
    flat = legacy.get("skills", {})
    skills: dict[str, dict] = {}

    for sid, extra in EXTRA_SKILLS.items():
        skills[sid] = {
            "id": sid,
            "layer": extra["layer"],
            "priority": extra["priority"],
            "source": extra["source"],
            "path": extra["path"],
            "depends_on": extra.get("depends_on", ["agents-md"]),
            "activate_when": extra.get("activate_when", []),
            "conflicts": extra.get("conflicts", []),
            "description": extra["description"],
            "autoload": extra.get("autoload", False),
            **({"status": extra["status"]} if "status" in extra else {}),
        }

    for sid, entry in flat.items():
        if sid in skills:
            continue
        path = entry.get("path", "")
        layer = infer_layer(sid, entry)
        skills[sid] = {
            "id": sid,
            "layer": layer,
            "priority": infer_priority(sid, entry),
            "source": infer_source(sid, path),
            "path": path,
            "depends_on": infer_depends(sid),
            "activate_when": get_triggers(legacy, sid),
            "conflicts": [],
            "description": entry.get("description", f"Skill {sid} â€” see path"),
            "autoload": bool(entry.get("autoload", False)),
            **({"role": entry["role"]} if entry.get("role") else {}),
            **({"category": entry["category"]} if entry.get("category") else {}),
        }

    for sid, mem in MEMORY_SKILLS.items():
        skills[sid] = {
            "id": sid,
            "layer": mem["layer"],
            "priority": mem["priority"],
            "source": "memory",
            "path": mem["path"],
            "depends_on": ["agents-md"],
            "activate_when": mem["activate_when"],
            "conflicts": [],
            "description": mem["description"],
            "autoload": mem["autoload"],
        }

    return dict(sorted(skills.items()))


def main() -> None:
    skills = build_skills()
    registry = {
        "version": "1.0.0",
        "metadata": {
            "name": "Teknovo Skill Registry",
            "description": "Central orchestration layer â€” single source of truth for skill discovery, layers, priorities, activation, and conflicts",
            "last_updated": date.today().isoformat(),
            "maintainer": "Teknovo AI SuperStack",
            "legacy_registry": ".cursor/registry/legacy-registry.yaml",
            "governance_doc": ".cursor/docs/ai/skill-governance.md",
            "inventory_doc": ".cursor/docs/ai/skill-inventory.md",
            "agent_registry": ".cursor/registry/agent-registry.yaml",
            "mcp_registry": ".cursor/registry/mcp-registry.yaml",
        },
        "layers": LAYERS,
        "priority_levels": {
            "critical": "Mandatory every session or gate-blocking",
            "high": "Autoload or phase-gate recommended",
            "medium": "Trigger-based on-demand",
            "optional": "Specialist / domain / experimental",
        },
        "conflict_resolution": CONFLICT_RESOLUTION,
        "sub_registries": {
            "taste": {"path": ".cursor/gates/taste/taste-registry.yaml", "prefix": "taste-", "note": "Taste artifacts mirrored here; bundles in sub-registry"},
            "quality": {"path": ".cursor/gates/quality/quality-registry.yaml", "prefix": "quality-", "note": "Impeccable quality artifacts"},
            "security": {"path": ".cursor/gates/security/security-registry.yaml", "prefix": "security-", "note": "Security layer artifacts"},
            "memory": {"path": ".cursor/docs/memory/memory-registry.yaml", "prefix": "memory-", "note": "Claude-Mem long-term artifacts"},
            "assurance": {"path": ".cursor/gates/assurance/", "prefix": "assurance-", "note": "Assurance artifacts; assurance-registry.yaml [PLANNED]"},
        },
        "autoload": [s for s, v in skills.items() if v.get("autoload")],
        "bundles": {
            "session-bootstrap": {
                "description": "Default session â€” foundation + memory + autoload skills",
                "skills": ["agents-md", "memory-project-context", "memory-repository-map"],
            },
            "pre-feature": {
                "description": "Before feature work â€” taste + assurance + pillar 1",
                "skills": ["taste-gates", "taste-reviewer", "requirement-clarifier", "teknovo-chief-product-designer"],
            },
            "pre-implementation": {
                "description": "Before code â€” architecture + security + context",
                "skills": ["teknovo-chief-architect", "context-builder", "security-reviewer", "security-gates"],
            },
            "pre-ship": {
                "description": "Before merge/deploy â€” quality + security + QA",
                "skills": ["quality-gates", "quality-self-critique", "security-reviewer", "gstack-qa", "gstack-eng-review"],
            },
        },
        "skills": skills,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    header = (
        "# Teknovo Skill Registry â€” Central Orchestration Layer\n"
        "# Single source of truth. Legacy: .cursor/registry/legacy-registry.yaml (backward compatible)\n"
        "# Schema: id, layer, priority, source, path, depends_on, activate_when, conflicts, description\n"
        "# Extend: add skill block under skills: â€” run .cursor/runtime/load-skills.py --validate\n\n"
    )
    OUT.write_text(header + yaml.dump(registry, sort_keys=False, allow_unicode=True, default_flow_style=False), encoding="utf-8")

    layers_count: dict[str, int] = {}
    for s in skills.values():
        layers_count[s["layer"]] = layers_count.get(s["layer"], 0) + 1
    print(f"Wrote {OUT} â€” {len(skills)} skills")
    for layer, count in sorted(layers_count.items(), key=lambda x: LAYERS[x[0]]["order"]):
        print(f"  {layer}: {count}")


if __name__ == "__main__":
    main()
