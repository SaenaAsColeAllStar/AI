/**
 * Filesystem operations scoped to workspace root.
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { resolveSafePath } from './path-guard.js';

/**
 * @param {string} path
 * @param {'utf8' | 'base64'} [encoding]
 */
export function readFile(path, encoding = 'utf8') {
  const safePath = resolveSafePath(path);
  const content = readFileSync(safePath);
  return encoding === 'base64' ? content.toString('base64') : content.toString('utf8');
}

/**
 * @param {string} path
 * @param {string} content
 * @param {{ encoding?: 'utf8' | 'base64', createDirs?: boolean }} [options]
 */
export function writeFile(path, content, options = {}) {
  const safePath = resolveSafePath(path);
  if (options.createDirs) {
    mkdirSync(dirname(safePath), { recursive: true });
  }
  const buffer = options.encoding === 'base64' ? Buffer.from(content, 'base64') : content;
  writeFileSync(safePath, buffer, typeof buffer === 'string' ? 'utf8' : undefined);
  return { path: safePath, bytes: statSync(safePath).size };
}

/**
 * @param {string} [path]
 * @param {{ recursive?: boolean, maxDepth?: number }} [options]
 */
export function listDirectory(path = '.', options = {}) {
  const safePath = resolveSafePath(path);
  const root = resolveSafePath('.');
  const maxDepth = options.maxDepth ?? (options.recursive ? 5 : 0);

  /** @type {Array<{ path: string, name: string, type: string, size?: number }>} */
  const entries = [];

  /**
   * @param {string} dir
   * @param {number} depth
   */
  function walk(dir, depth) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const rel = relative(root, full).replace(/\\/g, '/');
      const stat = statSync(full);
      const type = stat.isDirectory() ? 'directory' : 'file';
      entries.push({
        path: rel || '.',
        name,
        type,
        size: stat.isFile() ? stat.size : undefined,
      });
      if (options.recursive && stat.isDirectory() && depth < maxDepth) {
        walk(full, depth + 1);
      }
    }
  }

  walk(safePath, 0);
  return entries;
}

/**
 * @param {string} pattern
 * @param {string} [path]
 * @param {number} [maxResults]
 */
export function searchFiles(pattern, path = '.', maxResults = 100) {
  const regex = new RegExp(
    pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'),
    'i'
  );
  const all = listDirectory(path, { recursive: true, maxDepth: 10 });
  return all
    .filter((e) => e.type === 'file' && regex.test(e.name))
    .slice(0, maxResults);
}

/**
 * @param {string} path
 */
export function fileInfo(path) {
  const safePath = resolveSafePath(path);
  const stat = statSync(safePath);
  const root = resolveSafePath('.');
  return {
    path: relative(root, safePath).replace(/\\/g, '/') || basename(safePath),
    name: basename(safePath),
    type: stat.isDirectory() ? 'directory' : stat.isFile() ? 'file' : 'other',
    size: stat.size,
    created: stat.birthtime.toISOString(),
    modified: stat.mtime.toISOString(),
    exists: existsSync(safePath),
  };
}
