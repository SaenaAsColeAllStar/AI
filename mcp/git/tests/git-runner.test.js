/**
 * Git runner unit tests for security guards and env validation.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { resetRepoRoot, validateEnv, getRepoRoot, runGit } from '../lib/git-runner.js';
import { formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { configureLogger, logger } from '../lib/logger.js';
import { z } from 'zod';

/** @param {string} dir */
function initRepo(dir) {
  execFileSync('git', ['init'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 't@t.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'T'], { cwd: dir });
}

describe('git-runner guards', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetRepoRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-git-runner-'));
    initRepo(tempRoot);
    process.env.TEKNOVO_WORKSPACE = tempRoot;
  });

  afterEach(() => {
    resetRepoRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('validateEnv returns repo root', () => {
    const result = validateEnv();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.env.repoRoot).toContain('teknovo-git-runner');
  });

  it('getRepoRoot caches root', () => {
    const a = getRepoRoot();
    const b = getRepoRoot();
    expect(a).toBe(b);
  });

  it('blocks --force flag', () => {
    expect(() => runGit(['push', '--force', 'origin', 'main'])).toThrow('Force');
  });

  it('blocks -f flag', () => {
    expect(() => runGit(['push', '-f', 'origin', 'main'])).toThrow('Force');
  });

  it('runGit executes valid command', () => {
    const out = runGit(['rev-parse', '--is-inside-work-tree']);
    expect(out).toBe('true');
  });
});

describe('validateEnv failures', () => {
  afterEach(() => resetRepoRoot());

  it('fails when TEKNOVO_WORKSPACE missing', () => {
    delete process.env.TEKNOVO_WORKSPACE;
    const result = validateEnv();
    expect(result.ok).toBe(false);
  });

  it('fails when path is not a git repo', () => {
    const dir = mkdtempSync(join(tmpdir(), 'not-git-'));
    process.env.TEKNOVO_WORKSPACE = dir;
    const result = validateEnv();
    expect(result.ok).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('validation and logger', () => {
  it('validation helpers', () => {
    const schema = z.object({ x: z.string() });
    const r = schema.safeParse({});
    if (r.success) throw new Error('fail');
    expect(formatZodError(r.error)).toContain('x');
    expect(toolError('e').isError).toBe(true);
    expect(toolSuccess({}).content[0].text).toContain('success');
  });

  it('logger with invalid level', () => {
    configureLogger({ level: 'bad' });
    logger.debug('d');
    logger.info('i');
    configureLogger({ level: 'info' });
  });
});
