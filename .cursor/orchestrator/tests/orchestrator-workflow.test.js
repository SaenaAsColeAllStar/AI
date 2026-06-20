import { describe, it, expect } from '@jest/globals';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decomposeTask,
  selectAgents,
  runParallel,
  runSequential,
  runConditional,
  executeWorkflow,
  onAgentFailure,
  aggregateResults,
  loadAgentContract,
} from '../orchestrator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');

describe('orchestrator workflow', () => {
  it('decomposes compound tasks into domain subtasks', () => {
    const result = decomposeTask(
      {
        description: 'Build Next.js UI and REST API with RBAC',
        keywords: ['next.js', 'react', 'api', 'backend', 'rbac'],
      },
      REPO_ROOT
    );
    expect(result.subtasks.length).toBeGreaterThanOrEqual(2);
    const domains = result.subtasks.map((s) => s.domain);
    expect(domains).toContain('frontend');
    expect(domains).toContain('backend');
  });

  it('selects agents with contracts and MCPs', () => {
    const decomposition = decomposeTask(
      { description: 'Deploy to Cloudflare Pages', keywords: ['cloudflare', 'pages', 'deploy'] },
      REPO_ROOT
    );
    const selected = selectAgents(decomposition, REPO_ROOT);
    expect(selected.length).toBeGreaterThan(0);
    expect(selected[0].contract).toBeDefined();
  });

  it('runs parallel agents with failure isolation', async () => {
    let callCount = 0;
    const handlers = {
      'platform-frontend': async () => {
        callCount++;
        return { status: 'ok', agent: 'frontend' };
      },
      'platform-backend': async () => {
        callCount++;
        throw new Error('Backend failed');
      },
    };

    const result = await runParallel(
      [
        { agentId: 'platform-frontend', task: { description: 'UI' } },
        { agentId: 'platform-backend', task: { description: 'API' } },
      ],
      { handlers, root: REPO_ROOT, maxRetries: 1 }
    );

    expect(callCount).toBeGreaterThanOrEqual(2);
    expect(result.total).toBe(2);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.partialResults).toHaveLength(1);
  });

  it('runs sequential agents with dependency gates', async () => {
    const order = [];
    const handlers = {
      'platform-frontend': async () => {
        order.push('frontend');
        return { status: 'ok' };
      },
      'platform-testing': async () => {
        order.push('testing');
        return { status: 'ok' };
      },
      'platform-cloudflare': async () => {
        order.push('cloudflare');
        return { status: 'ok' };
      },
    };

    const result = await runSequential(
      [
        { id: 'frontend', agentId: 'platform-frontend', task: { description: 'Build UI' } },
        { id: 'testing', agentId: 'platform-testing', task: { description: 'Test' }, dependsOn: ['frontend'] },
        { id: 'cloudflare', agentId: 'platform-cloudflare', task: { description: 'Deploy' }, dependsOn: ['testing'] },
      ],
      { handlers, root: REPO_ROOT }
    );

    expect(result.success).toBe(true);
    expect(order).toEqual(['frontend', 'testing', 'cloudflare']);
  });

  it('blocks sequential step when dependency fails', async () => {
    const handlers = {
      'platform-frontend': async () => {
        throw new Error('Frontend failed');
      },
      'platform-testing': async () => ({ status: 'ok' }),
    };

    const result = await runSequential(
      [
        { id: 'frontend', agentId: 'platform-frontend', task: { description: 'UI' } },
        { id: 'testing', agentId: 'platform-testing', task: { description: 'Test' }, dependsOn: ['frontend'] },
      ],
      { handlers, root: REPO_ROOT, maxRetries: 1 }
    );

    expect(result.success).toBe(false);
    expect(result.failures.length).toBeGreaterThanOrEqual(1);
  });

  it('runs conditional workflow branches', async () => {
    const handlers = {
      'platform-cloudflare': async () => ({ deployed: true }),
      'platform-testing': async () => ({ retest: true }),
    };

    const passResult = await runConditional(
      {
        condition: (ctx) => ctx.testResults?.success === true,
        then: [{ id: 'deploy', agentId: 'platform-cloudflare', task: { description: 'Deploy' } }],
        else: [{ id: 'retest', agentId: 'platform-testing', task: { description: 'Retest' } }],
      },
      { handlers, root: REPO_ROOT, context: { testResults: { success: true } } }
    );
    expect(passResult.success).toBe(true);
    expect(passResult.results[0].agentId).toBe('platform-cloudflare');

    const failResult = await runConditional(
      {
        condition: (ctx) => ctx.testResults?.success === true,
        then: [{ id: 'deploy', agentId: 'platform-cloudflare', task: { description: 'Deploy' } }],
        else: [{ id: 'retest', agentId: 'platform-testing', task: { description: 'Retest' } }],
      },
      { handlers, root: REPO_ROOT, context: { testResults: { success: false } } }
    );
    expect(failResult.results[0].agentId).toBe('platform-testing');
  });

  it('executes declarative parallel workflow', async () => {
    const handlers = {
      'platform-frontend': async () => ({ ok: true }),
      'platform-backend': async () => ({ ok: true }),
    };

    const result = await executeWorkflow(
      {
        type: 'parallel',
        steps: [
          { agentId: 'platform-frontend', task: { description: 'UI' } },
          { agentId: 'platform-backend', task: { description: 'API' } },
        ],
      },
      { handlers, root: REPO_ROOT }
    );

    expect(result.success).toBe(true);
    expect(result.total).toBe(2);
  });

  it('isolates agent failure via onAgentFailure', async () => {
    const result = await onAgentFailure(
      {
        agentId: 'platform-backend',
        task: { description: 'API' },
        error: 'Connection refused',
        attempts: 10,
      },
      { root: REPO_ROOT, maxRetries: 10 }
    );

    expect(result.isolated).toBe(true);
    expect(result.recovered).toBe(false);
    expect(result.success).toBe(false);
  });

  it('aggregates partial results correctly', () => {
    const aggregated = aggregateResults([
      { agentId: 'a', success: true, result: { data: 1 } },
      { agentId: 'b', success: false, error: 'failed', isolated: true },
    ]);
    expect(aggregated.succeeded).toBe(1);
    expect(aggregated.failed).toBe(1);
    expect(aggregated.partialResults).toHaveLength(1);
  });

  it('loads agent contracts for all platform agents', () => {
    for (const agentId of [
      'orchestrator',
      'platform-frontend',
      'platform-backend',
      'platform-testing',
      'platform-devops',
      'platform-cloudflare',
      'platform-github',
    ]) {
      const contract = loadAgentContract(agentId, REPO_ROOT);
      expect(contract).toBeDefined();
      expect(contract.id ?? contract.name).toBeTruthy();
    }
  });

  it('platform agent contract files exist', () => {
    for (const dir of ['frontend', 'backend', 'devops', 'testing', 'orchestrator', 'cloudflare', 'github']) {
      const base = join(REPO_ROOT, 'agents', dir);
      expect(existsSync(join(base, 'agent.yaml'))).toBe(true);
      expect(existsSync(join(base, 'README.md'))).toBe(true);
      expect(existsSync(join(base, 'system-prompt.md'))).toBe(true);
      expect(existsSync(join(base, 'capabilities.yaml'))).toBe(true);
      expect(existsSync(join(base, 'workflow.yaml'))).toBe(true);
    }
  });
});
