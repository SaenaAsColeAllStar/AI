import { describe, it, beforeAll } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyzeIntent,
  selectSkills,
  dispatchPlan,
  orchestrate,
  shouldUseParallel,
  matchIntents,
  loadIntentMap,
  loadRoutingConfig,
} from '../orchestrator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, '..');
const REPO_ROOT = join(SKILL_ROOT, '..', '..', '..');

function expectSkillsInclude(analysis, ...expectedSkillIds) {
  for (const skillId of expectedSkillIds) {
    assert.ok(
      analysis.skills.includes(skillId),
      `Expected skills to include "${skillId}", got: ${JSON.stringify(analysis.skills)}`
    );
  }
}

describe('intent-routing', () => {
  beforeAll(() => {
    assert.ok(existsSync(join(SKILL_ROOT, 'routing.yaml')));
    assert.ok(existsSync(join(SKILL_ROOT, 'intent-map.yaml')));
    assert.ok(existsSync(join(SKILL_ROOT, 'orchestrator.js')));
  });

  it('loads routing and intent-map configs', () => {
    const routing = loadRoutingConfig(SKILL_ROOT);
    const intentMap = loadIntentMap(SKILL_ROOT);
    assert.ok(routing.routes?.landing_page);
    assert.ok(intentMap.intents?.finance);
    assert.ok(intentMap.intents?.ppdb);
  });

  it('Test 1: landing page for SMK Teknovo routes to architect, ui-ux, testing, cloudflare', () => {
    const message = 'Build a landing page for SMK Teknovo';
    const analysis = analyzeIntent(message, SKILL_ROOT);

    assert.equal(analysis.intent, 'landing_page');
    expectSkillsInclude(
      analysis,
      'teknovo-chief-architect',
      'teknovo-ui-ux',
      'teknovo-testing-architect',
      'teknovo-cloudflare-stack'
    );
    assert.ok(analysis.parallel, 'Landing page should enable parallel execution');
    assert.ok(analysis.autonomous);
  });

  it('Test 2: school finance system routes to finance skills', () => {
    const message = 'Build school finance system';
    const analysis = analyzeIntent(message, SKILL_ROOT);

    assert.equal(analysis.intent, 'finance');
    expectSkillsInclude(
      analysis,
      'teknovo-chief-architect',
      'teknovo-finance',
      'teknovo-database-architect',
      'teknovo-backend-development',
      'teknovo-rbac-architect',
      'teknovo-testing-architect',
      'teknovo-security-review'
    );
  });

  it('Test 3: PPDB system routes to ppdb skills', () => {
    const message = 'Build PPDB system';
    const analysis = analyzeIntent(message, SKILL_ROOT);

    assert.equal(analysis.intent, 'ppdb');
    expectSkillsInclude(
      analysis,
      'teknovo-chief-architect',
      'teknovo-ppdb',
      'teknovo-backend-development',
      'teknovo-database-architect',
      'teknovo-testing-architect'
    );
  });

  it('Test 4: sarpras/inventory routes to sarpras skills', () => {
    const message = 'Build sarpras inventory management system';
    const analysis = analyzeIntent(message, SKILL_ROOT);

    assert.equal(analysis.intent, 'sarpras');
    expectSkillsInclude(
      analysis,
      'teknovo-chief-architect',
      'teknovo-database-architect',
      'teknovo-backend-development',
      'teknovo-reporting',
      'teknovo-testing-architect'
    );
  });

  it('detects deploy keywords and adds cloudflare stack', () => {
    const analysis = analyzeIntent('Deploy landing page to Cloudflare production', SKILL_ROOT);
    assert.ok(analysis.deploy);
    expectSkillsInclude(analysis, 'teknovo-cloudflare-stack', 'teknovo-devops-engineer');
  });

  it('selectSkills resolves skill paths', () => {
    const paths = selectSkills(['teknovo-chief-architect', 'teknovo-ui-ux'], SKILL_ROOT);
    assert.equal(paths.length, 2);
    assert.ok(paths[0].path.includes('SKILL.md'));
    assert.ok(existsSync(join(REPO_ROOT, paths[0].path.replace(/^\.\//, ''))));
  });

  it('dispatchPlan produces workstreams with parallel groups for landing page', () => {
    const analysis = analyzeIntent('Build a landing page for SMK Teknovo', SKILL_ROOT);
    const plan = dispatchPlan(analysis, SKILL_ROOT);

    assert.ok(plan.workstreams.length >= 2);
    assert.equal(plan.executionMode, 'parallel');
    assert.ok(plan.parallelGroups.length >= 1);
    assert.ok(plan.verificationSkills.includes('teknovo-testing-architect'));
  });

  it('Test 5: multi-domain request triggers parallel dispatch', () => {
    const message = 'Build finance system and PPDB admission module and sarpras inventory';
    const matched = matchIntents(message, loadIntentMap(SKILL_ROOT));
    assert.ok(matched.length >= 3, `Expected 3+ domain matches, got ${matched.length}`);

    const analysis = analyzeIntent(message, SKILL_ROOT);
    assert.ok(analysis.intents.length >= 3);
    assert.ok(analysis.parallel, 'Multi-domain request should use parallel dispatch');

    const parallel = shouldUseParallel(
      matched.map((m) => ({ id: m.id, config: m.config })),
      loadRoutingConfig(SKILL_ROOT)
    );
    assert.ok(parallel);
  });

  it('orchestrate returns full analysis and plan', () => {
    const result = orchestrate('Build PPDB system with deploy to Cloudflare', SKILL_ROOT);
    assert.ok(result.analysis);
    assert.ok(result.plan);
    assert.equal(result.analysis.intent, 'ppdb');
    assert.ok(result.analysis.deploy);
    assert.ok(result.plan.workstreams.some((w) => w.id === 'deployment'));
  });
});

// Re-export for node --test compatibility when run directly
describe.run?.();
