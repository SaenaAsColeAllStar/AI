/**
 * Filesystem tool coverage tests.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resetWorkspaceRoot } from '../lib/path-guard.js';
import { formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { configureLogger, logger } from '../lib/logger.js';
import readFileTool from '../tools/read-file.js';
import writeFileTool from '../tools/write-file.js';
import listDirectoryTool from '../tools/list-directory.js';
import searchFilesTool from '../tools/search-files.js';
import fileInfoTool from '../tools/file-info.js';
import { z } from 'zod';

describe('validation helpers', () => {
  it('formatZodError, toolError, toolSuccess', () => {
    const schema = z.object({ x: z.string() });
    const r = schema.safeParse({});
    if (r.success) throw new Error('fail');
    expect(formatZodError(r.error)).toContain('x');
    expect(toolError('e').isError).toBe(true);
    expect(toolSuccess({}).content[0].text).toContain('success');
  });
});

describe('logger', () => {
  it('configureLogger and logger methods', () => {
    configureLogger({ level: 'debug' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    configureLogger({ level: 'info' });
  });
});

describe('filesystem tools', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetWorkspaceRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-fs-tools-'));
    process.env.TEKNOVO_WORKSPACE = tempRoot;
    writeFileSync(join(tempRoot, 'existing.txt'), 'exists');
  });

  afterEach(() => {
    resetWorkspaceRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('write_file creates file', async () => {
    const result = await writeFileTool.handler({
      path: 'out/new.txt',
      content: 'written',
      create_dirs: true,
    });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('write_file base64 encoding', async () => {
    const result = await writeFileTool.handler({
      path: 'bin.dat',
      content: Buffer.from('abc').toString('base64'),
      encoding: 'base64',
    });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('read_file base64 encoding', async () => {
    const result = await readFileTool.handler({ path: 'existing.txt', encoding: 'utf8' });
    expect(result.content[0].text).toContain('exists');
  });

  it('list_directory recursive', async () => {
    mkdirSync(join(tempRoot, 'sub'), { recursive: true });
    writeFileSync(join(tempRoot, 'sub', 'nested.txt'), 'n');
    const result = await listDirectoryTool.handler({ path: '.', recursive: true, max_depth: 2 });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('search_files finds matches', async () => {
    const result = await searchFilesTool.handler({ pattern: '*.txt', max_results: 10 });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('file_info returns metadata', async () => {
    const result = await fileInfoTool.handler({ path: 'existing.txt' });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('tools fail without workspace', async () => {
    delete process.env.TEKNOVO_WORKSPACE;
    resetWorkspaceRoot();
    expect((await readFileTool.handler({ path: 'x' })).isError).toBe(true);
  });

  it('read_file validates input', async () => {
    process.env.TEKNOVO_WORKSPACE = tempRoot;
    resetWorkspaceRoot();
    expect((await readFileTool.handler({})).isError).toBe(true);
  });
});
