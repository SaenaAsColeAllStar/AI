/**
 * Qdrant tool error-path coverage.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { QdrantApiError } from '../lib/qdrant-client.js';
import { formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { configureLogger, logger } from '../lib/logger.js';
import collectionList from '../tools/collection-list.js';
import searchTool from '../tools/search.js';
import upsertTool from '../tools/upsert.js';
import { z } from 'zod';

/** @param {string} method */
function errorClient(method) {
  return {
    [method]: async () => {
      throw new QdrantApiError('API failed', { status: 500 });
    },
  };
}

describe('validation and logger', () => {
  it('helpers work', () => {
    const schema = z.object({ x: z.string() });
    const r = schema.safeParse({});
    if (r.success) throw new Error('fail');
    expect(formatZodError(r.error)).toContain('x');
    expect(toolError('e').isError).toBe(true);
    expect(toolSuccess({}).content[0].text).toContain('success');
  });

  it('logger methods', () => {
    configureLogger({ level: 'debug' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    configureLogger({ level: 'info' });
  });
});

describe('qdrant tool error paths', () => {
  beforeEach(() => {
    process.env.QDRANT_URL = 'http://localhost:6333';
  });

  it('collection_list API error', async () => {
    const result = await collectionList.handler({}, { client: errorClient('listCollections') });
    expect(result.isError).toBe(true);
  });

  it('search API error', async () => {
    const result = await searchTool.handler(
      { collection: 'c', vector: [0.1], limit: 5, score_threshold: 0.5, filter: { must: [] } },
      { client: errorClient('search') }
    );
    expect(result.isError).toBe(true);
  });

  it('upsert API error', async () => {
    const result = await upsertTool.handler(
      { collection: 'c', points: [{ id: 1, vector: [0.1], payload: { t: 'x' } }] },
      { client: errorClient('upsert') }
    );
    expect(result.isError).toBe(true);
  });

  it('collection_list missing env', async () => {
    delete process.env.QDRANT_URL;
    const result = await collectionList.handler({});
    expect(result.isError).toBe(true);
  });

  it('upsert validates input', async () => {
    const result = await upsertTool.handler({ collection: 'c' });
    expect(result.isError).toBe(true);
  });
});
