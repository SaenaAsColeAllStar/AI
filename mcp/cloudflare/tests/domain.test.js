/**
 * Tests for Cloudflare domain MCP tools and server discovery.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import domainAttach from '../tools/domain-attach.js';
import domainVerify from '../tools/verify-domain.js';
import { discoverTools, createMcpServer } from '../server.js';
import { CloudflareClient } from '../lib/cloudflare-client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_KEYS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID'];

/** @type {Record<string, string | undefined>} */
const savedEnv = {};

function setValidEnv() {
  process.env.CLOUDFLARE_API_TOKEN = 'test-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.CLOUDFLARE_ZONE_ID = 'zone-456';
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
 */
function mockFetchStatus(status, body) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    text: async () => JSON.stringify(body),
  });
}

describe('Domain tools', () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
    }
    setValidEnv();
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  describe('domain_attach', () => {
    it('attaches custom domain', async () => {
      const fetchFn = mockFetchSuccess({
        id: 'dom-1',
        name: 'erp.school.sch.id',
        status: 'pending',
      });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await domainAttach.handler(
        { project_name: 'teknovo-erp', domain: 'erp.school.sch.id' },
        { client }
      );
      expect(result.content[0].text).toContain('erp.school.sch.id');
    });
  });

  describe('domain_verify', () => {
    it('returns active when already verified', async () => {
      const fetchFn = mockFetchSuccess({ name: 'erp.school.sch.id', status: 'active' });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await domainVerify.handler(
        { project_name: 'teknovo-erp', domain: 'erp.school.sch.id' },
        { client }
      );
      expect(result.content[0].text).toContain('"verified": true');
    });

    it('triggers verify when pending', async () => {
      let call = 0;
      const fetchFn = jest.fn().mockImplementation(async (url, opts) => {
        call += 1;
        if (call === 1) {
          return {
            ok: true,
            status: 200,
            headers: { get: () => null },
            text: async () =>
              JSON.stringify({
                success: true,
                result: { name: 'erp.school.sch.id', status: 'pending' },
              }),
          };
        }
        return {
          ok: true,
          status: 200,
          headers: { get: () => null },
          text: async () =>
            JSON.stringify({
              success: true,
              result: { name: 'erp.school.sch.id', status: 'active' },
            }),
        };
      });

      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await domainVerify.handler(
        { project_name: 'teknovo-erp', domain: 'erp.school.sch.id' },
        { client }
      );
      expect(result.content[0].text).toContain('"verified": true');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('errors when domain not attached', async () => {
      const fetchFn = mockFetchStatus(404, {
        success: false,
        errors: [{ message: 'Not found' }],
      });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await domainVerify.handler(
        { project_name: 'teknovo-erp', domain: 'missing.example.com' },
        { client }
      );
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('domain_attach');
    });
  });
});

describe('Server tool discovery', () => {
  it('discovers all 9 tools', async () => {
    const tools = await discoverTools(join(__dirname, '..', 'tools'));
    expect(tools.size).toBe(9);

    const expected = [
      'pages_create_project',
      'pages_deploy',
      'pages_list_projects',
      'pages_get_deployment',
      'dns_create_record',
      'dns_update_record',
      'dns_list_records',
      'domain_attach',
      'domain_verify',
    ];

    for (const name of expected) {
      expect(tools.has(name)).toBe(true);
    }
  });

  it('creates MCP server with tool definitions', async () => {
    const tools = await discoverTools(join(__dirname, '..', 'tools'));
    const server = createMcpServer(tools);
    expect(server).toBeDefined();
  });
});
