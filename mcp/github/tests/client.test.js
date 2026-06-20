/**
 * Additional GitHub client coverage.
 */

import { describe, it, expect } from '@jest/globals';
import { createClient, GitHubApiError } from '../lib/github-client.js';

describe('GitHubClient methods', () => {
  const mockFetch = async (url, init) => {
    const method = init?.method ?? 'GET';
    if (method === 'POST' && url.includes('/pulls') && !url.includes('/merge')) {
      return { ok: true, status: 201, text: async () => JSON.stringify({ number: 1 }) };
    }
    if (method === 'PUT' && url.includes('/merge')) {
      return { ok: true, status: 200, text: async () => JSON.stringify({ merged: true }) };
    }
    if (method === 'POST' && url.includes('/issues')) {
      return { ok: true, status: 201, text: async () => JSON.stringify({ number: 2 }) };
    }
    if (method === 'POST' && url.includes('/dispatches')) {
      return { ok: true, status: 204, text: async () => '' };
    }
    if (url.includes('/actions/workflows')) {
      return { ok: true, status: 200, text: async () => JSON.stringify({ workflows: [] }) };
    }
    if (url.includes('/repos') && method === 'POST') {
      return { ok: true, status: 201, text: async () => JSON.stringify({ name: 'r' }) };
    }
    return { ok: true, status: 200, text: async () => JSON.stringify([]) };
  };

  const client = createClient({ token: 't' }, { fetchFn: mockFetch });

  it('createRepo calls API', async () => {
    const result = await client.createRepo({ owner: 'o', name: 'r', private: true });
    expect(result).toHaveProperty('name');
  });

  it('createPullRequest calls API', async () => {
    const result = await client.createPullRequest({
      owner: 'o',
      repo: 'r',
      title: 't',
      head: 'f',
      base: 'main',
    });
    expect(result).toHaveProperty('number');
  });

  it('mergePullRequest calls API', async () => {
    const result = await client.mergePullRequest({
      owner: 'o',
      repo: 'r',
      pull_number: 1,
      merge_method: 'squash',
    });
    expect(result).toHaveProperty('merged');
  });

  it('listIssues calls API', async () => {
    const result = await client.listIssues({ owner: 'o', repo: 'r', state: 'open' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('createIssue calls API', async () => {
    const result = await client.createIssue({ owner: 'o', repo: 'r', title: 't' });
    expect(result).toHaveProperty('number');
  });

  it('listWorkflows calls API', async () => {
    const result = await client.listWorkflows({ owner: 'o', repo: 'r' });
    expect(result).toHaveProperty('workflows');
  });

  it('dispatchWorkflow calls API', async () => {
    const result = await client.dispatchWorkflow({
      owner: 'o',
      repo: 'r',
      workflow_id: 'ci.yml',
      ref: 'main',
      inputs: { x: '1' },
    });
    expect(result).toBeNull();
  });

  it('handles non-JSON error body', async () => {
    const badClient = createClient(
      { token: 't' },
      {
        fetchFn: async () => ({
          ok: false,
          status: 500,
          text: async () => 'plain error',
        }),
      }
    );
    await expect(badClient.listRepos({})).rejects.toBeInstanceOf(GitHubApiError);
  });
});
