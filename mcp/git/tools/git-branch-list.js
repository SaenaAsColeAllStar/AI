import { validateEnv, runGit } from '../lib/git-runner.js';
import { toolError, toolSuccess } from '../lib/validation.js';

export const name = 'git_branch_list';

export const definition = {
  name,
  description: 'List local and remote git branches.',
  inputSchema: { type: 'object', properties: {} },
};

export async function handler() {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);
  try {
    const local = runGit(['branch', '--list']);
    const remote = runGit(['branch', '-r', '--list']);
    return toolSuccess({
      local: local ? local.split('\n').map((b) => b.trim()).filter(Boolean) : [],
      remote: remote ? remote.split('\n').map((b) => b.trim()).filter(Boolean) : [],
    });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git branch list failed');
  }
}

export default { name, definition, handler };
