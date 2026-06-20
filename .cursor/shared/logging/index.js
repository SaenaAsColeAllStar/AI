/**
 * Platform structured logger — extends mcp/shared/logger with child loggers and context.
 */

import {
  configureLogger,
  registerSecret,
  maskValue,
  maskId,
  sanitizeData,
  MASKED_VALUE,
  logger as baseLogger,
} from '../../mcp/shared/logger.js';

export {
  configureLogger,
  registerSecret,
  maskValue,
  maskId,
  sanitizeData,
  MASKED_VALUE,
};

/**
 * @param {string} component
 * @returns {{ debug: Function, info: Function, warn: Function, error: Function }}
 */
export function createLogger(component) {
  const wrap =
    (level) =>
    (message, meta = {}) =>
      baseLogger[level](message, { component, ...meta });

  return {
    debug: wrap('debug'),
    info: wrap('info'),
    warn: wrap('warn'),
    error: wrap('error'),
  };
}

export const logger = createLogger('platform');
