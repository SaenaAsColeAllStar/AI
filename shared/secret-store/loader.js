/**
 * Platform-level secret store loader — wraps mcp/shared/secrets.js.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  resolveSecretsDir,
  parseEnvFile,
  loadCloudflareSecrets,
  loadGithubSecrets,
  loadOpenRouterSecrets,
  getCloudflareApiEnv,
  getGithubToken,
  getOpenRouterApiKey,
  resetSecretsCache,
  MASKED_TOKEN,
} from '../../mcp/shared/secrets.js';

export {
  resolveSecretsDir,
  parseEnvFile,
  loadCloudflareSecrets,
  loadGithubSecrets,
  loadOpenRouterSecrets,
  getCloudflareApiEnv,
  getGithubToken,
  getOpenRouterApiKey,
  resetSecretsCache,
  MASKED_TOKEN,
};

/**
 * Load all configured secret providers.
 * @param {{ secretsDir?: string, forceReload?: boolean }} [options]
 */
export function loadAllSecrets(options = {}) {
  const secretsDir = resolveSecretsDir(options);
  return {
    secretsDir,
    cloudflare: loadCloudflareSecrets(options),
    github: loadGithubSecrets(options),
    openrouter: loadOpenRouterSecrets(options),
  };
}

/**
 * Check which secret files exist on disk.
 * @param {{ secretsDir?: string }} [options]
 */
export function listSecretFiles(options = {}) {
  const secretsDir = resolveSecretsDir(options);
  const files = ['cloudflare.env', 'github.env', 'openrouter.env'];
  return files.map((file) => ({
    file,
    path: join(secretsDir, file),
    exists: existsSync(join(secretsDir, file)),
  }));
}

/**
 * Return configuration status without exposing values.
 * @param {{ secretsDir?: string }} [options]
 */
export function getSecretStoreStatus(options = {}) {
  const loaded = loadAllSecrets(options);
  return {
    secretsDir: loaded.secretsDir,
    providers: {
      cloudflare: { configured: loaded.cloudflare.configured, error: loaded.cloudflare.error ?? null },
      github: { configured: loaded.github.configured, error: loaded.github.error ?? null },
      openrouter: { configured: loaded.openrouter.configured, error: loaded.openrouter.error ?? null },
    },
  };
}
