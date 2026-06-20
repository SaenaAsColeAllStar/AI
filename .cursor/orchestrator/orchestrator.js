#!/usr/bin/env node
/**
 * Teknovo Multi-Agent Orchestrator
 * Routes tasks to specialized agents, discovers skills/MCPs, coordinates parallel work.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { WorkflowEngine, runStep } from '../shared/workflow/index.js';
import { createLogger } from '../shared/logging/index.js';
import { validateOrThrow, taskSchema } from '../shared/validation/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const logger = createLogger('orchestrator');

const DEFAULT_MAX_RETRIES = 10;

/** @type {Record<string, string>} */
export const AGENT_DIRS = {
  orchestrator: 'orchestrator',
  'platform-orchestrator': 'orchestrator',
  'platform-frontend': 'frontend',
  'platform-backend': 'backend',
  'platform-devops': 'devops',
  'platform-testing': 'testing',
  'platform-cloudflare': 'cloudflare',
  'platform-github': 'github',
  'chief-architect': 'orchestrator',
  frontend: 'frontend',
  backend: 'backend',
  devops: 'devops',
  testing: 'testing',
  cloudflare: 'cloudflare',
  github: 'github',
};

/** Domain keyword buckets for task decomposition */
const DOMAIN_KEYWORDS = {
  frontend: ['next.js', 'react', 'ui', 'tailwind', 'frontend', 'landing', 'seo', 'a11y', 'component'],
  backend: ['api', 'backend', 'database', 'rbac', 'migration', 'auth', 'nestjs', 'drizzle', 'rest'],
  testing: ['test', 'e2e', 'jest', 'vitest', 'playwright', 'coverage', 'lighthouse', 'qa'],
  cloudflare: ['cloudflare', 'pages', 'dns', 'workers', 'ssl', 'domain', 'tunnel'],
  github: ['github', 'pr', 'pull request', 'branch', 'release', 'issue', 'merge'],
  devops: ['deploy', 'docker', 'ci', 'cd', 'rollback', 'pipeline', 'release'],
};

/**
 * @param {string} agentId
 */
export function resolveAgentDir(agentId) {
  return AGENT_DIRS[agentId] ?? agentId.replace(/^platform-/, '');
}

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
  if (!mcpDir || !existsSync(mcpDir)) return [];

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
    (a) => a.type === 'platform' || a.type === 'meta' || a.type === 'specialist' || a.type === 'review'
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
 * Decompose a compound task into domain-scoped subtasks.
 * @param {{ description: string, keywords?: string[], domain?: string }} task
 * @param {string} [root]
 */
export function decomposeTask(task, root = REPO_ROOT) {
  const validated = validateOrThrow(taskSchema, task);
  const route = routeTask(validated, root);
  const keywords = route.keywords.map((k) => k.toLowerCase());

  /** @type {{ domain: string, agentId: string, keywords: string[], description: string }[]} */
  const subtasks = [];

  for (const [domain, domainKeys] of Object.entries(DOMAIN_KEYWORDS)) {
    const matched = domainKeys.filter((dk) =>
      keywords.some((k) => k.includes(dk) || dk.includes(k))
    );
    if (matched.length > 0) {
      const agentId = `platform-${domain === 'devops' ? 'devops' : domain}`;
      subtasks.push({
        domain,
        agentId,
        keywords: matched,
        description: `${validated.description} [${domain}]`,
      });
    }
  }

  if (subtasks.length === 0) {
    const primaryId = route.primary?.agentId ?? 'orchestrator';
    subtasks.push({
      domain: 'general',
      agentId: primaryId,
      keywords: route.keywords,
      description: validated.description,
    });
  }

  return { task: validated, subtasks, route };
}

/**
 * Select agents for subtasks with dependency hints.
 * @param {ReturnType<typeof decomposeTask>} decomposition
 * @param {string} [root]
 */
export function selectAgents(decomposition, root = REPO_ROOT) {
  const registry = loadAgentRegistry(root);
  const agents = registry.agents ?? {};

  return decomposition.subtasks.map((sub) => {
    const agent = agents[sub.agentId] ?? agents[sub.agentId.replace(/^platform-/, 'platform-')];
    const config = loadAgentConfig(sub.agentId, root);
    const contract = loadAgentContract(sub.agentId, root);
    return {
      ...sub,
      agent: agent ?? null,
      config,
      contract,
      mcps: resolveMcpsForTask(sub.keywords, root),
    };
  });
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
  const dirName = resolveAgentDir(agentId);
  const configPath = join(root, 'agents', dirName, 'config.yaml');
  if (!existsSync(configPath)) return null;
  return loadYamlFile(configPath);
}

/**
 * Load agent contract from agents/<name>/agent.yaml (falls back to config.yaml).
 * @param {string} agentId
 * @param {string} [root]
 */
export function loadAgentContract(agentId, root = REPO_ROOT) {
  const dirName = resolveAgentDir(agentId);
  const contractPath = join(root, 'agents', dirName, 'agent.yaml');
  if (existsSync(contractPath)) return loadYamlFile(contractPath);
  return loadAgentConfig(agentId, root);
}

/**
 * Execute a single agent with retry and failure isolation.
 * @param {string} agentId
 * @param {{ description: string, keywords?: string[] }} task
 * @param {{ handlers?: Record<string, Function>, root?: string, maxRetries?: number, onFailure?: Function }} [options]
 */
export async function executeAgent(agentId, task, options = {}) {
  const root = options.root ?? REPO_ROOT;
  const config = loadAgentConfig(agentId, root);
  const handler = options.handlers?.[agentId];
  const mcps = resolveMcpsForTask(task.keywords ?? [], root);
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const step = {
    id: agentId,
    name: `Execute ${agentId}`,
    action: async () => {
      if (handler) {
        return handler({ task, config, mcps, agentId });
      }
      return {
        agentId,
        status: 'routed',
        config: config ? { skills: config.skills, mcps: config.mcps } : null,
        mcpRecommendations: mcps.map((m) => m.id),
      };
    },
  };

  const result = await runStep(step, { maxRetries });

  if (!result.success) {
    const failureResult = await onAgentFailure(
      { agentId, task, error: result.error ?? 'Unknown error', attempts: result.attempts },
      options
    );
    return { agentId, ...failureResult, attempts: result.attempts };
  }

  return { agentId, success: true, isolated: false, result: result.result, attempts: result.attempts };
}

/**
 * Handle agent failure: isolate, retry up to maxRetries, allow unaffected agents to continue.
 * @param {{ agentId: string, task: object, error: string, attempts: number }} ctx
 * @param {{ maxRetries?: number, onFailure?: Function, handlers?: Record<string, Function>, root?: string }} [options]
 */
export async function onAgentFailure(ctx, options = {}) {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  options.onFailure?.(ctx);

  logger.warn('Agent failure isolated', {
    agentId: ctx.agentId,
    error: ctx.error,
    attempts: ctx.attempts,
  });

  if (ctx.attempts < maxRetries) {
    const retry = await executeAgent(ctx.agentId, ctx.task, {
      ...options,
      maxRetries: maxRetries - ctx.attempts,
    });
    if (retry.success) {
      return { success: true, isolated: false, recovered: true, result: retry.result, error: null };
    }
  }

  return {
    success: false,
    isolated: true,
    recovered: false,
    result: null,
    error: ctx.error,
    partial: { agentId: ctx.agentId, status: 'failed', message: ctx.error },
  };
}

/**
 * Aggregate partial results from parallel/sequential runs.
 * @param {Array<{ agentId: string, success?: boolean, result?: unknown, error?: string, isolated?: boolean }>} results
 */
export function aggregateResults(results) {
  const succeeded = results.filter((r) => r.success !== false);
  const failed = results.filter((r) => r.success === false || r.isolated);
  return {
    success: failed.length === 0,
    total: results.length,
    succeeded: succeeded.length,
    failed: failed.length,
    results,
    partialResults: succeeded.map((r) => r.result ?? r.partial),
    failures: failed.map((r) => ({ agentId: r.agentId, error: r.error ?? 'failed' })),
  };
}

/**
 * Run agents in parallel with failure isolation.
 * @param {Array<{ agentId: string, task: { description: string, keywords?: string[] }, id?: string }>} specs
 * @param {{ handlers?: Record<string, Function>, root?: string, maxRetries?: number }} [options]
 */
export async function runParallel(specs, options = {}) {
  const settled = await Promise.allSettled(
    specs.map((spec) => executeAgent(spec.agentId, spec.task, options))
  );

  /** @type {Array<{ agentId: string, success?: boolean, result?: unknown, error?: string, isolated?: boolean }>} */
  const results = settled.map((outcome, i) => {
    const spec = specs[i];
    if (outcome.status === 'fulfilled') return outcome.value;
    return {
      agentId: spec.agentId,
      success: false,
      isolated: true,
      error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
    };
  });

  return aggregateResults(results);
}

/**
 * Run agents sequentially respecting dependencies.
 * @param {Array<{ agentId: string, task: { description: string, keywords?: string[] }, id: string, dependsOn?: string[] }>} phases
 * @param {{ handlers?: Record<string, Function>, root?: string, maxRetries?: number, continueOnFailure?: boolean }} [options]
 */
export async function runSequential(phases, options = {}) {
  /** @type {Map<string, { success: boolean }>} */
  const completed = new Map();
  /** @type {Array<{ agentId: string, success?: boolean, result?: unknown, error?: string, isolated?: boolean }>} */
  const results = [];

  for (const phase of phases) {
    const deps = phase.dependsOn ?? [];
    const unmet = deps.filter((d) => !completed.get(d)?.success);
    if (unmet.length > 0) {
      results.push({
        agentId: phase.agentId,
        success: false,
        isolated: true,
        error: `Unmet dependencies: ${unmet.join(', ')}`,
      });
      if (!options.continueOnFailure) break;
      continue;
    }

    const result = await executeAgent(phase.agentId, phase.task, options);
    results.push(result);
    completed.set(phase.id, { success: result.success !== false });

    if (result.success === false && !options.continueOnFailure) break;
  }

  return aggregateResults(results);
}

/**
 * Run conditional workflow branch.
 * @param {{ condition: (ctx: object) => boolean | Promise<boolean>, then: Array<{ agentId: string, task: object, id: string, dependsOn?: string[] }>, else?: Array<{ agentId: string, task: object, id: string, dependsOn?: string[] }> }} spec
 * @param {{ handlers?: Record<string, Function>, root?: string, maxRetries?: number, context?: object }} [options]
 */
export async function runConditional(spec, options = {}) {
  const ctx = options.context ?? {};
  const branch = (await spec.condition(ctx)) ? spec.then : (spec.else ?? []);
  return runSequential(branch, options);
}

/**
 * Execute a declarative workflow (parallel, sequential, or conditional).
 * @param {{ type: 'parallel' | 'sequential' | 'conditional', steps?: object[], condition?: Function, then?: object[], else?: object[] }} workflow
 * @param {{ handlers?: Record<string, Function>, root?: string, maxRetries?: number, context?: object }} [options]
 */
export async function executeWorkflow(workflow, options = {}) {
  switch (workflow.type) {
    case 'parallel':
      return runParallel(workflow.steps ?? [], options);
    case 'sequential':
      return runSequential(workflow.steps ?? [], options);
    case 'conditional':
      return runConditional(
        {
          condition: workflow.condition ?? (() => true),
          then: workflow.then ?? [],
          else: workflow.else,
        },
        options
      );
    default:
      throw new Error(`Unknown workflow type: ${workflow.type}`);
  }
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
  decomposeTask,
  selectAgents,
  runParallel,
  runSequential,
  runConditional,
  executeWorkflow,
  onAgentFailure,
  aggregateResults,
  executeAgent,
  discoverSkills,
  discoverMcpServers,
  loadAgentContract,
};
