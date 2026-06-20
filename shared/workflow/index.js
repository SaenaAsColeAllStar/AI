/**
 * Teknovo workflow engine — step runner with retry and failure recovery.
 * Aligns with execution/execution-registry.yaml max_retries: 10.
 */

const DEFAULT_MAX_RETRIES = 10;

/**
 * @typedef {Object} WorkflowStep
 * @property {string} id
 * @property {string} [name]
 * @property {() => Promise<unknown>} action
 * @property {number} [retries]
 * @property {number} [timeoutMs]
 */

/**
 * @typedef {Object} StepResult
 * @property {string} id
 * @property {boolean} success
 * @property {unknown} [result]
 * @property {string} [error]
 * @property {number} attempts
 */

/**
 * @param {() => Promise<unknown>} fn
 * @param {number} timeoutMs
 */
async function withTimeout(fn, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return fn();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Step timed out after ${timeoutMs}ms`)), timeoutMs);
    fn()
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Run a single step with retries.
 * @param {WorkflowStep} step
 * @param {{ maxRetries?: number, onRetry?: (attempt: number, error: Error) => void }} [options]
 * @returns {Promise<StepResult>}
 */
export async function runStep(step, options = {}) {
  const maxRetries = step.retries ?? options.maxRetries ?? DEFAULT_MAX_RETRIES;
  let lastError = 'Unknown error';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(step.action, step.timeoutMs ?? 0);
      return { id: step.id, success: true, result, attempts: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        options.onRetry?.(attempt, err instanceof Error ? err : new Error(lastError));
      }
    }
  }

  return { id: step.id, success: false, error: lastError, attempts: maxRetries };
}

/**
 * Workflow engine for sequential and parallel step execution.
 */
export class WorkflowEngine {
  /**
   * @param {{ maxRetries?: number, onStepComplete?: (result: StepResult) => void }} [options]
   */
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.onStepComplete = options.onStepComplete;
    /** @type {WorkflowStep[]} */
    this.steps = [];
  }

  /**
   * @param {WorkflowStep} step
   */
  addStep(step) {
    this.steps.push(step);
    return this;
  }

  /**
   * @param {WorkflowStep[]} steps
   */
  addSteps(steps) {
    for (const step of steps) this.addStep(step);
    return this;
  }

  /**
   * Run all steps sequentially; stops on first failure unless continueOnError.
   * @param {{ continueOnError?: boolean }} [options]
   * @returns {Promise<{ success: boolean, results: StepResult[] }>}
   */
  async run(options = {}) {
    /** @type {StepResult[]} */
    const results = [];

    for (const step of this.steps) {
      const result = await runStep(step, { maxRetries: this.maxRetries });
      results.push(result);
      this.onStepComplete?.(result);

      if (!result.success && !options.continueOnError) {
        return { success: false, results };
      }
    }

    return { success: results.every((r) => r.success), results };
  }

  /**
   * Run steps in parallel.
   * @param {WorkflowStep[]} steps
   * @returns {Promise<{ success: boolean, results: StepResult[] }>}
   */
  async runParallel(steps) {
    const results = await Promise.all(
      steps.map((step) => runStep(step, { maxRetries: this.maxRetries }))
    );
    for (const result of results) this.onStepComplete?.(result);
    return { success: results.every((r) => r.success), results };
  }
}

export { DEFAULT_MAX_RETRIES };
