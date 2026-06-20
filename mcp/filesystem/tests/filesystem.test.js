/**
 * Filesystem MCP tests.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resetWorkspaceRoot, resolveSafePath, validateEnv } from '../lib/path-guard.js';
import { readFile, writeFile, listDirectory, searchFiles, fileInfo } from '../lib/fs-ops.js';
import { discoverTools, handleToolCall } from '../server.js';
import readFileTool from '../tools/read-file.js';

describe('path guard', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetWorkspaceRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-fs-'));
    process.env.TEKNOVO_WORKSPACE = tempRoot;
    writeFileSync(join(tempRoot, 'hello.txt'), 'hello world');
    mkdirSync(join(tempRoot, 'subdir'));
    writeFileSync(join(tempRoot, 'subdir', 'nested.js'), 'export {}');
  });

  afterEach(() => {
    resetWorkspaceRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('resolves paths within workspace', () => {
    const resolved = resolveSafePath('hello.txt');
    expect(resolved).toContain('hello.txt');
  });

  it('blocks path traversal', () => {
    expect(() => resolveSafePath('../outside.txt')).toThrow('Path traversal');
  });

  it('validateEnv succeeds with valid workspace', () => {
    const result = validateEnv();
    expect(result.ok).toBe(true);
  });
});

describe('fs operations', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetWorkspaceRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-fs-'));
    process.env.TEKNOVO_WORKSPACE = tempRoot;
    writeFileSync(join(tempRoot, 'read.txt'), 'content');
  });

  afterEach(() => {
    resetWorkspaceRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('reads and writes files', () => {
    expect(readFile('read.txt')).toBe('content');
    writeFile('new.txt', 'data', { createDirs: true });
    expect(readFile('new.txt')).toBe('data');
  });

  it('lists directory entries', () => {
    const entries = listDirectory('.');
    expect(entries.some((e) => e.name === 'read.txt')).toBe(true);
  });

  it('searches files by pattern', () => {
    writeFile('find-me.log', 'x', { createDirs: true });
    const matches = searchFiles('*.log');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('returns file info', () => {
    const info = fileInfo('read.txt');
    expect(info.type).toBe('file');
    expect(info.size).toBeGreaterThan(0);
  });
});

describe('tools and server', () => {
  /** @type {string} */
  let tempRoot;

  beforeEach(() => {
    resetWorkspaceRoot();
    tempRoot = mkdtempSync(join(tmpdir(), 'teknovo-fs-'));
    process.env.TEKNOVO_WORKSPACE = tempRoot;
    writeFileSync(join(tempRoot, 'tool.txt'), 'tool-content');
  });

  afterEach(() => {
    resetWorkspaceRoot();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('read_file tool works', async () => {
    const result = await readFileTool.handler({ path: 'tool.txt' });
    expect(result.content[0].text).toContain('tool-content');
  });

  it('discovers five tools', async () => {
    const tools = await discoverTools();
    expect(tools.size).toBe(5);
  });

  it('handleToolCall rejects unknown tool', async () => {
    const tools = await discoverTools();
    const result = await handleToolCall(tools, 'missing');
    expect(result.isError).toBe(true);
  });
});
