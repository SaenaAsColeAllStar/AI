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
}

/**
 * @param {{ token: string }} env
 * @param {{ fetchFn?: typeof fetch }} [options]
 */
export function createClient(env, options = {}) {
  return new GitHubClient(env, options);
}
