/**
 * Cloudflare REST API client with retry and rate-limit handling.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { logger } from './logger.js';
import { pagesApi } from './pages-api.js';
import { dnsApi } from './dns-api.js';
import { domainApi } from './domain-api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {Record<string, unknown>} */
let config = {};

try {
  const configPath = join(__dirname, '..', 'config', 'cloudflare.json');
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (err) {
  logger.warn('Could not load config/cloudflare.json, using defaults', {
    error: err instanceof Error ? err.message : String(err),
  });
  config = {
    apiBaseUrl: 'https://api.cloudflare.com/client/v4',
    retry: { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
    rateLimit: { defaultRetryAfterMs: 5000 },
  };
}

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {number} attempt
 * @param {number} base
 * @param {number} max
 */
function backoffDelay(attempt, base, max) {
  const exp = Math.min(base * 2 ** attempt, max);
  return exp + Math.floor(Math.random() * 250);
}

export class CloudflareClient {
  /**
   * @param {{ apiToken: string, accountId: string, zoneId: string }} env
   * @param {{ fetchFn?: typeof fetch }} [options]
   */
  constructor(env, options = {}) {
    this.apiToken = env.apiToken;
    this.accountId = env.accountId;
    this.zoneId = env.zoneId;
    this.baseUrl = /** @type {string} */ (config.apiBaseUrl ?? 'https://api.cloudflare.com/client/v4');
    this.fetchFn = options.fetchFn ?? fetch;
    /** @type {{ maxAttempts: number, baseDelayMs: number, maxDelayMs: number }} */
    this.retryConfig = /** @type {{ maxAttempts: number, baseDelayMs: number, maxDelayMs: number }} */ (
      config.retry ?? { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 10000 }
    );
    /** @type {{ defaultRetryAfterMs: number }} */
    this.rateLimitConfig = /** @type {{ defaultRetryAfterMs: number }} */ (
      config.rateLimit ?? { defaultRetryAfterMs: 5000 }
    );
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {Record<string, unknown> | undefined} [body]
   * @param {Record<string, string>} [query]
   */
  async request(method, path, body, query) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };

    let lastError;

    for (let attempt = 0; attempt < this.retryConfig.maxAttempts; attempt++) {
      try {
        logger.debug('Cloudflare API request', { method, path: url.pathname });

        const response = await this.fetchFn(url.toString(), {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter
            ? Number.parseInt(retryAfter, 10) * 1000
            : this.rateLimitConfig.defaultRetryAfterMs;
          logger.warn('Rate limited by Cloudflare', { path: url.pathname, delayMs, attempt });
          await sleep(delayMs);
          continue;
        }

        const text = await response.text();
        /** @type {Record<string, unknown>} */
        let payload;
        try {
          payload = text ? JSON.parse(text) : {};
        } catch {
          throw new CloudflareApiError(`Invalid JSON response (${response.status})`, {
            status: response.status,
            body: text.slice(0, 500),
          });
        }

        if (!response.ok) {
          const errors = /** @type {Array<{ message?: string }>} */ (payload.errors ?? []);
          const message =
            errors.map((e) => e.message).filter(Boolean).join('; ') ||
            `Cloudflare API error (${response.status})`;

          if (response.status >= 500 && attempt < this.retryConfig.maxAttempts - 1) {
            const delay = backoffDelay(
              attempt,
              this.retryConfig.baseDelayMs,
              this.retryConfig.maxDelayMs
            );
            logger.warn('Cloudflare server error, retrying', { status: response.status, delay, attempt });
            await sleep(delay);
            continue;
          }

          throw new CloudflareApiError(message, {
            status: response.status,
            errors: payload.errors,
            messages: payload.messages,
          });
        }

        if (payload.success === false) {
          const errors = /** @type {Array<{ message?: string }>} */ (payload.errors ?? []);
          throw new CloudflareApiError(
            errors.map((e) => e.message).filter(Boolean).join('; ') || 'Cloudflare API returned success=false',
            { errors: payload.errors }
          );
        }

        return payload;
      } catch (err) {
        lastError = err;
        if (err instanceof CloudflareApiError) throw err;
        if (attempt < this.retryConfig.maxAttempts - 1) {
          const delay = backoffDelay(
            attempt,
            this.retryConfig.baseDelayMs,
            this.retryConfig.maxDelayMs
          );
          logger.warn('Network error, retrying', {
            error: err instanceof Error ? err.message : String(err),
            delay,
            attempt,
          });
          await sleep(delay);
          continue;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new CloudflareApiError('Cloudflare request failed after retries');
  }
}

Object.assign(CloudflareClient.prototype, pagesApi, dnsApi, domainApi);

export class CloudflareApiError extends Error {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [details]
   */
  constructor(message, details = {}) {
    super(message);
    this.name = 'CloudflareApiError';
    this.details = details;
  }
}

/**
 * @param {{ apiToken: string, accountId: string, zoneId: string }} env
 * @param {{ fetchFn?: typeof fetch }} [options]
 */
export function createClient(env, options) {
  return new CloudflareClient(env, options);
}

export { config as cloudflareConfig };
