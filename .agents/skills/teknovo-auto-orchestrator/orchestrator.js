#!/usr/bin/env node
/**
 * Teknovo Auto-Orchestrator — Intent analyzer and dispatch planner
 * Reads routing.yaml and intent-map.yaml to route user requests to skills, agents, and workstreams.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = __dirname;
const REPO_ROOT = join(__dirname, '..', '..', '..');

/** @type {object | null} */
let cachedRouting = null;
/** @type {object | null} */
let cachedIntentMap = null;

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
export function loadRoutingConfig(root = SKILL_ROOT) {
  if (cachedRouting && root === SKILL_ROOT) return cachedRouting;
  const path = join(root, 'routing.yaml');
  if (!existsSync(path)) {
    throw new Error(`Routing config not found: ${path}`);
  }
  const config = loadYamlFile(path);
  if (root === SKILL_ROOT) cachedRouting = config;
  return config;
}

/**
 * @param {string} [root]
 */
export function loadIntentMap(root = SKILL_ROOT) {
  if (cachedIntentMap && root === SKILL_ROOT) return cachedIntentMap;
  const path = join(root, 'intent-map.yaml');
  if (!existsSync(path)) {
    throw new Error(`Intent map not found: ${path}`);
  }
  const config = loadYamlFile(path);
  if (root === SKILL_ROOT) cachedIntentMap = config;
  return config;
}

/**
 * Normalize message for keyword matching.
 * @param {string} message
 */
export function normalizeMessage(message) {
  return message.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if normalized message contains a keyword phrase.
 * @param {string} normalized
 * @param {string} keyword
 */
export function matchesKeyword(normalized, keyword) {
  const kw = keyword.toLowerCase().trim();
  if (!kw) return false;
  if (normalized.includes(kw)) return true;
  const tokens = kw.split(/\s+/);
  if (tokens.length === 1) {
    return normalized.split(/\s+/).some((w) => w === kw || w.includes(kw) || kw.includes(w));
  }
  return normalized.includes(kw);
}

/**
 * Score route/intent match against message.
 * @param {string[]} keywords
 * @param {string} normalized
 */
export function scoreKeywordMatch(keywords, normalized) {
  /** @type {string[]} */
  const matched = [];
  for (const keyword of keywords ?? []) {
    if (matchesKeyword(normalized, keyword)) {
      matched.push(keyword);
    }
  }
  return { score: matched.length, matchedKeywords: matched };
}

/**
 * Detect deploy intent from message.
 * @param {string} message
 * @param {object} routing
 * @param {object} intentMap
 */
export function detectDeploy(message, routing, intentMap) {
  const normalized = normalizeMessage(message);
  const deployKeywords = [
    ...(routing.deploy_keywords ?? []),
    ...(intentMap.deploy_detection?.keywords ?? []),
  ];
  const matched = deployKeywords.filter((kw) => matchesKeyword(normalized, kw));
  return {
    deploy: matched.length > 0,
    matchedKeywords: matched,
    skills: intentMap.deploy_detection?.skills ?? [],
    agents: intentMap.deploy_detection?.agents ?? [],
    mcps: intentMap.deploy_detection?.mcps ?? [],
  };
}

/**
 * Match intents from intent-map.yaml against user message.
 * @param {string} message
 * @param {object} intentMap
 */
export function matchIntents(message, intentMap) {
  const normalized = normalizeMessage(message);
  const intents = intentMap.intents ?? {};
  /** @type {Array<{ id: string, score: number, matchedKeywords: string[], config: object }>} */
  const matches = [];

  for (const [id, config] of Object.entries(intents)) {
    if (id === 'generic_build') continue;
    const { score, matchedKeywords } = scoreKeywordMatch(config.keywords, normalized);
    if (score > 0) {
      matches.push({ id, score, matchedKeywords, config });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    const generic = intents.generic_build;
    if (generic) {
      const buildTriggers = ['build', 'implement', 'create', 'develop', 'make', 'setup'];
      const hasBuild = buildTriggers.some((kw) => matchesKeyword(normalized, kw));
      if (hasBuild) {
        matches.push({
          id: 'generic_build',
          score: 1,
          matchedKeywords: buildTriggers.filter((kw) => matchesKeyword(normalized, kw)),
          config: generic,
        });
      }
    }
  }

  return matches;
}

/**
 * Determine if parallel execution should be used.
 * @param {Array<{ id: string, config: object }>} intents
 * @param {object} routing
 * @param {boolean} deployDetected
 */
export function shouldUseParallel(intents, routing, deployDetected = false) {
  const parallelRules = routing.parallel_dispatch ?? {};
  const minDomains = parallelRules.min_domains_for_auto_parallel ?? 3;

  if (intents.length >= minDomains) return true;

  const intentIds = new Set(intents.map((i) => i.id));
  const hasFrontendBackend =
    (intentIds.has('landing_page') && (intentIds.has('finance') || intentIds.has('ppdb') || intentIds.has('sarpras'))) ||
    intents.some((i) => i.config?.execution_mode === 'parallel');

  if (hasFrontendBackend && intents.length >= 2) return true;

  if (intents.length === 1 && intents[0].config?.execution_mode === 'parallel') return true;

  const combinations = routing.multi_domain_combinations ?? [];
  for (const combo of combinations) {
    const comboDomains = combo.domains ?? [];
    if (comboDomains.every((d) => intentIds.has(d)) && combo.execution_mode === 'parallel') {
      return true;
    }
  }

  const routeParallel = intents.some((i) => {
    const route = routing.routes?.[i.id];
    return route?.parallel === true;
  });

  if (routeParallel) return true;

  if (deployDetected && intents.length >= 1) {
    const separable = parallelRules.auto_parallel_when?.some(
      (rule) => rule.condition === 'testing_independent' || rule.condition === 'frontend_backend_separable'
    );
    if (separable && intents[0]?.config?.execution_mode === 'parallel') return true;
  }

  return false;
}

/**
 * Merge unique values preserving order.
 * @param {...string[]} arrays
 */
export function uniqueMerge(...arrays) {
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {string[]} */
  const result = [];
  for (const arr of arrays) {
    for (const item of arr ?? []) {
      if (!seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
  }
  return result;
}

/**
 * Analyze user message and return intent, skills, agents, parallel groups, deploy flag.
 * @param {string} userMessage
 * @param {string} [root]
 */
export function analyzeIntent(userMessage, root = SKILL_ROOT) {
  const routing = loadRoutingConfig(root);
  const intentMap = loadIntentMap(root);
  const matchedIntents = matchIntents(userMessage, intentMap);
  const deployInfo = detectDeploy(userMessage, routing, intentMap);

  const primaryIntent = matchedIntents[0]?.id ?? 'generic_build';
  const primaryConfig = matchedIntents[0]?.config ?? intentMap.intents?.generic_build ?? {};

  /** @type {string[]} */
  let skills = [];
  /** @type {string[]} */
  let agents = [];
  /** @type {string[]} */
  let mcps = [];

  for (const match of matchedIntents) {
    skills = uniqueMerge(skills, match.config.skills ?? []);
    agents = uniqueMerge(agents, match.config.agents ?? []);
    mcps = uniqueMerge(mcps, match.config.mcps ?? []);
  }

  skills = uniqueMerge(skills, intentMap.always_include?.skills ?? []);
  agents = uniqueMerge(agents, intentMap.always_include?.agents ?? []);

  if (deployInfo.deploy) {
    skills = uniqueMerge(skills, deployInfo.skills);
    agents = uniqueMerge(agents, deployInfo.agents);
    mcps = uniqueMerge(mcps, deployInfo.mcps);
  }

  const parallel = shouldUseParallel(matchedIntents, routing, deployInfo.deploy);
  const executionMode = parallel ? 'parallel' : (primaryConfig.execution_mode ?? 'sequential');

  /** @type {object[][]} */
  const parallelGroups = [];
  if (parallel && primaryConfig.parallel_groups) {
    parallelGroups.push(primaryConfig.parallel_groups);
  } else if (matchedIntents.length >= 2) {
    parallelGroups.push(
      matchedIntents.map((m) => ({
        id: m.id,
        label: m.config.description ?? m.id,
        skills: m.config.skills ?? [],
        agents: m.config.agents ?? [],
      }))
    );
  }

  return {
    intent: primaryIntent,
    intents: matchedIntents.map((m) => ({
      id: m.id,
      score: m.score,
      matchedKeywords: m.matchedKeywords,
    })),
    skills,
    agents,
    mcps,
    parallelGroups,
    parallel,
    executionMode,
    deploy: deployInfo.deploy,
    deployKeywords: deployInfo.matchedKeywords,
    matchedKeywords: matchedIntents.flatMap((m) => m.matchedKeywords),
    autonomous: (routing.autonomous_triggers ?? []).some((t) =>
      matchesKeyword(normalizeMessage(userMessage), t)
    ),
    policy: routing.execution_policy ?? {},
  };
}

/**
 * Resolve skill IDs to filesystem paths.
 * @param {string[]} skillIds
 * @param {string} [root]
 */
export function selectSkills(skillIds, root = SKILL_ROOT) {
  const intentMap = loadIntentMap(root);
  const skillPaths = intentMap.skill_paths ?? {};

  return skillIds.map((id) => ({
    id,
    path: skillPaths[id] ?? `.agents/skills/${id.replace(/^teknovo-/, 'teknovo-')}/SKILL.md`,
  }));
}

/**
 * Build workstreams for subagent dispatch from analyzed intent.
 * @param {ReturnType<typeof analyzeIntent>} analysis
 * @param {string} [root]
 */
export function dispatchPlan(analysis, root = SKILL_ROOT) {
  const routing = loadRoutingConfig(root);
  const intentMap = loadIntentMap(root);
  const primaryConfig = intentMap.intents?.[analysis.intent] ?? {};

  /** @type {Array<{ id: string, label: string, skills: string[], skillPaths: object[], agents: string[], parallelGroup: number, dependsOn: string[] }>} */
  const workstreams = [];

  const groups = primaryConfig.parallel_groups ?? [];
  if (groups.length > 0) {
    groups.forEach((group, index) => {
      workstreams.push({
        id: group.id,
        label: group.label ?? group.id,
        skills: group.skills ?? [],
        skillPaths: selectSkills(group.skills ?? [], root),
        agents: group.agents ?? [],
        parallelGroup: analysis.parallel ? index : 0,
        dependsOn: index === 0 ? [] : [groups[index - 1]?.id].filter(Boolean),
      });
    });
  } else {
    workstreams.push({
      id: analysis.intent,
      label: primaryConfig.description ?? analysis.intent,
      skills: analysis.skills,
      skillPaths: selectSkills(analysis.skills, root),
      agents: analysis.agents,
      parallelGroup: 0,
      dependsOn: [],
    });
  }

  if (analysis.intents.length >= 2 && analysis.parallel) {
    for (const intentMatch of analysis.intents.slice(1)) {
      const config = intentMap.intents?.[intentMatch.id];
      if (!config) continue;
      workstreams.push({
        id: intentMatch.id,
        label: config.description ?? intentMatch.id,
        skills: config.skills ?? [],
        skillPaths: selectSkills(config.skills ?? [], root),
        agents: config.agents ?? [],
        parallelGroup: 1,
        dependsOn: ['architecture'],
      });
    }
  }

  if (analysis.deploy) {
    workstreams.push({
      id: 'deployment',
      label: 'Deployment & Cloudflare',
      skills: uniqueMerge(
        intentMap.deploy_detection?.skills ?? [],
        routing.routes?.deployment?.skills ?? []
      ),
      skillPaths: selectSkills(
        uniqueMerge(
          intentMap.deploy_detection?.skills ?? [],
          routing.routes?.deployment?.skills ?? []
        ),
        root
      ),
      agents: uniqueMerge(
        intentMap.deploy_detection?.agents ?? [],
        routing.routes?.deployment?.agents ?? []
      ),
      parallelGroup: analysis.parallel ? workstreams.length : workstreams.length,
      dependsOn: workstreams.filter((w) => w.id !== 'deployment').map((w) => w.id),
    });
  }

  const groupedParallel = analysis.parallel
    ? groupWorkstreamsForParallel(workstreams, routing)
    : [workstreams];

  return {
    executionMode: analysis.executionMode,
    parallel: analysis.parallel,
    workstreams,
    parallelGroups: groupedParallel,
    maxParallelSiblings: routing.parallel_dispatch?.max_parallel_siblings ?? 3,
    policy: routing.execution_policy ?? {},
    verificationSkills: routing.execution_policy?.verification_skills ?? [],
    deploymentSkill: routing.execution_policy?.deployment_skill ?? null,
  };
}

/**
 * Group workstreams into parallel execution batches.
 * @param {Array<{ id: string, parallelGroup: number, dependsOn: string[] }>} workstreams
 * @param {object} routing
 */
export function groupWorkstreamsForParallel(workstreams, routing) {
  const maxSiblings = routing.parallel_dispatch?.max_parallel_siblings ?? 3;
  /** @type {Map<number, object[]>} */
  const byGroup = new Map();

  for (const ws of workstreams) {
    const group = ws.parallelGroup ?? 0;
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(ws);
  }

  const sortedGroups = [...byGroup.entries()].sort((a, b) => a[0] - b[0]);
  return sortedGroups.map(([, items]) => items.slice(0, maxSiblings));
}

/**
 * Full pipeline: analyze message and produce dispatch plan.
 * @param {string} userMessage
 * @param {string} [root]
 */
export function orchestrate(userMessage, root = SKILL_ROOT) {
  const analysis = analyzeIntent(userMessage, root);
  const plan = dispatchPlan(analysis, root);
  return { analysis, plan };
}

/**
 * CLI entry — analyze intent from argv.
 */
function main() {
  const message = process.argv.slice(2).join(' ') || 'Build landing page for SMK Teknovo';
  const result = orchestrate(message);
  console.log(JSON.stringify(result, null, 2));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main();
}

export default {
  analyzeIntent,
  selectSkills,
  dispatchPlan,
  orchestrate,
  matchIntents,
  detectDeploy,
  shouldUseParallel,
  loadRoutingConfig,
  loadIntentMap,
};
