---
name: gstack-ship
description: Safe release, deployment configuration, and post-merge verification guidelines.
---

# Ship Skill

Use this skill when preparing to merge, deploy, or release a completed feature. Final gate before production.

Modeled after [GStack /ship](https://github.com/garrytan/gstack) with Teknovo deployment standards.

---

## When to Activate

- QA passed with evidence
- Ready to merge to main/staging/production
- Trigger words: deploy, release, ship, merge to staging

---

## Pre-Ship Checklist

### Code Quality (must all pass)
- [ ] **superpowers-verification-before-completion** evidence attached
- [ ] **gstack-eng-review** passed
- [ ] **gstack-qa** passed
- [ ] No critical or major review issues open

### Database
- [ ] Migration files included in PR
- [ ] Migration tested against clean database
- [ ] Migration tested against database with existing data
- [ ] Rollback migration available (if destructive)
- [ ] No hard deletes in migration scripts

Reference: `docs/database/drizzle-contract.md`

### Environment
- [ ] New env vars documented in `.env.example`
- [ ] No secrets committed to repository
- [ ] Feature flags configured (if applicable)

Reference: `docs/standards/environment/environment-standard.md`

### RBAC
- [ ] New permissions seeded in migration or seed script
- [ ] `docs/.cursor/gates/security/rbac-matrix.md` updated
- [ ] Role assignments verified for new permissions

### API
- [ ] OpenAPI spec regenerated (if endpoints changed)
- [ ] No breaking changes to existing `/api/v1/` contracts
- [ ] Version bump if breaking change unavoidable

### Infrastructure
- [ ] Cloudflare DNS/tunnel updated (if new subdomain)
- [ ] R2 bucket created (if file storage added)
- [ ] Redis queue configured (if new async jobs)

Reference: `docs/infrastructure/deployment-standard.md`, `docs/infrastructure/cicd-standard.md`

---

## Deployment Steps

### Staging

```bash
# 1. Merge to staging branch
git checkout staging
git merge feature/<name>

# 2. Run migrations
pnpm drizzle-kit migrate

# 3. Deploy
pnpm deploy:staging

# 4. Smoke test critical flows
pnpm test:e2e --config playwright.staging.config.ts
```

### Production

```bash
# 1. Merge staging to main (after staging verification)
git checkout main
git merge staging

# 2. Tag release
git tag v<semver>

# 3. Run migrations (with backup)
pg_dump teknovo > backup-$(date +%Y%m%d).sql
pnpm drizzle-kit migrate

# 4. Deploy
pnpm deploy:production

# 5. Post-deploy verification
curl -f https://api.domain.sch.id/api/v1/health
```

Reference: `docs/infrastructure/deployment-standart-runtime.md`

---

## Post-Ship Verification

After deployment:

- [ ] Health check endpoint returns 200
- [ ] Login flow works
- [ ] New feature accessible with correct permissions
- [ ] No error spikes in logs (first 15 minutes)
- [ ] Database migration applied (`SELECT * FROM drizzle.__drizzle_migrations`)

---

## Rollback Plan

If post-ship verification fails:

1. Revert deployment to previous version
2. Run rollback migration (if available)
3. Restore database from backup (if migration was destructive)
4. Document incident for **gstack-retro**

---

## Ship Output

```markdown
## Ship Report: [feature/version]

### Deployment
- Environment: [staging/production]
- Version/tag: [vX.Y.Z]
- Migration: [applied/skipped]
- Deploy time: [timestamp]

### Post-Ship Checks
| Check | Result |
|-------|--------|
| Health endpoint | ✅ |
| Login flow | ✅ |
| New feature | ✅ |
| Error logs | ✅ clean |

### Rollback Plan
[steps if needed]
```

---

## Git Rules

- Only commit when user explicitly requests
- Only push when user explicitly requests
- Never force-push to main/master

---

## After Ship

Invoke **gstack-retro** for sprint-level features to capture lessons learned.
