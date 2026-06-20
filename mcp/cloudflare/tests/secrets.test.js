/**
 * Tests for Teknovo shared secret store loader.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadCloudflareSecrets,
  loadGithubSecrets,
  loadOpenRouterSecrets,
  getCloudflareApiEnv,
  getGithubToken,
  getOpenRouterApiKey,
  parseEnvFile,
  resolveSecretsDir,
  resetSecretsCache,
  MASKED_TOKEN,
} from '../../shared/secrets.js';
import { maskValue } from '../../shared/logger.js';

describe('parseEnvFile', () => {
  it('parses key=value pairs and ignores comments', () => {
    const vars = parseEnvFile(`
# comment
CLOUDFLARE_API_TOKEN=abc123
CLOUDFLARE_ACCOUNT_ID=acct-1
CLOUDFLARE_ZONE_ID="zone-2"
`);
    expect(vars.CLOUDFLARE_API_TOKEN).toBe('abc123');
    expect(vars.CLOUDFLARE_ACCOUNT_ID).toBe('acct-1');
    expect(vars.CLOUDFLARE_ZONE_ID).toBe('zone-2');
  });
});

describe('secret store loaders', () => {
  /** @type {string} */
  let tempDir;

  beforeEach(() => {
    resetSecretsCache();
    tempDir = mkdtempSync(join(tmpdir(), 'teknovo-secrets-'));
  });

  afterEach(() => {
    resetSecretsCache();
    rmSync(tempDir, { recursive: true, force: true });
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_ZONE_ID;
    delete process.env.GITHUB_TOKEN;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.TEKNOVO_SECRETS_DIR;
  });

  it('loadCloudflareSecrets fails safely when file missing', () => {
    const result = loadCloudflareSecrets({ secretsDir: tempDir, forceReload: true });
    expect(result.configured).toBe(false);
    expect(result.token).toBe(MASKED_TOKEN);
    expect(result.error).toContain('not found');
  });

  it('loadCloudflareSecrets loads and masks token', () => {
    writeFileSync(
      join(tempDir, 'cloudflare.env'),
      'CLOUDFLARE_API_TOKEN=real-secret-token-value\nCLOUDFLARE_ACCOUNT_ID=acc-999\nCLOUDFLARE_ZONE_ID=zone-888\n'
    );

    const result = loadCloudflareSecrets({ secretsDir: tempDir, forceReload: true });
    expect(result.configured).toBe(true);
    expect(result.token).toBe(MASKED_TOKEN);
    expect(result.accountId).toBe('acc-999');
    expect(result.zoneId).toBe('zone-888');

    const creds = getCloudflareApiEnv();
    expect(creds?.apiToken).toBe('real-secret-token-value');
    expect(maskValue(`Bearer ${creds?.apiToken}`)).not.toContain('real-secret-token-value');
  });

  it('loadCloudflareSecrets reports missing keys', () => {
    writeFileSync(join(tempDir, 'cloudflare.env'), 'CLOUDFLARE_ACCOUNT_ID=only-account\n');
    const result = loadCloudflareSecrets({ secretsDir: tempDir, forceReload: true });
    expect(result.configured).toBe(false);
    expect(result.missing).toContain('CLOUDFLARE_API_TOKEN');
  });

  it('loadGithubSecrets loads token', () => {
    writeFileSync(join(tempDir, 'github.env'), 'GITHUB_TOKEN=ghp_test_token_value\n');
    const result = loadGithubSecrets({ secretsDir: tempDir, forceReload: true });
    expect(result.configured).toBe(true);
    expect(result.token).toBe(MASKED_TOKEN);
    expect(getGithubToken()).toBe('ghp_test_token_value');
  });

  it('loadOpenRouterSecrets loads api key', () => {
    writeFileSync(join(tempDir, 'openrouter.env'), 'OPENROUTER_API_KEY=or-key-value\n');
    const result = loadOpenRouterSecrets({ secretsDir: tempDir, forceReload: true });
    expect(result.configured).toBe(true);
    expect(result.token).toBe(MASKED_TOKEN);
    expect(getOpenRouterApiKey()).toBe('or-key-value');
  });

  it('resolveSecretsDir honors TEKNOVO_SECRETS_DIR override', () => {
    process.env.TEKNOVO_SECRETS_DIR = tempDir;
    expect(resolveSecretsDir()).toBe(tempDir);
  });

  it('getCloudflareApiEnv falls back to process.env', () => {
    process.env.CLOUDFLARE_API_TOKEN = 'env-token';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'env-acc';
    process.env.CLOUDFLARE_ZONE_ID = 'env-zone';
    const creds = getCloudflareApiEnv();
    expect(creds?.apiToken).toBe('env-token');
  });

  it('loadCloudflareSecrets returns cached result without reload', () => {
    writeFileSync(
      join(tempDir, 'cloudflare.env'),
      'CLOUDFLARE_API_TOKEN=cache-token\nCLOUDFLARE_ACCOUNT_ID=acc-1\nCLOUDFLARE_ZONE_ID=zone-1\n'
    );
    const first = loadCloudflareSecrets({ secretsDir: tempDir, forceReload: true });
    const second = loadCloudflareSecrets({ secretsDir: tempDir });
    expect(first.configured).toBe(true);
    expect(second.configured).toBe(true);
    expect(second.token).toBe(MASKED_TOKEN);
  });
});
