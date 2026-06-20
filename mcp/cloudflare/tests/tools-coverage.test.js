/**
 * Additional coverage for tool branches and error paths.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CloudflareApiError } from '../lib/cloudflare-client.js';
import pagesDeploy from '../tools/pages-deploy.js';
import pagesList from '../tools/pages-list.js';
import pagesDeployment from '../tools/pages-deployment.js';
import dnsCreate from '../tools/dns-create.js';
import dnsUpdate from '../tools/dns-update.js';
import dnsList from '../tools/dns-list.js';
import domainAttach from '../tools/domain-attach.js';
import domainVerify from '../tools/verify-domain.js';

function apiErrorClient(method) {
  return {
    [method]: async () => {
      throw new CloudflareApiError('API failed', { status: 500 });
    },
  };
}

describe('Tool CloudflareApiError paths', () => {
  beforeEach(() => {
    process.env.CLOUDFLARE_API_TOKEN = 't';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a';
    process.env.CLOUDFLARE_ZONE_ID = 'z';
  });

  it('pages_deploy reports API errors', async () => {
    const result = await pagesDeploy.handler(
      { project_name: 'x', branch: 'main' },
      { client: apiErrorClient('deployPagesProject') }
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('API failed');
  });

  it('pages_list reports API errors', async () => {
    const result = await pagesList.handler({}, { client: apiErrorClient('listPagesProjects') });
    expect(result.isError).toBe(true);
  });

  it('pages_get_deployment reports API errors', async () => {
    const result = await pagesDeployment.handler(
      { project_name: 'x', deployment_id: 'd' },
      { client: apiErrorClient('getPagesDeployment') }
    );
    expect(result.isError).toBe(true);
  });

  it('dns_create with optional fields reports API errors', async () => {
    const result = await dnsCreate.handler(
      {
        type: 'MX',
        name: 'mail',
        content: 'mx.example.com',
        priority: 10,
        comment: 'mail server',
        proxied: false,
        ttl: 3600,
      },
      { client: apiErrorClient('createDnsRecord') }
    );
    expect(result.isError).toBe(true);
  });

  it('dns_update reports API errors', async () => {
    const result = await dnsUpdate.handler(
      { record_id: 'r', type: 'A', name: 'a', content: '1.1.1.1', proxied: true, ttl: 1, priority: 1, comment: 'x' },
      { client: apiErrorClient('updateDnsRecord') }
    );
    expect(result.isError).toBe(true);
  });

  it('dns_list reports API errors', async () => {
    const result = await dnsList.handler(
      { type: 'A', name: 'a', content: '1.1.1.1', page: 1, per_page: 50 },
      { client: apiErrorClient('listDnsRecords') }
    );
    expect(result.isError).toBe(true);
  });

  it('domain_attach reports API errors', async () => {
    const result = await domainAttach.handler(
      { project_name: 'x', domain: 'a.com' },
      { client: apiErrorClient('attachDomain') }
    );
    expect(result.isError).toBe(true);
  });

  it('domain_verify reports API errors on verify', async () => {
    const client = {
      getDomainStatus: async () => ({ result: { status: 'pending' } }),
      verifyDomain: async () => {
        throw new CloudflareApiError('verify failed');
      },
    };
    const result = await domainVerify.handler(
      { project_name: 'x', domain: 'a.com' },
      { client }
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('verify failed');
  });

  it('domain_verify uses pending status when verify response lacks status', async () => {
    const client = {
      getDomainStatus: async () => ({ result: { status: 'pending' } }),
      verifyDomain: async () => ({ result: { name: 'a.com' } }),
    };
    const result = await domainVerify.handler(
      { project_name: 'x', domain: 'a.com' },
      { client }
    );
    expect(result.content[0].text).toContain('"verified": false');
  });

  it('domain_verify rethrows non-404 get errors', async () => {
    const client = {
      getDomainStatus: async () => {
        throw new CloudflareApiError('server error', { status: 500 });
      },
    };
    const result = await domainVerify.handler(
      { project_name: 'x', domain: 'a.com' },
      { client }
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('server error');
  });
});

describe('Tool generic error paths', () => {
  beforeEach(() => {
    process.env.CLOUDFLARE_API_TOKEN = 't';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a';
    process.env.CLOUDFLARE_ZONE_ID = 'z';
  });

  const cases = [
    ['pages_deploy', { project_name: 'x' }, 'deployPagesProject', 'Failed to deploy'],
    ['pages_list', {}, 'listPagesProjects', 'Failed to list Pages'],
    ['pages_get_deployment', { project_name: 'x', deployment_id: 'd' }, 'getPagesDeployment', 'Failed to get deployment'],
    ['dns_create', { type: 'A', name: 'a', content: '1.1.1.1' }, 'createDnsRecord', 'Failed to create DNS'],
    ['dns_update', { record_id: 'r', content: '2.2.2.2' }, 'updateDnsRecord', 'Failed to update DNS'],
    ['dns_list', {}, 'listDnsRecords', 'Failed to list DNS'],
    ['domain_attach', { project_name: 'x', domain: 'a.com' }, 'attachDomain', 'Failed to attach domain'],
  ];

  it.each(cases)('%s handles generic errors', async (_label, args, method, message) => {
    const tools = {
      pages_deploy: pagesDeploy,
      pages_list: pagesList,
      pages_get_deployment: pagesDeployment,
      dns_create: dnsCreate,
      dns_update: dnsUpdate,
      dns_list: dnsList,
      domain_attach: domainAttach,
    };

    const tool = tools[_label];
    const client = {
      [method]: async () => {
        throw new TypeError('unexpected');
      },
    };

    const result = await tool.handler(args, { client });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Failed to|unexpected/i);
  });
});
