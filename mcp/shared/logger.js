/**
 * Shared structured logger with secret masking for Teknovo MCP servers.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

/** @type {keyof LEVELS} */
let minLevel = 'info';

/** @type {boolean} */
let maskSecrets = true;

/** @type {Set<string>} */
const knownSecrets = new Set();

export const MASKED_VALUE = '***MASKED***';

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
 * Register runtime secret values for redaction in logs.
 * @param {string | undefined | null} value
 */
export function registerSecret(value) {
  if (value && value.length >= 8) {
    knownSecrets.add(value);
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
    /(?:CLOUDFLARE_API_TOKEN|GITHUB_TOKEN|OPENROUTER_API_KEY)[=:]\s*["']?[^\s"']+/gi,
    (match) => `${match.split(/[=:]/)[0]}=[REDACTED]`
  );

  for (const secret of knownSecrets) {
    if (masked.includes(secret)) {
      masked = masked.split(secret).join(MASKED_VALUE);
    }
  }

  for (const envKey of ['CLOUDFLARE_API_TOKEN', 'GITHUB_TOKEN', 'OPENROUTER_API_KEY']) {
    const envVal = process.env[envKey];
    if (envVal && masked.includes(envVal)) {
      masked = masked.split(envVal).join(MASKED_VALUE);
    }
  }

  return masked;
}

/**
 * Mask Cloudflare-style account and zone IDs in log output.
 * @param {string} id
 * @returns {string}
 */
export function maskId(id) {
  if (!maskSecrets || typeof id !== 'string' || id.length < 8) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

/**
 * @param {unknown} data
 * @returns {unknown}
 */
export function sanitizeData(data) {
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
        lowerKey.includes('password') ||
        lowerKey.includes('apikey') ||
        lowerKey === 'apitoken'
      ) {
        out[key] = MASKED_VALUE;
      } else if (lowerKey.includes('accountid') || lowerKey === 'account_id') {
        out[key] = typeof val === 'string' ? maskId(val) : sanitizeData(val);
      } else if (lowerKey.includes('zoneid') || lowerKey === 'zone_id') {
        out[key] = typeof val === 'string' ? maskId(val) : sanitizeData(val);
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
