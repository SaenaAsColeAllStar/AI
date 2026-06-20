import { validateEnv, runGit } from '../lib/git-runner.js';
import { gitLogSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'git_log';

export const definition = {
  name,
  description: 'Show git commit log.',
  inputSchema: {
    type: 'object',
    properties: {
      max_count: { type: 'number', description: 'Max commits (default 20)' },
      oneline: { type: 'boolean', description: 'One line per commit' },
    },
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = gitLogSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const cmd = ['log', `-n`, String(parsed.data.max_count ?? 20)];
    if (parsed.data.oneline ?? true) cmd.push('--oneline');
    const output = runGit(cmd);
    return toolSuccess({ output, commits: output ? output.split('\n').filter(Boolean) : [] });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git log failed');
  }
}

export default { name, definition, handler };
