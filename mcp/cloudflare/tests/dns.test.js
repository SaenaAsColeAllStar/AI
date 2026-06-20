/**
 * Tests for Cloudflare DNS MCP tools.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import dnsCreate from '../tools/dns-create.js';
import dnsUpdate from '../tools/dns-update.js';
import dnsList from '../tools/dns-list.js';
import { CloudflareClient } from '../lib/cloudflare-client.js';
import { validateEnv } from '../lib/validation.js';
import { maskValue as loggerMask } from '../lib/logger.js';

const ENV_KEYS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID'];

/** @type {Record<string, string | undefined>} */
const savedEnv = {};

function setValidEnv() {
  process.env.CLOUDFLARE_API_TOKEN = 'secret-token-xyz';
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

describe('DNS tools', () => {
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

  describe('validateEnv', () => {
    it('returns ok with valid env', () => {
      const result = validateEnv();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.env.apiToken).toBe('secret-token-xyz');
      }
    });

    it('returns missing fields when invalid', () => {
      delete process.env.CLOUDFLARE_ZONE_ID;
      const result = validateEnv();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.missing).toContain('CLOUDFLARE_ZONE_ID');
      }
    });
  });

  describe('dns_create_record', () => {
    it('creates CNAME record', async () => {
      const fetchFn = mockFetchSuccess({ id: 'rec-1', type: 'CNAME', name: 'erp' });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await dnsCreate.handler(
        { type: 'CNAME', name: 'erp', content: 'tunnel.cfargotunnel.com' },
        { client }
      );
      expect(result.content[0].text).toContain('rec-1');
    });

    it('rejects invalid record type', async () => {
      const result = await dnsCreate.handler({
        type: 'INVALID',
        name: 'x',
        content: 'y',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('dns_update_record', () => {
    it('requires at least one update field', async () => {
      const result = await dnsUpdate.handler({ record_id: 'rec-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('At least one field');
    });

    it('updates record', async () => {
      const fetchFn = mockFetchSuccess({ id: 'rec-1', content: 'new-target' });
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await dnsUpdate.handler(
        { record_id: 'rec-1', content: 'new-target' },
        { client }
      );
      expect(result.content[0].text).toContain('new-target');
    });
  });

  describe('dns_list_records', () => {
    it('lists with filters', async () => {
      const fetchFn = mockFetchSuccess([{ id: '1', type: 'CNAME', name: 'api' }]);
      const client = new CloudflareClient(
        { apiToken: 't', accountId: 'a', zoneId: 'z' },
        { fetchFn }
      );

      const result = await dnsList.handler({ type: 'CNAME', name: 'api' }, { client });
      expect(result.content[0].text).toContain('api');
    });
  });
});

describe('Logger masking', () => {
  it('masks bearer tokens in logger', () => {
    const masked = loggerMask('Authorization: Bearer abc123secret');
    expect(masked).not.toContain('abc123secret');
    expect(masked).toContain('[REDACTED]');
  });
});
