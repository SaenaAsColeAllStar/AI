/**
 * Git runner — scoped to TEKNOVO_WORKSPACE repo root.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  TEKNOVO_WORKSPACE: z.string().min(1, 'TEKNOVO_WORKSPACE is required'),
});

/** @type {string | null} */
let repoRoot = null;

const BLOCKED_ARGS = ['--force', '-f'];
const BLOCKED_PATTERNS = [/--force-with-lease/i, /push.*--force/i];

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function getRepoRoot(env = process.env) {
  if (repoRoot) return repoRoot;

  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error('TEKNOVO_WORKSPACE is required');
  }

  const root = realpathSync(resolve(result.data.TEKNOVO_WORKSPACE));
  if (!existsSync(resolve(root, '.git'))) {
    throw new Error(`Not a git repository: ${root}`);
  }

  repoRoot = root;
  logger.info('Git repo root configured', { root });
  return repoRoot;
}

export function resetRepoRoot() {
  repoRoot = null;
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function validateEnv(env = process.env) {
  try {
    return { ok: true, env: { repoRoot: getRepoRoot(env) } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * @param {string[]} args
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv }} [options]
 */
export function runGit(args, options = {}) {
  const cwd = options.cwd ?? getRepoRoot(options.env);
  const flatArgs = args.flat();

  for (const arg of flatArgs) {
    if (BLOCKED_ARGS.includes(arg)) {
      throw new Error('Force operations are not allowed');
    }
  }

  const joined = flatArgs.join(' ');
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(joined)) {
      throw new Error('Force push is not allowed');
    }
  }

  if (flatArgs[0] === 'push' && flatArgs.includes('--force')) {
    throw new Error('Force push is not allowed');
  }

  logger.debug('Running git command', { args: flatArgs });

  const output = execFileSync('git', flatArgs, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });

  return output.trim();
}

/**
 * @param {string[]} args
 * @param {{ cwd?: string }} [options]
 */
export function runGitJson(args, options = {}) {
  const output = runGit([...args, '--porcelain=v2'], options);
  return output;
}
