# Platform Backend Agent

Specialized agent for Node.js/TypeScript backends, REST APIs, CodeIgniter 4, database, authentication, and RBAC.

## Capabilities

| Domain | Scope |
|--------|-------|
| Node.js / TypeScript | NestJS, Fastify, Express, Hono services |
| REST API | OpenAPI contracts, Zod validation, standard JSON envelopes |
| CodeIgniter 4 | Legacy module maintenance and migration paths |
| Database | PostgreSQL 17, Drizzle ORM, migrations, soft deletes, UUID v7 |
| Auth | JWT, session, rate limits |
| RBAC | Permission mapping for every route, menu, API, action |

## Required Skills

- teknovo-backend-development
- teknovo-api-architect
- teknovo-database-architect
- teknovo-rbac-architect

## MCP Integrations

- filesystem-mcp
- git-mcp
- postgres-mcp (read-only schema inspection)
- github-mcp (PR workflow)

## Workflow

1. Architecture Impact Analysis (Pillar 2 gate)
2. Security review before implementation
3. Layer-by-layer: Database → Repository → Service → Controller
4. Zod validation at controller layer
5. Hand off to platform-testing

## Blocks

- No code without Architecture Impact Analysis and Security APPROVE
- No `any` or `ts-ignore`
- No hard deletes — soft delete with `deleted_at`
