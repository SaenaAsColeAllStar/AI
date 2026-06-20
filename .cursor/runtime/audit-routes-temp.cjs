const fs = require("fs");
const path = require("path");
const { parse: parseYaml } = require(path.join("c:/Users/fajar/Downloads/AI/.cursor/orchestrator/node_modules/yaml"));

const ROOT = path.resolve("c:/Users/fajar/Downloads/AI");
const CURSOR = path.join(ROOT, ".cursor");

const LEGACY_PATTERNS = [
  { re: /\.agents\/skills/, label: ".agents/skills" },
  { re: /\.agents\//, label: ".agents/" },
  { re: /ai-agent\//, label: "ai-agent/" },
  { re: /agents\/orchestrator/, label: "agents/orchestrator" },
  { re: /docs\/design-system/, label: "docs/design-system" },
  { re: /\.cursor\/\.cursor\//, label: ".cursor/.cursor/" },
  { re: /teknovo-\.cursor/, label: "teknovo-.cursor" },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function collectPathLike(obj, out = []) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    if (/\.(md|yaml|yml|js|json|mdc|sh|py)$/.test(obj) || obj.startsWith(".cursor/") || obj === "AGENTS.md") {
      out.push(obj);
    }
    return out;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) collectPathLike(v, out);
    return out;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k === "path" || k.endsWith("_path") || k.endsWith("Path") || /registry|entry|server_entry|package|config_template|canonical|legacy|skill_registry|agent_registry|mcp_server/.test(k)) {
        if (typeof v === "string") out.push(v);
      }
      collectPathLike(v, out);
    }
  }
  return out;
}

function resolveRef(ref) {
  ref = ref.replace(/\\/g, "/").trim();
  if (!ref || ref.includes("://") || ref.startsWith("$")) return { ref, status: "skip" };
  const candidates = [path.join(ROOT, ref)];
  if (ref.startsWith(".cursor/")) candidates.push(path.join(ROOT, ref));
  for (const c of [...new Set(candidates)]) {
    if (fs.existsSync(c)) return { ref, status: "ok", resolved: c };
  }
  return { ref, status: "missing" };
}

const yamlTargets = [
  ".cursor/registry/skill-registry.yaml",
  ".cursor/registry/agent-registry.yaml",
  ".cursor/registry/mcp-registry.yaml",
  ".cursor/gates/assurance/assurance-registry.yaml",
  ".cursor/gates/execution/execution-registry.yaml",
  ".cursor/gates/quality/quality-registry.yaml",
  ".cursor/gates/security/security-registry.yaml",
  ".cursor/gates/taste/taste-registry.yaml",
  ".cursor/docs/memory/memory-registry.yaml",
  ".cursor/skills/teknovo-auto-orchestrator/intent-routing.yaml",
  ".cursor/skills/teknovo-auto-orchestrator/chain-map.yaml",
  ".cursor/skills/teknovo-auto-orchestrator/execution-policy.yaml",
  ".cursor/registry/mcp.yaml",
  ".cursor/registry/agents.yaml",
  ".cursor/registry/skills.yaml",
  ".cursor/registry/legacy-registry.yaml",
];

const report = { legacyHits: [], yamlErrors: [], missingPaths: [], okPathChecks: 0, yamlParseOk: 0, yamlParseFail: 0 };

const allFiles = walk(CURSOR);
for (const file of allFiles) {
  if (!/\.(md|yaml|yml|js|json|mdc|sh|py)$/.test(file)) continue;
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  for (const { re, label } of LEGACY_PATTERNS) {
    if (re.test(text)) {
      if (!report.legacyHits.some((h) => h.file === rel && h.label === label)) {
        report.legacyHits.push({ file: rel, label });
      }
    }
  }
}

for (const rel of yamlTargets) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) {
    report.yamlErrors.push({ file: rel, error: "registry file missing" });
    continue;
  }
  let doc;
  try {
    doc = parseYaml(fs.readFileSync(fp, "utf8"));
    report.yamlParseOk++;
  } catch (e) {
    report.yamlParseFail++;
    report.yamlErrors.push({ file: rel, error: String(e.message || e) });
    continue;
  }
  const refs = [...new Set(collectPathLike(doc))];
  for (const ref of refs) {
    const r = resolveRef(ref);
    if (r.status === "skip") continue;
    if (r.status === "ok") report.okPathChecks++;
    else report.missingPaths.push({ registry: rel, ref });
  }
}

// All yaml under .cursor parse check
const yamlFail = [];
for (const file of allFiles) {
  if (!/\.ya?ml$/i.test(file)) continue;
  try {
    parseYaml(fs.readFileSync(file, "utf8"));
  } catch (e) {
    yamlFail.push({ file: path.relative(ROOT, file).replace(/\\/g, "/"), error: String(e.message || e) });
  }
}
report.allYamlFail = yamlFail;

console.log(JSON.stringify(report, null, 2));
