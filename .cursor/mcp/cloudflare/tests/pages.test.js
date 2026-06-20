/**
 * Tests for Cloudflare Pages MCP tools.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import pagesCreate from '../tools/pages-create.js';
import pagesDeploy from '../tools/pages-deploy.js';
import pagesList from '../tools/pages-list.js';
import pagesDeployment from '../tools/pages-deployment.js';
import { CloudflareClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { resetSecretsCache } from '../../shared/secrets.js';

const ENV_KEYS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID'];

/** @type {Record<string, string | undefined>} */
const savedEnv = {};

/** @type {string | undefined} */
let emptySecretsDir;

function setValidEnv() {
  resetSecretsCache();
  process.env.TEKNOVO_SECRETS_DIR = emptySecretsDir;
  process.env.CLOUDFLARE_API_TOKEN = 'test-token-abc123';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.CLOUDFLARE_ZONE_ID = 'zone-456';
}

function clearEnv() {
  resetSecretsCache();
  process.env.TEKNOVO_SECRETS_DIR = emptySecretsDir;
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

/**
 * @param {Record<string, unknown>} body
 */
function mockFetchSuccess(body) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => JSON.stringify({ success: true, result: body }),
  });
}

/**
 * @param {number} status
 * @param {Array<{ message: string }>} errors
 */
function mockFetchError(status, errors) {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    headers: { get: () => null },
    text: async () => JSON.stringify({ success: false, errors }),
  });
}

describe('Pages tools', () => {
  beforeEach(() => {
    emptySecretsDir = mkdtempSync(join(tmpdir(), 'teknovo-empty-secrets-'));
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
    }
    savedEnv.TEKNOVO_SECRETS_DIR = process.env.TEKNOVO_SECRETS_DIR;
    setValidEnv();
  });

  afterEach(() => {
    resetSecretsCache();
    if (emptySecretsDir) rmSync(emptySecretsDir, { recursive: true, force: true });
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
    if (savedEnv.TEKNOVO_SECRETS_DIR === undefined) delete process.env.TEKNOVO_SECRETS_DIR;
    else process.env.TEKNOVO_SECRETS_DIR = savedEnv.TEKNOVO_SECRETS_DIR;
  });

  describe('pages_create_project', () => {
    it('fails safely when env vars missing', async () => {
      clearEnv();
      const result = await pagesCreate.handler({ name: 'my-app' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/Cloudflare credentials|CLOUDFLARE_API_TOKEN/);
    });

    it('validates required name', async () => {
      const result = await pagesCreate.handler({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
    });

    it('creates project via Cloudflare API', async () => {
      const fetchFn = mockFetchSuccess({ id: 'proj-1', name: 'teknovo-erp' });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await pagesCreate.handler({ name: 'teknovo-erp' }, { client });
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('teknovo-erp');
      expect(fetchFn).toHaveBeenCalled();
    });

    it('handles API errors', async () => {
      const fetchFn = mockFetchError(400, [{ message: 'Project already exists' }]);
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await pagesCreate.handler({ name: 'dup' }, { client });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Project already exists');
    });
  });

  describe('pages_deploy', () => {
    it('deploys project', async () => {
      const fetchFn = mockFetchSuccess({ id: 'dep-1', url: 'https://example.pages.dev' });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await pagesDeploy.handler({ project_name: 'teknovo-erp' }, { client });
      expect(result.content[0].text).toContain('dep-1');
    });
  });

  describe('pages_list_projects', () => {
    it('lists projects', async () => {
      const fetchFn = mockFetchSuccess([{ name: 'a' }, { name: 'b' }]);
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await pagesList.handler({}, { client });
      expect(result.content[0].text).toContain('"a"');
    });
  });

  describe('pages_get_deployment', () => {
    it('gets deployment details', async () => {
      const fetchFn = mockFetchSuccess({ id: 'dep-99', stage: 'production' });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await pagesDeployment.handler(
        { project_name: 'app', deployment_id: 'dep-99' },
        { client }
      );
      expect(result.content[0].text).toContain('dep-99');
    });
  });
});

describe('CloudflareClient retry', () => {
  it('retries on 429 rate limit', async () => {
    let calls = 0;
    const fetchFn = jest.fn().mockImplementation(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          ok: false,
          status: 429,
          headers: { get: () => '0' },
          text: async () => '{}',
        };
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => JSON.stringify({ success: true, result: { ok: true } }),
      };
    });

    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    const result = await client.listPagesProjects();
    expect(result.result.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('throws CloudflareApiError on client errors', async () => {
    const fetchFn = mockFetchError(403, [{ message: 'Forbidden' }]);
    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await expect(client.listPagesProjects()).rejects.toThrow(CloudflareApiError);
  });
});
