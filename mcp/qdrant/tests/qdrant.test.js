/**
 * Qdrant MCP tests.
 */

import { describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { validateEnv, createClient, QdrantApiError } from '../lib/qdrant-client.js';
import { toolError, toolSuccess } from '../lib/validation.js';
import { discoverTools, handleToolCall } from '../server.js';
import collectionList from '../tools/collection-list.js';
import searchTool from '../tools/search.js';
import upsertTool from '../tools/upsert.js';

describe('validation helpers', () => {
  it('toolError and toolSuccess work', () => {
    expect(toolError('x').isError).toBe(true);
    expect(toolSuccess({}).content[0].text).toContain('success');
  });
});

describe('validateEnv', () => {
  const saved = { QDRANT_URL: process.env.QDRANT_URL, QDRANT_API_KEY: process.env.QDRANT_API_KEY };

  afterEach(() => {
    process.env.QDRANT_URL = saved.QDRANT_URL;
    process.env.QDRANT_API_KEY = saved.QDRANT_API_KEY;
  });

  it('requires QDRANT_URL', () => {
    delete process.env.QDRANT_URL;
    expect(validateEnv().ok).toBe(false);
  });

  it('accepts valid URL', () => {
    process.env.QDRANT_URL = 'http://localhost:6333';
    const result = validateEnv();
    expect(result.ok).toBe(true);
  });
});

describe('QdrantClient', () => {
  const mockFetch = async (url, init) => {
    if (url.endsWith('/collections') && init?.method === 'GET') {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ result: { collections: [{ name: 'docs' }] } }),
      };
    }
    if (url.includes('/points/search')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ result: [{ id: 1, score: 0.9 }] }),
      };
    }
    if (url.includes('/points') && init?.method === 'PUT') {
      return { ok: true, status: 200, text: async () => JSON.stringify({ result: { status: 'ok' } }) };
    }
    return { ok: false, status: 404, text: async () => JSON.stringify({ status: { error: 'Not found' } }) };
  };

  beforeEach(() => {
    process.env.QDRANT_URL = 'http://localhost:6333';
  });

  it('throws QdrantApiError on failure', async () => {
    const client = createClient({ url: 'http://localhost:6333' }, {
      fetchFn: async () => ({ ok: false, status: 500, text: async () => '{}' }),
    });
    await expect(client.listCollections()).rejects.toBeInstanceOf(QdrantApiError);
  });

  it('listCollections succeeds', async () => {
    const client = createClient({ url: 'http://localhost:6333' }, { fetchFn: mockFetch });
    const result = await client.listCollections();
    expect(result).toHaveProperty('result');
  });

  it('search succeeds', async () => {
    const client = createClient({ url: 'http://localhost:6333' }, { fetchFn: mockFetch });
    const result = await client.search('docs', [0.1, 0.2]);
    expect(result).toHaveProperty('result');
  });

  it('upsert succeeds', async () => {
    const client = createClient({ url: 'http://localhost:6333' }, { fetchFn: mockFetch });
    const result = await client.upsert('docs', [{ id: 1, vector: [0.1], payload: { text: 'hi' } }]);
    expect(result).toHaveProperty('result');
  });
});

describe('tools', () => {
  const mockClient = {
    listCollections: async () => ({ result: { collections: [] } }),
    search: async () => ({ result: [] }),
    upsert: async () => ({ result: { status: 'ok' } }),
  };

  beforeEach(() => {
    process.env.QDRANT_URL = 'http://localhost:6333';
  });

  it('collection_list works', async () => {
    const result = await collectionList.handler({}, { client: mockClient });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('search validates input', async () => {
    const result = await searchTool.handler({ collection: 'docs' });
    expect(result.isError).toBe(true);
  });

  it('search works with mock client', async () => {
    const result = await searchTool.handler(
      { collection: 'docs', vector: [0.1, 0.2] },
      { client: mockClient }
    );
    expect(result.content[0].text).toContain('"success": true');
  });

  it('upsert works with mock client', async () => {
    const result = await upsertTool.handler(
      { collection: 'docs', points: [{ id: 1, vector: [0.1] }] },
      { client: mockClient }
    );
    expect(result.content[0].text).toContain('"success": true');
  });
});

describe('server', () => {
  it('discovers three tools', async () => {
    const tools = await discoverTools();
    expect(tools.size).toBe(3);
  });

  it('handleToolCall rejects unknown tool', async () => {
    const tools = await discoverTools();
    const result = await handleToolCall(tools, 'missing');
    expect(result.isError).toBe(true);
  });
});
