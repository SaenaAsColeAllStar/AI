/**
 * Tests for validation helpers and logger configuration.
 */

import { describe, it, expect, afterEach } from '@jest/globals';
import { z } from 'zod';
import {
  validateEnv,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { configureLogger, logger, maskValue } from '../lib/logger.js';

describe('validation helpers', () => {
  it('formatZodError formats issues', () => {
    const schema = z.object({ x: z.string().min(1) });
    const result = schema.safeParse({});
    if (result.success) throw new Error('expected failure');
    expect(formatZodError(result.error)).toContain('x');
  });

  it('toolError returns structured MCP error', () => {
    const result = toolError('fail', { code: 1 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('fail');
  });

  it('toolSuccess returns structured MCP success', () => {
    const result = toolSuccess({ id: 1 });
    expect(result.content[0].text).toContain('"success": true');
  });
});

describe('logger', () => {
  it('configureLogger accepts level and maskSecrets', () => {
    configureLogger({ level: 'debug', maskSecrets: false });
    expect(maskValue('plain')).toBe('plain');
    configureLogger({ level: 'info', maskSecrets: true });
  });

  it('masks env token when present', () => {
    const token = 'super-secret-token-value-12345';
    process.env.CLOUDFLARE_API_TOKEN = token;
    const masked = maskValue(`token=${token}`);
    expect(masked).not.toContain(token);
    delete process.env.CLOUDFLARE_API_TOKEN;
  });

  it('logger methods run without throw', () => {
    logger.debug('debug msg', { a: 1 });
    logger.info('info msg');
    logger.warn('warn msg');
    logger.error('error msg');
  });
});

describe('validateEnv edge cases', () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  it('rejects empty token', () => {
    process.env.CLOUDFLARE_API_TOKEN = '';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a';
    process.env.CLOUDFLARE_ZONE_ID = 'z';
    const result = validateEnv();
    expect(result.ok).toBe(false);
  });
});
