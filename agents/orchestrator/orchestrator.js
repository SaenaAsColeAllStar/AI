#!/usr/bin/env node
/**
 * Teknovo Multi-Agent Orchestrator
 * Routes tasks to specialized agents, discovers skills/MCPs, coordinates parallel work.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { WorkflowEngine } from '../../shared/workflow/index.js';
import { createLogger } from '../../shared/logging/index.js';
import { validateOrThrow, taskSchema } from '../../shared/validation/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const logger = createLogger('orchestrator');

const DEFAULT_MAX_RETRIES = 10;

/**
 * @param {string} filePath
 */
export function loadYamlFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return parseYaml(content);
}

/**
 * @param {string} [root]
 */
export function loadAgentRegistry(root = REPO_ROOT) {
  const path = join(root, 'registry', 'agents.yaml');
  if (!existsSync(path)) {
    throw new Error(`Agent registry not found: ${path}`);
  }
  return loadYamlFile(path);
}

/**
 * @param {string} [root]
 */
export function loadMcpRegistry(root = REPO_ROOT) {
  const path = join(root, 'registry', 'mcp.yaml');
  if (!existsSync(path)) {
    throw new Error(`MCP registry not found: ${path}`);
  }
  return loadYamlFile(path);
}

/**
 * Discover skill directories under .agents/skills/
 * @param {string} [root]
 */
export function discoverSkills(root = REPO_ROOT) {
  const skillsDir = join(root, '.agents', 'skills');
  if (!existsSync(skillsDir)) return [];

  /** @type {{ id: string, path: string, category: string }[]} */
  const skills = [];

  const walk = (dir, category = '') => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        const skillFile = join(full, 'SKILL.md');
        if (existsSync(skillFile)) {
          const rel = relative(skillsDir, full).replace(/\\/g, '/');
          const id = rel.replace(/\//g, '-');
          skills.push({ id, path: skillFile, category: category || rel.split('/')[0] });
        } else {
          walk(full, category || entry);
        }
      }
    }
  };

  walk(skillsDir);
  return skills;
}

/**
 * Discover MCP server packages under mcp/
 * @param {string} [root]
 */
export function discoverMcpServers(root = REPO_ROOT) {
  const mcpDir = join(root, 'mcp');
  if (!existsSync(mcpDir)) return [];

  return readdirSync(mcpDir)
    .filter((name) => {
      const serverPath = join(mcpDir, name, 'server.js');
      return existsSync(serverPath);
    })
    .map((name) => ({
      id: `${name}-mcp`,
      package: `mcp/${name}`,
      serverEntry: `mcp/${name}/server.js`,
    }));
}

/**
 * Score agent match against task keywords.
 * @param {{ activate_when?: string[], keywords?: string[], id: string }} agent
 * @param {string[]} taskKeywords
 */
export function scoreAgentMatch(agent, taskKeywords) {
  const triggers = [
    ...(agent.activate_when ?? []),
    ...(agent.keywords ?? []),
  ].map((t) => t.toLowerCase());

  const normalized = taskKeywords.map((k) => k.toLowerCase());
  /** @type {string[]} */
  const matched = [];

  for (const keyword of normalized) {
    for (const trigger of triggers) {
      if (trigger.includes(keyword) || keyword.includes(trigger)) {
        matched.push(keyword);
        break;
      }
    }
  }

  const score = matched.length / Math.max(normalized.length, 1);
  return { agentId: agent.id, score, matchedKeywords: [...new Set(matched)] };
}

/**
 * Route a task to the best matching agent(s).
 * @param {{ description: string, keywords?: string[], domain?: string, parallel?: boolean }} task
 * @param {string} [root]
 */
export function routeTask(task, root = REPO_ROOT) {
  const validated = validateOrThrow(taskSchema, task);
  const registry = loadAgentRegistry(root);
  const agents = registry.agents ?? {};

  const keywords = [
    ...(validated.keywords ?? []),
    ...(validated.domain ? [validated.domain] : []),
    ...validated.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
  ];

  const platformAgents = Object.values(agents).filter(
    (a) => a.type === 'platform' || a.type === 'specialist' || a.type === 'review'
  );

  const scored = platformAgents
    .map((agent) => scoreAgentMatch(agent, keywords))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const fallback = agents.orchestrator ?? agents['platform-orchestrator'];
    return {
      task: validated,
      primary: fallback ? { agentId: fallback.id, score: 0, matchedKeywords: [] } : null,
      alternates: [],
      keywords,
    };
  }

  const [primary, ...alternates] = scored;
  return { task: validated, primary, alternates, keywords };
}

/**
 * Resolve MCP servers for task keywords.
 * @param {string[]} keywords
 * @param {string} [root]
 */
export function resolveMcpsForTask(keywords, root = REPO_ROOT) {
  const registry = loadMcpRegistry(root);
  const matrix = registry.activation_matrix?.by_keyword ?? {};
  const integrations = registry.integrations ?? {};

  /** @type {Set<string>} */
  const ids = new Set();

  for (const keyword of keywords) {
    const lower = keyword.toLowerCase();
    for (const [key, mcpIds] of Object.entries(matrix)) {
      if (lower.includes(key) || key.includes(lower)) {
        for (const id of mcpIds) ids.add(id);
      }
    }
  }

  return [...ids].map((id) => integrations[id]).filter(Boolean);
}

/**
 * Load agent config from agents/<name>/config.yaml
 * @param {string} agentId
 * @param {string} [root]
 */
export function loadAgentConfig(agentId, root = REPO_ROOT) {
  const agentDirs = {
    orchestrator: 'orchestrator',
    'platform-frontend': 'frontend',
    'platform-backend': 'backend',
    'platform-devops': 'devops',
    'platform-testing': 'testing',
    frontend: 'frontend',
    backend: 'backend',
    devops: 'devops',
    testing: 'testing',
  };

  const dirName = agentDirs[agentId] ?? agentId.replace(/^platform-/, '');
  const configPath = join(root, 'agents', dirName, 'config.yaml');
  if (!existsSync(configPath)) return null;
  return loadYamlFile(configPath);
}

/**
 * Dispatch task to agent handler(s).
 * @param {{ description: string, keywords?: string[], domain?: string, parallel?: boolean }} task
 * @param {{ handlers?: Record<string, Function>, root?: string, maxRetries?: number }} [options]
 */
export async function dispatchTask(task, options = {}) {
  const root = options.root ?? REPO_ROOT;
  const route = routeTask(task, root);
  const mcps = resolveMcpsForTask(route.keywords, root);
  const skills = discoverSkills(root);
  const mcpServers = discoverMcpServers(root);

  const agentId = route.primary?.agentId ?? 'orchestrator';
  const config = loadAgentConfig(agentId, root);
  const handler = options.handlers?.[agentId];

  const engine = new WorkflowEngine({ maxRetries: options.maxRetries ?? DEFAULT_MAX_RETRIES });

  engine.addStep({
    id: 'dispatch',
    name: `Dispatch to ${agentId}`,
    action: async () => {
      if (handler) {
        return handler({ task: route.task, config, mcps, skills, mcpServers });
      }
      return {
        agentId,
        status: 'routed',
        config: config ? { skills: config.skills, mcps: config.mcps } : null,
        matchedKeywords: route.primary?.matchedKeywords ?? [],
        mcpRecommendations: mcps.map((m) => m.id),
        skillCount: skills.length,
      };
    },
  });

  const result = await engine.run();
  return {
    route,
    mcps,
    skillsDiscovered: skills.length,
    mcpServersDiscovered: mcpServers.length,
    execution: result,
  };
}

/**
 * Coordinate parallel agent dispatches.
 * @param {Array<{ description: string, keywords?: string[] }>} tasks
 * @param {{ handlers?: Record<string, Function>, root?: string }} [options]
 */
export async function dispatchParallel(tasks, options = {}) {
  const results = await Promise.all(tasks.map((task) => dispatchTask(task, options)));
  return {
    success: results.every((r) => r.execution.success),
    results,
  };
}

/**
 * CLI entry — route a task from argv.
 */
async function main() {
  const description = process.argv.slice(2).join(' ') || 'General platform task';
  const result = await dispatchTask({ description });
  console.log(JSON.stringify(result, null, 2));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    logger.error('Orchestrator failed', { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  });
}

export const Orchestrator = {
  routeTask,
  dispatchTask,
  dispatchParallel,
  discoverSkills,
  discoverMcpServers,
};
