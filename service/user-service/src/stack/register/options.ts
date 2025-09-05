import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service-library";

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
