/**
 * Git tool coverage tests using real temp repository.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { resetRepoRoot } from '../lib/git-runner.js';
import gitStatus from '../tools/git-status.js';
import gitDiff from '../tools/git-diff.js';
import gitLog from '../tools/git-log.js';
import gitCommit from '../tools/git-commit.js';
import gitPush from '../tools/git-push.js';
import gitBranchList from '../tools/git-branch-list.js';
import gitBranchCreate from '../tools/git-branch-create.js';

/** @param {string} dir */
function initRepo(dir) {
  execFileSync('git', ['init'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: dir });
  writeFileSync(join(dir, 'README.md'), '# test');
  execFileSync('git', ['add', 'README.md'], { cwd: dir });
  execFileSync('git', ['commit', '-m', 'init'], { cwd: dir });
}

describe('git tools integration', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetRepoRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-git-tools-'));
    initRepo(tempRoot);
    process.env.TEKNOVO_WORKSPACE = tempRoot;
  });

  afterEach(() => {
    resetRepoRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('git_status returns output', async () => {
    const result = await gitStatus.handler({});
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_diff returns output', async () => {
    writeFileSync(join(tempRoot, 'change.txt'), 'new');
    const result = await gitDiff.handler({});
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_diff staged mode', async () => {
    writeFileSync(join(tempRoot, 'staged.txt'), 's');
    execFileSync('git', ['add', 'staged.txt'], { cwd: tempRoot });
    const result = await gitDiff.handler({ staged: true, path: 'staged.txt' });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_log returns commits', async () => {
    const result = await gitLog.handler({ max_count: 5, oneline: true });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_commit creates commit', async () => {
    writeFileSync(join(tempRoot, 'commit-me.txt'), 'x');
    const result = await gitCommit.handler({
      message: 'add file',
      paths: ['commit-me.txt'],
    });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_branch_list returns branches', async () => {
    const result = await gitBranchList.handler({});
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_branch_create creates branch', async () => {
    const result = await gitBranchCreate.handler({
      name: 'feature/test',
      checkout: false,
    });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_branch_create with checkout', async () => {
    const result = await gitBranchCreate.handler({
      name: 'feature/checkout',
      checkout: true,
    });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('git_push fails without remote (expected)', async () => {
    const result = await gitPush.handler({ remote: 'origin', branch: 'main' });
    expect(result.isError).toBe(true);
  });

  it('git_commit validates message', async () => {
    const result = await gitCommit.handler({});
    expect(result.isError).toBe(true);
  });
});
