/**
 * Path guard — prevents traversal outside TEKNOVO_WORKSPACE.
 */

import { realpathSync, existsSync } from 'node:fs';
import { resolve, normalize, sep } from 'node:path';
import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  TEKNOVO_WORKSPACE: z.string().min(1, 'TEKNOVO_WORKSPACE is required'),
});

/** @type {string | null} */
let workspaceRoot = null;

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function getWorkspaceRoot(env = process.env) {
  if (workspaceRoot) return workspaceRoot;

  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      'TEKNOVO_WORKSPACE is required. Set absolute path to allowed workspace root.'
    );
  }

  const resolved = resolve(result.data.TEKNOVO_WORKSPACE);
  if (!existsSync(resolved)) {
    throw new Error(`TEKNOVO_WORKSPACE does not exist: ${resolved}`);
  }

  workspaceRoot = realpathSync(resolved);
  logger.info('Filesystem workspace root configured', { root: workspaceRoot });
  return workspaceRoot;
}

/**
 * Reset cached root (for tests).
 */
export function resetWorkspaceRoot() {
  workspaceRoot = null;
}

/**
 * @param {string} inputPath
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string} Absolute resolved path within workspace
 */
export function resolveSafePath(inputPath, env = process.env) {
  const root = getWorkspaceRoot(env);
  const normalized = normalize(inputPath);

  if (normalized.includes('..')) {
    throw new Error('Path traversal detected: ".." segments are not allowed');
  }

  const absolute = resolve(root, normalized.startsWith(sep) ? normalized.slice(1) : normalized);
  const real = existsSync(absolute) ? realpathSync(absolute) : absolute;

  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (real !== root && !real.startsWith(rootWithSep)) {
    throw new Error(`Path escapes workspace boundary: ${inputPath}`);
  }

  return real;
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function validateEnv(env = process.env) {
  try {
    const root = getWorkspaceRoot(env);
    return { ok: true, env: { workspaceRoot: root } };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.warn('Workspace validation failed', { error });
    return { ok: false, error };
  }
}
