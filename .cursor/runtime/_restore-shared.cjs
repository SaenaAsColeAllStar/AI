const fs = require("fs");
const { execSync } = require("child_process");
function fromGit(path) {
  return execSync("git show HEAD:" + path, { encoding: "utf8" });
}
const files = [
  ["shared/workflow/index.js", ".cursor/shared/workflow/index.js"],
  ["shared/logging/index.js", ".cursor/shared/logging/index.js"],
  ["shared/validation/index.js", ".cursor/shared/validation/index.js"],
  ["mcp/shared/secrets.js", ".cursor/mcp/shared/secrets.js"],
  ["mcp/shared/logger.js", ".cursor/mcp/shared/logger.js"],
  ["mcp/shared/validation.js", ".cursor/mcp/shared/validation.js"],
  ["mcp/shared/package.json", ".cursor/mcp/shared/package.json"],
];
for (const [src, dest] of files) {
  fs.mkdirSync(require("path").dirname(dest), { recursive: true });
  fs.writeFileSync(dest, fromGit(src));
}
let orch = fromGit("agents/orchestrator/orchestrator.js");
orch = orch.replace(/from '\.\.\/\.\.\/shared\//g, "from '../shared/");
orch = orch.replace("join(__dirname, '..', '..')", "join(__dirname, '..')");
fs.writeFileSync(".cursor/orchestrator/orchestrator.js", orch);
console.log("restored");
