import { logger } from "../helper/logger.js";
import { Middleware } from "../middleware.js";

/**
 *
 */
type Factory = () => Middleware;

/**
 * CORS headers middleware factory
 * Returns middleware that sets appropriate CORS headers based on request
 */
export const useLogRequest: Factory = () => async (context) => {
  logger.debug(`${context.incomingMessage.method?.toUpperCase() || 'UNKNOWN METHOD'} ${context.incomingMessage.url}`);
}
