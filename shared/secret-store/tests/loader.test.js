import { describe, it, expect, beforeEach } from '@jest/globals';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  parseEnvFile,
  listSecretFiles,
  getSecretStoreStatus,
  resetSecretsCache,
} from '../loader.js';

describe('secret-store loader', () => {
  beforeEach(() => {
    resetSecretsCache();
  });

  it('parses env files', () => {
    const vars = parseEnvFile('GITHUB_TOKEN=abc\n# comment\nFOO="bar"');
    expect(vars.GITHUB_TOKEN).toBe('abc');
    expect(vars.FOO).toBe('bar');
  });

  it('lists secret files in temp dir', () => {
    const dir = mkdtempSync(join(tmpdir(), 'teknovo-secrets-'));
    writeFileSync(join(dir, 'github.env'), 'GITHUB_TOKEN=test-token-12345678');
    const files = listSecretFiles({ secretsDir: dir });
    expect(files.find((f) => f.file === 'github.env')?.exists).toBe(true);
    expect(files.find((f) => f.file === 'cloudflare.env')?.exists).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  it('reports provider status without leaking tokens', () => {
    const dir = mkdtempSync(join(tmpdir(), 'teknovo-secrets-'));
    writeFileSync(join(dir, 'github.env'), 'GITHUB_TOKEN=test-token-12345678');
    const status = getSecretStoreStatus({ secretsDir: dir });
    expect(status.providers.github.configured).toBe(true);
    expect(JSON.stringify(status)).not.toContain('test-token');
    rmSync(dir, { recursive: true, force: true });
  });

  it('reports all providers when fully configured', () => {
    const dir = mkdtempSync(join(tmpdir(), 'teknovo-secrets-'));
    writeFileSync(
      join(dir, 'cloudflare.env'),
      'CLOUDFLARE_API_TOKEN=cf-token-12345678\nCLOUDFLARE_ACCOUNT_ID=acc1\nCLOUDFLARE_ZONE_ID=zone1'
    );
    writeFileSync(join(dir, 'github.env'), 'GITHUB_TOKEN=gh-token-12345678');
    writeFileSync(join(dir, 'openrouter.env'), 'OPENROUTER_API_KEY=or-key-12345678');
    const status = getSecretStoreStatus({ secretsDir: dir });
    expect(status.providers.cloudflare.configured).toBe(true);
    expect(status.providers.github.configured).toBe(true);
    expect(status.providers.openrouter.configured).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});
