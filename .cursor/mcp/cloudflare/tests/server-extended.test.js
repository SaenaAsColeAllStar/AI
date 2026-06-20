/**
 * Server discovery edge-case tests.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverTools } from '../server.js';
import pagesCreate from '../tools/pages-create.js';
import { createClient } from '../lib/cloudflare-client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('discoverTools edge cases', () => {
  it('skips invalid tool modules', async () => {
    const dir = join(__dirname, 'fixtures');
    const tools = await discoverTools(dir);
    expect(tools.has('invalid-tool')).toBe(false);
  });
});

describe('pages_create optional build config branches', () => {
  beforeEach(() => {
    process.env.CLOUDFLARE_API_TOKEN = 't';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a';
    process.env.CLOUDFLARE_ZONE_ID = 'z';
  });

  it('uses all optional build fields when provided', async () => {
    let captured;
    const client = {
      createPagesProject: async (body) => {
        captured = body;
        return { result: body };
      },
    };

    await pagesCreate.handler(
      {
        name: 'full-config',
        production_branch: 'develop',
        build_command: 'pnpm build',
        destination_dir: 'out',
        root_dir: 'apps/web',
      },
      { client }
    );

    expect(captured.production_branch).toBe('develop');
    expect(captured.build_config.build_command).toBe('pnpm build');
    expect(captured.build_config.destination_dir).toBe('out');
    expect(captured.build_config.root_dir).toBe('apps/web');
  });
});

describe('createClient factory', () => {
  it('returns CloudflareClient instance', () => {
    const client = createClient({
      apiToken: 't',
      accountId: 'a',
      zoneId: 'z',
    });
    expect(client.accountId).toBe('a');
  });
});
