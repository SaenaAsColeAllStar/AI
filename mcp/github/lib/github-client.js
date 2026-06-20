/**
 * GitHub REST API client for Teknovo MCP.
 */

import { logger } from './logger.js';

export class GitHubApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, details?: unknown }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = options.status;
    this.details = options.details;
  }
}

export class GitHubClient {
  /**
   * @param {{ token: string }} env
   * @param {{ fetchFn?: typeof fetch, baseUrl?: string }} [options]
   */
  constructor(env, options = {}) {
    this.token = env.token;
    this.baseUrl = options.baseUrl ?? 'https://api.github.com';
    this.fetchFn = options.fetchFn ?? fetch;
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {Record<string, unknown> | undefined} [body]
   * @param {Record<string, string | number | undefined>} [query]
   */
  async request(method, path, body, query) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    logger.debug('GitHub API request', { method, path: url.pathname });

    const response = await this.fetchFn(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'teknovo-github-mcp',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    /** @type {unknown} */
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? String(/** @type {{ message: unknown }} */ (data).message)
          : `GitHub API error (${response.status})`;
      throw new GitHubApiError(message, { status: response.status, details: data });
    }

    return data;
  }

  /**
   * @param {{ owner?: string, type?: string, per_page?: number, page?: number }} params
   */
  async listRepos(params) {
    const path = params.owner ? `/orgs/${params.owner}/repos` : '/user/repos';
    return this.request('GET', path, undefined, {
      type: params.type ?? 'all',
      per_page: params.per_page ?? 30,
      page: params.page ?? 1,
    });
  }

  /**
   * @param {{ owner: string, name: string, description?: string, private?: boolean, auto_init?: boolean }} params
   */
  async createRepo(params) {
    const path = params.owner ? `/orgs/${params.owner}/repos` : '/user/repos';
    return this.request('POST', path, {
      name: params.name,
      description: params.description,
      private: params.private ?? true,
      auto_init: params.auto_init ?? false,
    });
  }

  /**
   * @param {{ owner: string, repo: string, state?: string, per_page?: number, page?: number }} params
   */
  async listPullRequests(params) {
    return this.request('GET', `/repos/${params.owner}/${params.repo}/pulls`, undefined, {
      state: params.state ?? 'open',
      per_page: params.per_page ?? 30,
      page: params.page ?? 1,
    });
  }

  /**
   * @param {{ owner: string, repo: string, title: string, head: string, base: string, body?: string, draft?: boolean }} params
   */
  async createPullRequest(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/pulls`, {
      title: params.title,
      head: params.head,
      base: params.base,
      body: params.body,
      draft: params.draft,
    });
  }

  /**
   * @param {{ owner: string, repo: string, pull_number: number, merge_method?: string, commit_title?: string, commit_message?: string }} params
   */
  async mergePullRequest(params) {
    return this.request(
      'PUT',
      `/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}/merge`,
      {
        merge_method: params.merge_method ?? 'squash',
        commit_title: params.commit_title,
        commit_message: params.commit_message,
      }
    );
  }

  /**
   * @param {{ owner: string, repo: string, state?: string, labels?: string, per_page?: number, page?: number }} params
   */
  async listIssues(params) {
    return this.request('GET', `/repos/${params.owner}/${params.repo}/issues`, undefined, {
      state: params.state ?? 'open',
      labels: params.labels,
      per_page: params.per_page ?? 30,
      page: params.page ?? 1,
    });
  }

  /**
   * @param {{ owner: string, repo: string, title: string, body?: string, labels?: string[], assignees?: string[] }} params
   */
  async createIssue(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/issues`, {
      title: params.title,
      body: params.body,
      labels: params.labels,
      assignees: params.assignees,
    });
  }

  /**
   * @param {{ owner: string, repo: string, per_page?: number, page?: number }} params
   */
  async listWorkflows(params) {
    return this.request(
      'GET',
      `/repos/${params.owner}/${params.repo}/actions/workflows`,
      undefined,
      {
        per_page: params.per_page ?? 30,
        page: params.page ?? 1,
      }
    );
  }

  /**
   * @param {{ owner: string, repo: string, workflow_id: string | number, ref: string, inputs?: Record<string, string> }} params
   */
  async dispatchWorkflow(params) {
    return this.request(
      'POST',
      `/repos/${params.owner}/${params.repo}/actions/workflows/${params.workflow_id}/dispatches`,
      {
        ref: params.ref,
        inputs: params.inputs,
      }
    );
  }

  /**
   * @param {{ owner: string, repo: string }} params
   */
  async getRepository(params) {
    return this.request('GET', `/repos/${params.owner}/${params.repo}`);
  }

  /**
   * @param {{ owner: string, repo: string }} params
   */
  async listLanguages(params) {
    return this.request('GET', `/repos/${params.owner}/${params.repo}/languages`);
  }

  /**
   * @param {{ owner: string, repo: string, ref: string }} params
   */
  async getRef(params) {
    return this.request('GET', `/repos/${params.owner}/${params.repo}/git/ref/${encodeURIComponent(params.ref)}`);
  }

  /**
   * @param {{ owner: string, repo: string, ref: string, sha: string }} params
   */
  async createRef(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/git/refs`, {
      ref: params.ref,
      sha: params.sha,
    });
  }

  /**
   * @param {{ owner: string, repo: string, branch: string, from_branch?: string }} params
   */
  async createBranch(params) {
    const sourceBranch = params.from_branch ?? 'main';
    const normalizedSource = sourceBranch.startsWith('heads/')
      ? sourceBranch
      : `heads/${sourceBranch}`;
    const ref = await this.getRef({
      owner: params.owner,
      repo: params.repo,
      ref: normalizedSource,
    });
    const sha = ref.object?.sha;
    if (!sha) {
      throw new GitHubApiError('Could not resolve source branch SHA');
    }
    const branchRef = params.branch.startsWith('refs/heads/')
      ? params.branch
      : `refs/heads/${params.branch}`;
    return this.createRef({
      owner: params.owner,
      repo: params.repo,
      ref: branchRef,
      sha,
    });
  }

  /**
   * @param {{ owner: string, repo: string, content: string, encoding?: string }} params
   */
  async createBlob(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/git/blobs`, {
      content: params.content,
      encoding: params.encoding ?? 'utf-8',
    });
  }

  /**
   * @param {{ owner: string, repo: string, tree: object[], base_tree?: string }} params
   */
  async createTree(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/git/trees`, {
      base_tree: params.base_tree,
      tree: params.tree,
    });
  }

  /**
   * @param {{ owner: string, repo: string, message: string, tree: string, parents: string[] }} params
   */
  async createCommit(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/git/commits`, {
      message: params.message,
      tree: params.tree,
      parents: params.parents,
    });
  }

  /**
   * @param {{ owner: string, repo: string, ref: string, sha: string, force?: boolean }} params
   */
  async updateRef(params) {
    return this.request(
      'PATCH',
      `/repos/${params.owner}/${params.repo}/git/refs/${encodeURIComponent(params.ref)}`,
      { sha: params.sha, force: params.force ?? false }
    );
  }

  /**
   * @param {{ owner: string, repo: string, branch: string, message: string, files: Array<{ path: string, content: string }> }} params
   */
  async commitChanges(params) {
    const branchRef = params.branch.startsWith('heads/') ? params.branch : `heads/${params.branch}`;
    const ref = await this.getRef({ owner: params.owner, repo: params.repo, ref: branchRef });
    const baseSha = ref.object?.sha;
    if (!baseSha) {
      throw new GitHubApiError('Could not resolve branch HEAD');
    }

    const commit = await this.request(
      'GET',
      `/repos/${params.owner}/${params.repo}/git/commits/${baseSha}`
    );
    const baseTree = commit.tree?.sha;
    if (!baseTree) {
      throw new GitHubApiError('Could not resolve base tree');
    }

    /** @type {object[]} */
    const treeEntries = [];
    for (const file of params.files) {
      const blob = await this.createBlob({
        owner: params.owner,
        repo: params.repo,
        content: file.content,
      });
      treeEntries.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
    }

    const tree = await this.createTree({
      owner: params.owner,
      repo: params.repo,
      base_tree: baseTree,
      tree: treeEntries,
    });

    const newCommit = await this.createCommit({
      owner: params.owner,
      repo: params.repo,
      message: params.message,
      tree: tree.sha,
      parents: [baseSha],
    });

    await this.updateRef({
      owner: params.owner,
      repo: params.repo,
      ref: branchRef,
      sha: newCommit.sha,
    });

    return {
      commit: newCommit,
      branch: params.branch,
      files_changed: params.files.length,
    };
  }

  /**
   * @param {{ owner: string, repo: string, tag_name: string, name?: string, body?: string, draft?: boolean, prerelease?: boolean, target_commitish?: string }} params
   */
  async createRelease(params) {
    return this.request('POST', `/repos/${params.owner}/${params.repo}/releases`, {
      tag_name: params.tag_name,
      name: params.name ?? params.tag_name,
      body: params.body,
      draft: params.draft ?? false,
      prerelease: params.prerelease ?? false,
      target_commitish: params.target_commitish,
    });
  }

  /**
   * @param {{ owner: string, repo: string }} params
   */
  async analyzeRepository(params) {
    const [repo, languages, pulls, issues] = await Promise.all([
      this.getRepository(params),
      this.listLanguages(params),
      this.listPullRequests({ ...params, state: 'open', per_page: 5 }),
      this.listIssues({ ...params, state: 'open', per_page: 5 }),
    ]);

    return {
      repository: {
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        default_branch: repo.default_branch,
        visibility: repo.private ? 'private' : 'public',
        topics: repo.topics ?? [],
        open_issues_count: repo.open_issues_count,
        size_kb: repo.size,
        pushed_at: repo.pushed_at,
        created_at: repo.created_at,
      },
      languages,
      open_pull_requests: Array.isArray(pulls) ? pulls.length : 0,
      recent_pull_requests: pulls,
      open_issues_sample: issues,
    };
  }
}

/**
 * @param {{ token: string }} env
 * @param {{ fetchFn?: typeof fetch }} [options]
 */
export function createClient(env, options = {}) {
  return new GitHubClient(env, options);
}
