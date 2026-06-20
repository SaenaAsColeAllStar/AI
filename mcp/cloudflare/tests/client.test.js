/**
 * Extended Cloudflare client and server handler tests.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { CloudflareClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { discoverTools, handleToolCall, createMcpServer } from '../server.js';
import { resetSecretsCache } from '../../shared/secrets.js';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('CloudflareClient extended', () => {
  it('retries on 5xx errors', async () => {
    let calls = 0;
    const fetchFn = jest.fn().mockImplementation(async () => {
      calls += 1;
      if (calls < 3) {
        return {
          ok: false,
          status: 503,
          headers: { get: () => null },
          text: async () => JSON.stringify({ success: false, errors: [{ message: 'Unavailable' }] }),
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
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('throws on invalid JSON response', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => 'not-json',
    });

    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await expect(client.listPagesProjects()).rejects.toThrow(CloudflareApiError);
  });

  it('throws when success=false in body', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ success: false, errors: [{ message: 'Bad' }] }),
    });

    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await expect(client.listPagesProjects()).rejects.toThrow('Bad');
  });

  it('retries on network failure', async () => {
    let calls = 0;
    const fetchFn = jest.fn().mockImplementation(async () => {
      calls += 1;
      if (calls === 1) throw new Error('network down');
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => JSON.stringify({ success: true, result: [] }),
      };
    });

    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await client.listDnsRecords();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('covers pages and domain API methods', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ success: true, result: { id: '1' } }),
    });

    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await client.createPagesProject({ name: 'x' });
    await client.deployPagesProject('x');
    await client.getPagesDeployment('x', 'd1');
    await client.createDnsRecord({ type: 'A', name: 'a', content: '1.1.1.1' });
    await client.updateDnsRecord('r1', { content: '2.2.2.2' });
    await client.attachDomain('x', 'a.example.com');
    await client.getDomainStatus('x', 'a.example.com');
    await client.verifyDomain('x', 'a.example.com');

    expect(fetchFn).toHaveBeenCalledTimes(8);
  });

  it('throws after exhausting network retries', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('network down'));
    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await expect(client.listPagesProjects()).rejects.toThrow('network down');
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('skips null query parameters', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ success: true, result: [] }),
    });

    const client = new CloudflareClient(
      { apiToken: 't', accountId: 'a', zoneId: 'z' },
      { fetchFn }
    );

    await client.request('GET', '/zones/z/dns_records', undefined, {
      name: 'erp',
      content: undefined,
      page: '1',
    });

    const calledUrl = fetchFn.mock.calls[0][0];
    expect(calledUrl).toContain('name=erp');
    expect(calledUrl).not.toContain('content=');
  });
});

describe('handleToolCall', () => {
  it('returns error for unknown tool', async () => {
    const tools = new Map();
    const result = await handleToolCall(tools, 'missing');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool');
  });

  it('catches unhandled handler throws', async () => {
    const tools = new Map([
      [
        'boom',
        {
          definition: { name: 'boom' },
          handler: async () => {
            throw new Error('boom');
          },
        },
      ],
    ]);

    const result = await handleToolCall(tools, 'boom');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('boom');
  });

  it('dispatches to registered tool', async () => {
    const tools = new Map([
      [
        'echo',
        {
          definition: { name: 'echo' },
          handler: async (args) => ({
            content: [{ type: 'text', text: JSON.stringify(args) }],
          }),
        },
      ],
    ]);

    const result = await handleToolCall(tools, 'echo', { hi: true });
    expect(result.content[0].text).toContain('hi');
  });

  it('createMcpServer wires list tools', async () => {
    const tools = await discoverTools(join(__dirname, '..', 'tools'));
    const server = createMcpServer(tools);
    expect(server).toBeDefined();
  });
});

describe('Tool env failure coverage', () => {
  const ENV_KEYS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID'];
  const saved = {};
  /** @type {string | undefined} */
  let emptySecretsDir;

  beforeEach(() => {
    emptySecretsDir = mkdtempSync(join(tmpdir(), 'teknovo-empty-secrets-'));
    resetSecretsCache();
    process.env.TEKNOVO_SECRETS_DIR = emptySecretsDir;
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    resetSecretsCache();
    if (emptySecretsDir) rmSync(emptySecretsDir, { recursive: true, force: true });
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it('all tools fail safely without env', async () => {
    const tools = await discoverTools(join(__dirname, '..', 'tools'));
    const sampleArgs = {
      pages_create_project: { name: 'x' },
      pages_deploy: { project_name: 'x' },
      pages_list_projects: {},
      pages_get_deployment: { project_name: 'x', deployment_id: 'd' },
      dns_create_record: { type: 'A', name: 'a', content: '1.1.1.1' },
      dns_update_record: { record_id: 'r', content: '2.2.2.2' },
      dns_list_records: {},
      domain_attach: { project_name: 'x', domain: 'a.com' },
      domain_verify: { project_name: 'x', domain: 'a.com' },
    };

    for (const [name, tool] of tools) {
      const result = await tool.handler(sampleArgs[name] ?? {});
      expect(result.isError).toBe(true);
    }
  });
});

describe('Tool generic error paths', () => {
  const ENV_KEYS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID'];

  beforeEach(() => {
    process.env.CLOUDFLARE_API_TOKEN = 't';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a';
    process.env.CLOUDFLARE_ZONE_ID = 'z';
  });

  it('handles non-CloudflareApiError throws', async () => {
    const tools = await discoverTools(join(__dirname, '..', 'tools'));
    const brokenClient = {
      createPagesProject: async () => {
        throw new TypeError('unexpected');
      },
    };

    const createTool = tools.get('pages_create_project');
    const result = await createTool.handler({ name: 'x' }, { client: brokenClient });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Failed to create Pages project');
  });
});
