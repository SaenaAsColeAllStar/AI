/**
 * Structured logger with secret masking for Cloudflare MCP.
 */

const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9_-]+/gi,
  /CLOUDFLARE_API_TOKEN[=:]\s*["']?([^\s"']+)/gi,
  /[A-Za-z0-9_-]{32,}/g,
];

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

/** @type {keyof LEVELS} */
let minLevel = 'info';

/** @type {boolean} */
let maskSecrets = true;

/**
 * @param {{ level?: string, maskSecrets?: boolean }} config
 */
export function configureLogger(config = {}) {
  if (config.level && config.level in LEVELS) {
    minLevel = /** @type {keyof LEVELS} */ (config.level);
  }
  if (typeof config.maskSecrets === 'boolean') {
    maskSecrets = config.maskSecrets;
  }
}

/**
 * Mask sensitive values in strings.
 * @param {unknown} value
 * @returns {unknown}
 */
export function maskValue(value) {
  if (!maskSecrets) return value;
  if (typeof value !== 'string') return value;

  let masked = value;
  masked = masked.replace(/Bearer\s+[A-Za-z0-9_-]+/gi, 'Bearer [REDACTED]');
  masked = masked.replace(
    /CLOUDFLARE_API_TOKEN[=:]\s*["']?[^\s"']+/gi,
    'CLOUDFLARE_API_TOKEN=[REDACTED]'
  );

  if (process.env.CLOUDFLARE_API_TOKEN && masked.includes(process.env.CLOUDFLARE_API_TOKEN)) {
    masked = masked.split(process.env.CLOUDFLARE_API_TOKEN).join('[REDACTED]');
  }

  return masked;
}

/**
 * @param {unknown} data
 * @returns {unknown}
 */
function sanitizeData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return maskValue(data);
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('authorization') ||
        lowerKey.includes('password')
      ) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = sanitizeData(val);
      }
    }
    return out;
  }
  return data;
}

/**
 * @param {keyof LEVELS} level
 * @param {string} message
 * @param {Record<string, unknown>} [meta]
 */
function log(level, message, meta = {}) {
  if (LEVELS[level] < LEVELS[minLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: maskValue(message),
    .../** @type {Record<string, unknown>} */ (sanitizeData(meta)),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.error(line);
  }
}

export const logger = {
  debug: (/** @type {string} */ msg, /** @type {Record<string, unknown>} */ meta) =>
    log('debug', msg, meta),
  info: (/** @type {string} */ msg, /** @type {Record<string, unknown>} */ meta) =>
    log('info', msg, meta),
  warn: (/** @type {string} */ msg, /** @type {Record<string, unknown>} */ meta) =>
    log('warn', msg, meta),
  error: (/** @type {string} */ msg, /** @type {Record<string, unknown>} */ meta) =>
    log('error', msg, meta),
};

export { SECRET_PATTERNS };
