/**
 * Structured logger — re-exports shared Teknovo MCP logger.
 */

export {
  configureLogger,
  logger,
  maskValue,
  maskId,
  sanitizeData,
  registerSecret,
  MASKED_VALUE,
} from '../../shared/logger.js';
