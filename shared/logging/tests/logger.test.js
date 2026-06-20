import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  configureLogger,
  registerSecret,
  maskValue,
  sanitizeData,
  createLogger,
  MASKED_VALUE,
} from '../index.js';

describe('platform logging', () => {
  const originalToken = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    configureLogger({ maskSecrets: true });
    registerSecret('super-secret-token-value');
  });

  afterEach(() => {
    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
    else delete process.env.GITHUB_TOKEN;
  });

  it('masks registered secrets', () => {
    expect(maskValue('token super-secret-token-value here')).toContain(MASKED_VALUE);
  });

  it('sanitizes credential fields', () => {
    const out = sanitizeData({ apiToken: 'abc', name: 'test' });
    expect(out.apiToken).toBe(MASKED_VALUE);
    expect(out.name).toBe('test');
  });

  it('creates component logger', () => {
    const log = createLogger('orchestrator');
    expect(log.info).toBeInstanceOf(Function);
    expect(log.error).toBeInstanceOf(Function);
  });

  it('logs through all levels', () => {
    const log = createLogger('test');
    expect(() => {
      log.debug('debug msg', { key: 'value' });
      log.info('info msg');
      log.warn('warn msg');
      log.error('error msg');
    }).not.toThrow();
  });
});
