/**
 * Qdrant REST API client.
 */

import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  QDRANT_URL: z.string().url('QDRANT_URL must be a valid URL'),
  QDRANT_API_KEY: z.string().optional(),
});

export class QdrantApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, details?: unknown }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'QdrantApiError';
    this.status = options.status;
    this.details = options.details;
  }
}

export class QdrantClient {
  /**
   * @param {{ url: string, apiKey?: string | null }} env
   * @param {{ fetchFn?: typeof fetch }} [options]
   */
  constructor(env, options = {}) {
    this.baseUrl = env.url.replace(/\/$/, '');
    this.apiKey = env.apiKey ?? null;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {unknown} [body]
   */
  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['api-key'] = this.apiKey;

    logger.debug('Qdrant API request', { method, path });

    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method,
      headers,
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
        typeof data === 'object' && data !== null && 'status' in data
          ? String(/** @type {{ status: { error?: string } }} */ (data).status?.error ?? response.statusText)
          : `Qdrant API error (${response.status})`;
      throw new QdrantApiError(message, { status: response.status, details: data });
    }

    return data;
  }

  async listCollections() {
    return this.request('GET', '/collections');
  }

  /**
   * @param {string} collection
   * @param {number[]} vector
   * @param {{ limit?: number, score_threshold?: number, filter?: Record<string, unknown> }} [options]
   */
  async search(collection, vector, options = {}) {
    return this.request('POST', `/collections/${encodeURIComponent(collection)}/points/search`, {
      vector,
      limit: options.limit ?? 10,
      score_threshold: options.score_threshold,
      filter: options.filter,
      with_payload: true,
    });
  }

  /**
   * @param {string} collection
   * @param {Array<{ id: string | number, vector: number[], payload?: Record<string, unknown> }>} points
   */
  async upsert(collection, points) {
    return this.request('PUT', `/collections/${encodeURIComponent(collection)}/points`, {
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload ?? {},
      })),
    });
  }
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function validateEnv(env = process.env) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    return {
      ok: false,
      error: 'QDRANT_URL is required. Copy .env.example to .env.',
      missing: result.error.issues.map((i) => i.path.join('.')),
    };
  }
  return {
    ok: true,
    env: {
      url: result.data.QDRANT_URL,
      apiKey: result.data.QDRANT_API_KEY ?? null,
    },
  };
}

/**
 * @param {{ url: string, apiKey?: string | null }} env
 * @param {{ fetchFn?: typeof fetch }} [options]
 */
export function createClient(env, options = {}) {
  return new QdrantClient(env, options);
}
