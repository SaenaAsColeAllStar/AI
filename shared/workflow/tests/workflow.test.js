import { describe, it, expect } from '@jest/globals';
import { runStep, WorkflowEngine, DEFAULT_MAX_RETRIES } from '../index.js';

describe('workflow engine', () => {
  it('runs successful step', async () => {
    const result = await runStep({
      id: 's1',
      action: async () => 'ok',
    });
    expect(result.success).toBe(true);
    expect(result.result).toBe('ok');
  });

  it('retries failing step then succeeds', async () => {
    let calls = 0;
    const result = await runStep({
      id: 's2',
      action: async () => {
        calls += 1;
        if (calls < 3) throw new Error('fail');
        return 'done';
      },
      retries: 5,
    });
    expect(result.success).toBe(true);
    expect(calls).toBe(3);
  });

  it('fails after max retries', async () => {
    const result = await runStep({
      id: 's3',
      action: async () => {
        throw new Error('always fail');
      },
      retries: 2,
    });
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(2);
  });

  it('runs sequential workflow', async () => {
    const engine = new WorkflowEngine();
    const order = [];
    engine
      .addStep({ id: 'a', action: async () => { order.push('a'); } })
      .addStep({ id: 'b', action: async () => { order.push('b'); } });
    const out = await engine.run();
    expect(out.success).toBe(true);
    expect(order).toEqual(['a', 'b']);
  });

  it('runs parallel workflow', async () => {
    const engine = new WorkflowEngine();
    const out = await engine.runParallel([
      { id: 'p1', action: async () => 1 },
      { id: 'p2', action: async () => 2 },
    ]);
    expect(out.success).toBe(true);
    expect(out.results).toHaveLength(2);
  });

  it('uses default max retries constant', () => {
    expect(DEFAULT_MAX_RETRIES).toBe(10);
  });

  it('supports workflow builder addSteps', async () => {
    const engine = new WorkflowEngine();
    engine.addSteps([
      { id: 'x', action: async () => 'x' },
      { id: 'y', action: async () => 'y' },
    ]);
    const out = await engine.run();
    expect(out.success).toBe(true);
    expect(out.results).toHaveLength(2);
  });

  it('continues on error when configured', async () => {
    const engine = new WorkflowEngine();
    engine
      .addStep({ id: 'fail', action: async () => { throw new Error('nope'); }, retries: 1 })
      .addStep({ id: 'ok', action: async () => 'done' });
    const out = await engine.run({ continueOnError: true });
    expect(out.results).toHaveLength(2);
    expect(out.results[1].success).toBe(true);
  });

  it('invokes onStepComplete callback', async () => {
    const completed = [];
    const engine = new WorkflowEngine({
      onStepComplete: (r) => completed.push(r.id),
    });
    engine.addStep({ id: 'cb', action: async () => 1 });
    await engine.run();
    expect(completed).toEqual(['cb']);
  });

  it('calls onRetry between attempts', async () => {
    let calls = 0;
    let retries = 0;
    await runStep(
      {
        id: 'retry',
        action: async () => {
          calls += 1;
          if (calls < 2) throw new Error('retry me');
          return 'ok';
        },
        retries: 3,
      },
      { onRetry: () => { retries += 1; } }
    );
    expect(retries).toBe(1);
  });

  it('times out long-running steps', async () => {
    const result = await runStep({
      id: 'timeout',
      timeoutMs: 50,
      action: async () => new Promise((resolve) => setTimeout(resolve, 200)),
      retries: 1,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('timed out');
  });
});
