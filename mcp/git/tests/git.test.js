/**
 * Git MCP tests.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { resetRepoRoot, validateEnv, runGit } from '../lib/git-runner.js';
import { discoverTools, handleToolCall } from '../server.js';
import gitStatus from '../tools/git-status.js';

/** @param {string} dir */
function initRepo(dir) {
  execFileSync('git', ['init'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  writeFileSync(join(dir, 'file.txt'), 'hello');
  execFileSync('git', ['add', 'file.txt'], { cwd: dir });
  execFileSync('git', ['commit', '-m', 'init'], { cwd: dir });
}

describe('git runner', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetRepoRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-git-'));
    initRepo(tempRoot);
    process.env.TEKNOVO_WORKSPACE = tempRoot;
  });

  afterEach(() => {
    resetRepoRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('validates git repo', () => {
    const result = validateEnv();
    expect(result.ok).toBe(true);
  });

  it('runs git status', () => {
    const output = runGit(['status', '--short']);
    expect(typeof output).toBe('string');
  });

  it('blocks force push', () => {
    expect(() => runGit(['push', '--force', 'origin', 'main'])).toThrow('Force');
  });
});

describe('git tools', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetRepoRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-git-'));
    initRepo(tempRoot);
    process.env.TEKNOVO_WORKSPACE = tempRoot;
  });

  afterEach(() => {
    resetRepoRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('git_status tool returns success', async () => {
    const result = await gitStatus.handler({});
    expect(result.content[0].text).toContain('"success": true');
  });

  it('discovers seven tools', async () => {
    const tools = await discoverTools();
    expect(tools.size).toBe(7);
  });

  it('handleToolCall rejects unknown tool', async () => {
    const tools = await discoverTools();
    const result = await handleToolCall(tools, 'nope');
    expect(result.isError).toBe(true);
  });
});
