# Architecture Decisions — Teknovo

> **Source**: `.cursor/docs/ai/repository-analysis.md`, `teknovo-chief-architect`, `teknovo-cloudflare-stack`, `teknovo-repository-governance`, `teknovo-devops-engineer` skills; Teknovo-V2 ADRs referenced but not present in AI repo  
> **Last updated**: 2026-06-20  
> **Refresh policy**: Manual when ADRs change in Teknovo-V2; partial sync via refresh script

---

## ADR Index (Teknovo-V2 — Reference Paths)

These ADRs live in Teknovo-V2 `docs/adr/` and are cited throughout skills:

| ADR | Path | Topic |
|-----|------|-------|
| ADR-001 | `docs/adr/ADR-001-monorepo.md` | PNPM monorepo structure |
| ADR-011 | `docs/adr/ADR-011-subdomain-architecture.md` | Subdomain routing per domain |
| Package ownership | `docs/adr/package-ownership.md` | Package boundary rules |

> **Note**: ADR files are not copied into the AI SuperStack repo. Agents working on Teknovo-V2 must read them from the target codebase.

---

## Decision: PNPM Monorepo (ADR-001)

**Status**: Accepted (Teknovo-V2)

### Context

Teknovo is a multi-domain school ERP with shared UI, standards, and backend modules spanning PPDB, Academic, Finance, CBT, and WA.

### Decision

Use a **PNPM workspace monorepo** with:
- Applications in `apps/` (portal Nuxt app)
- Shared packages in `packages/` (ui, shared-utils)
- Centralized docs, migrations, and standards in `docs/` and `drizzle/`

### Rationale

| Benefit | Explanation |
|---------|-------------|
| Shared UI contract | `packages/ui/` enforces design system across all subdomains |
| Atomic changes | Schema + API + UI changes in single PR |
| Standards co-location | ADRs, PRDs, RBAC matrix alongside code |
| Agent awareness | Single repository map for AI workstation |

### Consequences

- New apps/packages require Architecture Impact Analysis
- Cross-package imports governed by `teknovo-repository-governance`
- UI components forbidden outside `packages/ui/`

---

## Decision: Subdomain Architecture (ADR-011)

**Status**: Accepted (Teknovo-V2)

### Context

Each ERP domain serves different user personas (applicants, teachers, finance staff, exam proctors) with distinct RBAC and scaling needs.

### Decision

Deploy each domain on dedicated subdomains routed through Cloudflare:

| Subdomain | Service | Port |
|-----------|---------|------|
| `portal.*` | Nuxt landing | 3000 |
| `erp.*` | ERP application | 3000 |
| `ppdb.*` | PPDB application | 3000 |
| `cbt.*` | CBT application | 3000 |
| `finance.*` | Finance application | 3000 |
| `api.*` | REST API | 4000 |
| `wa.*` | WhatsApp gateway | 4001 |

### Rationale

- **Security isolation** — Separate cookie scopes and CORS policies per domain
- **RBAC clarity** — Nav and permissions align to subdomain context
- **Independent scaling** — CBT exam traffic isolated from finance operations
- **Cloudflare routing** — Single tunnel, multiple hostname ingress rules

---

## Decision: Cloudflare Edge Infrastructure

**Status**: Accepted (Teknovo-V2 + AI workstation roadmap M4)

### Why Teknovo Uses Cloudflare

| Reason | Detail |
|--------|--------|
| **No public ports** | Cloudflare Tunnels expose services via `127.0.0.1` binding — database and API never directly internet-facing |
| **SSL/TLS termination** | Full (Strict) mode with automatic certificate management |
| **Edge security** | WAF, bot management, rate limiting on login/public endpoints |
| **DNS simplicity** | CNAME records to tunnel; one config per environment |
| **R2 object storage** | S3-compatible storage for documents, assets, backups, PDF reports without egress fees |
| **Workers/D1 (optional)** | Edge compute and SQLite for lightweight workloads per devops skill |
| **Indonesia school deployment** | Edge network reduces latency for distributed school admin access |

### Anti-Patterns Avoided

| Wrong | Right |
|-------|-------|
| Bind services to `0.0.0.0` | Bind to `127.0.0.1`, tunnel outward |
| R2 credentials in frontend | Presigned URLs via backend (5 min expiry) |
| Single bucket for all files | Separate buckets by access level |
| Database exposed to internet | Private PostgreSQL on localhost only |

### R2 Bucket Structure

| Bucket | Purpose | Access |
|--------|---------|--------|
| `teknovo-documents` | Student docs, PPDB uploads | Private |
| `teknovo-assets` | Marketing assets | Public CDN |
| `teknovo-backups` | Database backups | Private |
| `teknovo-reports` | Generated PDFs | Private |

---

## Decision: Nuxt.js Portal Application

**Status**: Accepted (Teknovo-V2)

> **Version note**: This AI repo references **Nuxt.js** for `apps/portal/` (`.cursor/docs/ai/repository-analysis.md`, `.cursor/docs/AGENTS.md`). Specific Nuxt major version (e.g., Nuxt 4) is defined in Teknovo-V2 `package.json`, not in this workstation repo.

### Context

Teknovo needs SSR/SSG for landing pages, SPA-like ERP dashboards, and shared component library integration.

### Decision

Use **Nuxt.js** in `apps/portal/` as the primary web application framework with shared components from `packages/ui/`.

### Rationale

| Benefit | Explanation |
|---------|-------------|
| Full-stack Vue | Pages, layouts, middleware for RBAC route guards |
| SEO for portal | Server rendering for `portal.domain.sch.id` landing/admissions |
| Monorepo fit | Nuxt integrates with PNPM workspace and shared UI package |
| Subdomain deployment | Same Nuxt build serves multiple subdomain contexts via routing/config |
| Ecosystem alignment | shadcn/ui + Radix + TanStack Query standard in Teknovo stack |

---

## Decision: RBAC Everywhere

**Status**: Accepted (core constraint)

### Decision

Every route, menu item, API endpoint, and action button requires explicit permission mapping using `domain.resource.action` format.

### Rationale

- School ERP handles sensitive student/finance data
- Multiple roles (GURU, ADMIN, finance staff, PPDB verifier) with overlapping but distinct access
- Sidebar navigation derives from permission-filtered menu tree
- Prevents "security by UI hiding" — backend guards mandatory

### Implementation

- Route guards on API (controller/policy layer)
- Nav node → permission mapping in RBAC matrix
- UI Permission page state when role insufficient
- Reference: `docs/standards/rbac/rbac-standard.md`, `docs/.cursor/gates/security/rbac-matrix.md`

---

## Decision: Sidebar Navigation (Mandatory)

**Status**: Accepted (design system)

See `.cursor/docs/memory/ui-ux-rules.md` for full rationale. Summary:

- Global Domain → Module → Page sidebar across all ERP modules
- Max 3 levels; no per-module custom sidebars
- Maps to RBAC permissions
- Mobile drawer/bottom nav adaptation

Reference: `docs/standards/design-system/navigation-architecture-standard.md`

---

## Decision: Layer Isolation (Controller → Service → Repository)

**Status**: Accepted (backend standard)

### Rationale

- Testable business logic in services
- Repository encapsulation prevents query sprawl
- Cross-module access only via exported services + domain events
- AI agents can audit layers independently (gstack-eng-review)

---

## Decision: UUID v7 + Soft Deletes

**Status**: Accepted (database standard)

### Rationale

| Choice | Reason |
|--------|--------|
| UUID v7 | Sortable, globally unique, no auto-increment leakage |
| Soft deletes | Audit compliance for school records; financial/academic history preserved |
| Audit columns | `created_by`, `updated_by`, `deleted_at` on every table |

---

## Decision: PostgreSQL 17 + Drizzle ORM

**Status**: Accepted

- PostgreSQL for relational school data with schema separation
- Drizzle for type-safe migrations via drizzle-kit
- Private access on `127.0.0.1` only

---

## Decision: BullMQ + Redis Event Bus

**Status**: Accepted

- Async domain events between bounded contexts
- Idempotent handlers, 3 retries, DLQ
- Naming: `domain.entity.action`

---

## Decision: Ollama + Qwen for AI Workstation (Not vLLM)

**Status**: Accepted for AI SuperStack workstation (M1 complete, M3 planned)

### Context

Local GPU workstation (RTX 3090 x2) runs agent sessions via OpenCode + Cursor.

### Decision

Use **Ollama** serving **Qwen3 32B** (`qwen3:32b` in `.cursor/runtime/bootstrap/install.lock.yaml`) — not vLLM, not raw PyTorch serving stack.

### Rationale

| Benefit | Explanation |
|---------|-------------|
| Simple install | Single `curl | sh` install per `AI_DEPLOY.md` |
| Model management | `ollama pull` handles quantization and GPU allocation |
| OpenCode integration | OpenAI-compatible API at `127.0.0.1:11434/v1` |
| Recovery | 10–15 minute restore after GPU expiry — no CUDA/Torch manual rebuild |
| Stability | Avoids vLLM/CUDA version pinning conflicts documented in lessons-learned |

---

## Decision: Three Pillars Gate Order

**Status**: Accepted (AI SuperStack workflow)

```text
Pillar 1 (Product Design) → Pillar 2 (Architecture) → Implementation → Review/QA → Pillar 3 (DevOps)
```

Blocks:
- UI without Product Design Analysis
- Code/migrations without Architecture Impact Analysis
- Production deploy without Deployment Impact Analysis + QA evidence

---

## Architecture Impact Analysis Template

Required before any implementation (from teknovo-chief-architect):

1. Executive Summary
2. Database Impact
3. API Impact
4. RBAC Impact
5. Folder Structure Impact
6. Cross-Domain Dependencies
7. ADR Compliance
8. Risks
9. Recommendations
10. Verdict: APPROVE / CONDITIONAL / BLOCK

Save to: `docs/architecture/impact/<feature>-architecture-impact.md`

---

## Related Teknovo-V2 Architecture Docs

| Document | Path |
|----------|------|
| System overview | `docs/architecture/system-overview.md` |
| Folder contract | `docs/architecture/folder-contract.md` |
| Domain context map | `docs/architecture/domain-context-map.md` |
| Data ownership matrix | `docs/architecture/data-ownership-matrix.md` |
| Domain event catalog | `docs/architecture/domain-event-catalog.md` |
| Cloudflare setup | `docs/infrastructure/cloudflare-setup-guide.md` |
| Deployment standard | `docs/infrastructure/deployment-standard.md` |
