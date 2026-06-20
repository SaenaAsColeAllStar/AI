import { validateEnv, runGit } from '../lib/git-runner.js';
import { gitPushSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'git_push';

export const definition = {
  name,
  description: 'Push commits to remote (force push blocked).',
  inputSchema: {
    type: 'object',
    properties: {
      remote: { type: 'string', description: 'Remote name (default: origin)' },
      branch: { type: 'string', description: 'Branch name (default: current)' },
      set_upstream: { type: 'boolean', description: 'Set upstream tracking' },
    },
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = gitPushSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const remote = parsed.data.remote ?? 'origin';
    const branch = parsed.data.branch;
    const cmd = ['push'];
    if (parsed.data.set_upstream) cmd.push('-u');
    cmd.push(remote);
    if (branch) cmd.push(branch);
    const output = runGit(cmd);
    return toolSuccess({ output });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git push failed');
  }
}

export default { name, definition, handler };
