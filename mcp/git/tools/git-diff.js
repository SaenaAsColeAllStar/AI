import { validateEnv, runGit } from '../lib/git-runner.js';
import { gitDiffSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'git_diff';

export const definition = {
  name,
  description: 'Show git diff (working tree or staged).',
  inputSchema: {
    type: 'object',
    properties: {
      staged: { type: 'boolean', description: 'Show staged diff only' },
      path: { type: 'string', description: 'Limit diff to path' },
    },
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = gitDiffSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const cmd = ['diff'];
    if (parsed.data.staged) cmd.push('--cached');
    if (parsed.data.path) cmd.push('--', parsed.data.path);
    const output = runGit(cmd);
    return toolSuccess({ output });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git diff failed');
  }
}

export default { name, definition, handler };
