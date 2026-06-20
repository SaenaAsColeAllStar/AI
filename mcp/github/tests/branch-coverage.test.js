/**
 * GitHub branch coverage — generic error paths and logger edge cases.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { configureLogger } from '../lib/logger.js';
import repoList from '../tools/repo-list.js';
import prList from '../tools/pr-list.js';
import repoCreate from '../tools/repo-create.js';

describe('generic error branches', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 't';
    process.env.GITHUB_OWNER = 'teknovo';
  });

  it('repo_list handles non-API errors', async () => {
    const result = await repoList.handler(
      {},
      { client: { listRepos: async () => { throw new TypeError('network'); } } }
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Failed to list repositories');
  });

  it('pr_list handles missing owner without env', async () => {
    delete process.env.GITHUB_OWNER;
    const result = await prList.handler({ repo: 'r' });
    expect(result.isError).toBe(true);
  });

  it('repo_create handles owner required from resolveOwner path', async () => {
    delete process.env.GITHUB_OWNER;
    const result = await repoCreate.handler(
      { name: 'x', owner: 'org' },
      { client: { createRepo: async () => ({ name: 'x' }) } }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('configureLogger ignores invalid level', () => {
    configureLogger({ level: 'invalid', maskSecrets: false });
    configureLogger({ level: 'info', maskSecrets: true });
  });
});
