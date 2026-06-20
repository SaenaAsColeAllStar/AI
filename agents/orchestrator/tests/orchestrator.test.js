import { describe, it, expect, beforeAll } from '@jest/globals';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  routeTask,
  discoverSkills,
  discoverMcpServers,
  scoreAgentMatch,
  loadAgentRegistry,
  dispatchTask,
} from '../orchestrator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');

describe('orchestrator', () => {
  beforeAll(() => {
    expect(existsSync(join(REPO_ROOT, 'registry', 'agents.yaml'))).toBe(true);
  });

  it('loads agent registry', () => {
    const registry = loadAgentRegistry(REPO_ROOT);
    expect(registry.agents).toBeDefined();
    expect(registry.agents.orchestrator).toBeDefined();
  });

  it('discovers skills', () => {
    const skills = discoverSkills(REPO_ROOT);
    expect(skills.length).toBeGreaterThan(10);
    expect(skills.some((s) => s.path.endsWith('SKILL.md'))).toBe(true);
  });

  it('discovers MCP servers', () => {
    const servers = discoverMcpServers(REPO_ROOT);
    expect(servers.some((s) => s.id === 'github-mcp')).toBe(true);
    expect(servers.some((s) => s.id === 'cloudflare-mcp')).toBe(true);
  });

  it('scores agent keyword matches', () => {
    const score = scoreAgentMatch(
      { id: 'platform-frontend', activate_when: ['next.js', 'react', 'ui'] },
      ['next.js', 'landing', 'tailwind']
    );
    expect(score.score).toBeGreaterThan(0);
    expect(score.matchedKeywords).toContain('next.js');
  });

  it('routes frontend tasks', () => {
    const route = routeTask(
      {
        description: 'Build Next.js landing page with Tailwind and SEO',
        keywords: ['next.js', 'react', 'tailwind', 'seo'],
      },
      REPO_ROOT
    );
    expect(route.primary?.agentId).toMatch(/frontend|product|ui/i);
  });

  it('routes backend tasks', () => {
    const route = routeTask(
      {
        description: 'Add REST API endpoint with RBAC and database migration',
        keywords: ['api', 'rbac', 'database', 'nestjs'],
      },
      REPO_ROOT
    );
    expect(route.primary?.agentId).toMatch(/backend|architect|api/i);
  });

  it('dispatches task with execution result', async () => {
    const result = await dispatchTask(
      { description: 'Run unit tests for orchestrator', keywords: ['test', 'jest'] },
      { root: REPO_ROOT }
    );
    expect(result.execution.success).toBe(true);
    expect(result.skillsDiscovered).toBeGreaterThan(0);
  });
});
