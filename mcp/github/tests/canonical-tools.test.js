/**
 * Tests for canonical GitHub MCP tools.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { handler as createBranch } from '../tools/create-branch.js';
import { handler as commitChanges } from '../tools/commit-changes.js';
import { handler as createRelease } from '../tools/create-release.js';
import { handler as repositoryAnalysis } from '../tools/repository-analysis.js';
import { handler as createRepository } from '../tools/create-repository.js';
import { createClient } from '../lib/github-client.js';

describe('canonical github tools', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token-12345678';
    process.env.GITHUB_OWNER = 'teknovo';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const mockClient = createClient(
    { token: 't' },
    {
      fetchFn: async (url, init) => {
        const method = init?.method ?? 'GET';
        if (url.includes('/git/ref/')) {
          return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ object: { sha: 'abc123' } }),
          };
        }
        if (url.includes('/git/refs') && method === 'POST') {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ ref: 'refs/heads/feature/x', object: { sha: 'abc123' } }),
          };
        }
        if (url.includes('/git/commits/')) {
          return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ tree: { sha: 'tree1' } }),
          };
        }
        if (url.includes('/git/blobs')) {
          return { ok: true, status: 201, text: async () => JSON.stringify({ sha: 'blob1' }) };
        }
        if (url.includes('/git/trees')) {
          return { ok: true, status: 201, text: async () => JSON.stringify({ sha: 'tree2' }) };
        }
        if (url.includes('/git/commits') && method === 'POST') {
          return { ok: true, status: 201, text: async () => JSON.stringify({ sha: 'commit1' }) };
        }
        if (url.includes('/git/refs/heads') && method === 'PATCH') {
          return { ok: true, status: 200, text: async () => JSON.stringify({ object: { sha: 'commit1' } }) };
        }
        if (url.includes('/releases') && method === 'POST') {
          return { ok: true, status: 201, text: async () => JSON.stringify({ tag_name: 'v1.0.0' }) };
        }
        if (url.includes('/repos/teknovo/r') && method === 'GET' && !url.includes('/pulls')) {
          if (url.includes('/languages')) {
            return { ok: true, status: 200, text: async () => JSON.stringify({ TypeScript: 100 }) };
          }
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({
                name: 'r',
                full_name: 'teknovo/r',
                default_branch: 'main',
                private: true,
                open_issues_count: 0,
                size: 10,
              }),
          };
        }
        if (url.includes('/pulls')) {
          return { ok: true, status: 200, text: async () => JSON.stringify([]) };
        }
        if (url.includes('/issues')) {
          return { ok: true, status: 200, text: async () => JSON.stringify([]) };
        }
        if (url.includes('/user/repos') && method === 'POST') {
          return { ok: true, status: 201, text: async () => JSON.stringify({ name: 'new-repo' }) };
        }
        return { ok: true, status: 200, text: async () => JSON.stringify({}) };
      },
    }
  );

  it('create_branch succeeds', async () => {
    const result = await createBranch({ repo: 'r', branch: 'feature/x' }, { client: mockClient });
    expect(result.isError).toBeFalsy();
    const body = JSON.parse(result.content[0].text);
    expect(body.success).toBe(true);
  });

  it('commit_changes succeeds', async () => {
    const result = await commitChanges(
      {
        repo: 'r',
        branch: 'main',
        message: 'feat: update',
        files: [{ path: 'README.md', content: '# Hi' }],
      },
      { client: mockClient }
    );
    expect(result.isError).toBeFalsy();
    const body = JSON.parse(result.content[0].text);
    expect(body.success).toBe(true);
  });

  it('create_release succeeds', async () => {
    const result = await createRelease({ repo: 'r', tag_name: 'v1.0.0' }, { client: mockClient });
    expect(result.isError).toBeFalsy();
  });

  it('repository_analysis succeeds', async () => {
    const result = await repositoryAnalysis({ repo: 'r' }, { client: mockClient });
    expect(result.isError).toBeFalsy();
    const body = JSON.parse(result.content[0].text);
    expect(body.data.repository.name).toBe('r');
  });

  it('create_repository alias succeeds', async () => {
    const result = await createRepository({ name: 'new-repo' }, { client: mockClient });
    expect(result.isError).toBeFalsy();
  });
});
