import { describe, it, expect } from '@jest/globals';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scoreAgentMatch,
  resolveMcpsForTask,
  loadAgentConfig,
  loadMcpRegistry,
  dispatchParallel,
} from '../orchestrator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');

describe('orchestrator extended', () => {
  it('returns zero score when no keywords match', () => {
    const score = scoreAgentMatch(
      { id: 'x', activate_when: ['cloudflare'] },
      ['unrelated', 'foobar']
    );
    expect(score.score).toBe(0);
    expect(score.matchedKeywords).toHaveLength(0);
  });

  it('resolves MCPs for cloudflare keywords', () => {
    const mcps = resolveMcpsForTask(['cloudflare', 'deploy'], REPO_ROOT);
    expect(mcps.some((m) => m.id === 'cloudflare-mcp')).toBe(true);
  });

  it('loads agent config for platform-frontend', () => {
    const config = loadAgentConfig('platform-frontend', REPO_ROOT);
    expect(config?.id).toBe('platform-frontend');
    expect(config?.skills?.required).toContain('teknovo-ui-ux');
  });

  it('returns null for unknown agent config', () => {
    expect(loadAgentConfig('nonexistent-agent', REPO_ROOT)).toBeNull();
  });

  it('loads mcp registry', () => {
    const registry = loadMcpRegistry(REPO_ROOT);
    expect(registry.integrations['github-mcp']).toBeDefined();
  });

  it('dispatches parallel tasks', async () => {
    const result = await dispatchParallel(
      [
        { description: 'UI task', keywords: ['react', 'ui'] },
        { description: 'API task', keywords: ['api', 'backend'] },
      ],
      { root: REPO_ROOT }
    );
    expect(result.results).toHaveLength(2);
    expect(result.success).toBe(true);
  });

  it('platform agent dirs exist', () => {
    for (const dir of ['frontend', 'backend', 'devops', 'testing', 'orchestrator', 'cloudflare', 'github']) {
      expect(existsSync(join(REPO_ROOT, 'agents', dir, 'AGENT.md'))).toBe(true);
      expect(existsSync(join(REPO_ROOT, 'agents', dir, 'config.yaml'))).toBe(true);
      expect(existsSync(join(REPO_ROOT, 'agents', dir, 'agent.yaml'))).toBe(true);
    }
  });
});
