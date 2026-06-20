/**
 * GitHub MCP validation and client tests.
 */

import { describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { z } from 'zod';
import {
  validateEnv,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { configureLogger, logger, maskValue } from '../lib/logger.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { discoverTools, handleToolCall } from '../server.js';
import repoList from '../tools/repo-list.js';
import prList from '../tools/pr-list.js';
import prCreate from '../tools/pr-create.js';
import workflowDispatch from '../tools/workflow-dispatch.js';

describe('validation helpers', () => {
  it('formatZodError formats issues', () => {
    const schema = z.object({ x: z.string().min(1) });
    const result = schema.safeParse({});
    if (result.success) throw new Error('expected failure');
    expect(formatZodError(result.error)).toContain('x');
  });

  it('toolError and toolSuccess return structured responses', () => {
    expect(toolError('fail').isError).toBe(true);
    expect(toolSuccess({ id: 1 }).content[0].text).toContain('"success": true');
  });
});

describe('validateEnv', () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  it('accepts valid token', () => {
    process.env.GITHUB_TOKEN = 'ghp_test';
    process.env.GITHUB_OWNER = 'teknovo';
    const result = validateEnv();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.env.token).toBe('ghp_test');
      expect(result.env.defaultOwner).toBe('teknovo');
    }
  });

  it('rejects missing token', () => {
    delete process.env.GITHUB_TOKEN;
    const result = validateEnv();
    expect(result.ok).toBe(false);
  });
});

describe('resolveOwner', () => {
  it('uses args owner first', () => {
    expect(resolveOwner({ owner: 'a' }, { defaultOwner: 'b' })).toBe('a');
  });

  it('falls back to env default', () => {
    expect(resolveOwner({}, { defaultOwner: 'b' })).toBe('b');
  });

  it('throws when owner missing', () => {
    expect(() => resolveOwner({}, { defaultOwner: null })).toThrow('owner is required');
  });
});

describe('logger', () => {
  it('masks token values', () => {
    process.env.GITHUB_TOKEN = 'secret-token-xyz';
    const masked = maskValue('token=secret-token-xyz');
    expect(masked).not.toContain('secret-token-xyz');
    delete process.env.GITHUB_TOKEN;
  });

  it('logger methods run without throw', () => {
    configureLogger({ level: 'debug' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    configureLogger({ level: 'info' });
  });
});

describe('GitHubClient', () => {
  it('throws GitHubApiError on failed response', async () => {
    const client = createClient(
      { token: 't' },
      {
        fetchFn: async () => ({
          ok: false,
          status: 404,
          text: async () => JSON.stringify({ message: 'Not Found' }),
        }),
      }
    );

    await expect(client.listRepos({})).rejects.toBeInstanceOf(GitHubApiError);
  });

  it('returns parsed JSON on success', async () => {
    const client = createClient(
      { token: 't' },
      {
        fetchFn: async () => ({
          ok: true,
          status: 200,
          text: async () => JSON.stringify([{ name: 'repo1' }]),
        }),
      }
    );

    const result = await client.listRepos({});
    expect(result).toEqual([{ name: 'repo1' }]);
  });
});

describe('tool handlers', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 't';
    process.env.GITHUB_OWNER = 'teknovo';
  });

  it('repo_list returns env error without token', async () => {
    delete process.env.GITHUB_TOKEN;
    const result = await repoList.handler({});
    expect(result.isError).toBe(true);
    process.env.GITHUB_TOKEN = 't';
  });

  it('repo_list succeeds with mock client', async () => {
    const result = await repoList.handler(
      {},
      { client: { listRepos: async () => [{ name: 'x' }] } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('pr_list reports API errors', async () => {
    const result = await prList.handler(
      { repo: 'r' },
      {
        client: {
          listPullRequests: async () => {
            throw new GitHubApiError('fail', { status: 500 });
          },
        },
      }
    );
    expect(result.isError).toBe(true);
  });

  it('pr_create validates input', async () => {
    const result = await prCreate.handler({ repo: 'r' });
    expect(result.isError).toBe(true);
  });

  it('workflow_dispatch succeeds with mock client', async () => {
    const result = await workflowDispatch.handler(
      { repo: 'r', workflow_id: 'ci.yml', ref: 'main' },
      { client: { dispatchWorkflow: async () => null } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });
});

describe('server discovery', () => {
  it('discovers all github tools', async () => {
    const tools = await discoverTools();
    expect(tools.size).toBe(17);
    expect(tools.has('repo_list')).toBe(true);
    expect(tools.has('create_repository')).toBe(true);
    expect(tools.has('create_branch')).toBe(true);
    expect(tools.has('repository_analysis')).toBe(true);
    expect(tools.has('workflow_dispatch')).toBe(true);
  });

  it('handleToolCall returns error for unknown tool', async () => {
    const tools = await discoverTools();
    const result = await handleToolCall(tools, 'unknown_tool');
    expect(result.isError).toBe(true);
  });
});
