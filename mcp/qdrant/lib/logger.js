/**
 * Structured logger for Qdrant MCP.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
/** @type {keyof LEVELS} */
let minLevel = 'info';

export function configureLogger(config = {}) {
  if (config.level && config.level in LEVELS) {
    minLevel = /** @type {keyof LEVELS} */ (config.level);
  }
}

function log(level, message, meta = {}) {
  if (LEVELS[level] < LEVELS[minLevel]) return;
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }));
}

export const logger = {
  debug: (msg, meta = {}) => log('debug', msg, meta),
  info: (msg, meta = {}) => log('info', msg, meta),
  warn: (msg, meta = {}) => log('warn', msg, meta),
  error: (msg, meta = {}) => log('error', msg, meta),
};
