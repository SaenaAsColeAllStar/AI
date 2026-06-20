/**
 * Teknovo secret store loader — reads credentials from OS config paths only.
 * Never commit secrets. Never log raw tokens.
 */

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { logger, registerSecret, MASKED_VALUE } from './logger.js';

export { MASKED_VALUE as MASKED_TOKEN };

/** @type {{ apiToken: string, accountId: string, zoneId: string } | null} */
let cloudflareInternal = null;

/** @type {{ token: string } | null} */
let githubInternal = null;

/** @type {{ apiKey: string } | null} */
let openrouterInternal = null;

/**
 * Resolve Teknovo secrets directory.
 * Production: /root/.config/teknovo/secrets/
 * Windows/dev: %USERPROFILE%\.config\teknovo\secrets\ or ~/.config/teknovo/secrets/
 * @param {{ secretsDir?: string }} [options]
 */
export function resolveSecretsDir(options = {}) {
  const override = options.secretsDir ?? process.env.TEKNOVO_SECRETS_DIR;
  if (override) return override;

  const linuxPath = '/root/.config/teknovo/secrets';
  if (existsSync(linuxPath)) return linuxPath;

  const userProfile = process.env.USERPROFILE ?? homedir();
  const windowsPath = join(userProfile, '.config', 'teknovo', 'secrets');
  if (existsSync(windowsPath)) return windowsPath;

  return join(homedir(), '.config', 'teknovo', 'secrets');
}

/**
 * @param {string} content
 * @returns {Record<string, string>}
 */
export function parseEnvFile(content) {
  /** @type {Record<string, string>} */
  const vars = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    vars[key] = value;
  }

  return vars;
}

/**
 * @param {string} filePath
 */
function readSecretFile(filePath) {
  if (!existsSync(filePath)) {
    return {
      ok: false,
      error: `Secret file not found: ${filePath}`,
      vars: /** @type {Record<string, string>} */ ({}),
    };
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    return { ok: true, vars: parseEnvFile(content), path: filePath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      vars: /** @type {Record<string, string>} */ ({}),
    };
  }
}

/**
 * Apply Cloudflare credentials to process.env for downstream MCP tools.
 * @param {{ apiToken: string, accountId: string, zoneId: string }} creds
 */
function applyCloudflareEnv(creds) {
  process.env.CLOUDFLARE_API_TOKEN = creds.apiToken;
  process.env.CLOUDFLARE_ACCOUNT_ID = creds.accountId;
  process.env.CLOUDFLARE_ZONE_ID = creds.zoneId;
  registerSecret(creds.apiToken);
}

/**
 * Load Cloudflare secrets from secret store.
 * Returns masked token for callers; use getCloudflareApiEnv() for API calls.
 * @param {{ secretsDir?: string, forceReload?: boolean }} [options]
 */
export function loadCloudflareSecrets(options = {}) {
  if (cloudflareInternal && !options.forceReload) {
    return {
      configured: true,
      token: MASKED_VALUE,
      accountId: cloudflareInternal.accountId,
      zoneId: cloudflareInternal.zoneId,
    };
  }

  const secretsDir = resolveSecretsDir(options);
  const filePath = join(secretsDir, 'cloudflare.env');
  const loaded = readSecretFile(filePath);

  if (!loaded.ok) {
    logger.warn('Cloudflare secret store unavailable', { secretsDir, error: loaded.error });
    return {
      configured: false,
      token: MASKED_VALUE,
      accountId: '',
      zoneId: '',
      error: loaded.error,
    };
  }

  const token = loaded.vars.CLOUDFLARE_API_TOKEN ?? loaded.vars.CLOUDFLARE_TOKEN ?? '';
  const accountId = loaded.vars.CLOUDFLARE_ACCOUNT_ID ?? '';
  const zoneId = loaded.vars.CLOUDFLARE_ZONE_ID ?? '';

  if (!token || !accountId || !zoneId) {
    /** @type {string[]} */
    const missing = [];
    if (!token) missing.push('CLOUDFLARE_API_TOKEN');
    if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
    if (!zoneId) missing.push('CLOUDFLARE_ZONE_ID');

    logger.warn('Cloudflare secret file incomplete', { secretsDir, missing });

    return {
      configured: false,
      token: MASKED_VALUE,
      accountId,
      zoneId,
      missing,
      error: `Missing required keys in cloudflare.env: ${missing.join(', ')}`,
    };
  }

  cloudflareInternal = { apiToken: token, accountId, zoneId };
  applyCloudflareEnv(cloudflareInternal);

  logger.info('Cloudflare secrets loaded from secret store', { secretsDir, accountId, zoneId });

  return {
    configured: true,
    token: MASKED_VALUE,
    accountId,
    zoneId,
  };
}

/**
 * Internal credentials for Cloudflare API clients — never log return value.
 * Falls back to process.env when secret store is not configured.
 */
export function getCloudflareApiEnv() {
  if (cloudflareInternal) {
    return { ...cloudflareInternal };
  }

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (apiToken && accountId && zoneId) {
    registerSecret(apiToken);
    return { apiToken, accountId, zoneId };
  }

  return null;
}

/**
 * Load GitHub secrets from secret store.
 * @param {{ secretsDir?: string, forceReload?: boolean }} [options]
 */
export function loadGithubSecrets(options = {}) {
  if (githubInternal && !options.forceReload) {
    return { configured: true, token: MASKED_VALUE };
  }

  const secretsDir = resolveSecretsDir(options);
  const filePath = join(secretsDir, 'github.env');
  const loaded = readSecretFile(filePath);

  if (!loaded.ok) {
    logger.warn('GitHub secret store unavailable', { secretsDir, error: loaded.error });
    return { configured: false, token: MASKED_VALUE, error: loaded.error };
  }

  const token = loaded.vars.GITHUB_TOKEN ?? loaded.vars.GH_TOKEN ?? '';

  if (!token) {
    logger.warn('GitHub secret file incomplete', { secretsDir, missing: ['GITHUB_TOKEN'] });
    return {
      configured: false,
      token: MASKED_VALUE,
      missing: ['GITHUB_TOKEN'],
      error: 'Missing required key in github.env: GITHUB_TOKEN',
    };
  }

  githubInternal = { token };
  process.env.GITHUB_TOKEN = token;
  registerSecret(token);

  logger.info('GitHub secrets loaded from secret store', { secretsDir });

  return { configured: true, token: MASKED_VALUE };
}

/**
 * Internal GitHub token for API clients.
 */
export function getGithubToken() {
  if (githubInternal) return githubInternal.token;
  if (process.env.GITHUB_TOKEN) {
    registerSecret(process.env.GITHUB_TOKEN);
    return process.env.GITHUB_TOKEN;
  }
  return null;
}

/**
 * Load OpenRouter secrets from secret store.
 * @param {{ secretsDir?: string, forceReload?: boolean }} [options]
 */
export function loadOpenRouterSecrets(options = {}) {
  if (openrouterInternal && !options.forceReload) {
    return { configured: true, token: MASKED_VALUE };
  }

  const secretsDir = resolveSecretsDir(options);
  const filePath = join(secretsDir, 'openrouter.env');
  const loaded = readSecretFile(filePath);

  if (!loaded.ok) {
    logger.warn('OpenRouter secret store unavailable', { secretsDir, error: loaded.error });
    return { configured: false, token: MASKED_VALUE, error: loaded.error };
  }

  const apiKey = loaded.vars.OPENROUTER_API_KEY ?? loaded.vars.OPENROUTER_TOKEN ?? '';

  if (!apiKey) {
    logger.warn('OpenRouter secret file incomplete', { secretsDir, missing: ['OPENROUTER_API_KEY'] });
    return {
      configured: false,
      token: MASKED_VALUE,
      missing: ['OPENROUTER_API_KEY'],
      error: 'Missing required key in openrouter.env: OPENROUTER_API_KEY',
    };
  }

  openrouterInternal = { apiKey };
  process.env.OPENROUTER_API_KEY = apiKey;
  registerSecret(apiKey);

  logger.info('OpenRouter secrets loaded from secret store', { secretsDir });

  return { configured: true, token: MASKED_VALUE };
}

/**
 * Internal OpenRouter API key.
 */
export function getOpenRouterApiKey() {
  if (openrouterInternal) return openrouterInternal.apiKey;
  if (process.env.OPENROUTER_API_KEY) {
    registerSecret(process.env.OPENROUTER_API_KEY);
    return process.env.OPENROUTER_API_KEY;
  }
  return null;
}

/**
 * Reset in-memory secret cache (testing only).
 */
export function resetSecretsCache() {
  cloudflareInternal = null;
  githubInternal = null;
  openrouterInternal = null;
}
