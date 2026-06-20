/**
 * Additional coverage for GitHub tool branches and error paths.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { GitHubApiError } from '../lib/github-client.js';
import repoCreate from '../tools/repo-create.js';
import repoList from '../tools/repo-list.js';
import prCreate from '../tools/pr-create.js';
import prMerge from '../tools/pr-merge.js';
import issueList from '../tools/issue-list.js';
import issueCreate from '../tools/issue-create.js';
import workflowList from '../tools/workflow-list.js';
import workflowDispatch from '../tools/workflow-dispatch.js';

/** @param {string} method */
function apiErrorClient(method) {
  return {
    [method]: async () => {
      throw new GitHubApiError('API failed', { status: 500 });
    },
  };
}

describe('GitHub tool coverage', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 't';
    process.env.GITHUB_OWNER = 'teknovo';
  });

  it('repo_create succeeds with mock client', async () => {
    const result = await repoCreate.handler(
      { name: 'new-repo', description: 'desc', private: true, auto_init: true },
      { client: { createRepo: async (p) => ({ name: p.name }) } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('repo_create reports API errors', async () => {
    const result = await repoCreate.handler(
      { name: 'x' },
      { client: apiErrorClient('createRepo') }
    );
    expect(result.isError).toBe(true);
  });

  it('repo_list reports API errors', async () => {
    const result = await repoList.handler({}, { client: apiErrorClient('listRepos') });
    expect(result.isError).toBe(true);
  });

  it('pr_create succeeds with mock client', async () => {
    const result = await prCreate.handler(
      { repo: 'r', title: 't', head: 'feature', base: 'main', body: 'b', draft: true },
      { client: { createPullRequest: async () => ({ number: 1 }) } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('pr_create reports API errors', async () => {
    const result = await prCreate.handler(
      { repo: 'r', title: 't', head: 'f', base: 'main' },
      { client: apiErrorClient('createPullRequest') }
    );
    expect(result.isError).toBe(true);
  });

  it('pr_merge succeeds with mock client', async () => {
    const result = await prMerge.handler(
      { repo: 'r', pull_number: 1, merge_method: 'squash', commit_title: 't', commit_message: 'm' },
      { client: { mergePullRequest: async () => ({ merged: true }) } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('pr_merge reports API errors', async () => {
    const result = await prMerge.handler(
      { repo: 'r', pull_number: 1 },
      { client: apiErrorClient('mergePullRequest') }
    );
    expect(result.isError).toBe(true);
  });

  it('issue_list succeeds with mock client', async () => {
    const result = await issueList.handler(
      { repo: 'r', state: 'open', labels: 'bug', per_page: 10, page: 1 },
      { client: { listIssues: async () => [] } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('issue_list reports API errors', async () => {
    const result = await issueList.handler(
      { repo: 'r' },
      { client: apiErrorClient('listIssues') }
    );
    expect(result.isError).toBe(true);
  });

  it('issue_create succeeds with mock client', async () => {
    const result = await issueCreate.handler(
      { repo: 'r', title: 'Bug', body: 'details', labels: ['bug'], assignees: ['dev'] },
      { client: { createIssue: async () => ({ number: 1 }) } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('issue_create reports API errors', async () => {
    const result = await issueCreate.handler(
      { repo: 'r', title: 'Bug' },
      { client: apiErrorClient('createIssue') }
    );
    expect(result.isError).toBe(true);
  });

  it('workflow_list succeeds with mock client', async () => {
    const result = await workflowList.handler(
      { repo: 'r', per_page: 20, page: 1 },
      { client: { listWorkflows: async () => ({ workflows: [] }) } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('workflow_list reports API errors', async () => {
    const result = await workflowList.handler(
      { repo: 'r' },
      { client: apiErrorClient('listWorkflows') }
    );
    expect(result.isError).toBe(true);
  });

  it('workflow_dispatch reports API errors', async () => {
    const result = await workflowDispatch.handler(
      { repo: 'r', workflow_id: 'ci.yml', ref: 'main', inputs: { env: 'staging' } },
      { client: apiErrorClient('dispatchWorkflow') }
    );
    expect(result.isError).toBe(true);
  });

  it('tools validate input', async () => {
    expect((await prMerge.handler({ repo: 'r' })).isError).toBe(true);
    expect((await issueCreate.handler({ repo: 'r' })).isError).toBe(true);
    expect((await repoCreate.handler({})).isError).toBe(true);
  });
});
