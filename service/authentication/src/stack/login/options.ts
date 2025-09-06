import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net.library/service";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`OPTIONS ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedOrigins: configuration.get('authentication.service.allowed-origins'),
    }),
  }),
])
