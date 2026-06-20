import { validateEnv } from '../lib/git-runner.js';
import { toolError, toolSuccess } from '../lib/validation.js';
import { runGit } from '../lib/git-runner.js';

export const name = 'git_status';

export const definition = {
  name,
  description: 'Get git status for the repository.',
  inputSchema: { type: 'object', properties: {} },
};

export async function handler() {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);
  try {
    const output = runGit(['status', '--short', '--branch']);
    return toolSuccess({ output });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git status failed');
  }
}

export default { name, definition, handler };
