import { describe, it, expect } from '@jest/globals';
import { taskSchema, validateOrThrow, formatZodError } from '../index.js';

describe('platform validation', () => {
  it('validates task schema', () => {
    const task = validateOrThrow(taskSchema, {
      description: 'Deploy landing page',
      keywords: ['cloudflare', 'deploy'],
    });
    expect(task.description).toBe('Deploy landing page');
  });

  it('throws on invalid task', () => {
    expect(() => validateOrThrow(taskSchema, { description: '' })).toThrow();
  });

  it('formats zod errors', () => {
    const result = taskSchema.safeParse({ description: '' });
    if (!result.success) {
      expect(formatZodError(result.error)).toContain('description');
    }
  });
});
