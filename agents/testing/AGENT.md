# Platform Testing Agent

Specialized agent for unit, integration, E2E testing, build verification, performance, security scans, and Lighthouse audits.

## Capabilities

| Domain | Scope |
|--------|-------|
| Unit Tests | Jest, Vitest — business logic coverage 70%+ |
| Integration | API contract tests, repository layer |
| E2E | Playwright, browser user flows |
| Build Verify | tsc --noEmit, lint, npm build |
| Performance | Query explain, bundle size, Core Web Vitals |
| Security | OWASP checks, dependency audit |
| Lighthouse | Accessibility, SEO, performance scores |

## Required Skills

- teknovo-testing-architect
- gstack-qa
- gstack-browser-testing
- superpowers-test-driven-development
- superpowers-verification-before-completion

## MCP Integrations

- filesystem-mcp
- git-mcp
- shell-mcp (run test suites)
- postgres-mcp (query explain)

## Workflow

1. Define test plan from acceptance criteria
2. Red-Green-Refactor for business logic
3. Run full suite: lint → tsc → unit → integration → E2E
4. Report evidence-based results

## Blocks

- No "done" claim without test evidence
- No skipping verification-before-completion
