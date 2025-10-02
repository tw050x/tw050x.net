import { logger } from "@tw050x.net.library/logger";
import { Middleware } from "@tw050x.net.library/service";

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
